import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { updateStoragePolicy } from "../services/updateStoragePolicy.service.js";

export const updateStoragePolicyController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const policy = await updateStoragePolicy(req);
        return res.status(200).json({ success: true, policy });
    } catch (error) {
        returnError(res, error);
    }
};

