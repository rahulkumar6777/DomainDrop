import { body } from "express-validator";
import { API_KEY_SCOPES } from "../../../models/apikeys.model.js";


export const createApiKeyValidator = [
    body("apiKeyName")
        .isString()
        .withMessage("apiKeyName must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("apiKeyName is required")
        .isLength({ min: 2, max: 40 })
        .withMessage("apiKeyName must be between 2 and 40 characters"),

    body("apiKeyScope")
        .optional()
        .isArray({ min: 1 })
        .withMessage("apiKeyScope must be a non-empty array")
        .bail()
        .custom((scopes) => {
            const hasDuplicates = new Set(scopes).size !== scopes.length;
            const hasInvalidScope = scopes.some(
                (scope) => typeof scope !== "string" || !API_KEY_SCOPES.includes(scope),
            );

            if (hasDuplicates || hasInvalidScope) {
                throw new Error("apiKeyScope must contain unique, supported scopes");
            }

            return true;
        }),

    body("expiresAt")
        .optional({ values: "null" })
        .isISO8601({ strict: true })
        .withMessage("expiresAt must be a valid ISO 8601 date")
        .bail()
        .custom((value) => {
            if (new Date(value).getTime() <= Date.now()) {
                throw new Error("expiresAt must be a future date");
            }

            return true;
        }),
];
