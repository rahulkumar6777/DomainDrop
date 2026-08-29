export const cacheKey = {
    UserOtp: (email) => `domaindrop:users:otp:${email}`,
    SessionKey: (userId, tokenId) => `domaindrop:sessions:${userId}:${tokenId}`,
    RefreshLock: (userId, tokenId) => `domaindrop:refresh:lock:${userId}:${tokenId}`,
    RefreshRotation: (userId, tokenId) => `domaindrop:refresh:rotation:${userId}:${tokenId}`,
    ApiKey: (apiKeyHash) => `domaindrop:apikeys:auth:${apiKeyHash}`,
    ResetPassword: (tokenHash) => `domaindrop:users:reset:${tokenHash}`,
    ApiKeyUsagePending: () => "domaindrop:apikeys:usage:pending",
    ApiKeyUsageProcessing: (snapshotId) => `domaindrop:apikeys:usage:processing:${snapshotId}`,
    ApiKeyUsageProcessingPattern: () => "domaindrop:apikeys:usage:processing:*",
    ApiKeyUsageFlushLock: () => "domaindrop:apikeys:usage:flush-lock"
}   
