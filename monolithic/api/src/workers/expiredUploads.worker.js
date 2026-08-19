import { claimExpiredFileDeletion, finalizeFileDeletion, } from "../modules/files/services/fileDeletion.service.js";

const CLEANUP_INTERVAL_MS = 60 * 1000;
const CLEANUP_BATCH_SIZE = 50;

let cleanupRunning = false;

export const runExpiredUploadCleanup = async () => {
    if (cleanupRunning) {
        return 0;
    }

    cleanupRunning = true;
    let cleanedFiles = 0;

    try {
        while (cleanedFiles < CLEANUP_BATCH_SIZE) {
            const file = await claimExpiredFileDeletion();
            if (!file) {
                break;
            }

            try {
                await finalizeFileDeletion(file);
                cleanedFiles += 1;
            } catch (error) {
                console.warn(`[files] cleanup failed for ${file._id}: ${error.message}`);
                break;
            }
        }
    } finally {
        cleanupRunning = false;
    }

    return cleanedFiles;
};

export const startExpiredUploadsWorker = () => {
    runExpiredUploadCleanup().catch((error) => {
        console.warn(`[files] cleanup worker failed: ${error.message}`);
    });

    const timer = setInterval(() => {
        runExpiredUploadCleanup().catch((error) => {
            console.warn(`[files] cleanup worker failed: ${error.message}`);
        });
    }, CLEANUP_INTERVAL_MS);

    timer.unref();
    return timer;
};
