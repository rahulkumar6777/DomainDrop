import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { createDefaultStorageCorsConfiguration } from "../../constant/storageCors.js";
import { getDefaultCorsOrigin, normalizeUserStorageCorsConfiguration, } from "../storage/corsConfiguration.js";
import { s3Client } from "./s3Client.js";


export const buildBucketCorsRules = (value = createDefaultStorageCorsConfiguration()) => {
    const configuration = normalizeUserStorageCorsConfiguration(value);
    const rules = [
        {
            ID: "domaindrop-dashboard",
            AllowedOrigins: [getDefaultCorsOrigin()],
            AllowedMethods: ["GET", "HEAD", "PUT"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
        },
    ];

    if (configuration.allowedOrigins.length > 0) {
        const userRule = {
            ID: "user-configured",
            AllowedOrigins: configuration.allowedOrigins,
            AllowedMethods: configuration.allowedMethods,
            MaxAgeSeconds: configuration.maxAgeSeconds,
        };

        if (configuration.allowedHeaders.length > 0) {
            userRule.AllowedHeaders = configuration.allowedHeaders;
        }

        if (configuration.exposeHeaders.length > 0) {
            userRule.ExposeHeaders = configuration.exposeHeaders;
        }

        rules.push(userRule);
    }

    return { configuration, rules };
};

export const updateBucketCors = async (bucketName, value) => {
    const { configuration, rules } = buildBucketCorsRules(value);

    await s3Client.send(new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: { CORSRules: rules },
    }));

    return configuration;
};
