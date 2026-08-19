import { body, param } from "express-validator";

export const createSpaceValidator = [
    body("name")
        .isString()
        .withMessage("Space name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Space name is required")
        .isLength({ max: 120 })
        .withMessage("Space name is too long"),
    body("description")
        .optional({ values: "null" })
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description is too long"),
];

export const spaceIdValidator = [
    param("spaceId")
        .isMongoId()
        .withMessage("Invalid space id"),
];

export const updateSpaceValidator = [
    ...spaceIdValidator,
    body("name")
        .optional()
        .isString()
        .withMessage("Space name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Space name cannot be empty")
        .isLength({ max: 120 })
        .withMessage("Space name is too long"),
    body("description")
        .optional({ values: "null" })
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description is too long"),
    body().custom((value) => {
        if (value?.name === undefined && value?.description === undefined) {
            throw new Error("Name or description is required");
        }

        return true;
    }),
];
