import minioClient from "../../../utils/minio/minio.js";
import { File } from "../../../models/file.model.js";
import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { clearQuotaEvent, commitFileReservation } from "./fileQuota.service.js";
import { formatFile } from "./fileResponse.js";
import { claimFileDeletion, finalizeFileDeletion } from "./fileDeletion.service.js";

const clearQuotaEventQuietly = async (userId, eventId) => {
    try {
        await clearQuotaEvent(userId, eventId);
    } catch (_error) {
    }
};

const getCompletedParts = (file, parts) => {
    if (!Array.isArray(parts) || parts.length !== file.partCount) {
        throw new AppError(`All ${file.partCount} uploaded parts are required`, 400);
    }

    const sortedParts = [...parts].sort((left, right) => left.partNumber - right.partNumber);
    const hasInvalidOrder = sortedParts.some(
        (part, index) => part.partNumber !== index + 1,
    );

    if (hasInvalidOrder) {
        throw new AppError("Multipart parts must be unique and complete", 400);
    }

    return sortedParts.map((part) => ({
        part: part.partNumber,
        etag: part.etag,
    }));
};

export const completeUpload = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const file = await File.findOne({ _id: req.params.fileId, ownerId: userId });
    if (!file) {
        throw new AppError("File not found", 404);
    }

    const quotaEventId = `file-complete:${file._id}`;

    if (file.status === "ready") {
        await clearQuotaEventQuietly(userId, quotaEventId);
        return formatFile(file);
    }

    if (file.status !== "pending") {
        throw new AppError("File upload cannot be completed", 409);
    }

    const storage = await Storage.findOne({ userId, status: "active" })
        .select("bucket")
        .lean();

    if (!storage) {
        throw new AppError("Storage is not active", 409);
    }

    if (file.uploadExpiresAt && file.uploadExpiresAt <= new Date()) {
        const expiredFile = await claimFileDeletion(userId, file._id, "expired");
        await finalizeFileDeletion(expiredFile);
        throw new AppError("Upload URL expired", 410);
    }

    let objectStat = null;

    if (!file.multipartUploadId) {
        throw new AppError("Upload is not initialized", 409);
    }

    try {
        objectStat = await minioClient.statObject(storage.bucket.name, file.objectKey);
    } catch (_error) {
    }

    if (!objectStat) {
        const completedParts = getCompletedParts(file, req.body?.parts);

        try {
            await minioClient.completeMultipartUpload(
                storage.bucket.name,
                file.objectKey,
                file.multipartUploadId,
                completedParts,
            );
            objectStat = await minioClient.statObject(
                storage.bucket.name,
                file.objectKey,
            );
        } catch (_error) {
            throw new AppError("Upload could not be completed", 409);
        }
    }

    if (objectStat.size !== file.size) {
        const invalidFile = await claimFileDeletion(userId, file._id, "expired");
        await finalizeFileDeletion(invalidFile);
        throw new AppError("Uploaded file size does not match", 400);
    }

    await commitFileReservation(userId, file.size, quotaEventId);

    const completedFile = await File.findOneAndUpdate(
        { _id: file._id, ownerId: userId, status: "pending" },
        {
            $set: {
                status: "ready",
                etag: objectStat.etag || null,
                uploadedAt: new Date(),
                uploadExpiresAt: null,
                multipartUploadId: null,
            },
        },
        { new: true },
    );

    if (!completedFile) {
        const currentFile = await File.findOne({ _id: file._id, ownerId: userId });
        if (currentFile?.status === "ready") {
            await clearQuotaEventQuietly(userId, quotaEventId);
            return formatFile(currentFile);
        }

        throw new AppError("File upload cannot be completed", 409);
    }

    await clearQuotaEventQuietly(userId, quotaEventId);
    return formatFile(completedFile);
};
