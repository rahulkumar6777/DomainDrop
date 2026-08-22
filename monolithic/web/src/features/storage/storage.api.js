export const storageApi = {
  get: (call) => call('/v1/storage'),
  updatePolicy: (call, visibility) => call('/v1/storage/policy', {
    method: 'PATCH',
    body: { visibility },
  }),
  updateCors: (call, configuration) => call('/v1/storage/cors', {
    method: 'PUT',
    body: configuration,
  }),
}
