import express from 'express';
import {randomUUID} from 'crypto'
import {dbClient} from "../config/dbClient";
import {redisClient} from "../config/redis/redisClient";

const ScheduledNotificationRouter = express.Router();

/** ------------------------------
 * Helper functions for Redis keys
 * ----------------------------- */
const notifKey = (userId: string, notifId: string) => `notif:${userId}:${notifId}`;
const notifSetKey = (userId: string) => `notifications:${userId}`;

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
        let rule, stage;
        try {
            rule = await dbClient.notificationRules.getById(workerId, ruleId);
            stage = await dbClient.stages.getById(workerId, stageId);
        } catch (err) {
            console.error('Mongo fetch error:', err);
            return res.status(500).json({error: 'Failed to fetch rule or stage'});
        }

        if (!rule || !stage) {
            return res.status(404).json({error: 'Rule or stage not found'});
        }

        // --- Compose notification ---
        const notificationId = randomUUID();
        const ttlMs = Math.min(calculateTTL(rule, stage), 100000); // at least 1s
        const ttlSeconds = Math.ceil(ttlMs / 1000);

        const notification = {
            id: notificationId,
            userId: rule.userId,
            message: `Stage "${stage.type}" triggered by rule "${rule.stageField}".`,
            isRead: false,
            createdAt: new Date().toISOString(),
            expireAt: Date.now() + ttlMs, // optional: track expiry
        };

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
        console.error('Error creating notification:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

/** ------------------------------
 * GET /notifications/:userId
 * Fetches all active notifications for a user
 * ----------------------------- */
ScheduledNotificationRouter.get('/:userId', async (req, res) => {
    const {userId} = req.params;
    const userSetRedisKey = notifSetKey(userId);

    try {
        const notifKeys = await redisClient.smembers(userSetRedisKey);

        if (!notifKeys.length) {
            return res.status(200).json([]);
        }

        // Check which notifications still exist
        const existsResults = await Promise.all(
            notifKeys.map((key) => redisClient.exists(key))
        );

        const validKeys = notifKeys.filter((_, i) => existsResults[i] === 1);
        const expiredKeys = notifKeys.filter((_, i) => existsResults[i] === 0);

        // Cleanup expired references
        if (expiredKeys.length > 0) {
            const cleanupPipeline = redisClient.multi();
            cleanupPipeline.srem(userSetRedisKey, ...expiredKeys);
            await cleanupPipeline.exec();
        }

        // Fetch valid notifications
        const notifications = await Promise.all(
            validKeys.map(async (key) => {
                try {
                    const data = await redisClient.get(key);
                    return data ? JSON.parse(data) : null;
                } catch (err) {
                    console.warn(`Failed to parse notification ${key}:`, err);
                    return null;
                }
            })
        );

        res.status(200).json(notifications.filter(Boolean));
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({error: 'Failed to fetch notifications'});
    }
});

export default ScheduledNotificationRouter;
