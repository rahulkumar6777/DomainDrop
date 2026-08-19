import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { updateSpace } from "../services/updateSpace.service.js";

export const updateSpaceController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const space = await updateSpace(req);
        return res.status(200).json({ success: true, space });
    } catch (error) {
        returnError(res, error);
    }
};
