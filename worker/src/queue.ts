import {bullConnection, redisClient, DELAYED_NOTIFICATION_QUEUE} from "./config/redisClient";
import {Queue} from "bullmq";
import {v4 as uuidv4} from 'uuid';
import {NotificationQueue, ScheduledNotification, transactionType} from "./interfaces";

export const stageNotificationQueue = new Queue(DELAYED_NOTIFICATION_QUEUE, {
    connection: bullConnection,
});


export async function enqueueNotification(userId: string, notifications: ScheduledNotification[]) {
    const zsetKey = `notification:user:${userId}`;

    const jobs = await stageNotificationQueue.addBulk(
        notifications.map(notification => ({
            name: 'trigger-notification',
            data: notification,
            opts: {jobId: uuidv4(), delay: 30000}//Math.max(0, notification.triggerTime - Date.now())},
        }))
    )

    const bulkJobIds = jobs.map(job => job.id);

    if (notifications.length > 0) {
        const pipeline = redisClient.pipeline();

        notifications.forEach((notification, i) => {
            if (bulkJobIds[i]) {
                pipeline.zadd(zsetKey, notification.triggerTime,
                    JSON.stringify({
                        jobId: bulkJobIds[i],
                        ruleId: notification.ruleId,
                        stageId: notification.stageId,
                    })
                );
            }
        });
        await pipeline.exec();
    }

    console.log(
        `✅ Created ${notifications.length} notifications for user ${userId}`
    );
}


export async function dequeueNotification(userId: string, typeOfTransaction: transactionType, matchValue: string) {
    const zsetKey = `notification:user:${userId}`
    const matchKey: keyof NotificationQueue = typeOfTransaction === 'Stage' ? 'stageId' : 'ruleId'

    const members = await redisClient.zrange(zsetKey, 0, -1);
    if (members.length === 0) {
        console.log(`No notifications found for user ${userId}`);
        return;
    }

    const toRemove: NotificationQueue[] = members.map(raw => {
        const parsed: NotificationQueue = JSON.parse(raw);
        return parsed[matchKey] == matchValue && parsed;
    }).filter(n => n) as NotificationQueue[];

    if (toRemove.length === 0) return

    const pipeline = redisClient.pipeline();
    toRemove.forEach((member) => pipeline.zrem(zsetKey, JSON.stringify({
        jobId: member.queueJobId,
        ruleId: member.ruleId,
        stageId: member.stageId,
    })));
    await pipeline.exec();

    // Remove jobs from BullMQ in parallel
    await Promise.allSettled(
        toRemove.map(({queueJobId}) => stageNotificationQueue.remove(queueJobId))
    );

    console.log(
        `✅ Removed ${toRemove.length} notifications for user ${userId}`
    );
}

