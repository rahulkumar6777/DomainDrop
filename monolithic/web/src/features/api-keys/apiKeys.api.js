export const apiKeysApi = {
  list: (call) => call('/v1/api-keys'),
  create: (call, details) => call('/v1/api-keys', { method: 'POST', body: details }),
  revoke: (call, apiKeyId) => call(`/v1/api-keys/${apiKeyId}`, { method: 'DELETE' }),
}
