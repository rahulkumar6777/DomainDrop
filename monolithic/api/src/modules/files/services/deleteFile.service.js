import minioClient from "../../../utils/minio/minio.js";
import { File } from "../../../models/file.model.js";
import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import {
    releaseFileReservation,
    removeFileUsage,
} from "./fileQuota.service.js";

export const deleteFile = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const file = await File.findOne({ _id: req.params.fileId, ownerId: userId });
    if (!file) {
        throw new AppError("File not found", 404);
    }

    if (file.status === "deleting") {
        throw new AppError("File deletion is already in progress", 409);
    }

    const storage = await Storage.findOne({ userId })
        .select("bucket")
        .lean();

    if (!storage) {
        throw new AppError("Storage not found", 404);
    }

    const previousStatus = file.status;
    const claimedFile = await File.findOneAndUpdate(
        { _id: file._id, ownerId: userId, status: previousStatus },
        { $set: { status: "deleting" } },
        { new: true },
    );

    if (!claimedFile) {
        throw new AppError("File changed, please try again", 409);
    }

    try {
        if (
            previousStatus === "pending" &&
            file.uploadType === "multipart" &&
            file.multipartUploadId
        ) {
            try {
                await minioClient.abortMultipartUpload(
                    storage.bucket.name,
                    file.objectKey,
                    file.multipartUploadId,
                );
            } catch (error) {
                if (error?.code !== "NoSuchUpload") {
                    throw error;
                }
            }
        } else {
            await minioClient.removeObject(storage.bucket.name, file.objectKey);
        }
    } catch (error) {
        await File.updateOne(
            { _id: file._id, ownerId: userId, status: "deleting" },
            { $set: { status: previousStatus } },
        );
        throw error;
    }

    await File.deleteOne({ _id: file._id, ownerId: userId, status: "deleting" });

    if (previousStatus === "ready") {
        await removeFileUsage(userId, file.size);
    } else if (previousStatus === "pending") {
        await releaseFileReservation(userId, file.size);
    }

    return file._id;
};
