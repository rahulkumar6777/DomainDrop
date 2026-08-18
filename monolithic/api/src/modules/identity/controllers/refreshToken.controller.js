import { returnError } from "../../../utils/errors/errorHandler.js";
import { getAccessTokenOptions, getRefreshTokenOptions } from "../../../utils/security/cookieOption.js";
import { refreshTokenService } from "../services/refreshToken.service.js";


export const refreshTokenController = async (req, res) => {
    try {

        const refreshToken = req.cookies?.RefreshToken;

        const result = await refreshTokenService({
            refreshToken,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        return res
            .cookie('RefreshToken', result.RefreshToken, getRefreshTokenOptions())
            .json({ accessToken: result.AccessToken });

    } catch (error) {
        returnError(res, error)
    }
}

