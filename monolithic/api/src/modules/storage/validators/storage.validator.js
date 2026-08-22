import { body } from "express-validator";
import { STORAGE_VISIBILITIES } from "../../../models/storage.model.js";
import { normalizeUserStorageCorsConfiguration } from "../../../utils/storage/corsConfiguration.js";

export const updateStoragePolicyValidator = [
    body("visibility")
        .isIn(STORAGE_VISIBILITIES)
        .withMessage("visibility must be private or public-read"),
];


export const updateStorageCorsValidator = [
    body().custom((value) => {
        try {
            normalizeUserStorageCorsConfiguration(value);
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }),
];
