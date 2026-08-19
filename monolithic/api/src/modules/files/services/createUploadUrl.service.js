import minioClient from "../../../utils/minio/minio.js";
import { File } from "../../../models/file.model.js";
import { Space } from "../../../models/space.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { buildObjectKey, normalizeRelativePath } from "../../../utils/storage/filePath.js";
import { createUploadPlan } from "../../../utils/storage/uploadPlan.js";
import { reserveFileQuota, releaseFileReservation } from "./fileQuota.service.js";
import { formatFile } from "./fileResponse.js";

export const createUploadUrl = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const space = await Space.findOne({ _id: req.body.spaceId, userId })
        .select("_id +keyPrefix")
        .lean();

    if (!space) {
        throw new AppError("Space not found", 404);
    }

    let relativePath;
    let objectKey;
    try {
        relativePath = normalizeRelativePath(req.body.path);
        objectKey = buildObjectKey(space.keyPrefix, relativePath);
    } catch (error) {
        throw new AppError(error.message, 400);
    }

    const existingFile = await File.exists({ ownerId: userId, objectKey });
    if (existingFile) {
        throw new AppError("A file already exists at this path", 409);
    }

    let uploadPlan;
    try {
        uploadPlan = createUploadPlan(req.body.size);
    } catch (error) {
        throw new AppError(error.message, 413);
    }
    const storage = await reserveFileQuota(userId, req.body.size);
    let file;
    let multipartUploadId = null;

    try {
        file = await File.create({
            originalName: relativePath.split("/").at(-1),
            mimeType: req.body.mimeType || "application/octet-stream",
            objectKey,
            relativePath,
            size: req.body.size,
            spaceId: space._id,
            ownerId: userId,
            uploadType: uploadPlan.type,
            partSize: uploadPlan.partSize,
            partCount: uploadPlan.partCount,
            uploadExpiresAt: new Date(Date.now() + uploadPlan.expiresIn * 1000),
        });
    } catch (error) {
        await releaseFileReservation(userId, req.body.size);

        if (error?.code === 11000) {
            throw new AppError("A file already exists at this path", 409);
        }

        throw error;
    }

    try {
        multipartUploadId = await minioClient.initiateNewMultipartUpload(
            storage.bucket.name,
            objectKey,
            { "Content-Type": file.mimeType },
        );

        const updatedFile = await File.updateOne(
            { _id: file._id, ownerId: userId, status: "pending" },
            { $set: { multipartUploadId } },
        );

        if (updatedFile.matchedCount !== 1) {
            throw new AppError("Upload could not be created", 409);
        }

        if (uploadPlan.type === "multipart") {
            return {
                file: formatFile(file),
                upload: {
                    type: "multipart",
                    partSize: uploadPlan.partSize,
                    partCount: uploadPlan.partCount,
                    partsEndpoint: `/api/v1/files/${file._id}/parts`,
                    completeEndpoint: `/api/v1/files/${file._id}/complete`,
                    expiresAt: file.uploadExpiresAt,
                },
            };
        }

        const url = await minioClient.presignedUrl(
            "PUT",
            storage.bucket.name,
            objectKey,
            uploadPlan.expiresIn,
            {
                partNumber: "1",
                uploadId: multipartUploadId,
            },
        );

        return {
            file: formatFile(file),
            upload: {
                type: "single",
                url,
                method: "PUT",
                partNumber: 1,
                etagHeader: "ETag",
                headers: {
                    "Content-Type": file.mimeType,
                },
                completeEndpoint: `/api/v1/files/${file._id}/complete`,
                expiresAt: file.uploadExpiresAt,
            },
        };
    } catch (error) {
        if (multipartUploadId) {
            try {
                await minioClient.abortMultipartUpload(
                    storage.bucket.name,
                    objectKey,
                    multipartUploadId,
                );
            } catch (_abortError) {
            }
        }

        await File.deleteOne({ _id: file._id, ownerId: userId, status: "pending" });
        await releaseFileReservation(userId, file.size);
        throw error;
    }
};
