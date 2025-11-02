import express from 'express';
import {randomUUID} from 'crypto'
import {dbClient} from "../config/dbClient";
import {redisClient} from "../config/redis/redisClient";
import {fetchUserNotifications, notifKey, notifSetKey} from "../utils/scheduledNotificationUtils";
import WebSocketServerManager from '../webSocket/server';
import logger from '../config/logger';

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
            expireAt: Date.now() + ttlMs, // optional: track expiry
        };

        WebSocketServerManager.sendNotification(rule.userId.toString(), notification.message);

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

export default ScheduledNotificationRouter;
