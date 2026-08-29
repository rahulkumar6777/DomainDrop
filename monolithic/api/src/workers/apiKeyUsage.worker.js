import crypto from "crypto";
import { ApiKeyUsage } from "../models/apiKeyUsage.model.js";
import { ApiKey } from "../models/apikeys.model.js";
import { getRedisClient } from "../config/redis/redis.js";
import { cacheKey } from "../utils/cache/cacheKey.js";

const FLUSH_INTERVAL_MS = 10 * 1000;
const FLUSH_BATCH_SIZE = 500;
const FLUSH_LOCK_SECONDS = 5 * 60;
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CLAIM_SNAPSHOT_SCRIPT = `
if redis.call("EXISTS", KEYS[1]) == 1 then
    redis.call("RENAME", KEYS[1], KEYS[2])
    return 1
end
return 0
`;

const RELEASE_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
end
return 0
`;

let flushRunning = false;

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

    return [...new Set(keys)].sort();
};

const parseUsage = (value) => {
    try {
        const usage = JSON.parse(value);
        const timestamp = new Date(usage.timestamp);

        if (
            !UUID_V4_PATTERN.test(usage.eventId) ||
            !OBJECT_ID_PATTERN.test(usage.apiKeyId) ||
            !OBJECT_ID_PATTERN.test(usage.userId) ||
            typeof usage.method !== "string" ||
            !usage.method ||
            typeof usage.endpoint !== "string" ||
            !usage.endpoint ||
            !Number.isInteger(usage.statusCode) ||
            usage.statusCode < 100 ||
            usage.statusCode > 599 ||
            !Number.isFinite(usage.durationMs) ||
            usage.durationMs < 0 ||
            Number.isNaN(timestamp.getTime())
        ) {
            return null;
        }

        return {
            eventId: usage.eventId,
            apiKeyId: usage.apiKeyId,
            userId: usage.userId,
            ipAddress: typeof usage.ipAddress === "string" ? usage.ipAddress.slice(0, 64) : null,
            method: usage.method.toUpperCase().slice(0, 10),
            endpoint: usage.endpoint.slice(0, 300),
            statusCode: usage.statusCode,
            durationMs: usage.durationMs,
            timestamp,
        };
    } catch (_error) {
        return null;
    }
};

const persistUsageBatch = async (events) => {
    if (events.length === 0) {
        return;
    }

    await ApiKeyUsage.bulkWrite(
        events.map((event) => ({
            updateOne: {
                filter: { eventId: event.eventId },
                update: { $setOnInsert: event },
                upsert: true,
            },
        })),
        { ordered: false },
    );

    const latestUsageByKey = new Map();
    for (const event of events) {
        const currentTimestamp = latestUsageByKey.get(event.apiKeyId);
        if (!currentTimestamp || event.timestamp > currentTimestamp) {
            latestUsageByKey.set(event.apiKeyId, event.timestamp);
        }
    }

    await ApiKey.bulkWrite(
        [...latestUsageByKey].map(([apiKeyId, lastUsedAt]) => ({
            updateOne: {
                filter: { _id: apiKeyId },
                update: { $max: { lastUsedAt } },
            },
        })),
        { ordered: false },
    );
};

const flushSnapshot = async (redis, snapshotKey, persistBatch) => {
    let flushedEvents = 0;

    while (true) {
        const bufferedValues = await redis.lrange(snapshotKey, 0, FLUSH_BATCH_SIZE - 1);
        if (bufferedValues.length === 0) {
            await redis.del(snapshotKey);
            return flushedEvents;
        }

        const events = bufferedValues.map(parseUsage).filter(Boolean);
        await persistBatch(events);
        await redis.ltrim(snapshotKey, bufferedValues.length, -1);
        flushedEvents += events.length;
    }
};

const claimPendingSnapshot = async (redis) => {
    const snapshotKey = cacheKey.ApiKeyUsageProcessing(
        `${Date.now()}-${crypto.randomUUID()}`,
    );
    const claimed = await redis.eval(
        CLAIM_SNAPSHOT_SCRIPT,
        2,
        cacheKey.ApiKeyUsagePending(),
        snapshotKey,
    );

    return Number(claimed) === 1 ? snapshotKey : null;
};

export const flushApiKeyUsage = async ({
    redis = getRedisClient(),
    persistBatch = persistUsageBatch,
} = {}) => {
    if (flushRunning) {
        return 0;
    }

    flushRunning = true;
    const lockToken = crypto.randomUUID();
    let hasLock = false;

    try {
        hasLock = await redis.set(
            cacheKey.ApiKeyUsageFlushLock(),
            lockToken,
            "EX",
            FLUSH_LOCK_SECONDS,
            "NX",
        ) === "OK";

        if (!hasLock) {
            return 0;
        }

        let flushedEvents = 0;
        const abandonedSnapshots = await scanKeys(
            redis,
            cacheKey.ApiKeyUsageProcessingPattern(),
        );

        for (const snapshotKey of abandonedSnapshots) {
            flushedEvents += await flushSnapshot(redis, snapshotKey, persistBatch);
        }

        const pendingSnapshot = await claimPendingSnapshot(redis);
        if (pendingSnapshot) {
            flushedEvents += await flushSnapshot(redis, pendingSnapshot, persistBatch);
        }

        return flushedEvents;
    } finally {
        try {
            if (hasLock) {
                await redis.eval(
                    RELEASE_LOCK_SCRIPT,
                    1,
                    cacheKey.ApiKeyUsageFlushLock(),
                    lockToken,
                );
            }
        } finally {
            flushRunning = false;
        }
    }
};

export const startApiKeyUsageWorker = () => {
    flushApiKeyUsage()
        .then((count) => {
            if (count > 0) console.log(`[apikeys] flushed ${count} usage events`);
        })
        .catch((error) => console.warn(`[apikeys] usage flush failed: ${error.message}`));

    const timer = setInterval(() => {
        flushApiKeyUsage()
            .then((count) => {
                if (count > 0) console.log(`[apikeys] flushed ${count} usage events`);
            })
            .catch((error) => console.warn(`[apikeys] usage flush failed: ${error.message}`));
    }, FLUSH_INTERVAL_MS);

    timer.unref();
    return timer;
};
