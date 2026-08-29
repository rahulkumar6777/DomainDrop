import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import { forgetPasswordServiceInit } from "../services/forgetPassword.service.js";

export const forgetPasswordControllerInit = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        await forgetPasswordServiceInit(req);

        return res.status(200).json({
            message: "Reset Link sent to your email"
        });

    } catch (error) {
        console.log(error)
        returnError(res, error)
    }
}