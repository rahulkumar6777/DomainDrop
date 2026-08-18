import { validationResult } from "express-validator";
import { returnError } from "../../../utils/errors/errorHandler.js";
import { loginService } from "../services/login.service.js";
import { generateToken } from "../../../utils/security/generateToken.js";
import { getAccessTokenOptions, getRefreshTokenOptions } from "../../../utils/security/cookieOption.js";


export const loginController = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        };


        const user = await loginService(req);

        const { AccessToken, RefreshToken } = await generateToken(user._id, user.role, req);

        return res
            .cookie('RefreshToken', RefreshToken, getRefreshTokenOptions())
            .status(200)
            .json({
                success: true,
                message: 'Login Successful',
                AccessToken
            });

    } catch (error) {
        console.log(error)
        returnError(res, error)
    }
}