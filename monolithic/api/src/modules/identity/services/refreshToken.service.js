import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { SESSION_TTL_SECONDS, MAX_SESSIONS_PER_USER, createSessionKey, deleteAllSessions, enforceSessionLimit, generateAccessToken, generateRefreshToken, generateHashRefreshToken as hashRefreshToken, } from '../../../utils/security/generateToken.js';
import { AppError } from '../../../utils/errors/AppError.js';
import { getRedisClient } from '../../../config/redis/redis.js';
import { envs } from '../../../lib/env.js';
import { cacheKey } from '../../../utils/cache/cacheKey.js';

const REFRESH_ROTATION_GRACE_SECONDS = 10;
const REFRESH_LOCK_SECONDS = 5;

const readRotationResult = async ({ redis, userId, tokenId, incomingHash, userAgent }) => {
    const rotationData = await redis.get(cacheKey.RefreshRotation(userId, tokenId));
    if (!rotationData) {
        return null;
    }

    const rotation = JSON.parse(rotationData);
    if (rotation.oldHash !== incomingHash) {
        await deleteAllSessions(redis, userId);
        throw new AppError('Token reuse detected. All sessions revoked.', 403);
    }

    if (rotation.userAgent && userAgent && rotation.userAgent !== userAgent) {
        await deleteAllSessions(redis, userId);
        throw new AppError('Token reuse detected. All sessions revoked.', 403);
    }

    return {
        AccessToken: rotation.AccessToken,
        RefreshToken: rotation.RefreshToken,
        tokenId: rotation.tokenId,
    };
};

const waitForRotationResult = async ({ redis, userId, tokenId, incomingHash, userAgent }) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const result = await readRotationResult({ redis, userId, tokenId, incomingHash, userAgent });
        if (result) {
            return result;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return null;
};

export const refreshTokenService = async ({ refreshToken, ip, userAgent }) => {

    const redis = getRedisClient();

    // here if refreshtoken not found
    if (!refreshToken) {
        throw new AppError("no refreshToken Found", 401);
    };


    // here i decode token
    let payload;
    try {
        payload = await jwt.verify(refreshToken, envs.REFRESH_TOKEN_SECRET);
    } catch (_error) {
        throw new AppError("invalid refreshToken", 401);
    };


    const userId = payload._id;
    const tokenId = payload.jti;

    if (!userId || !tokenId) {
        throw new AppError('invalid token payload', 401);
    }

    const sessionKey = createSessionKey(userId, tokenId);
    const incommingHash = hashRefreshToken(refreshToken);
    const sessionData = await redis.get(sessionKey);
    if (!sessionData) {
        const rotationResult = await readRotationResult({ redis, userId, tokenId, incomingHash: incommingHash, userAgent });
        if (rotationResult) {
            return rotationResult;
        }

        throw new AppError('Invalid Sessions', 401);
    }

    const lockKey = cacheKey.RefreshLock(userId, tokenId);
    const lockAcquired = await redis.set(lockKey, '1', 'EX', REFRESH_LOCK_SECONDS, 'NX');
    if (!lockAcquired) {
        const rotationResult = await waitForRotationResult({ redis, userId, tokenId, incomingHash: incommingHash, userAgent });
        if (rotationResult) {
            return rotationResult;
        }

        throw new AppError('Refresh token rotation in progress. Please retry.', 409);
    }

    const session = JSON.parse(sessionData);

    if (incommingHash !== session.hashedToken) {
        await deleteAllSessions(redis, userId);
        throw new AppError('Token reuse detected. All sessions revoked.', 403);
    };

    await enforceSessionLimit(redis, userId);
    const sessionStillActive = await redis.exists(sessionKey);
    if (!sessionStillActive) {
        await redis.del(lockKey);
        throw new AppError('Session limit exceeded. Oldest session revoked.', 401);
    }

    const newTokenId = crypto.randomUUID();
    const newSessionKey = createSessionKey(userId, newTokenId);
    const newRefreshToken = generateRefreshToken(userId, newTokenId);
    const newSession = {
        ...session,
        hashedToken: hashRefreshToken(newRefreshToken),
        ip: ip || session.ip || '',
        userAgent: userAgent || session.userAgent || '',
        createdAt: session.createdAt || Date.now(),
        rotatedAt: Date.now(),
    };

    const AccessToken = generateAccessToken(userId, newTokenId);
    const rotationResult = {
        oldHash: incommingHash,
        userAgent: userAgent || session.userAgent || '',
        AccessToken,
        RefreshToken: newRefreshToken,
        tokenId: newTokenId,
    };

    await redis
        .multi()
        .set(newSessionKey, JSON.stringify(newSession), 'EX', SESSION_TTL_SECONDS)
        .set(cacheKey.RefreshRotation(userId, tokenId), JSON.stringify(rotationResult), 'EX', REFRESH_ROTATION_GRACE_SECONDS)
        .del(sessionKey)
        .del(lockKey)
        .exec();

    await enforceSessionLimit(redis, userId, MAX_SESSIONS_PER_USER, [newSessionKey]);

    return {
        AccessToken,
        RefreshToken: newRefreshToken,
        tokenId: newTokenId
    };
};
