import { API_KEY_SCOPES, ApiKey } from "../../../models/apikeys.model.js";
import { getRedisClient } from "../../../config/redis/redis.js";
import { cacheApiKey } from "../../../utils/cache/apiKeyCache.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { generateApiKey, getApiKeyPrefix, hashApiKey, } from "../../../utils/generateApikey.js";

export const createApiKey = async (req) => {

    if (req.auth?.type !== "jwt" || !req.auth.userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const userId = req.auth.userId;
    const name = req.body?.apiKeyName;
    const scopes = req.body?.apiKeyScope;
    const expiresAt = req.body?.expiresAt ? new Date(req.body.expiresAt) : null;

    if (name !== undefined && (typeof name !== "string" || !name.trim() || name.trim().length > 80)) {
        throw new AppError("API key name must be between 1 and 80 characters", 400);
    }

    if (scopes !== undefined && !Array.isArray(scopes)) {
        throw new AppError("scopes must be an array", 400);
    }

    if (scopes !== undefined) {
        const invalidScopes = scopes.filter((scope) => !API_KEY_SCOPES.includes(scope));
        if (scopes.length === 0 || new Set(scopes).size !== scopes.length || invalidScopes.length > 0) {
            throw new AppError("scopes must contain unique, supported values", 400);
        }
    }

    if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date())) {
        throw new AppError("expiresAt must be a future date", 400);
    }

    const rawApiKey = generateApiKey();
    const apiKeyHash = hashApiKey(rawApiKey);
    const apiKey = await ApiKey.create({
        userId,
        name: name?.trim(),
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
