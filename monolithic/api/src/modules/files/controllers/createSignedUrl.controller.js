import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { createSignedUrl } from "../services/createSignedUrl.service.js";

export const createSignedUrlController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const download = await createSignedUrl(req);
        return res.status(200).json({ success: true, download });
    } catch (error) {
        returnError(res, error);
    }
};
