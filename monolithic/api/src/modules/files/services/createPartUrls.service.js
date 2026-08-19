import minioClient from "../../../utils/minio/minio.js";
import { File } from "../../../models/file.model.js";
import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { PART_URL_EXPIRY_SECONDS } from "../../../utils/storage/uploadPlan.js";

export const createPartUrls = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const file = await File.findOne({
        _id: req.params.fileId,
        ownerId: userId,
        status: "pending",
    })
        .select("objectKey uploadType multipartUploadId partCount uploadExpiresAt")
        .lean();

    if (!file) {
        throw new AppError("Pending file upload not found", 404);
    }

    if (file.uploadType !== "multipart" || !file.multipartUploadId) {
        throw new AppError("File does not use multipart upload", 409);
    }

    const uploadExpiresAt = new Date(file.uploadExpiresAt).getTime();
    const remainingSeconds = Math.floor((uploadExpiresAt - Date.now()) / 1000);
    if (!Number.isFinite(uploadExpiresAt) || remainingSeconds <= 0) {
        throw new AppError("Multipart upload expired", 410);
    }

    const partNumbers = [...new Set(req.body.partNumbers)];
    if (partNumbers.length !== req.body.partNumbers.length) {
        throw new AppError("Part numbers must be unique", 400);
    }

    if (partNumbers.some((partNumber) => partNumber > file.partCount)) {
        throw new AppError("Part number is outside this upload", 400);
    }

    const storage = await Storage.findOne({ userId, status: "active" })
        .select("bucket")
        .lean();

    if (!storage) {
        throw new AppError("Storage is not active", 409);
    }

    const expiresIn = Math.min(PART_URL_EXPIRY_SECONDS, remainingSeconds);
    const parts = await Promise.all(
        partNumbers.map(async (partNumber) => ({
            partNumber,
            method: "PUT",
            url: await minioClient.presignedUrl(
                "PUT",
                storage.bucket.name,
                file.objectKey,
                expiresIn,
                {
                    partNumber: String(partNumber),
                    uploadId: file.multipartUploadId,
                },
            ),
        })),
    );

    return {
        parts,
        etagHeader: "ETag",
        expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
};
