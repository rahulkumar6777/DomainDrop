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

const applyQuotaChange = async (userId, filter, change, eventId = null) => {
    const eventFilter = eventId
        ? { "usage.appliedEvents": { $ne: eventId } }
        : {};
    const eventUpdate = eventId
        ? { $addToSet: { "usage.appliedEvents": eventId } }
        : {};

    const result = await Storage.updateOne(
        { userId, ...filter, ...eventFilter },
        { $inc: change, ...eventUpdate },
    );

    if (result.modifiedCount === 1) {
        return;
    }

    if (eventId) {
        const alreadyApplied = await Storage.exists({
            userId,
            "usage.appliedEvents": eventId,
        });
        if (alreadyApplied) {
            return;
        }
    }

    throw new AppError("Storage accounting conflict", 409);
};

export const clearQuotaEvent = async (userId, eventId) => {
    await Storage.updateOne(
        { userId },
        { $pull: { "usage.appliedEvents": eventId } },
    );
};

export const hasQuotaEvent = (userId, eventId) => Storage.exists({
    userId,
    "usage.appliedEvents": eventId,
});

export const releaseFileReservation = async (userId, size, eventId = null) => {
    await applyQuotaChange(
        userId,
        {
            "usage.reservedBytes": { $gte: size },
            "usage.reservedObjects": { $gte: 1 },
        },
        {
            "usage.reservedBytes": -size,
            "usage.reservedObjects": -1,
        },
        eventId,
    );
};

export const commitFileReservation = async (userId, size, eventId) => {
    await applyQuotaChange(
        userId,
        {
            "usage.reservedBytes": { $gte: size },
            "usage.reservedObjects": { $gte: 1 },
        },
        {
            "usage.reservedBytes": -size,
            "usage.reservedObjects": -1,
            "usage.bytes": size,
            "usage.objects": 1,
        },
        eventId,
    );
};

export const removeFileUsage = async (userId, size, eventId) => {
    await applyQuotaChange(
        userId,
        {
            "usage.bytes": { $gte: size },
            "usage.objects": { $gte: 1 },
        },
        {
            "usage.bytes": -size,
            "usage.objects": -1,
        },
        eventId,
    );
};
