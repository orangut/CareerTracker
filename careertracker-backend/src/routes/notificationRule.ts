import {Response, Router} from 'express';

import {AuthenticatedRequest} from "../interfaces/authenticatedRequest";
import {dbClient} from "../config/dbClient";

const notificationRuleRouter = Router();


// Route to get a single job application by ID
notificationRuleRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const {id} = req.params;

        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const notificationRule = await dbClient.notificationRules.getById(userId, id);

        if (!notificationRule) {
            return res.status(404).json({error: 'notification rule not found.'});
        }

        return res.status(200).json(notificationRule);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Failed to retrieve notification rule.'});
    }
});

// Route to get all notification rules for the authenticated user
notificationRuleRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        // TODO: Can't happen because there is auth validation, but TS require it
        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const jobApplications = await dbClient.notificationRules.getAll(userId)

        return res.status(200).json(jobApplications);
    } catch (error) {
        console.error(error);

        return res.status(500).json({error: 'Failed to retrieve notification rules.'});
    }
});

// Route to create a new job application
notificationRuleRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        // TODO: Can't happen because there is auth validation, but TS require it
        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        // Ensure the application is associated with the authenticated user
        const newRule = await dbClient.notificationRules.create(userId, req.body);

        if (!newRule) {
            return res.status(500).send('Failed to create application.');
        }

        return res.status(201).json(newRule);
    } catch (error) {
        console.error(error);

        return res.status(400).json({error: 'Failed to create notification rule. Please check the data provided.'});
    }
});

// Route to update a job application
notificationRuleRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const {id} = req.params;

        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const updated = await dbClient.notificationRules.update(userId, id, req.body);

        if (!updated) {
            return res.status(404).json({error: 'Notification rule not found or update failed.'});
        }

        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Failed to update notification rule.'});
    }
});


// Route to delete a job application
notificationRuleRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const {id} = req.params;

        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const deleted = await dbClient.notificationRules.delete(userId, id);

        if (!deleted) {
            return res.status(404).json({error: 'Notification rule not found or delete failed.'});
        }

        return res.status(200).json({message: 'Notification rule deleted successfully.'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Failed to delete notification rule.'});
    }
});


export default notificationRuleRouter;
