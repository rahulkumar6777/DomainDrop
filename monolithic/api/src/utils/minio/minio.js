import { createRequire } from 'module'
import { envs } from '../../lib/env.js';


const require = createRequire(import.meta.url)
const Minio = require('minio')

 
const client = new Minio.Client({
  endPoint: envs.MINIO_ENDPOINT,
  port: Number(envs.MINIO_PORT),
  useSSL: envs.NODE_ENV === "production",
  region: "auto",
  accessKey: envs.MINIO_ACCESS_KEY,
  secretKey: envs.MINIO_SECRET_KEY
});

export default client
