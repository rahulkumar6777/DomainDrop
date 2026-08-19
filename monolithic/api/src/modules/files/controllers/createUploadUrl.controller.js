import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { createUploadUrl } from "../services/createUploadUrl.service.js";

export const createUploadUrlController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const result = await createUploadUrl(req);
        return res.status(201).json({ success: true, ...result });
    } catch (error) {
        returnError(res, error);
    }
};
