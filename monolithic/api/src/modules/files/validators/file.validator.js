import { body, param, query } from "express-validator";
import { FILE_STATUSES } from "../../../models/file.model.js";
import { isValidRelativePath } from "../../../utils/storage/filePath.js";

export const createUploadUrlValidator = [
    body("spaceId")
        .isMongoId()
        .withMessage("Invalid space id"),
    body("path")
        .isString()
        .withMessage("File path must be a string")
        .bail()
        .custom(isValidRelativePath)
        .withMessage("Invalid file path"),
    body("size")
        .isInt({ min: 1, max: Number.MAX_SAFE_INTEGER })
        .withMessage("File size must be a positive integer")
        .toInt(),
    body("mimeType")
        .optional()
        .isString()
        .withMessage("mimeType must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("mimeType cannot be empty")
        .isLength({ max: 255 })
        .withMessage("mimeType is too long"),
];

export const fileIdValidator = [
    param("fileId")
        .isMongoId()
        .withMessage("Invalid file id"),
];

export const multipartPartUrlsValidator = [
    ...fileIdValidator,
    body("partNumbers")
        .isArray({ min: 1, max: 50 })
        .withMessage("partNumbers must contain between 1 and 50 parts"),
    body("partNumbers.*")
        .isInt({ min: 1, max: 10000 })
        .withMessage("Invalid part number")
        .toInt(),
];

export const completeUploadValidator = [
    ...fileIdValidator,
    body("parts")
        .optional()
        .isArray({ min: 1, max: 10000 })
        .withMessage("parts must be a non-empty array"),
    body("parts.*.partNumber")
        .isInt({ min: 1, max: 10000 })
        .withMessage("Invalid completed part number")
        .toInt(),
    body("parts.*.etag")
        .isString()
        .withMessage("Part ETag must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Part ETag is required")
        .isLength({ max: 200 })
        .withMessage("Part ETag is too long"),
];

export const getFilesValidator = [
    query("spaceId")
        .optional()
        .isMongoId()
        .withMessage("Invalid space id"),
    query("prefix")
        .optional()
        .isString()
        .withMessage("prefix must be a string")
        .bail()
        .trim()
        .isLength({ min: 1, max: 1024 })
        .withMessage("Invalid path prefix")
        .custom((prefix) => !prefix.includes("\\") && !/[\u0000-\u001f\u007f]/.test(prefix))
        .withMessage("Invalid path prefix"),
    query("status")
        .optional()
        .isIn(FILE_STATUSES)
        .withMessage("Invalid file status"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("limit must be between 1 and 100")
        .toInt(),
];

export const signedUrlValidator = [
    ...fileIdValidator,
    body("expiresIn")
        .optional()
        .isInt({ min: 60, max: 86400 })
        .withMessage("expiresIn must be between 60 and 86400 seconds")
        .toInt(),
];
