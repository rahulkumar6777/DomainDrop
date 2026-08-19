import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { getFiles } from "../services/getFiles.service.js";

export const getFilesController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const files = await getFiles(req);
        return res.status(200).json({ success: true, files });
    } catch (error) {
        returnError(res, error);
    }
};
