import {Response, Router} from 'express';
import logger from '../config/logger';

import {AuthenticatedRequest} from '../interfaces/authenticatedRequest';
import {dbClient} from "../config/dbClient";
import {FilterMiddlewareRequest} from "../middleware/filterMiddleware";

import {NotificationRule} from "./index";
import {pushTransaction} from "../config/redisClient";

const notificationRuleRouter = Router();

// Route to get ALL notification rules for the user
notificationRuleRouter.get('/', async (req: FilterMiddlewareRequest<NotificationRule>, res: Response) => {
    const {userId, filters} = req;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access all notification rules without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Fetching all notification rules for user: ${userId}`);
        const rules: NotificationRule[] | null = await dbClient.notificationRules.getAll(userId, filters);

        // Return 200 with an empty array if null is received (no rules found)
        const responseRules = rules || [];
        logger.info(`Successfully retrieved ${responseRules.length} rules for user: ${userId}`);
        return res.status(200).json(responseRules);
    } catch (error) {
        logger.error(`Failed to retrieve all notification rules for user: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve notification rules.'});
    }
});

// Route to get a single notification rule by ID
notificationRuleRouter.get('/:ruleId', async (req: FilterMiddlewareRequest<NotificationRule>, res: Response) => {
    const {userId, filters} = req;
    const {ruleId} = req.params;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access a notification rule without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Fetching notification rule with ID: ${ruleId} for user: ${userId}`);
        const rule: NotificationRule | null = await dbClient.notificationRules.getById(userId, ruleId, filters);

        if (!rule) {
            logger.warn(`Rule with ID: ${ruleId} not found for user: ${userId}`);
            return res.status(404).json({error: 'Notification rule not found.'});
        }

        logger.info(`Successfully retrieved rule with ID: ${ruleId} for user: ${userId}`);
        return res.status(200).json(rule);
    } catch (error) {
        logger.error(`Failed to retrieve rule with ID: ${ruleId} for user: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve notification rule.'});
    }
});

// Route to create a new notification rule
notificationRuleRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to create a notification rule without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to create a new notification rule for user: ${userId}`);
        const newRule: NotificationRule | null = await dbClient.notificationRules.create(userId, req.body);

        if (!newRule?._id) {
            logger.error(`Failed to create notification rule for user: ${userId}. DB Client returned null.`);
            return res.status(500).send('Failed to create notification rule.');
        }

        await pushTransaction('Rule', 'CREATE', userId.toString(), newRule._id.toString());

        logger.info(`Successfully created new rule with ID: ${newRule._id} for user: ${userId}`);
        return res.status(201).json(newRule);
    } catch (error) {
        // Use 400 for bad data submission errors
        logger.error(`Failed to create notification rule for user: ${userId}. Check provided data.`, {error});
        return res.status(400).json({error: 'Failed to create notification rule. Please check the data provided.'});
    }
});

// Route to update a notification rule
notificationRuleRouter.put('/:ruleId', async (req: FilterMiddlewareRequest<NotificationRule>, res: Response) => {
    const {userId, filters} = req;
    const {ruleId} = req.params;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to update a notification rule without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to update rule with ID: ${ruleId} for user: ${userId}`);
        const updated: NotificationRule | null = await dbClient.notificationRules.update(userId, ruleId, req.body, filters);

        if (!updated?._id) {
            logger.warn(`Update failed: Rule ID: ${ruleId} not found or update failed for user: ${userId}`);
            return res.status(404).json({error: 'Notification rule not found or update failed.'});
        }

        await pushTransaction('Rule', 'DELETE', userId.toString(), ruleId)
        await pushTransaction('Rule', 'CREATE', userId.toString(), updated._id.toString())

        logger.info(`Successfully updated rule with ID: ${ruleId} for user: ${userId}`);
        return res.status(200).json(updated);
    } catch (error) {
        logger.error(`Failed to update rule with ID: ${ruleId} for userId: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to update notification rule.'});
    }
});

// Route to delete a notification rule
notificationRuleRouter.delete('/:ruleId', async (req: FilterMiddlewareRequest<NotificationRule>, res: Response) => {
    const {userId, filters} = req;
    const {ruleId} = req.params;
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to delete a notification rule without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to delete rule with ID: ${ruleId} for user: ${userId}`);
        // dbClient.notificationRules.delete returns void | null
        const deleted: void | null = await dbClient.notificationRules.delete(userId, ruleId, filters);

        if (deleted === null) {
            logger.warn(`Deletion failed: Rule ID: ${ruleId} not found or delete failed for user: ${userId}`);
            return res.status(404).json({error: 'Notification rule not found or delete failed.'});
        }

        await pushTransaction('Rule', 'DELETE', userId.toString(), ruleId)

        logger.info(`Successfully deleted rule with ID: ${ruleId} for user: ${userId}`);
        return res.status(200).json({message: 'Notification rule deleted successfully.'});
    } catch (error) {
        logger.error(`Failed to delete rule with ID: ${ruleId} for userId: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to delete notification rule.'});
    }
});

export default notificationRuleRouter;