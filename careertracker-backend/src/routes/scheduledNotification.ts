import express from 'express';
import {randomUUID} from 'crypto'
import {dbClient} from "../config/dbClient";
import {redisClient} from "../config/redis/redisClient";
import {fetchUserNotifications, notifKey, notifSetKey} from "../utils/scheduledNotificationUtils";
import WebSocketServerManager from '../webSocket/server';
import logger from '../config/logger';
import authenticateToken, {AuthenticatedRequest} from '../middleware/authenticateToken';
import {userFiltersHandler} from '../middleware/filterMiddleware';

const ScheduledNotificationRouter = express.Router();


/** ------------------------------
 * Utility: TTL calculation helper
 * (You can customize this logic)
 * ----------------------------- */
function calculateTTL(rule: any, stage: any): number {
    // Dummy fallback (e.g., 1 hour)
    // Replace with your real logic
    return rule?.ttlMs || 60 * 60 * 1000;
}

/** ------------------------------
 * POST /notifications
 * Creates a new notification with TTL
 * ----------------------------- */
ScheduledNotificationRouter.post('/', async (req, res) => {
    const {workerId, ruleId, stageId} = req.body;
    if (!ruleId || !stageId) {
        return res.status(400).json({error: 'ruleId and stageId are required'});
    }

    try {
        // --- Fetch from Mongo ---
        let rule, stage, jobApplication;
        try {
            rule = await dbClient.notificationRules.getById(workerId, ruleId);
            stage = await dbClient.stages.getById(workerId, stageId);
        } catch (err) {
            logger.error('Mongo fetch error:', err);
            return res.status(500).json({error: 'Failed to fetch rule or stage'});
        }
        if (!rule || !stage) {
            return res.status(404).json({error: 'Rule or stage not found'});
        }

        jobApplication = await dbClient.jobApplications.getById(workerId, stage.jobApplicationId.toString())

        if (jobApplication?.userId !== rule.userId) {
            return res.status(500).json({error: "Job's userId and Rule's userId unmatched!"});
        }

        // --- Compose notification ---
        const notificationId = randomUUID();
        const ttlMs = Math.min(calculateTTL(rule, stage), 100000000); // at least 1s
        const ttlSeconds = Math.ceil(ttlMs / 1000);

        const notification = {
            id: notificationId,
            userId: rule.userId,
            jobApplicationId: jobApplication._id,
            message: `In the company ${jobApplication.company} - the stage "${stage.type}" triggered by rule "${rule.stageField}".`,
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            expireAt: Date.now() + ttlMs, // optional: track expiry
        };

        WebSocketServerManager.sendNotification(rule.userId.toString(), notification);

        const notifRedisKey = notifKey(rule.userId.toString(), notificationId);
        const userSetRedisKey = notifSetKey(rule.userId.toString());

        // --- Save in Redis atomically ---
        const pipeline = redisClient.multi();
        pipeline.set(notifRedisKey, JSON.stringify(notification), 'EX', ttlSeconds);
        pipeline.sadd(userSetRedisKey, notifRedisKey);
        const results = await pipeline.exec();

        if (!results) throw new Error('Redis pipeline failed');

        res.status(201).json({
            success: true,
            notification,
            expiresIn: ttlSeconds,
        });
    } catch (err) {
        logger.error('Error creating notification:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

/** ------------------------------
 * GET /notifications/:userId
 * Fetches all active notifications for a user
 * ----------------------------- */
ScheduledNotificationRouter.get('/:userId', async (req, res) => {
    const {userId} = req.params;

    try {
        const notifications = await fetchUserNotifications(userId);
        res.status(200).json(notifications.filter(Boolean));
    } catch (err) {
        logger.error('Error fetching notifications:', err);
        res.status(500).json({error: 'Failed to fetch notifications'});
    }
});

ScheduledNotificationRouter.delete('/:notificationId', authenticateToken, userFiltersHandler, async (req: AuthenticatedRequest, res) => {
    const {userId} = req;
    const {notificationId} = req.params;
    try {
        if (!userId) {
            return res.status(403).json({error: 'Not authorized'});
        }
        const notifRedisKey = notifKey(userId, notificationId);
        const userSetRedisKey = notifSetKey(userId);

        const pipeline = redisClient.multi();
        pipeline.del(notifRedisKey);
        pipeline.srem(userSetRedisKey, notifRedisKey);
        const results = await pipeline.exec();

        if (!results) throw new Error('Redis pipeline failed');

        res.status(200).json({'message': 'Notification deleted successfully.'});
    } catch (err) {
        logger.error('Error creating notification:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

ScheduledNotificationRouter.put('/:notificationId', authenticateToken, userFiltersHandler, async (req: AuthenticatedRequest, res) => {
    const { userId } = req;
    const { notificationId } = req.params;

    // --- Main Try/Catch Block ---
    // This catches any unexpected errors (e.g., Redis connection lost)
    try {
        if (!userId) {
            logger.warn('Unauthorized attempt to update notification without user ID.');
            // 403 Forbidden
            return res.status(403).send('Not authorized');
        }

        const notifRedisKey = notifKey(userId.toString(), notificationId);

        // --- Get current data and TTL ---
        const pipeline = redisClient.multi();
        pipeline.get(notifRedisKey); // Get the current value
        pipeline.ttl(notifRedisKey); // Get the remaining time-to-live
        const results = await pipeline.exec();

        if (results === null) {
            logger.error(`Redis transaction was aborted for key: ${notifRedisKey}`);
            // 500 Internal Server Error
            return res.status(500).send('Redis transaction failed.');
        }

        const currentNotificationStr = results[0][1];
        const ttlSeconds: number = results[1][1] as number;

        // --- Check if notification exists ---
        // If GET returned null or TTL is -2 (key doesn't exist)
        if (ttlSeconds === -2 || typeof currentNotificationStr !== "string") {
            logger.warn(`Attempted to update non-existent notification. Key: ${notifRedisKey}`);
            // 404 Not Found
            return res.status(404).send('Notification not found.');
        }

        // --- Parse, Update, and Save ---
        try {
            const notification = JSON.parse(currentNotificationStr);

            // Create the new object by merging old data with new data from req.body
            const updatedNotification = {
                ...notification,
                ...req.body,
                updatedAt: new Date().toISOString(),
            };

            const updatedNotificationStr = JSON.stringify(updatedNotification);

            let redisResult;

            // We must preserve the original TTL
            if (ttlSeconds > 0) {
                // Key has an expiration
                redisResult = await redisClient.set(
                    notifRedisKey,
                    updatedNotificationStr,
                    'EX',
                    ttlSeconds
                );
            } else if (ttlSeconds === -1) {
                // Key has no expiration
                redisResult = await redisClient.set(
                    notifRedisKey,
                    updatedNotificationStr
                );
            } else {
                // This case should be impossible due to the check above, but for safety:
                logger.warn(`Notification found but has invalid TTL (${ttlSeconds}). Key: ${notifRedisKey}`);
                return res.status(404).send('Notification state is invalid.');
            }

            // --- Send Success or Failure Response ---
            if (redisResult === 'OK') {
                logger.info(`Successfully updated notification. Key: ${notifRedisKey}`);
                // 200 OK: Send the complete updated object back to the client
                return res.status(200).json(updatedNotification);
            } else {
                logger.error(`Redis SET command failed for key: ${notifRedisKey}`);
                // 500 Internal Server Error
                return res.status(500).send('Failed to save update to database.');
            }

        } catch (parseError) {
            // This catch handles errors from JSON.parse()
            logger.error(`Failed to parse existing notification JSON. Key: ${notifRedisKey}`, parseError);
            // 500 Internal Server Error
            return res.status(500).send('Failed to read existing notification data.');
        }

    } catch (err) {
        // This is the general catch-all for any other error
        logger.error(`Unhandled error in update notification route for user ${userId}:`, err);
        // 500 Internal Server Error
        return res.status(500).send('An internal server error occurred.');
    }
});

export default ScheduledNotificationRouter;
