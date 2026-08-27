import { body } from "express-validator";

export const changePasswordValidators = [
    body("oldPassword")
        .notEmpty()
        .withMessage("Old Password is required")
        .isLength({ min: 8, max: 30 })
        .withMessage("Password length must be between 8 to 30letters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .withMessage(
            "Password must be characters and include uppercase, lowercase, number, and special character"
        ),
    body("newPassword")
        .notEmpty()
        .withMessage("new Password is required")
        .isLength({ min: 8, max: 30 })
        .withMessage("Password length must be between 8 to 30letters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .withMessage(
            "Password must be characters and include uppercase, lowercase, number, and special character"
        )
]