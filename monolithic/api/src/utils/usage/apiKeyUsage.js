import crypto from "crypto";
import { getRedisClient } from "../../config/redis/redis.js";
import { cacheKey } from "../cache/cacheKey.js";

const getEndpoint = (req) => {
    const routePath = typeof req.route?.path === "string" ? req.route.path : req.path;
    return `${req.baseUrl || ""}${routePath || "unknown"}`.slice(0, 300);
};

export const enqueueApiKeyUsage = (redis, usage) =>
    redis.rpush(cacheKey.ApiKeyUsagePending(), JSON.stringify(usage));

export const captureApiKeyUsage = (req, res, auth, startedAt) => {
    res.once("finish", () => {
        const elapsedNanoseconds = process.hrtime.bigint() - startedAt;
        const durationMs = Math.round((Number(elapsedNanoseconds) / 1_000_000) * 1000) / 1000;
        const usage = {
            eventId: crypto.randomUUID(),
            apiKeyId: auth.apiKeyId,
            userId: auth.userId,
            ipAddress: req.ip ? String(req.ip).slice(0, 64) : null,
            method: String(req.method || "UNKNOWN").toUpperCase().slice(0, 10),
            endpoint: getEndpoint(req),
            statusCode: res.statusCode,
            durationMs,
            timestamp: new Date().toISOString(),
        };

        let redis;
        try {
            redis = getRedisClient();
        } catch (error) {
            console.warn(`[apikeys] usage buffer failed: ${error.message}`);
            return;
        }

        enqueueApiKeyUsage(redis, usage).catch((error) => {
            console.warn(`[apikeys] usage buffer failed: ${error.message}`);
        });
    });
};
