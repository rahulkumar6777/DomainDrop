export const filesApi = {
  list: (call, query = {}) => {
    const search = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.set(key, value)
    })
    const suffix = search.size ? `?${search.toString()}` : ''
    return call(`/v1/files${suffix}`)
  },
  get: (call, fileId) => call(`/v1/files/${fileId}`),
  delete: (call, fileId) => call(`/v1/files/${fileId}`, { method: 'DELETE' }),
  createDownload: (call, fileId, expiresIn = 900) => call(
    `/v1/files/${fileId}/signed-url`,
    { method: 'POST', body: { expiresIn } },
  ),
}
