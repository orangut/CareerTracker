// src/config/transactionQueue.ts

import {Queue} from 'bullmq';
import dotenv from 'dotenv';
import logger from '../logger'; // Use your existing logger
import {bullConnection} from './redisClient'

dotenv.config();

// Queue name (used by both producer and worker)
const TRANSACTION_QUEUE_NAME = 'notification_transactions';

// Transaction types
type TransactionType = 'Stage' | 'Rule';
type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

// Interface for the data that will be passed inside the BullMQ job
interface TransactionPayload {
    transactionType: TransactionType;
    operation: OperationType;
    userId: string;
    objectId: string; // The ID of the document being acted upon
    timestamp: number;
}

// 1. Initialize the BullMQ Queue instance
const transactionQueue = new Queue(TRANSACTION_QUEUE_NAME, {
    connection: bullConnection,
    // Optional: Add default job options like retries
    defaultJobOptions: {
        attempts: 3,
        backoff: {type: 'exponential', delay: 5000},
    },
});

logger.info(`BullMQ Queue '${TRANSACTION_QUEUE_NAME}' initialized.`);

/**
 * Pushes a new transaction job to the BullMQ queue.
 * @param transactionType - The type of document being modified.
 * @param operation - The CRUD operation being performed.
 * @param userId - The ID of the user performing the operation.
 * @param objectId - The ID of the document being acted upon.
 */
export async function pushTransaction(
    transactionType: TransactionType,
    operation: OperationType,
    userId: string,
    objectId: string
) {
    const payload: TransactionPayload = {
        transactionType,
        operation,
        userId,
        objectId,
        timestamp: Date.now(),
    };

    try {
        // 2. BullMQ Method: Use queue.add() instead of redisClient.lpush()
        // Job Name ('process' here) is used to identify the job's purpose;
        // Data is the payload the worker receives.
        await transactionQueue.add('process', payload);
        logger.debug(`Transaction job added: ${JSON.stringify(payload)}`);

    } catch (err) {
        logger.error('Failed to add transaction job to BullMQ:', err);
        throw new Error('Queueing failed.'); // Re-throw for upstream error handling
    }
}
