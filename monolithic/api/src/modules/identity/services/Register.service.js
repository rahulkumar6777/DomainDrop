import { getRedisClient } from '../../../config/redis/redis.js';
import { cacheKey } from '../../../utils/cache/cacheKey.js';
import { AppError } from '../../../utils/errors/AppError.js';
import { transporter } from '../../../utils/mail/transporter.js';
import { User } from '../models/user.Model.js';
import { Space } from '../../../models/space.model.js';
import { Storage } from '../../../models/storage.model.js';
import { createBucket } from '../../../utils/minio/createBucket.js';
import { plans } from '../../../constant/plan.js';
import { generateBucketName } from '../../../utils/storage/generateBucketName.js';
import { envs } from '../../../lib/env.js';


export const initRegisterService = async (req) => {

    const redis = getRedisClient();

    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {

        if (existingUser.status === 'active') {
            throw new AppError('user with this email already exist', 409);
        }


        if (existingUser.status === 'pending') {
            throw new AppError('Registration Already initiated', 400)
        }

        if (['provisioning', 'provisioning_failed'].includes(existingUser.status)) {
            throw new AppError('Registration verification already completed', 409)
        }

        throw new AppError('Account with this email cannot be registered', 409)

    }

    const REGISTRATION_EXPIRY_MS = 10 * 60 * 1000;
    const getRegistrationExpiry = () => new Date(Date.now() + REGISTRATION_EXPIRY_MS);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
        fullName,
        email,
        password,
        status: 'pending',
    });

    const redisKey = cacheKey.UserOtp(newUser.email);
    await redis
        .multi()
        .hset(redisKey, {
            email: newUser.email,
            otp
        })
        .expire(redisKey, 600)
        .exec();

    await transporter.sendMail({
        from: `"DomainDrop" <${envs.EMAIL_USER}>`,
        to: newUser.email,
        subject: 'Your Registration Otp',
        text: `Your Registration otp is ${otp}`
    });

    newUser.registrationExpiresAt = getRegistrationExpiry();
    await newUser.save({ validateBeforeSave: false });

    return;
}

export const provisionUserStorage = async (userId) => {
    const bucketName = generateBucketName(userId);
    const plan = plans.free;

    await createBucket(bucketName, 'private');

    const defaultSpace = await Space.exists({ userId, isDefault: true });
    if (!defaultSpace) {
        try {
            await Space.create({
                name: 'default',
                description: 'default space',
                userId,
                isDefault: true
            });
        } catch (error) {
            const createdByAnotherRequest = error?.code === 11000
                ? await Space.exists({ userId, isDefault: true })
                : null;

            if (!createdByAnotherRequest) {
                throw error;
            }
        }
    }

    await Storage.updateOne(
        { userId },
        {
            $set: {
                policy: {
                    visibility: 'private',
                    appliedVisibility: 'private',
                    status: 'applied',
                    appliedAt: new Date()
                },
                quota: {
                    maxBytes: plan.maxStorage,
                    maxObjects: plan.maxFiles,
                    maxFileSize: plan.maxFileSize
                },
                status: 'active'
            },
            $setOnInsert: {
                userId,
                bucket: {
                    name: bucketName,
                    provider: 'minio',
                },
                usage: {
                    objects: 0,
                    bytes: 0
                }
            }
        },
        { upsert: true, runValidators: true }
    );
}

export const verifyRegisterService = async (req) => {
    const redis = getRedisClient();

    const { otp, email } = req.body;

    const redisKey = cacheKey.UserOtp(email);
    const cachedOtp = await redis.hgetall(redisKey);

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Registration expired or Registration not initiated. Please register again', 400);
    }

    if (user.status === 'provisioning') {
        throw new AppError('Account setup is already in progress', 409);
    }

    if (!['pending', 'provisioning_failed'].includes(user.status)) {
        throw new AppError('Registration cannot be verified for this account', 403);
    }

    if (user.status === 'pending' && user.registrationExpiresAt && user.registrationExpiresAt <= new Date()) {
        await User.deleteOne({ _id: user._id, status: "pending" });
        throw new AppError('Registration expired. Please register again', 400);
    }

    if (user.status === 'pending' && cachedOtp.otp !== otp) {
        throw new AppError("Invalid or Expired Otp", 400);
    }

    const userData = await User.findOneAndUpdate(
        { _id: user._id, status: user.status },
        {
            $set: {
                status: "provisioning",
                emailVerifiedAt: new Date()
            },
            $unset: { registrationExpiresAt: "" }
        },
        { returnDocument: 'after' }
    );

    if (!userData) {
        throw new AppError('Account setup is already in progress', 409);
    }

    try {
        await provisionUserStorage(userData._id);

        const activationResult = await User.updateOne(
            { _id: userData._id, status: 'provisioning' },
            {
                $set: { status: 'active' },
                $unset: { provisioningError: '' }
            }
        );

        if (activationResult.matchedCount !== 1) {
            throw new Error('Unable to activate provisioned account');
        }

        await redis.del(redisKey);
    } catch (error) {
        await User.updateOne(
            { _id: userData._id, status: 'provisioning' },
            {
                $set: {
                    status: 'provisioning_failed',
                    provisioningError: String(error.message || 'Account setup failed').slice(0, 500)
                }
            }
        );

        throw new AppError('Account setup failed. Please try again', 503);
    }
}
