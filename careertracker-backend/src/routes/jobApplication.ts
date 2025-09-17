import express, { Request, Response } from 'express';
import JobApplication from '../models/jobApplication';

// Extend the Request object to include the userId from the JWT payload
interface AuthenticatedRequest extends Request {
    userId?: number;
}

const jobApplicationRoutes = express.Router();

// Route to get all job applications for the authenticated user
jobApplicationRoutes.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

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
jobApplicationRoutes.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        console.log(userId);

        // Ensure the application is associated with the authenticated user
        const newApplication = await JobApplication.create({ ...req.body, userId });

        return res.status(201).json(newApplication);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Failed to create job application. Please check the data provided.' });
    }
});

export default jobApplicationRoutes;