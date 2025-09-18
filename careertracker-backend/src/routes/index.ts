import express from 'express';

import authRouter from './auth';
import userRouter from './user';
import jobApplicationRouter from './jobApplication';
import authenticateToken from '../middleware/authenticateToken';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', authenticateToken, userRouter);
router.use('/job-application', authenticateToken, jobApplicationRouter);

export default router;
