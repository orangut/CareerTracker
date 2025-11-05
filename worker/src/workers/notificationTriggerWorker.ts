import {Worker} from "bullmq";
import {randomUUID} from 'crypto'
import {ScheduledNotification} from "../interfaces";
import {connectionDetails, DELAYED_NOTIFICATION_QUEUE, redisClient} from "../config/redisClient";
import logger from "../config/logger";
import {delayedNotificationSetKey} from "../delayedNotificationQueue";
import {dbClient} from "../config/dbClient";


const NOTIFICATION_CHANNEL = 'global_notifications';


/** ------------------------------
 * Helper functions for Redis keys
 * ----------------------------- */
export const notifKey = (userId: string, notifId: string) => `notif:${userId}:${notifId}`;
export const notifSetKey = (userId: string) => `notifications:${userId}`;


/** ------------------------------
 * Utility: TTL calculation helper
 * (You can customize this logic)
 * ----------------------------- */
function calculateTTL(rule: any, stage: any): number {
    // Dummy fallback (e.g., 1 hour)
    // Replace with your real logic
    return rule?.ttlMs || 60 * 60 * 1000;
}

/* It fetches data, builds the notification, saves it to Redis, and publishes it.
* @param workerId - The ID of the worker processing the job
* @param ruleId - The ID of the rule that was triggered
* @param stageId - The ID of the stage that was matched
*/
async function processAndPublishNotification({
                                                 userId,
                                                 ruleId,
                                                 stageId,
                                                 triggerTime
                                             }: ScheduledNotification, jobId: string | undefined) {
    let rule, stage, jobApplication;

    // TODO: Currently mocked workerId, needs to implement a real JWT with the backend and fetch the workerId from the jwt.
    const workerId = randomUUID();

    // --- 1. Fetch all data ---
    try {
        rule = await dbClient.notificationRules.getById(userId, ruleId);
        stage = await dbClient.stages.getById(userId, stageId);
    } catch (err) {
        logger.error(`[Worker] Api fetch error for rule/stage: ${err}`);
        throw new Error(`Api Rule or Stage fetch error: ${err}`);
    }

    if (!rule || !stage) {
        logger.warn(`[Worker] Rule (${ruleId}) or Stage (${stageId}) not found. Aborting notification.`);
        return;
    }

    // --- 2. Fetch Job Application ---
    try {
        jobApplication = await dbClient.jobApplications.getById(userId, stage.jobApplicationId.toString());
    } catch (err) {
        logger.error(`[Worker] Api fetch error for jobApp ${stage.jobApplicationId}: ${err}`);
        throw new Error(`Api jobApplication fetch error: ${err}`);
    }

    if (!jobApplication || jobApplication.userId !== rule.userId) {
        logger.error(`[Worker] Job's userId and Rule's userId unmatched! Rule: ${ruleId}`);
        return;
    }

    // --- 3. Compose Notification (This logic is moved from backend) ---
    const notificationId = randomUUID();
    const ttlMs = Math.min(calculateTTL(rule, stage), 100000000); // at least 1s
    const ttlSeconds = Math.ceil(ttlMs / 1000);

    const notification = {
        id: notificationId,
        ruleId: ruleId,
        stageId: stageId,
        userId: rule.userId,
        jobApplicationId: jobApplication._id,
        message: `In the company ${jobApplication.company} - the stage "${stage.type}" triggered by rule "${rule.stageField}".`,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expireAt: Date.now() + ttlMs, // optional: track expiry
    };

    const notificationString = JSON.stringify(notification);
    const userIdString = rule.userId.toString();

    // --- 4. Prepare Redis Pipeline (Persist + Publish) ---
    const notifRedisKey = notifKey(userIdString, notificationId);
    const userSetRedisKey = notifSetKey(userIdString);

    // Using the "prefix" method (Option 2 from our discussion)
    const pubSubMessage = `${userIdString}:${notificationString}`;

    const pipeline = redisClient.multi();

    // A. Persist the notification string
    pipeline.set(notifRedisKey, notificationString, 'EX', ttlSeconds);
    // B. Add to the user's set of notifications
    pipeline.sadd(userSetRedisKey, notifRedisKey);
    // C. Publish for real-time listeners
    pipeline.publish(NOTIFICATION_CHANNEL, pubSubMessage);

    // Construct the EXACT JSON string used when enqueuing the job
    const memberToRemoveFromDelayedNotificationSet = JSON.stringify({
        jobId: jobId, // Use the current job's ID
        ruleId: ruleId,
        stageId: stageId,
    });

    // D. Removed from delayed notification set the processed job
    pipeline.zrem(delayedNotificationSetKey(userId), memberToRemoveFromDelayedNotificationSet);

    // --- 5. Execute all at once ---
    try {
        await pipeline.exec();

        logger.info(`[Worker] Successfully processed and published notification ${notificationId} for user ${userIdString}`);
    } catch (err) {
        logger.error(`[Worker] Redis pipeline failed for notification ${notificationId}: ${err}`)
    }
}


export const notificationTriggerWorker = new Worker<ScheduledNotification>(
    DELAYED_NOTIFICATION_QUEUE,
    async (job) => {
        try {
            await processAndPublishNotification(job.data, job.id);
        } catch (err: any) {
            logger.error(`Job ${job.id} failed: ${err.message}`);
            throw err;
        }
    },
    {
        connection: connectionDetails,
        concurrency: 5,
        limiter: {
            max: 100,
            duration: 1000,
        },
    }
)

// Event Handlers
notificationTriggerWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
});

notificationTriggerWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
});

notificationTriggerWorker.on('error', (err) => {
    logger.error('Worker error:', err);
});
