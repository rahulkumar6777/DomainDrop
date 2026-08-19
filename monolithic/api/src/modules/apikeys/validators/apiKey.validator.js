import { param } from "express-validator";

export const apiKeyIdValidator = [
    param("apiKeyId")
        .isMongoId()
        .withMessage("Invalid API key id"),
];

