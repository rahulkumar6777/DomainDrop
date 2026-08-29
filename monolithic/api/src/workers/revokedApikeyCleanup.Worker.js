import cron from 'node-cron';
import { ApiKey } from '../models/apikeys.model.js'
import { ApiKeyUsage } from "../models/apiKeyUsage.model.js";
import { getRedisClient } from "../config/redis/redis.js";
import { cacheKey } from "../utils/cache/cacheKey.js";


const Batch_Size = 10_000;
let isRunning = false;

const scanKeys = async (redis, pattern) => {
    let cursor = "0";
    const keys = [];

    do {
        const [nextCursor, foundKeys] = await redis.scan(
            cursor,
            "MATCH",
            pattern,
            "COUNT",
            100,
        );
        cursor = nextCursor;
        keys.push(...foundKeys);
    } while (cursor !== "0");

    return [...new Set(keys)];
};

const clearApiKeyCache = async (redis, apikey) => {
    const usageKeys = await scanKeys(
        redis,
        cacheKey.ApiKeyUsageQueryPattern(apikey.userId, apikey._id),
    );
    const keys = [
        cacheKey.ApiKey(apikey.keyHash),
        cacheKey.ApiKeyUsageVersion(apikey._id),
        ...usageKeys,
    ];

    return redis.del(...keys);
};

export const cleanupRevokedApiKeys = async () => {


    if (isRunning) {
        console.log('Previous job is still running, skipping...');
        return 0;
    }

    isRunning = true;
    let lastId = null;
    let deletedCount = 0;
    let deletedCacheCount = 0;

    try {
        const redis = getRedisClient();

        while (true) {

            const query = lastId ? { _id: { $gt: lastId }, status: "revoked" } : { status: "revoked" };

            const apikeys = await ApiKey.find(query)
                .select("+keyHash userId")
                .sort({ _id: 1 })
                .limit(Batch_Size)
                .lean()

            if (apikeys.length === 0) {
                break;
            }

            console.log(`Processing ${apikeys.length} documents`);

            for (const apikey of apikeys) {
                try {
                    deletedCacheCount += await clearApiKeyCache(redis, apikey);
                } catch (error) {
                    console.warn(`[apikeys] revoked cache cleanup failed for ${apikey._id}: ${error.message}`);
                }

                await ApiKeyUsage.deleteMany({ apiKeyId: apikey._id });
                await ApiKey.deleteOne({ _id: apikey._id });
                deletedCount += 1;
            }

            lastId = apikeys[apikeys.length - 1]._id;
        }

        if (deletedCount > 0) {
            console.log(`[apikeys] removed ${deletedCount} revoked keys and ${deletedCacheCount} Redis entries`);
        }

        return deletedCount;
    } catch (error) {
        console.error(`[apikeys] revoked cleanup failed: ${error.message}`);
        return deletedCount;

    } finally {
        isRunning = false;
    }
};

// this job runs every minute
cron.schedule("* * * * *", cleanupRevokedApiKeys);
