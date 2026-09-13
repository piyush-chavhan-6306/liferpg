import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/client'
import { safeStorage } from '../lib/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return safeStorage.getParsedItem('questlog_user')
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = safeStorage.getItem('questlog_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data)
        safeStorage.setItem('questlog_user', res.data)
      })
      .catch(() => {
        safeStorage.removeItem('questlog_token')
        safeStorage.removeItem('questlog_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await authApi.login({ username, password })
    safeStorage.setItem('questlog_token', res.data.access_token)
    safeStorage.setItem('questlog_user', res.data.user)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (username, email, password) => {
    const res = await authApi.register({ username, email, password })
    safeStorage.setItem('questlog_token', res.data.access_token)
    safeStorage.setItem('questlog_user', res.data.user)
    setUser(res.data.user)
  }, [])

  const setSession = useCallback((token, userData) => {
    safeStorage.setItem('questlog_token', token)
    safeStorage.setItem('questlog_user', userData)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    safeStorage.removeItem('questlog_token')
    safeStorage.removeItem('questlog_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
