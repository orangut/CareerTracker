import express, { Request, Response } from 'express';
import authenticateToken from '../middleware/authenticateToken'; // Your existing middleware
import User from '../models/user';

const router = express.Router();

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
        // The authenticateToken middleware adds the user ID to the request object
        const userId = (req as any).userId;

        const user = await User.findByPk(userId);

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

export default router;