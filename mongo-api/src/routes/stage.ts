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


// The 'filters' parameter now expects an ARRAY of match conditions
const getPipeline = (flatFilters: object = {}) => {
    const {extractedUserId, otherFilters} = separateUserIdFilterObject<Stage>(flatFilters)

    // Define the single list of conditions for the $and operator
    const matchConditions: object[] = [];

    if (extractedUserId) matchConditions.push({"jobApp.userId": extractedUserId});

    // Add the flat filter object as a single condition if it's not empty
    if (Object.keys(otherFilters).length > 0) {
        // Pushing the single object {keyA: valueA, keyB: valueB}
        // as one element in the $and array.
        matchConditions.push(otherFilters);
    }
    return [
        // 1. $lookup (Join)
        {
            $lookup: {
                from: "job_applications",
                localField: "jobApplicationId",
                foreignField: "_id",
                as: "jobApp",
            },
        },
        // 2. $unwind
        {
            $unwind: "$jobApp",
        },
        // 3. $match: Use $and to ensure all conditions are met
        {
            $match: {
                $and: matchConditions,
            },
        },
        // 4. $project: Reshape the output
        {
            $project: {
                jobApp: 0,
            },
        },
    ];
};

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

        const userIdObject = new ObjectId(userId)
        const jobApplicationId = parseResult.data.jobApplicationId;

        // VERIFY JOB APPLICATION EXISTENCE AND OWNERSHIP ---
        const jobAppOwner = await jobApplicationsCollection.findOne(
            { _id: jobApplicationId, userId: userIdObject },
            { projection: { _id: 1 } } // Optimize by fetching only the _id
        );

        if (!jobAppOwner) {
            logger.warn(`Job application ID ${jobApplicationId} not found or unauthorized for stage creation. UserId: ${userId}`);
            // Return 404 (Not Found) or 403 (Forbidden) depending on policy
            return res.status(404).json({ error: "Job application not found or unauthorized." });
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

// Route to get all last stages by userId and filters
stageRouter.get("/last-stages", async (req: GetStageReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access all stages without userId in authContext.');
            return res.status(403).json({error: 'Not authorized'});
        }

        logger.info(`Fetching 'last stages' for user: ${userId} with filters: ${JSON.stringify(filters)}`);

        // Define the specific filter to find only the last stage
        const lastStageFilter = {
            $expr: {
                $eq: ["$_id", "$jobApp.lastStageId"]
            }
        };

        const pipeline = getPipeline({...filters, ...lastStageFilter});

        // Execute the aggregation
        const stages = await stagesCollection.aggregate<Stage>(pipeline).toArray();

        if (!stages || stages.length === 0) {
            logger.info(`No stages found for user: ${userId} with provided filters.`);
            // Return 200 with an empty array if no stages are found
            return res.status(200).json([]);
        }

        logger.info(`Successfully retrieved ${stages.length} stages for user: ${userId}`);
        return res.status(200).json(stages);
    } catch (err) {
        logger.error(`Failed to retrieve all stages for user: ${userId}. Error: ${err}`);
        return res.status(500).json({error: "Failed to retrieve stages."});
    }
});

// Get stage by id
stageRouter.get("/:id", validateObjectId, async (req: GetStageReq, res: Response) => {
    const userId = req?.authContext?.userId;
    const filters = req?.authContext?.filters;

    const {id} = req.params;
    const stageIdObject = new ObjectId(id as string);

    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access all stages without userId in authContext.');
            return res.status(403).json({error: 'Not authorized'});
        }

        const pipeline = getPipeline({...filters, _id: stageIdObject});

        // Execute the aggregation
        // We expect only 0 or 1 result, so we take the first element [0]
        const stage = await stagesCollection.aggregate<Stage>(pipeline).next();

        if (!stage) {
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

    const {extractedUserId, otherFilters} = separateUserIdFilterObject<Stage>(req.authContext?.filters)
    const data = req.authContext?.data;

    const { id } = req.params;
    const stageIdObject = new ObjectId(id as string);

    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to update stage without userId in authContext.');
            return res.status(403).json({ error: 'Not authorized' });
        }

        // 1. Validate incoming data
        const parseResult = StageUpdateSchema.safeParse(data);
        if (!parseResult.success) {
            logger.warn(`Failed to update stage ${id} due to validation error: ${parseResult.error.issues}. UserId: ${userId}`);
            return res.status(400).json({ error: parseResult.error.issues });
        }

        // --- AUTHENTICATION & JOB ID RETRIEVAL ---

        // 2. Query the stage to get the jobApplicationId AND verify existence
        const existingStage = await stagesCollection.findOne({ _id: stageIdObject, ...otherFilters });

        if (!existingStage) {
            logger.warn(`Stage with ID ${id} not found for update. UserId: ${userId}`);
            return res.status(404).json({ error: "Not found" });
        }

        const jobApplicationId = existingStage.jobApplicationId;

        const jobQueryFilters: Record<string, any> = {_id: jobApplicationId}
        if (extractedUserId) jobQueryFilters['userId'] = extractedUserId;

        // 3. Verify user ownership of the parent job application
        const jobAppOwner = await jobApplicationsCollection.findOne(
            jobQueryFilters,
            { projection: { _id: 1 } } // Only fetch _id for performance
        );

        if (!jobAppOwner) {
            // Stage found, but user doesn't own the associated job application
            logger.warn(`Unauthorized attempt to update stage ${id}. User ${userId} does not own job application ${jobApplicationId}.`);
            return res.status(403).json({ error: "Not authorized to modify this resource." });
        }

        // --- PERFORM THE UPDATE ---

        const updateData = parseResult.data;
        const updatedAt = new Date();
        const update = { ...updateData, updatedAt: updatedAt };

        // 4. Perform the update using only the stage _id (ownership is already verified)
        const updatedStageResult = await stagesCollection.findOneAndUpdate(
            { _id: stageIdObject },
            { $set: update },
            { returnDocument: 'after' }
        );

        // 5. Update the updateAt in JobApplication
        await jobApplicationsCollection.updateOne({ _id: jobApplicationId }, { $set: { updatedAt } });

        logger.info(`Successfully updated stage with ID: ${id} for job application: ${jobApplicationId}. UserId: ${userId}`);
        res.json(updatedStageResult);

    } catch (err) {
        logger.error(`Error updating stage with ID ${id}: ${err}. UserId: ${userId}`);
        res.status(500).json({ error: "Failed to update stage" });
    }
});

// Delete stage
stageRouter.delete("/:id", validateObjectId, async (req: DeleteStageReq, res: Response) => {
    const userId = req?.authContext?.userId;

    const filters = req?.authContext?.filters; // Filters passed from middleware (if any)

    const {id} = req.params;
    const stageIdObject = new ObjectId(id as string);

    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to delete stage without userId in authContext.');
            return res.status(403).json({error: 'Not authorized'});
        }

        // --- 1. Authorization and Existence Check ---
        // Use the pipeline to check if the stage exists AND belongs to the user
        const pipeline = getPipeline({...filters, _id: stageIdObject});

        // Get the stage document that is authorized for deletion
        const stageToDelete = await stagesCollection.aggregate<Stage>(pipeline).next();

        if (!stageToDelete) {
            logger.warn(`Stage with ID ${id} not found or unauthorized for deletion. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }

        const jobApplicationId = stageToDelete.jobApplicationId; // Correct variable

        // --- 2. Delete the Stage ---
        const result = await stagesCollection.deleteOne({_id: stageIdObject, jobApplicationId: jobApplicationId});

        if (result.deletedCount === 0) {
            // This should ideally not happen if stageToDelete was found
            logger.warn(`Stage with ID ${id} was not deleted after initial check. UserId: ${userId}`);
            return res.status(404).json({error: "Not found"});
        }

        // --- 3. Find the New Last Stage ---
        // Find the most recent remaining stage for the job application (sorted by createdAt descending)
        const lastStage = await stagesCollection
            .find({jobApplicationId}) // Only look within the affected job application
            .sort({createdAt: -1})
            .limit(1)
            .toArray();

        const lastStageId = lastStage.length > 0 ? lastStage[0]._id : undefined; // ObjectId or undefined

        // --- 4. Update Job Application ---
        const updatedAt = lastStage[0].updatedAt;
        await jobApplicationsCollection.updateOne(
            {_id: jobApplicationId},
            {$set: {lastStageId, updatedAt}}
        );

        logger.info(`Successfully deleted stage with ID: ${id} for job application: ${jobApplicationId}. New last stage ID is ${lastStageId?.toHexString() || 'none'}. UserId: ${userId}`);
        res.json({
            message: "Deleted successfully",
            lastStageId: lastStageId?.toHexString() // Use optional chaining for safety
        });
    } catch (err) {
        logger.error(`Error deleting stage with ID ${id}: ${err}. UserId: ${userId}`);
        res.status(500).json({error: "Failed to delete stage"});
    }
});

export default stageRouter;