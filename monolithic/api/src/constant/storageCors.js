export const STORAGE_CORS_METHODS = Object.freeze([
    "GET",
    "HEAD",
    "PUT",
    "POST",
    "DELETE",
]);

export const STORAGE_CORS_LIMITS = Object.freeze({
    maxOrigins: 20,
    maxHeaders: 20,
    maxAgeSeconds: 86400,
});

export const createDefaultStorageCorsConfiguration = () => ({
    allowedOrigins: [],
    allowedMethods: ["GET", "HEAD", "PUT"],
    allowedHeaders: ["*"],
    exposeHeaders: ["ETag"],
    maxAgeSeconds: 3600,
});
