import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

export const reserveFileQuota = async (userId, size) => {
    const storage = await Storage.findOneAndUpdate(
        {
            userId,
            status: "active",
            $expr: {
                $and: [
                    { $lte: [size, "$quota.maxFileSize"] },
                    {
                        $lte: [
                            { $add: ["$usage.bytes", "$usage.reservedBytes", size] },
                            "$quota.maxBytes",
                        ],
                    },
                    {
                        $lte: [
                            { $add: ["$usage.objects", "$usage.reservedObjects", 1] },
                            "$quota.maxObjects",
                        ],
                    },
                ],
            },
        },
        {
            $inc: {
                "usage.reservedBytes": size,
                "usage.reservedObjects": 1,
            },
        },
        { new: true },
    )
        .select("bucket policy quota usage status")
        .lean();

    if (storage) {
        return storage;
    }

    const currentStorage = await Storage.findOne({ userId })
        .select("quota usage status")
        .lean();

    if (!currentStorage) {
        throw new AppError("Storage not found", 404);
    }

    if (currentStorage.status !== "active") {
        throw new AppError("Storage is not active", 409);
    }

    if (size > currentStorage.quota.maxFileSize) {
        throw new AppError("File is larger than your plan limit", 413);
    }

    throw new AppError("Storage quota exceeded", 413);
};

export const releaseFileReservation = async (userId, size) => {
    await Storage.updateOne(
        { userId },
        {
            $inc: {
                "usage.reservedBytes": -size,
                "usage.reservedObjects": -1,
            },
        },
    );
};

export const commitFileReservation = async (userId, size) => {
    await Storage.updateOne(
        { userId },
        {
            $inc: {
                "usage.reservedBytes": -size,
                "usage.reservedObjects": -1,
                "usage.bytes": size,
                "usage.objects": 1,
            },
        },
    );
};

export const removeFileUsage = async (userId, size) => {
    await Storage.updateOne(
        { userId },
        {
            $inc: {
                "usage.bytes": -size,
                "usage.objects": -1,
            },
        },
    );
};
