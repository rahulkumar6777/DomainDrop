import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { updateBucketCors } from "../../../utils/minio/updateBucketCors.js";
import { normalizeUserStorageCorsConfiguration } from "../../../utils/storage/corsConfiguration.js";
import { storageCorsResponse } from "./storageCorsResponse.js";


export const updateStorageCors = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    let configuration;
    try {
        configuration = normalizeUserStorageCorsConfiguration(req.body);
    } catch (error) {
        throw new AppError(error.message, 400);
    }

    const storage = await Storage.findOneAndUpdate(
        {
            userId,
            status: "active",
            "cors.status": { $ne: "pending" },
        },
        {
            $set: {
                "cors.configuration": configuration,
                "cors.status": "pending",
                "cors.lastError": null,
            },
        },
        { returnDocument: "after", runValidators: true },
    ).select("bucket cors status");

    if (!storage) {
        const existingStorage = await Storage.findOne({ userId })
            .select("status cors.status")
            .lean();

        if (!existingStorage) {
            throw new AppError("Storage not found", 404);
        }

        if (existingStorage.cors?.status === "pending") {
            throw new AppError("A bucket CORS update is already in progress", 409);
        }

        throw new AppError("Storage is not active", 409);
    }

    try {
        const appliedConfiguration = await updateBucketCors(storage.bucket.name, configuration);
        const appliedAt = new Date();

        await Storage.updateOne(
            { _id: storage._id, "cors.status": "pending" },
            {
                $set: {
                    "cors.appliedConfiguration": appliedConfiguration,
                    "cors.status": "applied",
                    "cors.appliedAt": appliedAt,
                    "cors.lastError": null,
                },
            },
        );

        return storageCorsResponse({
            configuration,
            appliedConfiguration,
            status: "applied",
            appliedAt,
        });
    } catch (error) {
        await Storage.updateOne(
            { _id: storage._id, "cors.status": "pending" },
            {
                $set: {
                    "cors.status": "error",
                    "cors.lastError": String(error.message || "CORS update failed").slice(0, 500),
                },
            },
        );

        throw new AppError("Unable to update bucket CORS", 502);
    }
};
