import dotenv from "dotenv";
dotenv.config();

const requiredEnvs = [
    "NODE_ENV", "PORT",
    "MONGODB_URI", "REDIS_URI",
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
    REDIS_URI: process.env.REDIS_URI,
}