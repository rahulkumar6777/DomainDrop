export const cacheKey = {
    UserOtp: (email) => `domaindrop:users:otp:${email}`,
    SessionKey: (userId, tokenId) => `domaindrop:sessions:${userId}:${tokenId}`,
    RefreshLock: (userId, tokenId) => `domaindrop:refresh:lock:${userId}:${tokenId}`,
    RefreshRotation: (userId, tokenId) => `domaindrop:refresh:rotation:${userId}:${tokenId}`,
}