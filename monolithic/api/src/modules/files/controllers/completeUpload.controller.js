import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { completeUpload } from "../services/completeUpload.service.js";

export const completeUploadController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const file = await completeUpload(req);
        return res.status(200).json({ success: true, file });
    } catch (error) {
        returnError(res, error);
    }
};
