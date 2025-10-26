import {Worker} from "bullmq";
import {ScheduledNotification} from "../interfaces";
import {connectionDetails, DELAYED_NOTIFICATION_QUEUE, redisClient} from "../config/redisClient";
import logger from "../config/logger";
import {ScheduledNotificationClient} from "../config/scheduledNotificationClient";
import {delayedNotificationSetKey} from "../queue";


export const notificationTriggerWorker = new Worker<ScheduledNotification>(
    DELAYED_NOTIFICATION_QUEUE,
    async (job) => {
        const { userId, ruleId, stageId, triggerTime } = job.data;
        const zsetKey = delayedNotificationSetKey(userId);
        const jobId = job.id; // The ID of the current BullMQ job

        logger.info(`notification of user: ${userId}. ruleId: ${ruleId}, stageId: ${stageId}. TriggerTime: ${new Date(triggerTime)}. JobID: ${job.id} `);

        // TODO: handle jwt with the backend and put the workerId instead of userId
        await ScheduledNotificationClient.post('', {'workerId': userId, stageId, ruleId})

        try {
            // Construct the EXACT JSON string used when enqueuing the job
            const memberToRemove = JSON.stringify({
                jobId: jobId, // Use the current job's ID
                ruleId: ruleId,
                stageId: stageId,
            });

            // Use ZREM (Sorted Set Remove) with the key and the exact member string
            const removeResult = await redisClient.zrem(zsetKey, memberToRemove);

            if (removeResult === 1) {
                console.log(`🧹 Successfully removed job ${jobId} from ZSET ${zsetKey}`);
            } else if (removeResult === 0) {
                console.warn(`⚠️ Job ${jobId} was not found in ZSET ${zsetKey}. It may have already been removed.`);
            } else {
                console.error(`❌ Unexpected ZREM result (${removeResult}) for job ${jobId}.`);
            }

        } catch (error) {
            console.error(`❌ Error during ZSET cleanup for job ${jobId}:`, error);
            // Handle cleanup failure if necessary
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
