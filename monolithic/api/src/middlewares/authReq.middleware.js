import jwt from 'jsonwebtoken';
import { extractCredential } from '../utils/security/extractCredential.js';
import { envs } from '../lib/env.js';
import { hashApiKey } from '../utils/generateApikey.js';
import { cacheApiKey, getCachedApiKey } from '../utils/cache/apiKeyCache.js';
import { getRedisClient } from '../config/redis/redis.js';
import { ApiKey } from '../models/apikeys.model.js';

const sendError = (res, status, message) => {
    return res.status(status).json({ success: false, message });
};


export const authReq = async (req, res, next) => {

    const { type, value } = await extractCredential(req);

    if (!type) {
        return sendError(res, 401, "UnAuthorized Request");
    }

    if (type === "accessToken") {
        try {
            const decoded = jwt.verify(value, envs.ACCESS_TOKEN_SECRET)
            if (!decoded?._id) {
                return sendError(res, 401, "Invalid access token");
            }

            req.user = decoded;
            req.auth = {
                type: "jwt",
                userId: String(decoded._id),
                tokenId: decoded.jti ?? null,
                scopes: ["*"],
            };

            return next();
        } catch (_error) {
            return sendError(res, 401, "Invalid or expired access token");
        }
    }

    if (type === "apiKey") {

        const API_KEY_PATTERN = /^dd_live_[a-f0-9]{16}_[A-Za-z0-9_-]{43}$/;

        if (!API_KEY_PATTERN.test(credential)) {
            return sendError(res, 401, "Invalid API key");
        }

        const apikeyhash = hashApiKey(value);

        let redis = null;
        let apiKey = null;

        try {
            redis = getRedisClient();
            apiKey = await getCachedApiKey(redis, apikeyhash);
        } catch (_error) {

        }

        try {

            if (!apiKey) {
                apiKey = await ApiKey.findOne({ keyHash: apikeyhash })
                    .select("_id userId keyPrefix scopes status expiresAt")
                    .lean();

                if (!apiKey || apiKey.status !== "active" || isExpired(apiKey.expiresAt)) {
                    return sendError(res, 401, "Invalid or expired API key");
                }

                if (redis) {
                    try {
                        await cacheApiKey(redis, apikeyhash, apiKey);
                    } catch (_error) {
                    }
                }

                try {
                    await ApiKey.updateOne({ _id: apiKey._id }, { $set: { lastUsedAt: new Date() } });
                } catch (_error) {

                }
            }

            if (apiKey.status !== "active" || isExpired(apiKey.expiresAt)) {
                return sendError(res, 401, "Invalid or expired API key");
            }

            const apiKeyId = apiKey._id ?? apiKey.apiKeyId;
            req.user = { _id: String(apiKey.userId) };
            req.auth = {
                type: "api-key",
                userId: String(apiKey.userId),
                apiKeyId: String(apiKeyId),
                keyPrefix: apiKey.keyPrefix,
                scopes: [...apiKey.scopes],
            };

            return next();
        } catch (error) {
            return next(error);
        }
    }
}