import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { createSpace } from "../services/createSpace.service.js";

export const createSpaceController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const space = await createSpace(req);
        return res.status(201).json({ success: true, space });
    } catch (error) {
        returnError(res, error);
    }
};
