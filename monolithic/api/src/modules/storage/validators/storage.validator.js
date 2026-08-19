import { body } from "express-validator";
import { STORAGE_VISIBILITIES } from "../../../models/storage.model.js";

export const updateStoragePolicyValidator = [
    body("visibility")
        .isIn(STORAGE_VISIBILITIES)
        .withMessage("visibility must be private or public-read"),
];

