import { createDefaultStorageCorsConfiguration } from "../../../constant/storageCors.js";
import { getDefaultCorsOrigin, normalizeUserStorageCorsConfiguration, } from "../../../utils/storage/corsConfiguration.js";


export const storageCorsResponse = (cors = {}) => ({
    defaultOrigin: getDefaultCorsOrigin(),
    configuration: normalizeUserStorageCorsConfiguration(
        cors.configuration || createDefaultStorageCorsConfiguration(),
    ),
    appliedConfiguration: cors.appliedConfiguration
        ? normalizeUserStorageCorsConfiguration(cors.appliedConfiguration)
        : null,
    status: cors.status || "pending",
    appliedAt: cors.appliedAt || null,
});
