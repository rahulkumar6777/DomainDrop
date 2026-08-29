import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { getApiKeyUsage } from "../services/getApiKeyUsage.service.js";

export const getApiKeyUsageController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const result = await getApiKeyUsage(req);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        returnError(res, error);
    }
};
