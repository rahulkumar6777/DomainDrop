import { AppError } from "../errors/AppError.js";

const getBearerToken = (authorizationHeader) => {
    if (authorizationHeader === undefined) {
        return null;
    }

    if (typeof authorizationHeader !== "string") {
        throw new AppError("Invalid Authorization header", 400);
    }

    const match = authorizationHeader.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
        throw new AppError("Authorization header must use Bearer scheme", 401);
    }

    return match[1];
};

export const extractCredential = (req) => {
    const accessToken = getBearerToken(req.headers?.authorization);
    const apiKeyHeader = req.headers?.["x-api-key"];

    if (apiKeyHeader !== undefined && typeof apiKeyHeader !== "string") {
        throw new AppError("Invalid API key header", 400);
    }

    const apiKey = apiKeyHeader?.trim() || null;

    if (!accessToken && !apiKey) {
        throw new AppError("Authentication required", 401);
    }

    if (accessToken && apiKey) {
        throw new AppError("Use either API key or access token, not both", 400);
    }

    if (accessToken) {
        return {
            type: "jwt",
            value: accessToken,
        };
    }

    return {
        type: "api-key",
        value: apiKey,
    };
};
