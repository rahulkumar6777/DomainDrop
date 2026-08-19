import { getRedisClient } from "../../../config/redis/redis.js";
import { ApiKey } from "../../../models/apikeys.model.js";
import { invalidateApiKeyCache } from "../../../utils/cache/apiKeyCache.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const revokeApiKey = async (req) => {
    if (req.auth?.type !== "jwt" || !req.auth.userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const apiKey = await ApiKey.findOne({
        _id: req.params.apiKeyId,
        userId: req.auth.userId,
        status: { $ne: "revoked" },
    }).select("+keyHash status revokedAt");

    if (!apiKey) {
        throw new AppError("API key not found", 404);
    }

    apiKey.status = "revoked";
    apiKey.revokedAt = new Date();
    await apiKey.save();

    try {
        await invalidateApiKeyCache(getRedisClient(), apiKey.keyHash);
    } catch (error) {
        console.warn(`[apikeys] cache invalidation failed for ${apiKey._id}: ${error.message}`);
    }

    return apiKey._id;
};

