import {Response, Router} from "express";
import {ObjectId} from "mongodb";
import {
    Stage,
    StageCreateData,
    StageCreateSchema,
    stagesCollection,
    StageUpdateData,
    StageUpdateSchema
} from "../models/stage";
// Assuming JobApplication and collections are imported correctly
import {jobApplicationsCollection} from "../models/jobApplication";
import {validateObjectId} from "../middleware/validateObjectId";
import logger from '../config/logger';
import {MyRequestType} from '../types';
import {separateUserIdFilterObject} from "../utils";

const stageRouter = Router();

// --- TYPE ALIASES ---
// Use MyRequestType<FilterType, DataType>
type CreateStageReq = MyRequestType<Stage, StageCreateData>;
type GetStageReq = MyRequestType<Stage>;
type UpdateStageReq = MyRequestType<Stage, StageUpdateData>;
type DeleteStageReq = MyRequestType<Stage>;


// Create Stage
stageRouter.post('/', async (req: CreateStageReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const data = req.authContext?.data;

    try {
        const parseResult = StageCreateSchema.safeParse(data);
        if (!parseResult.success) {
            logger.warn(`Failed to create stage due to validation error: ${parseResult.error}. UserId: ${userId}`);
            return res.status(400).json({error: parseResult.error});
        }

        const now = new Date()

        // Prepare data for insertion, ensuring the required server-side fields are added
        const stageData: Omit<Stage, '_id'> = {
            ...parseResult.data,
            createdAt: now,
            updatedAt: now,
        } as Omit<Stage, '_id'>;

        const result = await stagesCollection.insertOne(stageData as Stage);

        const newStage: Stage = {
            _id: result.insertedId,
            ...stageData,
        };

        const jobApplicationId = newStage.jobApplicationId

        // Update JobApplication
        await jobApplicationsCollection.updateOne({_id: jobApplicationId}, {
            $set: {
                lastStageId: newStage._id,
                updatedAt: now
            }
        });

        logger.info(`Successfully created new stage with ID: ${newStage._id} for job application: ${jobApplicationId}. UserId: ${userId}`);
        res.status(201).json(newStage);
    } catch (err) {
        logger.error(`Error creating stage for job application ${data?.jobApplicationId}: ${err}`);
        res.status(500).json({error: "Failed to create stage"});
    }
});

// Get stage by id
stageRouter.get("/:id", validateObjectId, async (req: GetStageReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;
    const {extractedUserId, otherFilters} = separateUserIdFilterObject<Stage>(filters)

    const {id} = req.params;
    const stageIdObject = new ObjectId(id as string);

    try {
        // Lookup the stage using the provided ID and body filters
        const stage = await stagesCollection.findOne({...otherFilters, _id: stageIdObject});

        if (!stage) {
            logger.warn(`Stage ${id} not found or unauthorized. UserId: ${userId}.`);
            return res.status(404).json({error: `Stage ${id} not found or unauthorized.`});
        }

        const jobApplication = await jobApplicationsCollection.findOne({
            userId: extractedUserId,
            _id: stage?.jobApplicationId
        })

        if (!jobApplication) {
            logger.warn(`Stage ${id} not found or unauthorized. UserId: ${userId}.`);
            return res.status(404).json({error: `Stage ${id} not found or unauthorized.`});
        }

        logger.info(`Successfully fetched stage with ID: ${stage._id}. UserId: ${userId}`);
        res.json(stage);
    } catch (err) {
        logger.error(`Error fetching stage with ID ${id}: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to fetch stage"});
    }
});

// Update stage
stageRouter.put("/:id", validateObjectId, async (req: UpdateStageReq, res: Response) => {
    const userId = req?.authContext?.userId;

    const filters = req?.authContext?.filters;
    const {extractedUserId, otherFilters} = separateUserIdFilterObject<Stage>(filters)

    const data = req.authContext?.data;

    const {id} = req.params;
    const stageIdObject = new ObjectId(id as string);

    try {
        // 1. Validate incoming data
        const parseResult = StageUpdateSchema.safeParse(data);
        if (!parseResult.success) {
            logger.warn(`Failed to update stage ${id} due to validation error: ${parseResult.error.issues}. UserId: ${userId}`);
            return res.status(400).json({error: parseResult.error.issues});
        }

        const updateData = parseResult.data;
        const updatedAt = new Date();
        const update = {...updateData, updatedAt: updatedAt};

        // 2. Perform the update and get the updated document
        const updatedStageResult = await stagesCollection.findOneAndUpdate(
            {...otherFilters, _id: stageIdObject},
            {$set: update},
            {returnDocument: 'after'}
        );

        if (!updatedStageResult) {
            logger.warn(`Stage with ID ${id} not found for update. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }

        const jobApplicationId = updatedStageResult.jobApplicationId;

        // 3. Update the updateAt in JobApplication
        await jobApplicationsCollection.updateOne({_id: jobApplicationId}, {$set: {updatedAt}});

        logger.info(`Successfully updated stage with ID: ${id} for job application: ${jobApplicationId}. UserId: ${userId}`);
        res.json(updatedStageResult);
    } catch (err) {
        logger.error(`Error updating stage with ID ${id}: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to update stage"});
    }
});

// Delete stage
stageRouter.delete("/:id", validateObjectId, async (req: DeleteStageReq, res: Response) => {
    const userId = req?.authContext?.userId;

    const filters = req?.authContext?.filters;
    const {extractedUserId, otherFilters} = separateUserIdFilterObject<Stage>(filters)

    const {id} = req.params;
    const stageObjectId = new ObjectId(id as string);

    try {
        // 1. Get the stage before deleting it to find the jobApplicationId
        const stageToDelete = await stagesCollection.findOne({...otherFilters, _id: stageObjectId});

        if (!stageToDelete) {
            logger.warn(`Stage with ID ${id} not found for deletion. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }

        const jobApplicationId = stageToDelete.jobApplicationId;

        // 2. Delete the stage using filters
        const result = await stagesCollection.deleteOne({...filters, _id: stageObjectId});

        if (result.deletedCount === 0) {
            // Redundant check, but safe
            logger.warn(`Stage with ID ${id} not found for deletion in job application ${jobApplicationId}. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }

        // 3. Find the new last stage (sorted by createdAt descending)
        const lastStage = await stagesCollection
            .find({jobApplicationId})
            .sort({createdAt: -1})
            .limit(1)
            .toArray();

        const lastStageId = lastStage.length > 0 ? lastStage[0]._id : undefined;

        // 4. Update job application with the new lastStageId
        const updatedAt = new Date();
        await jobApplicationsCollection.updateOne(
            {_id: jobApplicationId},
            {$set: {lastStageId, updatedAt}}
        );

        logger.info(`Successfully deleted stage with ID: ${id} for job application: ${jobApplicationId}. New last stage ID is ${lastStageId}. UserId: ${userId}`);
        res.json({
            message: "Deleted successfully",
            lastStageId: lastStageId?.toHexString()
        });
    } catch (err) {
        logger.error(`Error deleting stage with ID ${id}: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to delete stage"});
    }
});

export default stageRouter;