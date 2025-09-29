import {Response, Router} from 'express';
import logger from '../config/logger';

import {AuthenticatedRequest} from '../interfaces/authenticatedRequest';
import {dbClient} from "../config/dbClient";
import {FilterMiddlewareRequest} from "../middleware/filterMiddleware";

import {JobApplication, JobApplicationPopulatedStage} from "./index";

const jobApplicationRouter = Router();

// Route to get ALL job applications for the user
jobApplicationRouter.get('/', async (req: FilterMiddlewareRequest<JobApplication>, res: Response) => {
    const {userId, filters} = req;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access all applications without user ID.');
            return res.status(403).send('Not authorized');
        }
        logger.info(`Fetching all job applications for user: ${userId}`);
        const applications: JobApplicationPopulatedStage[] | null = await dbClient.jobApplications.getAll(userId, filters);
        if (!applications) {
            logger.info(`No job applications found for user: ${userId}`);
            return res.status(200).json([]);
        }
        logger.info(`Successfully retrieved ${applications.length} applications for user: ${userId}`);
        return res.status(200).json(applications);
    } catch (error) {
        logger.error(`Failed to retrieve all job applications for user: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve job applications.'});
    }
});

// Route to get a single job application by ID
jobApplicationRouter.get('/:applicationId', async (req: FilterMiddlewareRequest<JobApplication>, res: Response) => {
    const {userId, filters} = req;
    const {applicationId} = req.params;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access an application without user ID.');
            return res.status(403).send('Not authorized');
        }
        logger.info(`Fetching job application with ID: ${applicationId} for user: ${userId}`);
        const application: JobApplicationPopulatedStage | null = await dbClient.jobApplications.getById(userId, applicationId, filters);
        if (!application) {
            logger.warn(`Application with ID: ${applicationId} not found for user: ${userId}`);
            return res.status(404).json({error: 'Job application not found.'});
        }
        logger.info(`Successfully retrieved application with ID: ${applicationId}`);
        return res.status(200).json(application);
    } catch (error) {
        logger.error(`Failed to retrieve application with ID: ${applicationId} for user: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve job application.'});
    }
});

// Route to get STAGES for a specific job application
jobApplicationRouter.get('/:applicationId/stages', async (req: FilterMiddlewareRequest<JobApplication>, res: Response) => {
    const {userId, filters} = req;
    const {applicationId} = req.params;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access application stages without user ID.');
            return res.status(403).send('Not authorized');
        }
        logger.info(`Fetching stages for application ID: ${applicationId} for user: ${userId}`);
        const stages = await dbClient.jobApplications.getStagesByJobApplicationId(userId, applicationId, filters);
        if (!stages) {
            logger.info(`Stages not found for application ID: ${applicationId}. Returning empty array.`);
            return res.status(200).json([]);
        }
        logger.info(`Successfully retrieved ${stages.length} stages for application ID: ${applicationId}`);
        return res.status(200).json(stages);
    } catch (error) {
        logger.error(`Failed to retrieve stages for application ID: ${applicationId} for user: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve application stages.'});
    }
});

// Route to create a new job application
jobApplicationRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to create an application without user ID.');
            return res.status(403).send('Not authorized');
        }
        logger.info(`Attempting to create a new job application for user: ${userId}`);
        const newApplication = await dbClient.jobApplications.create(userId, req.body);
        if (!newApplication) {
            logger.error(`Failed to create job application for user: ${userId}.`);
            return res.status(500).send('Failed to create job application.');
        }
        logger.info(`Successfully created new application with ID: ${newApplication._id} for user: ${userId}`);
        return res.status(201).json(newApplication);
    } catch (error) {
        logger.error(`Failed to create job application for user: ${userId}. Check provided data.`, {error});
        return res.status(400).json({error: 'Failed to create job application. Please check the data provided.'});
    }
});

// Route to update a job application
jobApplicationRouter.put('/:applicationId', async (req: FilterMiddlewareRequest<JobApplication>, res: Response) => {
    const {userId, filters} = req;
    const {applicationId} = req.params;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to update an application without user ID.');
            return res.status(403).send('Not authorized');
        }
        logger.info(`Attempting to update application with ID: ${applicationId} for user: ${userId}`);
        const updated = await dbClient.jobApplications.update(userId, applicationId, req.body, filters);
        if (!updated) {
            logger.warn(`Update failed: Application ID: ${applicationId} not found or update failed.`);
            return res.status(404).json({error: 'Job application not found or update failed.'});
        }
        logger.info(`Successfully updated application with ID: ${applicationId}`);
        return res.status(200).json(updated);
    } catch (error) {
        logger.error(`Failed to update application with ID: ${applicationId} for userId: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to update job application.'});
    }
});

// Route to delete a job application
jobApplicationRouter.delete('/:applicationId', async (req: FilterMiddlewareRequest<JobApplication>, res: Response) => {
    const {userId, filters} = req;
    const {applicationId} = req.params;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to delete an application without user ID.');
            return res.status(403).send('Not authorized');
        }
        logger.info(`Attempting to delete application with ID: ${applicationId} for user: ${userId}`);
        const deleted = await dbClient.jobApplications.delete(userId, applicationId, filters);
        if (deleted === null) {
            logger.warn(`Deletion failed: Application ID: ${applicationId} not found or delete failed.`);
            return res.status(404).json({error: 'Job application not found or delete failed.'});
        }
        logger.info(`Successfully deleted application with ID: ${applicationId}`);
        return res.status(200).json({message: 'Job application deleted successfully.'});
    } catch (error) {
        logger.error(`Failed to delete application with ID: ${applicationId} for userId: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to delete job application.'});
    }
});

export default jobApplicationRouter;