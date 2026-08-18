import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../lib/api.js'
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

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isReady,
      login,
      logout,
      refreshSession,
    }),
    [accessToken, isReady, login, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
