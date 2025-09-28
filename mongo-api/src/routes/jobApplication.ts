import {Response, Router} from "express";
import {ObjectId, WithId} from "mongodb";
import {
    JobApplication,
    JobApplicationCreateData,
    JobApplicationCreateSchema, JobApplicationPopulatedStage,
    jobApplicationsCollection,
    JobApplicationUpdateData,
    JobApplicationUpdateSchema
} from "../models/jobApplication";
import {stagesCollection} from "../models/stage"; // Assuming Stage model is imported here
import logger from "../config/logger";
import {MyRequestType} from '../types';
import {validateObjectId} from "../middleware/validateObjectId";

const jobApplicationRoute = Router();

// --- TYPE ALIASES (F=JobApplication, D=DataPayload) ---
type CreateAppReq = MyRequestType<JobApplication, JobApplicationCreateData>;
type GetAppReq = MyRequestType<JobApplicationPopulatedStage>;
type UpdateAppReq = MyRequestType<JobApplication, JobApplicationUpdateData>;
type DeleteAppReq = MyRequestType<JobApplication>;

/**
 * Helper function to populate the lastStage data onto an application object.
 * @param app - The job application document.
 * @returns The application document with the populated 'lastStage' field.
 */
const populateLastStage = async (app: WithId<JobApplication>): Promise<WithId<JobApplication> & {
    lastStage?: any
}> => {
    const {lastStageId, ...rest} = app;

    let lastStage = undefined;
    if (lastStageId) {
        // Find the stage document, assuming Stage interface matches the type returned
        lastStage = await stagesCollection.findOne({_id: lastStageId});
    }

    // Return the combined object, retaining the _id from the original document
    return {...rest, lastStage, _id: app._id} as WithId<JobApplication> & { lastStage?: any };
};


// Create Job Application
jobApplicationRoute.post("/", async (req: CreateAppReq, res: Response) => {
    try {
        // 1. VALIDATION: Validate user input against the creation schema
        const parseResult = JobApplicationCreateSchema.safeParse(req.body.data);

        if (!parseResult.success) {
            logger.warn(`User ${req.body.userId}: Failed to create job application due to validation error: ${parseResult.error.issues}`);
            return res.status(400).json({error: parseResult.error.issues});
        }

        const userData = parseResult.data;
        const now = new Date();

        // 2. Build the full document for insertion (including server-managed fields)
        const data: Omit<JobApplication, '_id'> = {
            ...userData,
            createdAt: now,
            updatedAt: now
        };

        const result = await jobApplicationsCollection.insertOne(data);
        const newApplication: WithId<JobApplication> = {
            _id: result.insertedId,
            ...data
        };

        logger.info(`User ${req.body.userId}: Successfully created new job application with ID: ${result.insertedId}`);
        res.status(201).json(newApplication);
    } catch (err) {
        logger.error(`Error creating job application for user ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to create job application"});
    }
});

// Get all job applications for user (populated stage)
jobApplicationRoute.get("/", async (req: GetAppReq, res: Response) => {
    try {
        // Find applications using the filters provided (ensures ownership)
        const apps = await jobApplicationsCollection.find(req.body.filters || {}).toArray();

        // FIX: Use Promise.all to ensure all asynchronous stage lookups complete
        const populatedApps = await Promise.all(
            apps.map(app => populateLastStage(app))
        );

        logger.info(`Successfully fetched ${apps.length} job applications. UserId: ${req.body.userId}`);
        res.json(populatedApps);
    } catch (err) {
        logger.error(`Error fetching job applications for user ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to fetch job applications"});
    }
});

// Get single job application by ID (populated stage)
jobApplicationRoute.get("/:jobId", validateObjectId, async (req: GetAppReq, res: Response) => {
    try {
        const appIdObject = new ObjectId(req.params.jobId as string);

        const app = await jobApplicationsCollection.findOne({...req.body.filters, _id: appIdObject});

        if (!app) {
            logger.warn(`Job application ${req.params.jobId} not found or unauthorized. UserId: ${req.body.userId}.`);
            return res.status(404).json({error: "Job application not found or unauthorized."});
        }

        // Populate the last stage
        const populatedApp = await populateLastStage(app);

        logger.info(`Successfully fetched job application with ID: ${app._id}. UserId: ${req.body.userId}`);
        res.json(populatedApp);
    } catch (err) {
        logger.error(`Error fetching job application with ID ${req.params.jobId}. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to fetch job application"});
    }
});

// Update job application
jobApplicationRoute.put("/:jobId", validateObjectId, async (req: UpdateAppReq, res: Response) => {
    try {
        const appIdObject = new ObjectId(req.params.jobId as string);
        const id = req.params.jobId;

        // 1. VALIDATION: Validate user input against the update schema
        const parseResult = JobApplicationUpdateSchema.safeParse(req.body.data);
        if (!parseResult.success) {
            logger.warn(`Failed to update job application ${id} due to validation error: ${parseResult.error.issues}. UserId: ${req.body.userId}`);
            return res.status(400).json({error: parseResult.error.issues});
        }

        const updateData = parseResult.data;
        const updatedAt = new Date();

        // 2. Prepare update payload: $set includes validated data and the new timestamp
        const update = {...updateData, updatedAt};

        // 3. Perform the update and get the updated document
        // Use req.body.filters to ensure user ownership
        const updateJobApplicationResult = await jobApplicationsCollection.findOneAndUpdate(
            {...req.body.filters, _id: appIdObject},
            {$set: update},
            {returnDocument: 'after'}
        );

        if (!updateJobApplicationResult) {
            logger.warn(`JobApplication with ID ${id} not found for update or unauthorized. UserId: ${req.body.userId}`);
            return res.status(404).json({error: "Not found"});
        }

        // Return the updated application document
        logger.info(`Successfully updated job application with ID: ${id}. UserId: ${req.body.userId}`);
        res.json(updateJobApplicationResult);
    } catch (err) {
        logger.error(`Error updating job application with ID ${req.params.jobId}. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to update job application"});
    }
});

// Delete job application
jobApplicationRoute.delete("/:jobId", validateObjectId, async (req: DeleteAppReq, res: Response) => {
    try {
        const appIdObject = new ObjectId(req.params.jobId as string);
        const id = appIdObject;

        // Use req.body.filters combined with _id to ensure the user owns the application
        const result = await jobApplicationsCollection.deleteOne({...req.body.filters, _id: id});

        if (result.deletedCount === 0) {
            logger.warn(`Job application with ID ${req.params.jobId} not found for deletion or unauthorized. UserId: ${req.body.userId}`);
            return res.status(404).json({error: "Not found or unauthorized"});
        }

        // Delete related stages (using the job application ID)
        const stagesResult = await stagesCollection.deleteMany({jobApplicationId: id});

        logger.info(`Successfully deleted job application with ID: ${req.params.jobId} and ${stagesResult.deletedCount} related stages. UserId: ${req.body.userId}`);
        res.json({message: "Deleted successfully"});
    } catch (err) {
        logger.error(`Error deleting job application with ID ${req.params.jobId}. UserId: ${req.body.userId}: ${err}`);
        res.status(500).json({error: "Failed to delete job application"});
    }
});

export default jobApplicationRoute;
