import dotenv from "dotenv";
dotenv.config();

const requiredEnvs = [
    "NODE_ENV", "PORT",
    "ADMIN_EMAIL", "ADMIN_USERNAME", "ADMIN_PASSWORD",
    "MONGODB_URI", "REDIS_URI",
    "EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS",
    "REFRESH_TOKEN_SECRET", "REFRESH_TOKEN_EXPIRATION", "ACCESS_TOKEN_SECRET", "ACCESS_TOKEN_EXPIRATION",
    "MINIO_ENDPOINT", "MINIO_PORT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY"
]

for (const env of requiredEnvs) {
    if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
    }
}

export const envs = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_URI: process.env.REDIS_URI,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION,
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY
}