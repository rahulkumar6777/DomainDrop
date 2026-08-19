import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { deleteFile } from "../services/deleteFile.service.js";

export const deleteFileController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const fileId = await deleteFile(req);
        return res.status(200).json({ success: true, message: "File deleted", fileId });
    } catch (error) {
        returnError(res, error);
    }
};
