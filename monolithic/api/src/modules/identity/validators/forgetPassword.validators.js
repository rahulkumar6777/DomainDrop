import { body } from 'express-validator'

export const forgetPasswordValidatorsInit = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("invalid Email formet")
        .isLength({ max: 100 })
        .withMessage("Email length must be under 100letters")
]

export const forgetPasswordValidatorsVerify = [
    body("token")
        .notEmpty()
        .withMessage("token is required")
        .isString()
        .withMessage("token must be a string")
        .isLength({ max: 140 })
        .withMessage("token length not be more than 140 "),
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