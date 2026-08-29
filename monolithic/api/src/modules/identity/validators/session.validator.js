import { param } from "express-validator";

export const sessionIdValidator = [
    param("sessionId")
        .isUUID(4)
        .withMessage("Invalid session id"),
];
