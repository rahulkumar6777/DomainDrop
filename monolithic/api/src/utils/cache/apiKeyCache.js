import { cacheKey } from "./cacheKey.js";
import { cacheKeyExpiry } from "./cacheKeyExpiry.js";


const API_KEY_CACHE_TTL_SECONDS = cacheKeyExpiry.apikeyCacheExpiry();


// this function return apikey expirey of apikey 
const getCacheTtl = (expiresAt, now = new Date()) => {
  if (!expiresAt) {
    return API_KEY_CACHE_TTL_SECONDS;
  }

  const remainingSeconds = Math.floor(
    (new Date(expiresAt).getTime() - now.getTime()) / 1000,
  );

  return Math.min(API_KEY_CACHE_TTL_SECONDS, remainingSeconds);
};


const serializeApiKey = (apiKey) => ({
  apiKeyId: String(apiKey._id ?? apiKey.apiKeyId),
  userId: String(apiKey.userId),
  keyPrefix: apiKey.keyPrefix,
  scopes: apiKey.scopes,
  status: apiKey.status,
  expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt).toISOString() : null,
});


const isValidCacheValue = (value) =>
  value &&
  typeof value.apiKeyId === "string" &&
  typeof value.userId === "string" &&
  typeof value.keyPrefix === "string" &&
  Array.isArray(value.scopes) &&
  value.status === "active";



export const cacheApiKey = async (redis, apiKeyHash, apiKey) => {

  const ttl = getCacheTtl(apiKey.expiresAt);
  const key = cacheKey.ApiKey(apiKeyHash);

  if (apiKey.status !== "active" || ttl <= 0) {
    await redis.del(key);
    return;
  }

  await redis.set(key, JSON.stringify(serializeApiKey(apiKey)), "EX", ttl);
};


export const getCachedApiKey = async (redis, apiKeyHash) => {
  const key = cacheKey.ApiKey(apiKeyHash);
  const cachedValue = await redis.get(key);

  if (!cachedValue) {
    return null;
  }

  try {
    const apiKey = JSON.parse(cachedValue);
    const expiryTime = apiKey.expiresAt ? new Date(apiKey.expiresAt).getTime() : null;
    const hasInvalidExpiry = expiryTime !== null && Number.isNaN(expiryTime);
    const isExpired = expiryTime !== null && !hasInvalidExpiry && expiryTime <= Date.now();

    if (!isValidCacheValue(apiKey) || hasInvalidExpiry || isExpired) {
      await redis.del(key);
      return null;
    }

    return apiKey;
  } catch (_error) {
    await redis.del(key);
    return null;
  }
};

export const invalidateApiKeyCache = (redis, apiKeyHash) => {
  redis.del(cacheKey.ApiKey(apiKeyHash))
}
