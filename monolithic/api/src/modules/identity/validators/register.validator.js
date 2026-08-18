import { body } from 'express-validator';

export const initRegisterValidator = [
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('fullname is required')
        .isString()
        .withMessage('fullName must be a string')
        .isLength({ min: 3, max: 30 })
        .withMessage("fullname length between 3 to 30"),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid Email formet'),
    body('password')
        .notEmpty()
        .withMessage('password is required')
        .isString()
        .withMessage("password must be a String")
        .isLength({ min: 8, max: 30 })
        .withMessage("password length between 8 to 30")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .withMessage(
            "Password must be characters and include uppercase, lowercase, number, and special character"
        )
]

export const verifyRegisterValidator = [
    body("otp")
        .trim()
        .notEmpty()
        .withMessage("otp is required")
        .isNumeric()
        .withMessage("otp must contain only digits")
        .isLength({ min: 6, max: 6 })
        .withMessage("otp must be six digit"),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid Email formet'),
]
