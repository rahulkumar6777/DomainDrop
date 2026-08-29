export const apiKeysApi = {
  list: (call) => call('/v1/api-keys'),
  create: (call, details) => call('/v1/api-keys', { method: 'POST', body: details }),
  revoke: (call, apiKeyId) => call(`/v1/api-keys/${apiKeyId}`, { method: 'DELETE' }),
  usage: (call, apiKeyId, query = {}) => {
    const search = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    const suffix = search.size ? `?${search.toString()}` : ''
    return call(`/v1/api-keys/${apiKeyId}/usage${suffix}`)
  },
}
