import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { deleteSpace } from "../services/deleteSpace.service.js";

export const deleteSpaceController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const spaceId = await deleteSpace(req);
        return res.status(200).json({
            success: true,
            message: "Space deleted successfully",
            spaceId,
        });
    } catch (error) {
        returnError(res, error);
    }
};
