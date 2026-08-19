export const spacesApi = {
  list: (call) => call('/v1/spaces'),
  get: (call, spaceId) => call(`/v1/spaces/${spaceId}`),
  create: (call, details) => call('/v1/spaces', { method: 'POST', body: details }),
  update: (call, spaceId, details) => call(`/v1/spaces/${spaceId}`, {
    method: 'PATCH',
    body: details,
  }),
  delete: (call, spaceId) => call(`/v1/spaces/${spaceId}`, { method: 'DELETE' }),
}
