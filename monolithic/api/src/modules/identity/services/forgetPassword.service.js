import { getRedisClient } from "../../../config/redis/redis.js";
import { passwordResetEmailTemplate } from "../../../EmailTemplets/passwordResetEmail.js";
import { envs } from "../../../lib/env.js";
import { cacheKey } from "../../../utils/cache/cacheKey.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { transporter } from "../../../utils/mail/transporter.js";
import { deleteAllSessions } from "../../../utils/security/generateToken.js";
import { User } from "../models/user.Model.js";
import crypto from 'crypto';

export const forgetPasswordServiceInit = async (req) => {

    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
        throw new AppError("Invalid User", 404)
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const redis = getRedisClient();
    const redisKey = cacheKey.ResetPassword(hashToken);

    await redis.set(redisKey, user._id);
    redis.expire(redisKey, 900)


    const resetLink = envs.NODE_ENV === 'production' ? `${envs.FRONTEND_URI}/reset-password?token=${rawToken}` : `${envs.FRONTEND_URI}/reset-password?token=${rawToken}`

    await transporter.sendMail({
        from: `DomainDrop ${envs.EMAIL_USER}`,
        to: email,
        subject: `Reset Password Link`,
        html: passwordResetEmailTemplate({ resetUrl: resetLink })
    });
}


export const forgetPasswordServiceVerify = async (req) => {

    const { token, password } = req.body;

    const redis = getRedisClient();

    const hashToken = crypto.createHash("sha256").update(token).digest("hex");
    const redisKey = cacheKey.ResetPassword(hashToken);

    const cacheDataUserId = await redis.get(redisKey);
    if (!cacheDataUserId) {
        throw new AppError("Invalid or Expired token, please generate a new Reset link", 400)
    }

    const user = await User.findById(cacheDataUserId);
    user.password = password;
    await user.save();

    if (!user) {
        throw new AppError("User not Found", 404)
    }

    await redis.del(redisKey);

    await deleteAllSessions(redis, user._id)
}