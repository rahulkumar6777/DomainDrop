import { createRequire } from 'module'
import { envs } from '../../lib/env.js';


const require = createRequire(import.meta.url)
const Minio = require('minio')
 

export const client = new Minio.Client({
  endPoint: envs.NODE_ENV === "production" ? envs.MINIO_ENDPOINT : "localhost",
  port: envs.NODE_ENV === "production" ? envs.MINIO_PORT : 9000,
  useSSL: envs.NODE_ENV === "production",
  region: "auto",
  accessKey: envs.NODE_ENV === "production" ? envs.MINIO_ACCESS_KEY : "admin",
  secretKey: envs.NODE_ENV === "production" ? envs.MINIO_SECRET_KEY : "rahul@dkfd48"
});