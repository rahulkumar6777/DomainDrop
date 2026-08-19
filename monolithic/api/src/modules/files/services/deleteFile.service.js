import { AppError } from "../../../utils/errors/AppError.js";
import { claimFileDeletion, finalizeFileDeletion, } from "./fileDeletion.service.js";

export const deleteFile = async (req) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Unauthorized request", 401);
    }

    const file = await claimFileDeletion(userId, req.params.fileId, "user");
    return finalizeFileDeletion(file);
};
