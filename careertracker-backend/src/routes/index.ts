import express from 'express';

import authRouter from './auth';
// import userRouter from './user';
import authenticateToken from '../middleware/authenticateToken';
import notificationRuleRouter from "./notificationRule";
import jobApplicationRouter from "./jobApplication";
import userRouter from "./user";

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', authenticateToken, userRouter);
router.use('/job-application', authenticateToken, jobApplicationRouter);
router.use('/notification-rule', authenticateToken, notificationRuleRouter);



export default router;
