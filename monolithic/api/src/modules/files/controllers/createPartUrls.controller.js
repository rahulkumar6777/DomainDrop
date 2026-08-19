import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { createPartUrls } from "../services/createPartUrls.service.js";

export const createPartUrlsController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const upload = await createPartUrls(req);
        return res.status(200).json({ success: true, upload });
    } catch (error) {
        returnError(res, error);
    }
};
