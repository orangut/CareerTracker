import express, {Request, Response, NextFunction} from 'express';
import logger from '../config/logger';

import authRouter from './auth';
import authenticateToken from '../middleware/authenticateToken';
import {userFiltersHandler, userIdForeignKeyFiltersHandler} from '../middleware/filterMiddleware'
import notificationRuleRouter from "./notificationRule";
import jobApplicationRouter from "./jobApplication";
import userRouter from "./user";
import stageRouter from "./stage";

const router = express.Router();

// Middleware to log all incoming API requests
router.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

router.use('/auth', authRouter);
router.use('/user', authenticateToken, userFiltersHandler, userRouter);
router.use('/job-application', authenticateToken, userIdForeignKeyFiltersHandler, jobApplicationRouter);
router.use('/notification-rule', authenticateToken, userIdForeignKeyFiltersHandler, notificationRuleRouter);
router.use('/stage', authenticateToken, userIdForeignKeyFiltersHandler, stageRouter);

// Error handling middleware to catch and log any unhandled errors
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Unhandled Error: ${err.message}`, {stack: err.stack});
    res.status(500).send('Something broke!');
});

export {
    User, JobApplication, JobApplicationPopulatedStage, NotificationRule, Stage
} from "@monorepo/db-api-client/src/interfaces"


export default router;
