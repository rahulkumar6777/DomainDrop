import { randomUUID } from "node:crypto";
import minioClient from "../../../utils/minio/minio.js";
import { File } from "../../../models/file.model.js";
import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import {
    clearQuotaEvent,
    hasQuotaEvent,
    releaseFileReservation,
    removeFileUsage,
} from "./fileQuota.service.js";

const DELETION_LEASE_MS = 2 * 60 * 1000;

const newLease = () => ({
    deletionLeaseId: randomUUID(),
    deletionLeaseUntil: new Date(Date.now() + DELETION_LEASE_MS),
});

const availableLease = (now) => ({
    $or: [
        { deletionLeaseUntil: null },
        { deletionLeaseUntil: { $exists: false } },
        { deletionLeaseUntil: { $lte: now } },
    ],
});

const releaseLease = async (file) => {
    await File.updateOne(
        {
            _id: file._id,
            status: "deleting",
            deletionLeaseId: file.deletionLeaseId,
        },
        {
            $set: {
                deletionLeaseId: null,
                deletionLeaseUntil: null,
            },
        },
    );
};

export const claimFileDeletion = async (userId, fileId, reason = "user") => {
    const currentFile = await File.findOne({ _id: fileId, ownerId: userId })
        .select("+deletionLeaseId +deletionLeaseUntil");

    if (!currentFile) {
        throw new AppError("File not found", 404);
    }

    const lease = newLease();
    const now = new Date();

    if (currentFile.status === "deleting") {
        const claimedFile = await File.findOneAndUpdate(
            {
                _id: currentFile._id,
                ownerId: userId,
                status: "deleting",
                ...availableLease(now),
            },
            { $set: lease },
            { new: true },
        ).select("+deletionLeaseId +deletionLeaseUntil");

        if (!claimedFile) {
            throw new AppError("File deletion is already in progress", 409);
        }

        return claimedFile;
    }

    const claimedFile = await File.findOneAndUpdate(
        {
            _id: currentFile._id,
            ownerId: userId,
            status: currentFile.status,
        },
        {
            $set: {
                status: "deleting",
                deletionFromStatus: currentFile.status,
                deleteReason: reason,
                ...lease,
            },
        },
        { new: true },
    ).select("+deletionLeaseId +deletionLeaseUntil");

    if (!claimedFile) {
        throw new AppError("File changed, please try again", 409);
    }

    return claimedFile;
};

export const claimExpiredFileDeletion = async () => {
    const now = new Date();
    const lease = newLease();

    const expiredFile = await File.findOneAndUpdate(
        {
            status: "pending",
            uploadExpiresAt: { $lte: now },
        },
        {
            $set: {
                status: "deleting",
                deletionFromStatus: "pending",
                deleteReason: "expired",
                ...lease,
            },
        },
        { new: true, sort: { uploadExpiresAt: 1 } },
    ).select("+deletionLeaseId +deletionLeaseUntil");

    if (expiredFile) {
        return expiredFile;
    }

    return File.findOneAndUpdate(
        {
            status: "deleting",
            ...availableLease(now),
        },
        { $set: lease },
        { new: true, sort: { updatedAt: 1 } },
    ).select("+deletionLeaseId +deletionLeaseUntil");
};

const removeMinioData = async (bucketName, file) => {
    if (file.deletionFromStatus === "pending" && file.multipartUploadId) {
        try {
            await minioClient.abortMultipartUpload(
                bucketName,
                file.objectKey,
                file.multipartUploadId,
            );
        } catch (error) {
            if (error?.code !== "NoSuchUpload") {
                throw error;
            }
        }
    }

    await minioClient.removeObject(bucketName, file.objectKey);
};

export const finalizeFileDeletion = async (file) => {
    const storage = await Storage.findOne({ userId: file.ownerId })
        .select("bucket")
        .lean();

    if (!storage) {
        await releaseLease(file);
        throw new AppError("Storage not found", 404);
    }

    try {
        await removeMinioData(storage.bucket.name, file);

        const deleteEventId = `file-delete:${file._id}`;
        const completeEventId = `file-complete:${file._id}`;
        const completionWasApplied = file.deletionFromStatus === "pending"
            ? await hasQuotaEvent(file.ownerId, completeEventId)
            : false;

        if (file.deletionFromStatus === "ready" || completionWasApplied) {
            await removeFileUsage(file.ownerId, file.size, deleteEventId);
        } else if (file.deletionFromStatus === "pending") {
            await releaseFileReservation(file.ownerId, file.size, deleteEventId);
        }

        const deletedFile = await File.deleteOne({
            _id: file._id,
            status: "deleting",
            deletionLeaseId: file.deletionLeaseId,
        });

        if (deletedFile.deletedCount !== 1) {
            const fileStillExists = await File.exists({ _id: file._id });
            if (fileStillExists) {
                throw new AppError("File deletion lease was lost", 409);
            }
        }

        await Promise.allSettled([
            clearQuotaEvent(file.ownerId, deleteEventId),
            clearQuotaEvent(file.ownerId, completeEventId),
        ]);
    } catch (error) {
        await releaseLease(file);
        throw error;
    }

    return file._id;
};
