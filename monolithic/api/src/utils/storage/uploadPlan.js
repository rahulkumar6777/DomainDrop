export const MULTIPART_UPLOAD_THRESHOLD = 64 * 1024 * 1024;
export const MULTIPART_PART_SIZE = 16 * 1024 * 1024;
export const MAX_MULTIPART_PARTS = 10000;
const PART_SIZE_STEP = 1024 * 1024;
const MAX_MULTIPART_PART_SIZE = 5 * 1024 * 1024 * 1024;
export const SINGLE_UPLOAD_EXPIRY_SECONDS = 15 * 60;
export const MULTIPART_UPLOAD_EXPIRY_SECONDS = 24 * 60 * 60;
export const PART_URL_EXPIRY_SECONDS = 60 * 60;

export const createUploadPlan = (size) => {
    if (!Number.isSafeInteger(size) || size < 0) {
        throw new TypeError("File size must be a non-negative safe integer");
    }

    if (size <= MULTIPART_UPLOAD_THRESHOLD) {
        return {
            type: "single",
            partSize: null,
            partCount: null,
            expiresIn: SINGLE_UPLOAD_EXPIRY_SECONDS,
        };
    }

    const minimumPartSize = Math.ceil(size / MAX_MULTIPART_PARTS);
    const partSize = Math.ceil(
        Math.max(MULTIPART_PART_SIZE, minimumPartSize) / PART_SIZE_STEP,
    ) * PART_SIZE_STEP;

    if (partSize > MAX_MULTIPART_PART_SIZE) {
        throw new TypeError("File is larger than the multipart upload limit");
    }

    return {
        type: "multipart",
        partSize,
        partCount: Math.ceil(size / partSize),
        expiresIn: MULTIPART_UPLOAD_EXPIRY_SECONDS,
    };
};
