import dotenv from 'dotenv';
import {redisClient} from './config/redisClient';
import {notificationCalculationWorker} from './workers/notificationCalculationWorker';
import {notificationTriggerWorker} from './workers/notificationTriggerWorker'
import logger from './config/logger';

dotenv.config();

// Graceful Shutdown
const shutdown = async () => {
    logger.info('Shutting down gracefully...');

    try {
        await notificationCalculationWorker.close();
        await notificationTriggerWorker.close();
        logger.info('Worker closed');

        await redisClient.quit();
        logger.info('Redis connection closed');

        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown();
});

logger.info('🚀 Notification Calculation Worker started');
logger.info('🚀 Notification Trigger Worker started');

export {notificationCalculationWorker, notificationTriggerWorker};