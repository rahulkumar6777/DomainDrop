import { Storage } from "../../../models/storage.model.js";
import { AppError } from "../../../utils/errors/AppError.js";

const storageResponse = (storage) => ({
    bucket: storage.bucket,
    policy: storage.policy,
    usage: storage.usage,
    quota: storage.quota,
    status: storage.status,
    createdAt: storage.createdAt,
    updatedAt: storage.updatedAt,
});

export const getStorage = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const storage = await Storage.findOne({ userId })
        .select("bucket policy usage quota status createdAt updatedAt")
        .lean();

    if (!storage) {
        throw new AppError("Storage not found", 404);
    }

    return storageResponse(storage);
};

