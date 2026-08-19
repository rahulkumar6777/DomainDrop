import { ApiKey } from "../../../models/apikeys.model.js";
import { getRedisClient } from "../../../config/redis/redis.js";
import { cacheApiKey } from "../../../utils/cache/apiKeyCache.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { generateApiKey, getApiKeyPrefix, hashApiKey, } from "../../../utils/generateApikey.js";

export const createApiKey = async (req) => {

    const userId = req.auth?.userId ?? req.user?._id;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    if (req.auth?.type && req.auth.type !== "jwt") {
        throw new AppError("API keys can only be managed with a user session", 403);
    }

    const name = req.body?.apiKeyName;
    const scopes = req.body?.apiKeyScope;
    const expiresAt = req.body?.expiresAt ? new Date(req.body.expiresAt) : null;

    if (scopes !== undefined && !Array.isArray(scopes)) {
        throw new AppError("scopes must be an array", 400);
    }

    if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date())) {
        throw new AppError("expiresAt must be a future date", 400);
    }

    const rawApiKey = generateApiKey();
    const apiKeyHash = hashApiKey(rawApiKey);
    const apiKey = await ApiKey.create({
        userId,
        name,
        keyPrefix: getApiKeyPrefix(rawApiKey),
        keyHash: apiKeyHash,
        scopes,
        expiresAt,
    });

    try {
        await cacheApiKey(getRedisClient(), apiKeyHash, apiKey);
    } catch (error) {
        console.warn(`[apikeys] cache write failed for ${apiKey._id}: ${error.message}`);
    }

    return {
        apiKey: rawApiKey,
        key: {
            id: apiKey._id,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix,
            scopes: apiKey.scopes,
            status: apiKey.status,
            expiresAt: apiKey.expiresAt,
            createdAt: apiKey.createdAt,
        },
    };
};
