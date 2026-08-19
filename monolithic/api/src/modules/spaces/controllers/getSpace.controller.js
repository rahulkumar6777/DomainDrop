import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { getSpace } from "../services/getSpace.service.js";

export const getSpaceController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const space = await getSpace(req);
        return res.status(200).json({ success: true, space });
    } catch (error) {
        returnError(res, error);
    }
};
