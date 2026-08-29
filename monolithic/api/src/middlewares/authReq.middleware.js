import jwt from 'jsonwebtoken';
import { extractCredential } from '../utils/security/extractCredential.js';
import { envs } from '../lib/env.js';
import { hashApiKey } from '../utils/generateApikey.js';
import { cacheApiKey, getCachedApiKey } from '../utils/cache/apiKeyCache.js';
import { getRedisClient } from '../config/redis/redis.js';
import { ApiKey } from '../models/apikeys.model.js';
import { cacheKey } from '../utils/cache/cacheKey.js';
import { captureApiKeyUsage } from '../utils/usage/apiKeyUsage.js';


const API_KEY_PATTERN = /^dd_live_[a-f0-9]{16}_[A-Za-z0-9_-]{43}$/;


const sendError = (res, status, message) => {
    return res.status(status).json({ success: false, message });
};

const isExpired = (expiresAt) => Boolean(expiresAt) && new Date(expiresAt).getTime() <= Date.now();


export const authReq = async (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    let credential;

    try {
        credential = extractCredential(req);
    } catch (error) {
        return sendError(res, error.status ?? 401, error.msg ?? "Authentication failed");
    }

    const { type, value } = credential;

    if (type === "jwt") {
        let decoded;
        try {
            decoded = jwt.verify(value, envs.ACCESS_TOKEN_SECRET);
        } catch (_error) {
            return sendError(res, 401, "Invalid or expired access token");
        }

        if (!decoded?._id || !decoded.jti) {
            return sendError(res, 401, "Invalid access token");
        }

        try {
            const sessionExists = await getRedisClient().exists(
                cacheKey.SessionKey(decoded._id, decoded.jti),
            );
            if (!sessionExists) {
                return sendError(res, 401, "Session expired or revoked");
            }
        } catch (error) {
            return next(error);
        }

        req.user = decoded;
        req.auth = {
            type: "jwt",
            userId: String(decoded._id),
            tokenId: decoded.jti,
            scopes: ["*"],
        };

        return next();
    }

    if (type === "api-key") {
        if (!API_KEY_PATTERN.test(value)) {
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

            captureApiKeyUsage(req, res, req.auth, startedAt);

            return next();
        } catch (error) {
            return next(error);
        }
    }

    return sendError(res, 401, "Unsupported authentication type");
};
