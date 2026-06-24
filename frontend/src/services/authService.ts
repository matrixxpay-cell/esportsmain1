import api from './api'
import { User } from '@/types'

interface AuthResponse {
  user: User
  token: string
}

interface RegisterData {
  username: string
  email: string
  phone: string
  password: string
  referralCode?: string
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', { email, password })
    return res.data.data!
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post<{ data: AuthResponse }>('/auth/register', data)
    return res.data.data!
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  },

  async resendVerification(): Promise<void> {
    await api.post('/auth/resend-verification')
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  },

  async getProfile(): Promise<User> {
    const res = await api.get<{ data: User }>('/auth/profile')
    return res.data.data!
  },
}
