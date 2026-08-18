import { body } from "express-validator";

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .isString()
        .withMessage('email must be a String')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage("Email is too long"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage('password must be a String')
        .isLength({ max: 64 })
        .withMessage("Password is too long"),
]