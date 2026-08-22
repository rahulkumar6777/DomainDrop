import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { updateStorageCors } from "../services/updateStorageCors.service.js";

export const updateStorageCorsController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const cors = await updateStorageCors(req);
        return res.status(200).json({ success: true, cors });
    } catch (error) {
        returnError(res, error);
    }
};
