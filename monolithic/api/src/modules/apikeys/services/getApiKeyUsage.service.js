import crypto from "crypto";
import mongoose from "mongoose";
import { getRedisClient } from "../../../config/redis/redis.js";
import { ApiKeyUsage } from "../../../models/apiKeyUsage.model.js";
import { ApiKey } from "../../../models/apikeys.model.js";
import { cacheKey } from "../../../utils/cache/cacheKey.js";
import { cacheKeyExpiry } from "../../../utils/cache/cacheKeyExpiry.js";
import { AppError } from "../../../utils/errors/AppError.js";

const DEFAULT_LIMIT = 50;

const encodeCursor = (usage) => Buffer.from(JSON.stringify({
    timestamp: usage.timestamp.toISOString(),
    id: String(usage._id),
})).toString("base64url");

const decodeCursor = (cursor) => {
    try {
        const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        const timestamp = new Date(value.timestamp);

        if (Number.isNaN(timestamp.getTime()) || !mongoose.isValidObjectId(value.id)) {
            throw new Error("Invalid cursor value");
        }

        return { timestamp, id: value.id };
    } catch (_error) {
        throw new AppError("Invalid usage cursor", 400);
    }
};

const createQueryHash = (query) => crypto
    .createHash("sha256")
    .update(JSON.stringify(query))
    .digest("hex")
    .slice(0, 24);

const readCachedUsage = async (redis, key) => {
    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.warn(`[apikeys] usage cache read failed: ${error.message}`);
        return null;
    }
};

const cacheUsage = async (redis, key, result) => {
    try {
        await redis.set(
            key,
            JSON.stringify(result),
            "EX",
            cacheKeyExpiry.apiKeyUsageQueryExpiry(),
        );
    } catch (error) {
        console.warn(`[apikeys] usage cache write failed: ${error.message}`);
    }
};

export const getApiKeyUsage = async (req) => {
    if (req.auth?.type !== "jwt" || !req.auth.userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const userId = String(req.auth.userId);
    const apiKeyId = req.params.apiKeyId;
    const query = {
        limit: req.query.limit || DEFAULT_LIMIT,
        method: req.query.method || null,
        statusCode: req.query.statusCode || null,
        from: req.query.from || null,
        to: req.query.to || null,
        cursor: req.query.cursor || null,
    };
    const redis = getRedisClient();

    let version = "0";
    try {
        version = await redis.get(cacheKey.ApiKeyUsageVersion(apiKeyId)) || "0";
    } catch (error) {
        console.warn(`[apikeys] usage cache version read failed: ${error.message}`);
    }

    const resultCacheKey = cacheKey.ApiKeyUsageQuery(
        userId,
        apiKeyId,
        version,
        createQueryHash(query),
    );
    const cachedResult = await readCachedUsage(redis, resultCacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    const apiKeyExists = await ApiKey.exists({ _id: apiKeyId, userId });
    if (!apiKeyExists) {
        throw new AppError("API key not found", 404);
    }

    const filter = { apiKeyId, userId };
    if (query.method) filter.method = query.method;
    if (query.statusCode) filter.statusCode = query.statusCode;

    if (query.from || query.to) {
        filter.timestamp = {};
        if (query.from) filter.timestamp.$gte = new Date(query.from);
        if (query.to) filter.timestamp.$lte = new Date(query.to);
    }

    if (query.cursor) {
        const cursor = decodeCursor(query.cursor);
        filter.$or = [
            { timestamp: { $lt: cursor.timestamp } },
            { timestamp: cursor.timestamp, _id: { $lt: cursor.id } },
        ];
    }

    const rows = await ApiKeyUsage.find(filter)
        .select("_id apiKeyId ipAddress method endpoint statusCode durationMs timestamp")
        .sort({ timestamp: -1, _id: -1 })
        .limit(query.limit + 1)
        .lean();

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const result = {
        usage: page.map((item) => ({
            id: item._id,
            apiKeyId: item.apiKeyId,
            ipAddress: item.ipAddress,
            method: item.method,
            endpoint: item.endpoint,
            statusCode: item.statusCode,
            durationMs: item.durationMs,
            timestamp: item.timestamp,
        })),
        pagination: {
            limit: query.limit,
            hasMore,
            nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
        },
    };

    await cacheUsage(redis, resultCacheKey, result);
    return result;
};
