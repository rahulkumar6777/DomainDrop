import { File } from "../../../models/file.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { formatFile } from "./fileResponse.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getFiles = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const filter = { ownerId: userId };
    if (req.query.spaceId) {
        filter.spaceId = req.query.spaceId;
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }
    if (req.query.prefix) {
        filter.relativePath = { $regex: `^${escapeRegex(req.query.prefix)}` };
    }

    const limit = req.query.limit || 50;
    const files = await File.find(filter)
        .select("_id spaceId relativePath objectKey originalName mimeType size status uploadType partSize partCount etag uploadedAt uploadExpiresAt createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return files.map(formatFile);
};
