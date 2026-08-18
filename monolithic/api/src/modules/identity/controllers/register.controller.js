import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/sendError.js";
import {
    initRegisterService,
    verifyRegisterService,
} from "../services/Register.service.js";

export const initRegisterController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
            });
        }

        await initRegisterService(req);

        return res.status(200).json({
            success: true,
            message: "Otp sent Successfully",
        });
    } catch (error) {
        returnError(res, error);
    }
};

export const verifyRegisterController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
            });
        }

        const { apiKey } = await verifyRegisterService(req);

        return res
            .set('Cache-Control', 'no-store')
            .status(200)
            .json({
                success: true,
                message: "Registration Verified SuccessFully",
                data: {
                    apiKey,
                },
            });
    } catch (error) {
        returnError(res, error);
    }
};
