import { File } from "../../../models/file.model.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { formatFile } from "./fileResponse.js";

export const getFile = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const file = await File.findOne({ _id: req.params.fileId, ownerId: userId })
        .select("_id spaceId relativePath objectKey originalName mimeType size status uploadType partSize partCount etag uploadedAt uploadExpiresAt createdAt updatedAt")
        .lean();

    if (!file) {
        throw new AppError("File not found", 404);
    }

    return formatFile(file);
};
