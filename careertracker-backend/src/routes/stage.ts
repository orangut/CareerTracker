import {Response, Router} from 'express';
import logger from '../config/logger';

import {AuthenticatedRequest} from '../interfaces/authenticatedRequest';
import {dbClient} from "../config/dbClient";
import {FilterMiddlewareRequest} from "../middleware/filterMiddleware";

import {Stage} from "./index"

const stageRouter = Router();

// Route to get a single stage by ID
stageRouter.get('/:stageId', async (req: FilterMiddlewareRequest<Stage>, res: Response) => {
    try {
        const {userId, filters} = req;
        const {stageId} = req.params;

        if (!userId) {
            logger.warn('Unauthorized attempt to access a stage without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Fetching stage with ID: ${stageId} for user: ${userId}`);
        const stage = await dbClient.stages.getById(userId, stageId, filters);

        if (!stage) {
            logger.warn(`Stage with ID: ${stageId} not found for user: ${userId}`);
            return res.status(404).json({error: 'Stage not found.'});
        }

        logger.info(`Successfully retrieved stage with ID: ${stageId} for user: ${userId}`);
        return res.status(200).json(stage);
    } catch (error) {
        logger.error(`Failed to retrieve stage with ID: ${req.params.id}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve stage.'});
    }
});

// Route to create a new stage
stageRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            logger.warn('Unauthorized attempt to create a stage without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to create a new stage for user: ${userId}`);
        const newStage = await dbClient.stages.create(userId, req.body);

        if (!newStage) {
            logger.error(`Failed to create stage for user: ${userId}`);
            return res.status(500).send('Failed to create stage.');
        }

        logger.info(`Successfully created new stage with ID: ${newStage._id} for user: ${userId}`);
        return res.status(201).json(newStage);
    } catch (error) {
        logger.error('Failed to create stage. Check provided data.', {error});
        return res.status(400).json({error: 'Failed to create stage. Please check the data provided.'});
    }
});


// Route to update a stage
stageRouter.put('/:stageId', async (req: FilterMiddlewareRequest<Stage>, res: Response) => {
    try {
        const {userId, filters} = req;
        const {stageId} = req.params;

        if (!userId) {
            logger.warn('Unauthorized attempt to update a stage without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to update stage with ID: ${stageId} for user: ${userId}`);
        const updated = await dbClient.stages.update(userId, stageId, req.body, filters);

        if (!updated) {
            logger.warn(`Update failed: Stage with ID: ${stageId} not found or update failed for user: ${userId}`);
            return res.status(404).json({error: 'Stage not found or update failed.'});
        }

        logger.info(`Successfully updated stage with ID: ${stageId} for user: ${userId}`);
        return res.status(200).json(updated);
    } catch (error) {
        logger.error('Failed to update stage.', {error});
        return res.status(500).json({error: 'Failed to update stage.'});
    }
});


// Route to delete a stage
stageRouter.delete('/:stageId', async (req: FilterMiddlewareRequest<Stage>, res: Response) => {
    try {
        const {userId, filters} = req;
        const {stageId} = req.params;

        if (!userId) {
            logger.warn('Unauthorized attempt to delete a stage without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to delete stage with ID: ${stageId} for user: ${userId}`);
        const deleted = await dbClient.stages.delete(userId, stageId, filters);

        if (!deleted) {
            logger.warn(`Deletion failed: Stage with ID: ${stageId} not found or delete failed for user: ${userId}`);
            return res.status(404).json({error: 'Stage not found or delete failed.'});
        }

        logger.info(`Successfully deleted stage with ID: ${stageId} for user: ${userId}`);
        return res.status(200).json({message: 'Stage deleted successfully.'});
    } catch (error) {
        logger.error('Failed to delete stage.', {error});
        return res.status(500).json({error: 'Failed to delete stage.'});
    }
});


export default stageRouter;
