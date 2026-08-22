import { S3Client } from "@aws-sdk/client-s3";
import { envs } from "../../lib/env.js";

const endpoint = new URL(`https://${envs.MINIO_ENDPOINT}`);
endpoint.port = envs.MINIO_PORT;

export const s3Client = new S3Client({
    endpoint: endpoint.origin,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
        accessKeyId: envs.MINIO_ACCESS_KEY,
        secretAccessKey: envs.MINIO_SECRET_KEY,
    },
});
