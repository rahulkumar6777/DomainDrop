import { connectDb, disconnectDb } from "../config/db/mongodb.js";
import { createDefaultStorageCorsConfiguration } from "../constant/storageCors.js";
import { Storage } from "../models/storage.model.js";
import { updateBucketCors } from "../utils/minio/updateBucketCors.js";
import { normalizeUserStorageCorsConfiguration } from "../utils/storage/corsConfiguration.js";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);


const syncBucketCors = async () => {
    await connectDb();

    let updated = 0;
    let failed = 0;
    const storages = Storage.find({ status: "active" })
        .select("bucket cors")
        .lean()
        .cursor();

    for await (const storage of storages) {
        try {
            const configuration = normalizeUserStorageCorsConfiguration(
                storage.cors?.configuration || createDefaultStorageCorsConfiguration(),
            );
            const appliedConfiguration = await updateBucketCors(storage.bucket.name, configuration);
            await Storage.updateOne(
                { _id: storage._id },
                {
                    $set: {
                        "cors.configuration": configuration,
                        "cors.appliedConfiguration": appliedConfiguration,
                        "cors.status": "applied",
                        "cors.appliedAt": new Date(),
                        "cors.lastError": null,
                    },
                },
            );
            updated += 1;
            console.log(`[cors] updated ${storage.bucket.name}`);
        } catch (error) {
            failed += 1;
            await Storage.updateOne(
                { _id: storage._id },
                {
                    $set: {
                        "cors.status": "error",
                        "cors.lastError": String(error.message || "CORS update failed").slice(0, 500),
                    },
                },
            );
            console.error(`[cors] failed ${storage.bucket.name}: ${error.message}`);
        }
    }

    console.log(`[cors] complete: ${updated} updated, ${failed} failed`);
    if (failed > 0) {
        process.exitCode = 1;
    }
};

try {
    await syncBucketCors();
} finally {
    await disconnectDb();
}
