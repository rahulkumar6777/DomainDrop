import { param, query } from "express-validator";

export const apiKeyIdValidator = [
    param("apiKeyId")
        .isMongoId()
        .withMessage("Invalid API key id"),
];

export const getApiKeyUsageValidator = [
    ...apiKeyIdValidator,
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("limit must be between 1 and 100")
        .toInt(),
    query("method")
        .optional()
        .isIn(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"])
        .withMessage("Invalid request method"),
    query("statusCode")
        .optional()
        .isInt({ min: 100, max: 599 })
        .withMessage("Invalid status code")
        .toInt(),
    query("from")
        .optional()
        .isISO8601({ strict: true })
        .withMessage("from must be a valid ISO date"),
    query("to")
        .optional()
        .isISO8601({ strict: true })
        .withMessage("to must be a valid ISO date"),
    query("cursor")
        .optional()
        .isString()
        .withMessage("Invalid usage cursor")
        .bail()
        .isLength({ min: 1, max: 300 })
        .withMessage("Invalid usage cursor")
        .matches(/^[A-Za-z0-9_-]+$/)
        .withMessage("Invalid usage cursor"),
    query().custom((value) => {
        if (value.from && value.to && new Date(value.from) > new Date(value.to)) {
            throw new Error("from must be before to");
        }
        return true;
    }),
];
