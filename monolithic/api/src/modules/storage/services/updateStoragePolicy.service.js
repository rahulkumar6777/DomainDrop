import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { updateBucketPolicy } from "../../../utils/minio/updateBucketPolicy.js";

export const updateStoragePolicy = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const visibility = req.body.visibility;
    const storage = await Storage.findOneAndUpdate(
        {
            userId,
            status: "active",
            "policy.status": { $ne: "pending" },
        },
        {
            $set: {
                "policy.visibility": visibility,
                "policy.status": "pending",
                "policy.lastError": null,
            },
        },
        { returnDocument: "after", runValidators: true },
    ).select("bucket policy status");

    if (!storage) {
        const existingStorage = await Storage.findOne({ userId })
            .select("status policy.status")
            .lean();

        if (!existingStorage) {
            throw new AppError("Storage not found", 404);
        }

        if (existingStorage.policy?.status === "pending") {
            throw new AppError("A bucket policy update is already in progress", 409);
        }

        throw new AppError("Storage is not active", 409);
    }

    try {
        await updateBucketPolicy(storage.bucket.name, visibility);

        const appliedAt = new Date();
        await Storage.updateOne(
            { _id: storage._id, "policy.visibility": visibility },
            {
                $set: {
                    "policy.appliedVisibility": visibility,
                    "policy.status": "applied",
                    "policy.appliedAt": appliedAt,
                    "policy.lastError": null,
                },
            },
        );

        return {
            visibility,
            appliedVisibility: visibility,
            status: "applied",
            appliedAt,
        };
    } catch (error) {
        await Storage.updateOne(
            { _id: storage._id, "policy.visibility": visibility },
            {
                $set: {
                    "policy.status": "error",
                    "policy.lastError": String(error.message || "Policy update failed").slice(0, 500),
                },
            },
        );

        throw new AppError("Unable to update bucket policy", 502);
    }
};
