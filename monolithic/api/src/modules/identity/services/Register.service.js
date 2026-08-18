import { getRedisClient } from '../../../config/redis/redis.js';
import { cacheKey } from '../../../utils/cache/cacheKey.js';
import { AppError } from '../../../utils/errors/AppError.js';
import { transporter } from '../../../utils/mail/transporter.js';
import { User } from '../models/user.model.js';
import { ApiKey } from '../../../models/apikeys.model.js';
import { Folder } from '../../../models/folder.model.js';
import { Storage } from '../../../models/storage.model.js';
import { generateApiKey } from '../../../utils/generateApikey.js';
import { buildBucketPolicy } from '../../../utils/minio/policy.js';
import { createBucket } from '../../../utils/minio/createBucket.js';

export const initRegisterService = async (req) => {

    const redis = getRedis();

    const { fullName, email, phoneno, password, age } = req.body;

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
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    const newUser = new User({
        fullname: fullName,
        email: email,
        password: password,

    });

    const redisKey = cacheKey.UserOtp(newUser.email);
    redis.hset(redisKey, {
        email: newUser.email,
        otp: otp
    });
    redis.expire(redisKey, 600);

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
    const redis = getRedis();

    const { otp, email } = req.body;

    const redisKey = cacheKey.UserOtp(email);
    const cachedOtp = await redis.hgetall(redisKey);

    const user = await User.findOne({ email });
    console.log(user)
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
            $set: { status: "active" },
            $unset: { registrationExpiresAt: "" }
        },
        { returnDocument: "after" }
    );

    const apiKey = generateApiKey();
    const bucketName = generateBucketName(userData._id);
    const policy = buildBucketPolicy(bucketName, 'private');


    // here i create the bucket and set the policy
    const bucketCreationresult = await createBucket(bucketName, 'private');

    await ApiKey.create({
        userid: userData._id,
        apikey: apiKey,
        status: 'active'
    });

    await Folder.create({
        foldername: 'default',
        description: 'default Folder',
        userid: userData._id
    });

    await Storage.create({
        userId: userData._id,
        bucket: {
            name: bucketName,
            provider: 'minio',
        },
        policy: {
            type: 'private',
            rules: policy
        },
        status: "active"
    });

    await redis.del(redisKey);
}