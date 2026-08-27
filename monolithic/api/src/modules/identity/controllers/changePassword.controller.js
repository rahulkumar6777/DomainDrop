import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { changePasswordService } from "../services/changePassword.service.js";

export const changePasswordController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        };

        await changePasswordService(req);

        return res.status(200).json({
            message: "Password Changed SuccessFully"
        })

    } catch (error) {
        returnError(res, error)
    }
}