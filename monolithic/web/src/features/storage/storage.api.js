export const storageApi = {
  get: (call) => call('/v1/storage'),
  updatePolicy: (call, visibility) => call('/v1/storage/policy', {
    method: 'PATCH',
    body: { visibility },
  }),
}
