import minioClient from "../../../utils/minio/minio.js";
import { File } from "../../../models/file.model.js";
import { Storage } from "../../../models/storage.model.js";
import { envs } from "../../../lib/env.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { encodeObjectKey } from "../../../utils/storage/filePath.js";

export const createSignedUrl = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const file = await File.findOne({
        _id: req.params.fileId,
        ownerId: userId,
        status: "ready",
    })
        .select("objectKey")
        .lean();

    if (!file) {
        throw new AppError("Ready file not found", 404);
    }

    const storage = await Storage.findOne({ userId, status: "active" })
        .select("bucket policy")
        .lean();

    if (!storage) {
        throw new AppError("Storage is not active", 409);
    }

    if (storage.policy.appliedVisibility === "public-read") {
        const baseUrl = envs.MINIO_CDN_URL.replace(/\/$/, "");
        return {
            url: `${baseUrl}/${storage.bucket.name}/${encodeObjectKey(file.objectKey)}`,
            type: "public",
            expiresAt: null,
        };
    }

    const expiresIn = req.body?.expiresIn || 15 * 60;
    const url = await minioClient.presignedGetObject(
        storage.bucket.name,
        file.objectKey,
        expiresIn,
    );

    return {
        url,
        type: "signed",
        expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
};
