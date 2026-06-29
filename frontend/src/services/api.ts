import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const { state } = JSON.parse(raw)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      }
    } catch {}
  }
  return config
})

// Handle 401 — auto logout only for auth endpoints
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthEndpoint = !url.includes('/register') && !url.includes('/confirm-payment') && !url.includes('/content/')
      if (isAuthEndpoint && typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
