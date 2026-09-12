import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('questlog_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('questlog_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('questlog_user', JSON.stringify(res.data))
      })
      .catch(() => {
        localStorage.removeItem('questlog_token')
        localStorage.removeItem('questlog_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await authApi.login({ username, password })
    localStorage.setItem('questlog_token', res.data.access_token)
    localStorage.setItem('questlog_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (username, email, password) => {
    const res = await authApi.register({ username, email, password })
    localStorage.setItem('questlog_token', res.data.access_token)
    localStorage.setItem('questlog_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('questlog_token')
    localStorage.removeItem('questlog_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
