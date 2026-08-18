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

    return sessionKeys;
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


export {
    SESSION_TTL_SECONDS,
    MAX_SESSIONS_PER_USER,
    createSessionKey,
    enforceSessionLimit,
    generateHashRefreshToken,
    generateRefreshToken,
    generateAccessToken,
    generateToken,
    deleteAllSessions
}
