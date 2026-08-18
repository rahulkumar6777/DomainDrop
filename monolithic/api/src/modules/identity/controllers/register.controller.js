import { validationResult } from "express-validator";
import { returnError } from '../../../utils/errors/sendError.js'
import { initRegisterService, verifyRegisterService } from "../services/Register.service.js";
import { envs } from "../../../lib/env.js";


export const initRegisterController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        await initRegisterService(req);


        return res.status(200).json({
            success: true,
            message: "Otp sent Successfully"
        });

    } catch (error) {
        returnError(res, error)
    }
}

export const verifyRegisterController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        await verifyRegisterService(req);

        return res.status(200).json({
            success: true,
            message: "Registration Verified SuccessFully"
        })

    } catch (error) {
        returnError(res, error)
    }
}