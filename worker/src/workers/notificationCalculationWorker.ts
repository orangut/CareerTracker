import {Worker} from 'bullmq';
import {operationType, Transaction, transactionType} from '../interfaces';
import logger from "../config/logger";
import {connectionDetails, TRANSACTION_QUEUE} from "../config/redisClient";
import {getNotificationsToCreate} from "../transactionHandlers/stageTransactionHandler";
import {dequeueNotification, enqueueNotification} from "../queue";

export const notificationCalculationWorker = new Worker<Transaction>(
    TRANSACTION_QUEUE,
    async (job) => {
        const transaction = job.data;

        logger.info(`Processing transaction: ${JSON.stringify(transaction)}`);

        try {
            const operationKey = transaction.operation as operationType; // Assert to the keys available in the mapping
            const transactionTypeKey = transaction.transactionType as transactionType;

            if (operationKey === "DELETE") {
                await dequeueNotification(transaction.userId, transactionTypeKey, transaction.objectId);
                logger.info(`✓ Transaction processed successfully for ${transactionTypeKey}`);
            } else if (operationKey === "CREATE") {
                const notifications = await getNotificationsToCreate(transaction.userId, transactionTypeKey, transaction.objectId)
                await enqueueNotification(transaction.userId, notifications)
                logger.info(`✓ Transaction processed successfully for ${transactionTypeKey}`);
            } else {
                logger.error(`Invalid operation: ${operationKey}`)
            }
        } catch (error) {
            logger.error(`✗ Error processing transaction:`, error);
            throw error;
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
);

// Event Handlers
notificationCalculationWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
});

notificationCalculationWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
});

notificationCalculationWorker.on('error', (err) => {
    logger.error('Worker error:', err);
});
