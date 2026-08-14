import dotenv from "dotenv";
dotenv.config();

const requiredEnvs = [
    "NODE_ENV", "PORT",
    "MONGODB_URI", "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD", "REDIS_URI",
]

for (const env of requiredEnvs) {
    if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
    }
}

export const envs = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_URI: process.env.REDIS_URI,
}