import {Response, Router} from 'express';
import logger from '../config/logger';

import {AuthenticatedRequest} from '../interfaces/authenticatedRequest';
import {dbClient} from "../config/dbClient";
import {FilterMiddlewareRequest} from "../middleware/filterMiddleware";
import {User} from "./index";
import {fetchUserNotifications} from "../utils/scheduledNotificationUtils"; // Assuming your user interface is imported here

const userRouter = Router();


// FIXME: handle permission from here (and not from mongo-api) - because the permission depend in userId, and we have the userId.

// ====================================================================
// 1. GET /me (Retrieve current authenticated user's profile)
// ====================================================================
userRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to access /me endpoint without user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to retrieve 'me' data for user ID: ${userId}`);

        // Target ID and Calling ID are the same for '/me'
        const user = await dbClient.users.getById(userId, userId);

        if (!user) {
            logger.warn(`'Me' data not found for user ID: ${userId}`);
            // This is a profile existence issue, likely 404
            return res.status(404).json({error: 'User profile not found.'});
        }

        const notifications = await fetchUserNotifications(userId);

        logger.info(`Successfully retrieved 'me' data for user ID: ${userId}`);

        // Filter out sensitive data (like 'password' if it exists on the 'user' object)
        return res.status(200).json({
            _id: user._id,
            username: user.username,
            notifications: notifications
            // ... include other non-sensitive fields
        });
    } catch (error) {
        logger.error(`Failed to retrieve 'me' data for user ID: ${userId}.`, {error});
        return res.status(500).json({error: 'Internal server error while fetching user profile.'});
    }
});

// ====================================================================
// 2. GET / (Retrieve ALL users - typically Admin access)
// ====================================================================
userRouter.get('/', async (req: FilterMiddlewareRequest<User>, res: Response) => {
    const {userId: callingUserId, filters} = req;
    try {
        if (!callingUserId) {
            logger.warn('Unauthorized attempt to access all users.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Fetching all users for calling user: ${callingUserId}`);
        const users: User[] | null = await dbClient.users.getAll(callingUserId, filters);

        const responseUsers = users || [];
        logger.info(`Successfully retrieved ${responseUsers.length} users for calling user: ${callingUserId}`);

        // Filter sensitive data before sending all users
        return res.status(200).json(responseUsers.map(user => ({
            _id: user._id,
            username: user.username
        })));
    } catch (error) {
        logger.error(`Failed to retrieve all users for calling user: ${callingUserId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve users.'});
    }
});

// ====================================================================
// 3. GET /:targetUserId (Retrieve a specific user profile)
// ====================================================================
userRouter.get('/:targetUserId', async (req: FilterMiddlewareRequest<User>, res: Response) => {
    const {userId: callingUserId, filters} = req;
    const {targetUserId} = req.params;
    try {
        if (!callingUserId) {
            logger.warn(`Unauthorized attempt to access user ${targetUserId}.`);
            return res.status(403).send('Not authorized');
        }

        logger.info(`Fetching user ${targetUserId} by calling user: ${callingUserId}`);
        const userProfile = await dbClient.users.getById(targetUserId, callingUserId, filters);

        if (!userProfile) {
            logger.warn(`User profile not found for ID: ${targetUserId} by caller: ${callingUserId}`);
            return res.status(404).json({error: 'User not found.'});
        }

        logger.info(`Successfully retrieved user ${targetUserId} by caller: ${callingUserId}`);
        return res.status(200).json({
            _id: userProfile._id,
            username: userProfile.username
            // ... filter fields
        });
    } catch (error) {
        logger.error(`Failed to retrieve user ${targetUserId} for caller: ${callingUserId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve user profile.'});
    }
});

// ====================================================================
// 4. GET /username/:username (Retrieve a user profile by username)
// ====================================================================
userRouter.get('/username/:username', async (req: AuthenticatedRequest, res: Response) => {
    const callingUserId = req.userId;
    const {username} = req.params;
    try {
        if (!callingUserId) {
            logger.warn(`Unauthorized attempt to lookup username: ${username}.`);
            return res.status(403).send('Not authorized');
        }

        logger.info(`Fetching user by username ${username} by calling user: ${callingUserId}`);
        const userProfile = await dbClient.users.getByUsername(username, callingUserId);

        if (!userProfile) {
            logger.warn(`User with username ${username} not found by caller: ${callingUserId}`);
            return res.status(404).json({error: 'User not found.'});
        }

        logger.info(`Successfully retrieved user by username ${username} by caller: ${callingUserId}`);
        return res.status(200).json({
            _id: userProfile._id,
            username: userProfile.username
            // ... filter fields
        });
    } catch (error) {
        logger.error(`Failed to retrieve user by username ${username} for caller: ${callingUserId}.`, {error});
        return res.status(500).json({error: 'Failed to retrieve user profile by username.'});
    }
});

// ====================================================================
// 5. POST / (Create a new user profile - Admin function)
// ====================================================================
userRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const callingUserId = req.userId;
    const profileData = req.body;

    try {
        if (!callingUserId) {
            logger.warn('Unauthorized attempt to create a user without an authenticated user ID.');
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to create a new user profile by caller: ${callingUserId}`);

        const newUser = await dbClient.users.create(profileData, callingUserId);

        if (!newUser) {
            logger.error(`Failed to create user profile. DB Client returned null. Caller: ${callingUserId}`);
            return res.status(400).json({error: 'Failed to create user profile. Check data (e.g., username availability).'});
        }

        logger.info(`Successfully created new user with ID: ${newUser._id} by caller: ${callingUserId}`);

        return res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            // ... include other non-sensitive fields
        });
    } catch (error) {
        logger.error(`Failed to create user profile for caller: ${callingUserId}. Check provided data.`, {error});
        return res.status(400).json({error: 'Failed to create user profile. Please check the data provided.'});
    }
});

// ====================================================================
// 6. PUT /:targetUserId (Update a user profile)
// ====================================================================
userRouter.put('/:targetUserId', async (req: FilterMiddlewareRequest<User>, res: Response) => {
    const {userId: callingUserId, filters} = req;
    const {targetUserId} = req.params;
    try {
        if (!callingUserId) {
            logger.warn(`Unauthorized attempt to update user ${targetUserId}.`);
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to update user ${targetUserId} by caller: ${callingUserId}`);
        const updated = await dbClient.users.update(targetUserId, req.body, callingUserId, filters);

        if (!updated) {
            logger.warn(`Update failed: User ID: ${targetUserId} not found or update failed.`);
            return res.status(404).json({error: 'User not found or update failed.'});
        }

        logger.info(`Successfully updated user ${targetUserId} by caller: ${callingUserId}`);
        return res.status(200).json({
            _id: updated._id,
            username: updated.username
            // ... filter fields
        });
    } catch (error) {
        logger.error(`Failed to update user ${targetUserId} for caller: ${callingUserId}.`, {error});
        return res.status(400).json({error: 'Failed to update user profile. Check the data provided.'});
    }
});

// ====================================================================
// 7. DELETE /:targetUserId (Delete a user profile)
// ====================================================================
userRouter.delete('/:targetUserId', async (req: FilterMiddlewareRequest<User>, res: Response) => {
    const {userId, filters} = req;
    const {targetUserId} = req.params;
    try {
        if (!userId) {
            logger.warn(`Unauthorized attempt to delete user ${targetUserId}.`);
            return res.status(403).send('Not authorized');
        }

        logger.info(`Attempting to delete user ${targetUserId} by caller: ${userId}`);
        const deleted = await dbClient.users.delete(targetUserId, userId, filters);

        if (deleted === null) {
            logger.warn(`Deletion failed: User ID: ${targetUserId} not found or delete failed.`);
            return res.status(404).json({error: 'User not found or delete failed.'});
        }

        logger.info(`Successfully deleted user ${targetUserId} by caller: ${userId}`);
        return res.status(200).json({message: 'User deleted successfully.'});
    } catch (error) {
        logger.error(`Failed to delete user ${targetUserId} for caller: ${userId}.`, {error});
        return res.status(500).json({error: 'Failed to delete user profile.'});
    }
});


export default userRouter;