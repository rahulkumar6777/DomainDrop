import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { revokeApiKey } from "../services/revokeApiKey.service.js";

export const revokeApiKeyController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const apiKeyId = await revokeApiKey(req);
        return res.status(200).json({ success: true, message: "API key revoked", apiKeyId });
    } catch (error) {
        returnError(res, error);
    }
};

