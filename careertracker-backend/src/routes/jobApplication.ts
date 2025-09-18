import express, { Request, Response } from 'express';
import JobApplication from '../models/jobApplication';
import { AuthenticatedRequest } from '../interfaces/authenticatedRequest';


const jobApplicationRouter = express.Router();

// Route to get all job applications for the authenticated user
jobApplicationRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        const jobApplications = await JobApplication.findAll({
            where: {
                userId: userId,
            },
        });

        return res.status(200).json(jobApplications);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve job applications.' });
    }
});

// Route to create a new job application
jobApplicationRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        // Ensure the application is associated with the authenticated user
        const newApplication = await JobApplication.create({ ...req.body, userId });

        return res.status(201).json(newApplication);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Failed to create job application. Please check the data provided.' });
    }
});

export default jobApplicationRouter;