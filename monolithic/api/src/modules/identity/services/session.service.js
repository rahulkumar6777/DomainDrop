import { AppError } from './../../../utils/errors/AppError.js';
import { getRedisClient } from "./../../../config/redis/redis.js";
import { createSessionKey, listAllSessions, revokeOtherSessions, revokeSession, } from '../../../utils/security/generateToken.js';

const getJwtSession = (req) => {
    if (req.auth?.type !== "jwt" || !req.auth.userId || !req.auth.tokenId) {
        throw new AppError("JWT access token is required", 401);
    }

    return {
        userId: req.auth.userId,
        currentTokenId: req.auth.tokenId,
    };
};

const getActiveJwtSession = async (req) => {
    const session = getJwtSession(req);
    const redis = getRedisClient();
    const isActive = await redis.exists(
        createSessionKey(session.userId, session.currentTokenId),
    );

    if (!isActive) {
        throw new AppError("Session expired or revoked", 401);
    }

    return { ...session, redis };
};

export const listSessionsService = async (req) => {
    const { userId, currentTokenId, redis } = await getActiveJwtSession(req);
    return listAllSessions(redis, userId, currentTokenId);
};

export const revokeSessionService = async (req) => {
    const { userId, currentTokenId, redis } = await getActiveJwtSession(req);
    const sessionId = req.params.sessionId;
    const revoked = await revokeSession(redis, userId, sessionId);

    if (!revoked) {
        throw new AppError("Session not found", 404);
    }

    return {
        sessionId,
        isCurrent: sessionId === currentTokenId,
    };
};

export const revokeOtherSessionsService = async (req) => {
    const { userId, currentTokenId, redis } = await getActiveJwtSession(req);
    return revokeOtherSessions(redis, userId, currentTokenId);
};
