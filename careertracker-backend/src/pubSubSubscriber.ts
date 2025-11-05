import logger from "./config/logger";
import {redisClient} from './config/redis/redisClient'
import {sendNotification} from "./webSocket/server";


export const NOTIFICATION_CHANNEL = 'global_notifications'; // Must match your worker!

export const subscriberClient = redisClient.duplicate();

subscriberClient.on('error', (err) => {
    logger.error('Redis Subscriber Client Error:', err);
});

// This is the "listener" that runs when the worker publishes a message
subscriberClient.on('message', (channel, message) => {
    // Only listen to the channel we care about
    if (channel !== NOTIFICATION_CHANNEL) {
        return;
    }

    try {
        // A. Split the message "USER_ID:JSON_STRING" (from Option 2)
        const separatorIndex = message.indexOf(':');
        if (separatorIndex === -1) {
            logger.warn('Received malformed pub/sub message (no separator)');
            return;
        }

        const userId = message.substring(0, separatorIndex);
        const notificationString = message.substring(separatorIndex + 1);

        // B. Parse the full notification object
        const notification = JSON.parse(notificationString);

        // C. Call your existing WebSocket manager to send the push
        //    This will find all sockets for that user *on this instance*
        //    and send the message.
        sendNotification(userId, notification);

    } catch (err: any) {
        logger.error(`Failed to process pub/sub notification: ${err.message}`, {message});
    }
});