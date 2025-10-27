import {redisClient} from "../config/redis/redisClient";
import logger from "../config/logger";

/** ------------------------------
 * Helper functions for Redis keys
 * ----------------------------- */
export const notifKey = (userId: string, notifId: string) => `notif:${userId}:${notifId}`;
export const notifSetKey = (userId: string) => `notifications:${userId}`;


export const fetchUserNotifications = async (userId: string) => {
    const userSetRedisKey = notifSetKey(userId);

    try {
        const notifKeys = await redisClient.smembers(userSetRedisKey);

        if (!notifKeys.length) {
            return []
        }

        // Check which notifications still exist
        // Log the operation for tracking
        logger.debug(`Checking existence for ${notifKeys.length} notification keys for user ${userId}.`);

        const existsResults = await Promise.all(
            notifKeys.map((key) => redisClient.exists(key))
        );

        const validKeys = notifKeys.filter((_, i) => existsResults[i] === 1);
        const expiredKeys = notifKeys.filter((_, i) => existsResults[i] === 0);

        // Cleanup expired references
        if (expiredKeys.length > 0) {
            logger.info(`Cleaning up ${expiredKeys.length} expired notification references for user ${userId}.`);
            const cleanupPipeline = redisClient.multi();
            cleanupPipeline.srem(userSetRedisKey, ...expiredKeys);

            try {
                await cleanupPipeline.exec();
            } catch (cleanupError) {
                // Log the cleanup failure but proceed with fetching valid keys
                logger.error(`Failed to cleanup expired keys for user ${userId}:`, cleanupError);
                // We won't re-throw here, as the main goal (fetching valid notifs) can still proceed.
            }
        }

        // Fetch valid notifications
        logger.debug(`Fetching ${validKeys.length} valid notifications for user ${userId}.`);

        const notifications = await Promise.all(
            validKeys.map(async (key) => {
                try {
                    const data = await redisClient.get(key);
                    return data ? JSON.parse(data) : null;
                } catch (err) {
                    // Existing logging for JSON parsing errors is good
                    logger.error(`Failed to parse or fetch notification data for key ${key}:`, err);
                    return null;
                }
            })
        );

        return notifications.filter(Boolean); // Filter out any nulls from parsing/fetching errors

    } catch (err) {
        // Top-level error handling for Redis connection issues, smembers, exists, or general Promise.all failures
        logger.error(`An error occurred while fetching user notifications for userId ${userId}:`, err);
        // Ensure the function still returns an array, satisfying the caller's expectation
        return [];
    }
}