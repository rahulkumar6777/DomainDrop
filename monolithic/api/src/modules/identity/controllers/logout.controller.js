import jwt from 'jsonwebtoken';
import { getRedisClient } from '../../../config/redis/redis.js';
import { envs } from '../../../lib/env.js';
import { createSessionKey } from '../../../utils/security/generateToken.js';
import { getClearRefreshTokenOptions } from '../../../utils/security/cookieOption.js';

export const logoutController = async (req, res) => {
    const refreshToken = req.cookies?.RefreshToken;

    if (refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, envs.REFRESH_TOKEN_SECRET);
            if (payload?._id && payload?.jti) {
                await getRedisClient().del(createSessionKey(payload._id, payload.jti));
            }
        } catch (_error) {
        }
    }

    return res
        .clearCookie('RefreshToken', getClearRefreshTokenOptions())
        .status(200)
        .json({ success: true, message: 'Logged out successfully' });
};
