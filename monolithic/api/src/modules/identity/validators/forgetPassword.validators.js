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