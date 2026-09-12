import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: API_URL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('questlog_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('questlog_token')
      localStorage.removeItem('questlog_user')
      if (!window.location.pathname.startsWith('/login')) {
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
}

export const characterApi = {
  get: () => client.get('/character'),
}

export const tasksApi = {
  list: () => client.get('/tasks'),
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
