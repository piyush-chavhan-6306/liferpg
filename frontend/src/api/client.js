import axios from 'axios'
import { safeStorage } from '../lib/storage'

const API_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:8000' : '')

const client = axios.create({ baseURL: API_URL })

client.interceptors.request.use((config) => {
  const token = safeStorage.getItem('questlog_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      safeStorage.removeItem('questlog_token')
      safeStorage.removeItem('questlog_user')
      if (typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register') &&
          window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default client

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
  supabaseSync: (data) => client.post('/auth/supabase-sync', data),
  checkEmail: (email) => client.get('/auth/check-email', { params: { email } }),
}

export const characterApi = {
  get: () => client.get('/character'),
  equip: (themeId) => client.patch('/character/equip', { theme_id: themeId }),
}

export const tasksApi = {
  list: (statusFilter) =>
    client.get('/tasks', statusFilter ? { params: { status_filter: statusFilter } } : undefined),
  create: (data) => client.post('/tasks', data),
  update: (id, data) => client.patch(`/tasks/${id}`, data),
  remove: (id) => client.delete(`/tasks/${id}`),
  complete: (id) => client.post(`/tasks/${id}/complete`),
}

export const shopApi = {
  list: () => client.get('/shop'),
  purchase: (id) => client.post(`/shop/${id}/purchase`),
  inventory: () => client.get('/shop/inventory/mine'),
}
