import {Worker} from "bullmq";
import {ScheduledNotification} from "../interfaces";
import {connectionDetails, DELAYED_NOTIFICATION_QUEUE} from "../config/redisClient";
import logger from "../config/logger";


export const notificationTriggerWorker = new Worker<ScheduledNotification>(
    DELAYED_NOTIFICATION_QUEUE,
    async (job) => {
        const data = job.data;
        logger.info(`notification of user: ${data.userId}. ruleId: ${data.ruleId}, stageId: ${data.stageId}. TriggerTime: ${new Date(data.triggerTime)} `);
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
