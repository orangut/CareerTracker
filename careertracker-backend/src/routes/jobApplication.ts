import express, { Request, Response } from 'express';
import JobApplication from '../models/jobApplication';

const jobApplicationRoutes = express.Router();

// Route to create a new job application
jobApplicationRoutes.post('/', async (req: Request, res: Response) => {
    try {
        const newApplication = await JobApplication.create(req.body);
        return res.status(201).json(newApplication);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Failed to create job application. Please check the data provided.' });
    }
});

export default jobApplicationRoutes;