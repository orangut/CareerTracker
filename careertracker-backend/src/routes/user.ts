import express, { Response } from 'express';
import User from '../models/user';
import { AuthenticatedRequest } from '../interfaces/authenticatedRequest';

const userRouter = express.Router();

userRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
    try {

        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data, excluding the password
        return res.status(200).json({
            id: user.id,
            username: user.username,
            // Include other user data you need
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default userRouter;