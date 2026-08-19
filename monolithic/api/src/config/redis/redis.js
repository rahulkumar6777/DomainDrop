import Redis from 'ioredis';
import { envs } from '../../lib/env.js';

let redis;


export const connectRedis = async () => {
    try {
        redis = new Redis(envs.REDIS_URI, {
            enableReadyCheck: true,
            lazyConnect: true
        });
        await redis.set('foo', 'bar');
        console.log("Redis Connected")
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        process.exit(1);
    }
}

export const getRedisClient = () => {
    if (!redis) {
        throw new Error('Redis client is not initialized. Call connectRedis() first.');
    }
    return redis;
}