import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { createApiKey } from "../services/createApiKey.service.js";

export const createApiKeyController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        const { apiKey, key } = await createApiKey(req);

        return res.status(201).json({
            success: true,
            apiKey,
            key
        })

    } catch (error) {
        returnError(res, error)
    }
}
