import { ApiKey } from "../../../models/apikeys.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const getApiKeys = async (req) => {

    if (req.auth?.type !== "jwt" || !req.auth.userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const apiKeys = await ApiKey.find({ userId: req.auth.userId })
        .select("_id name keyPrefix scopes status lastUsedAt expiresAt createdAt")
        .sort({ createdAt: -1 })
        .lean();

    return apiKeys.map((apiKey) => ({
        id: apiKey._id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        status: apiKey.status,
        lastUsedAt: apiKey.lastUsedAt,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
    }));
};
