import { getRedisClient } from "../../config/redis/redis.js";
import { envs } from "../../lib/env.js";


export const connection = {
  url: envs.REDIS_URI,        // e.g. "rediss://default:<password>@<host>:<port"
  maxRetriesPerRequest: null, // recommended for BullMQ
};