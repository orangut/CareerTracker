// src/config/redisTransactionQueue.ts

import Redis from 'ioredis';
import dotenv from 'dotenv';

import logger from '../logger'
import {RedisOptions} from "bullmq";


dotenv.config();


const connectionDetails: RedisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0),
}


const redisOptions: RedisOptions = {
    ...connectionDetails,

    retryStrategy: (times) => Math.min(times * 100, 2000),

    reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
        if (targetErrors.some((msg) => err.message.includes(msg))) {
            logger.warn(`Reconnecting after error: ${err.message}`);
            return true;
        }
        return false;
    }
}

export const redisClient: Redis = new Redis(redisOptions);

/**
 * BullMQ expects either a Redis connection or connection options.
 * Exporting connection options keeps things consistent.
 */
export const bullConnection = redisOptions;


/**
 * Event listeners for connection health monitoring.
 */
redisClient.on('connect', () => {
    logger.info('✅ Connected to Redis');
});

redisClient.on('ready', () => {
    logger.info('✅ Redis connection ready');
});

redisClient.on('error', (err: Error) => {
    logger.error(`❌ Redis error: ${err.message}`);
});

redisClient.on('reconnecting', () => {
    logger.warn('🔁 Reconnecting to Redis...');
});

redisClient.on('end', () => {
    logger.warn('⚠️ Redis connection closed');
});
