import { AppError } from "../errors/AppError.js";

export const extractCredential = async (req) => {

    const accessToken = req.headers.authorization?.replace('Bearer ', "");
    const apikey = req.headers['x-api-key'];

    if (!accessToken && !apikey) {
        throw new AppError("Use either API key or access token");
    }

    if (accessToken && apikey) {
        throw new AppError("Use either API key or access token , not both");
    }

    if (typeof accessToken !== "string" || typeof apikey !== "string") {
        throw new AppError("Invalid Authincation type");
    }

    if (apikey) {
        return {
            type: "apiKey",
            value: apikey,
        };
    }

    if (accessToken) {
        return {
            type: "accessToken",
            value: accessToken,
        };
    }

}