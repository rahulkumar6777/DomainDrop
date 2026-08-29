import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { envs } from '../../lib/env.js'
import { getRedisClient } from '../../config/redis/redis.js';
import { cacheKey } from '../cache/cacheKey.js';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_SESSIONS_PER_USER = 2;
const createSessionKey = (userId, tokenId) => cacheKey.SessionKey(userId, tokenId)

const extractDevice = (ua = '') => {
    ua = ua.toLowerCase();

    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('mac')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';

    return 'Unknown Device';
};

const generateHashRefreshToken = (refreshToken) => crypto.createHash('sha256').update(refreshToken).digest('hex');

const getSessionKeys = async (redis, userId) => {
    const pattern = createSessionKey(userId, '*');
    let cursor = '0';
    const sessionKeys = [];

    do {
        const [nextCursor, keys] = await redis.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            100
        );

        cursor = nextCursor;
        sessionKeys.push(...keys);
    } while (cursor !== '0');

    return [...new Set(sessionKeys)];
};

const enforceSessionLimit = async (redis, userId, maxSessions = MAX_SESSIONS_PER_USER, protectedSessionKeys = []) => {
    const sessionKeys = await getSessionKeys(redis, userId);
    if (sessionKeys.length <= maxSessions) {
        return;
    }
    const protectedKeys = new Set(protectedSessionKeys);

    const sessions = await Promise.all(
        sessionKeys.map(async (key) => {
            const sessionData = await redis.get(key);
            if (!sessionData) {
                return null;
            }

            try {
                const session = JSON.parse(sessionData);
                return {
                    key,
                    createdAt: Number(session.createdAt) || 0,
                };
            } catch (_error) {
                return {
                    key,
                    createdAt: 0,
                };
            }
        })
    );

    const activeSessions = sessions.filter(Boolean);
    const extraSessionCount = activeSessions.length - maxSessions;
    if (extraSessionCount <= 0) {
        return;
    }

    const keysToDelete = activeSessions
        .filter((session) => !protectedKeys.has(session.key))
        .sort((firstSession, secondSession) => firstSession.createdAt - secondSession.createdAt)
        .slice(0, extraSessionCount)
        .map((session) => session.key);

    if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
    }
};

const generateRefreshToken = (userId, tokenId) => {
    return jwt.sign(
        {
            _id: userId,
        }, envs.REFRESH_TOKEN_SECRET,
        {
            expiresIn: envs.REFRESH_TOKEN_EXPIRATION,
            jwtid: tokenId
        })
};

const generateAccessToken = (userId, tokenId) => {
    return jwt.sign(
        {
            _id: userId,
        }, envs.ACCESS_TOKEN_SECRET,
        {
            expiresIn: envs.ACCESS_TOKEN_EXPIRATION,
            jwtid: tokenId
        })
}

const generateToken = async (userId, req) => {
    const tokenId = crypto.randomUUID();
    const redis = getRedisClient();

    const refreshToken = generateRefreshToken(userId, tokenId);

    await redis.set(
        createSessionKey(userId, tokenId),
        JSON.stringify({
            hashedToken: generateHashRefreshToken(refreshToken),
            ip: req?.ip || '',
            userAgent: req?.headers?.['user-agent'] || '',
            device: extractDevice(req?.headers?.['user-agent']),
            createdAt: Date.now(),
        }),
        'EX',
        SESSION_TTL_SECONDS
    );

    await enforceSessionLimit(redis, userId);

    return {
        RefreshToken: refreshToken,
        AccessToken: generateAccessToken(userId, tokenId),
        tokenId
    };
}

const deleteAllSessions = async (redis, userId) => {
    const sessionKeys = await getSessionKeys(redis, userId);
    if (sessionKeys.length > 0) {
        await redis.del(...sessionKeys);
    }
};

const getTokenIdFromSessionKey = (userId, sessionKey) => {
    const prefix = createSessionKey(userId, '');
    return sessionKey.startsWith(prefix) ? sessionKey.slice(prefix.length) : null;
};

const toIsoDate = (value) => {
    const timestamp = Number(value);
    return Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp).toISOString() : null;
};

const listAllSessions = async (redis, userId, currentTokenId = null) => {
    const sessionKeys = await getSessionKeys(redis, userId);
    if (sessionKeys.length === 0) {
        return [];
    }

    const [sessionValues, sessionTtls] = await Promise.all([
        redis.mget(...sessionKeys),
        Promise.all(sessionKeys.map((key) => redis.pttl(key))),
    ]);
    const now = Date.now();

    return sessionValues
        .map((value, index) => {
            if (!value) {
                return null;
            }

            let session;
            try {
                session = JSON.parse(value);
            } catch (_error) {
                return null;
            }

            const tokenId = getTokenIdFromSessionKey(userId, sessionKeys[index]);
            if (!tokenId) {
                return null;
            }

            const ttl = Number(sessionTtls[index]);
            const lastActiveAt = toIsoDate(session.rotatedAt) || toIsoDate(session.createdAt);

            return {
                id: tokenId,
                device: session.device || extractDevice(session.userAgent),
                ip: session.ip || null,
                userAgent: session.userAgent || null,
                createdAt: toIsoDate(session.createdAt),
                lastActiveAt,
                expiresAt: ttl > 0 ? new Date(now + ttl).toISOString() : null,
                isCurrent: tokenId === currentTokenId,
            };
        })
        .filter(Boolean)
        .sort((firstSession, secondSession) => {
            if (firstSession.isCurrent !== secondSession.isCurrent) {
                return firstSession.isCurrent ? -1 : 1;
            }

            return new Date(secondSession.lastActiveAt || 0) - new Date(firstSession.lastActiveAt || 0);
        });
};

const revokeSession = async (redis, userId, tokenId) => {
    const result = await redis
        .multi()
        .del(createSessionKey(userId, tokenId))
        .del(cacheKey.RefreshLock(userId, tokenId))
        .del(cacheKey.RefreshRotation(userId, tokenId))
        .exec();

    return Number(result?.[0]?.[1]) === 1;
};

const revokeOtherSessions = async (redis, userId, currentTokenId) => {
    const sessionKeys = await getSessionKeys(redis, userId);
    const sessionIds = sessionKeys
        .map((key) => getTokenIdFromSessionKey(userId, key))
        .filter((tokenId) => tokenId && tokenId !== currentTokenId);

    if (sessionIds.length === 0) {
        return 0;
    }

    const keysToDelete = sessionIds.flatMap((tokenId) => [
        createSessionKey(userId, tokenId),
        cacheKey.RefreshLock(userId, tokenId),
        cacheKey.RefreshRotation(userId, tokenId),
    ]);

    await redis.del(...keysToDelete);
    return sessionIds.length;
};


export {
    SESSION_TTL_SECONDS,
    MAX_SESSIONS_PER_USER,
    createSessionKey,
    enforceSessionLimit,
    generateHashRefreshToken,
    generateRefreshToken,
    generateAccessToken,
    generateToken,
    deleteAllSessions,
    listAllSessions,
    revokeSession,
    revokeOtherSessions
}
