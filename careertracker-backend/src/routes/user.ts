import express, { Response } from 'express';

import { AuthenticatedRequest } from '../interfaces/authenticatedRequest';
import {dbClient} from "../config/dbClient";

const userRouter = express.Router();

userRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId

        // TODO: Can't happen because there is auth validation, but TS require it
        if (!userId) {
            return res.status(403).send('Not authorized');
        }

        const user = await dbClient.users.getById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data, excluding the password
        return res.status(200).json({
            id: user._id,
            username: user.username,
            // Include other user data you need
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default userRouter;