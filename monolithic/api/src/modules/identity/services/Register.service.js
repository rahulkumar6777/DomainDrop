import { getRedisClient } from '../../../config/redis/redis.js';
import { cacheKey } from '../../../utils/cache/cacheKey.js';
import { AppError } from '../../../utils/errors/AppError.js';
import { transporter } from '../../../utils/mail/transporter.js';
import { User } from '../models/user.Model.js';
import { Folder } from '../../../models/folder.model.js';
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

export const verifyRegisterService = async (req) => {
    const redis = getRedisClient();

    const { otp, email } = req.body;

    const redisKey = cacheKey.UserOtp(email);
    const cachedOtp = await redis.hgetall(redisKey);

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Registration expired or Registration not initiated. Please register again', 400);
    }

    if (user.status !== 'pending') {
        throw new AppError('Registration cannot be verified for this account', 403);
    }

    if (user.registrationExpiresAt && user.registrationExpiresAt <= new Date()) {
        await User.deleteOne({ _id: user._id, status: "pending" });
        throw new AppError('Registration expired. Please register again', 400);
    }

    if (cachedOtp.otp !== otp) {
        throw new AppError("Invalid or Expired Otp", 400);
    }

    const userData = await User.findOneAndUpdate(
        { _id: user._id, status: "pending" },
        {
            $set: {
                status: "active",
                emailVerifiedAt: new Date()
            },
            $unset: { registrationExpiresAt: "" }
        },
        { new: true }
    );

    const bucketName = generateBucketName(userData._id);
    const plan = plans.free;

    // here i create the bucket and set the policy
    await createBucket(bucketName, 'private');

    await Folder.create({
        name: 'default',
        description: 'default Folder',
        userId: userData._id,
        parentId: null,
        isDefault: true
    });

    await Storage.create({
        userId: userData._id,
        bucket: {
            name: bucketName,
            provider: 'minio',
        },
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
        usage: {
            objects: 0,
            bytes: 0
        },
        status: "active"
    });

    await redis.del(redisKey);
}
