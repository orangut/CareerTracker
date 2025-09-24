import express, {Response} from 'express';
import {AuthenticatedRequest} from '../interfaces/authenticatedRequest';
import {dbClient} from "../config/dbClient";

const jobApplicationRouter = express.Router();


// Route to get a single job application by ID
jobApplicationRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const {id} = req.params;

        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const jobApplication = await dbClient.jobApplications.getById(userId, id);

        if (!jobApplication) {
            return res.status(404).json({error: 'Job application not found.'});
        }

        return res.status(200).json(jobApplication);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Failed to retrieve job application.'});
    }
});


// Route to get all job applications for the authenticated user
jobApplicationRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        // TODO: Could not happen because there is auth validation, but TS require it
        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const jobApplications = await dbClient.jobApplications.getAll(userId)

        return res.status(200).json(jobApplications);
    } catch (error) {
        console.error(error);

        return res.status(500).json({error: 'Failed to retrieve job applications.'});
    }
});

// Route to create a new job application
jobApplicationRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        // TODO: Could not happen because there is auth validation, but TS require it
        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        // Ensure the application is associated with the authenticated user
        const newApplication = await dbClient.jobApplications.create(userId, req.body);

        if (!newApplication) {
            return res.status(500).send('Failed to create application.');
        }

        return res.status(201).json(newApplication);
    } catch (error) {
        console.error(error);

        return res.status(400).json({error: 'Failed to create job application. Please check the data provided.'});
    }
});


// Route to update a job application
jobApplicationRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const {id} = req.params;

        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const updated = await dbClient.jobApplications.update(userId, id, req.body);

        if (!updated) {
            return res.status(404).json({error: 'Job application not found or update failed.'});
        }

        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Failed to update job application.'});
    }
});

// Route to delete a job application
jobApplicationRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const {id} = req.params;

        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const deleted = await dbClient.jobApplications.delete(userId, id);

        if (!deleted) {
            return res.status(404).json({error: 'Job application not found or delete failed.'});
        }

        return res.status(200).json({message: 'Job application deleted successfully.'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Failed to delete job application.'});
    }
});

export default jobApplicationRouter;
