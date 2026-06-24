import api from './api'
import { Tournament, ApiResponse } from '@/types'

interface TournamentFilters {
  game?: string
  status?: string
  type?: string
  mode?: string
  page?: number
  limit?: number
  search?: string
}

export const tournamentService = {
  async getTournaments(filters: TournamentFilters = {}): Promise<ApiResponse<Tournament[]>> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => v !== undefined && params.set(k, String(v)))
    const res = await api.get<ApiResponse<Tournament[]>>(`/tournaments?${params}`)
    return res.data
  },

  async getTournament(id: string): Promise<Tournament> {
    const res = await api.get<ApiResponse<Tournament>>(`/tournaments/${id}`)
    return res.data.data!
  },

  async register(tournamentId: string): Promise<void> {
    await api.post(`/tournaments/${tournamentId}/register`)
  },

  async createPaymentOrder(tournamentId: string) {
    const res = await api.post<ApiResponse<{ orderId: string; amount: number; currency: string }>>(
      `/tournaments/${tournamentId}/payment-order`
    )
    return res.data.data
  },

  async confirmPayment(tournamentId: string, paymentDetails: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }): Promise<void> {
    await api.post(`/tournaments/${tournamentId}/confirm-payment`, paymentDetails)
  },

  async getMyTournaments(): Promise<Tournament[]> {
    const res = await api.get<ApiResponse<Tournament[]>>('/tournaments/my/registered')
    return res.data.data || []
  },

  async getLeaderboard(gameId?: string, limit = 10) {
    const params = gameId ? `?game=${gameId}&limit=${limit}` : `?limit=${limit}`
    const res = await api.get<ApiResponse<unknown[]>>(`/leaderboard${params}`)
    return res.data.data || []
  },
}
