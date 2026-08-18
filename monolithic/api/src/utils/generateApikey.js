import crypto from "crypto";

const API_KEY_ID_BYTES = 8;
const API_KEY_SECRET_BYTES = 32;

export const generateApiKey = () => {
  const keyId = crypto.randomBytes(API_KEY_ID_BYTES).toString("hex");
  const secret = crypto.randomBytes(API_KEY_SECRET_BYTES).toString("base64url");

  return `dd_live_${keyId}_${secret}`;
};

export const hashApiKey = (apiKey) => {
  if (typeof apiKey !== "string" || apiKey.length === 0) {
    throw new TypeError("API key must be a non-empty string");
  }

  return crypto.createHash("sha256").update(apiKey, "utf8").digest("hex");
};

export const getApiKeyPrefix = (apiKey) => {
  if (typeof apiKey !== "string" || apiKey.length === 0) {
    throw new TypeError("API key must be a non-empty string");
  }

  return apiKey.split("_").slice(0, 3).join("_");
};
