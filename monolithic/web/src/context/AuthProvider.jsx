import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, authApi, authorizedRequest } from '../lib/api.js'
import { AuthContext } from './authContext.js'

let pendingSessionRestore = null

function restoreSession() {
  if (!pendingSessionRestore) {
    pendingSessionRestore = authApi.refresh().finally(() => {
      pendingSessionRestore = null
    })
  }
  return pendingSessionRestore
}

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const refreshSession = useCallback(async () => {
    const result = await restoreSession()
    setAccessToken(result.accessToken)
    return result.accessToken
  }, [])

  useEffect(() => {
    let isActive = true

    restoreSession()
      .then((result) => {
        if (isActive) setAccessToken(result.accessToken)
      })
      .catch(() => {
        if (isActive) setAccessToken(null)
      })
      .finally(() => {
        if (isActive) setIsReady(true)
      })

    return () => {
      isActive = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials)
    setAccessToken(result.accessToken)
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setAccessToken(null)
    }
  }, [])

  const apiRequest = useCallback(async (path, options = {}) => {
    let token = accessToken

    if (!token) {
      try {
        token = await refreshSession()
      } catch {
        setAccessToken(null)
        throw new ApiError('Your session has expired. Please log in again.', 401)
      }
    }

    try {
      return await authorizedRequest(path, token, options)
    } catch (error) {
      if (error.status !== 401) throw error

      try {
        token = await refreshSession()
        return await authorizedRequest(path, token, options)
      } catch (refreshError) {
        setAccessToken(null)
        throw refreshError
      }
    }
  }, [accessToken, refreshSession])

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isReady,
      login,
      logout,
      refreshSession,
      apiRequest,
    }),
    [accessToken, apiRequest, isReady, login, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
