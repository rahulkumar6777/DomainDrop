const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function request(path, options = {}) {
  const { body, headers, ...fetchOptions } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...fetchOptions,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new ApiError(
      payload?.message || 'Something went wrong. Please try again.',
      response.status,
      payload,
    )
  }

  return payload
}

const getAccessToken = (payload) =>
  payload?.AccessToken || payload?.accessToken || null

export const authApi = {
  async login(credentials) {
    const payload = await request('/v1/auth/login', {
      method: 'POST',
      body: credentials,
    })
    return { ...payload, accessToken: getAccessToken(payload) }
  },

  async beginRegistration(details) {
    return request('/v1/auth/register/init', {
      method: 'POST',
      body: details,
    })
  },

  async verifyRegistration(details) {
    return request('/v1/auth/register/verify', {
      method: 'POST',
      body: details,
    })
  },

  async refresh() {
    const payload = await request('/v1/auth/refresh-token')
    return { ...payload, accessToken: getAccessToken(payload) }
  },

  async logout() {
    return request('/v1/auth/logout', { method: 'POST' })
  },
}

export async function authorizedRequest(path, accessToken, options = {}) {
  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
