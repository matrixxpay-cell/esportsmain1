import api from './api'

export const adminService = {
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics')
    return res.data.data
  },

  getUsers: async (page = 1, search = '') => {
    const res = await api.get('/admin/users', { params: { page, limit: 20, search: search || undefined } })
    return res.data
  },

  banUser: async (id: string, reason: string) => {
    const res = await api.put(`/admin/users/${id}/ban`, { reason })
    return res.data
  },

  unbanUser: async (id: string) => {
    const res = await api.put(`/admin/users/${id}/unban`)
    return res.data
  },

  getTransactions: async (params: { page?: number; type?: string; status?: string } = {}) => {
    const res = await api.get('/admin/transactions', { params })
    return res.data
  },

  getPendingWithdrawals: async () => {
    const res = await api.get('/admin/withdrawals/pending')
    return res.data.data
  },

  approveWithdrawal: async (id: string) => {
    const res = await api.put(`/admin/withdrawals/${id}/approve`)
    return res.data
  },

  rejectWithdrawal: async (id: string) => {
    const res = await api.put(`/admin/withdrawals/${id}/reject`)
    return res.data
  },

  getTournaments: async (status = '', game = '') => {
    const res = await api.get('/tournaments', { params: { status: status || undefined, game: game || undefined, limit: 50 } })
    return res.data.data
  },

  deleteTournament: async (id: string) => {
    const res = await api.delete(`/tournaments/${id}`)
    return res.data
  },

  getTournament: async (id: string) => {
    const res = await api.get(`/tournaments/${id}`)
    return res.data.data
  },

  updateTournament: async (id: string, data: any) => {
    const res = await api.put(`/tournaments/${id}`, data)
    return res.data.data
  },

  createTournament: async (data: any) => {
    const res = await api.post('/tournaments', data)
    return res.data.data
  },

  updateTournamentStatus: async (id: string, status: string) => {
    const res = await api.patch(`/tournaments/${id}/status`, { status })
    return res.data.data
  },

  demoFill: async (id: string, count: number) => {
    const res = await api.post(`/tournaments/${id}/demo-fill`, { count })
    return res.data
  },

  generateBrackets: async (id: string, opts: { shuffle?: boolean; thirdPlace?: boolean } = {}) => {
    const res = await api.post(`/tournaments/${id}/brackets/generate`, opts)
    return res.data
  },

  getBrackets: async (id: string) => {
    const res = await api.get(`/tournaments/${id}/brackets`)
    return res.data.data
  },

  updateMatchResult: async (id: string, matchNumber: number, data: any) => {
    const res = await api.put(`/tournaments/${id}/brackets/${matchNumber}`, data)
    return res.data
  },

  resetBrackets: async (id: string) => {
    const res = await api.delete(`/tournaments/${id}/brackets`)
    return res.data
  },

  sendMatchRoom: async (id: string, matchNumber: number, roomId: string, roomPassword: string) => {
    const res = await api.post(`/tournaments/${id}/brackets/${matchNumber}/room`, { roomId, roomPassword })
    return res.data
  },

  getContentGames: async () => {
    const res = await api.get('/admin/content/games')
    return res.data.data
  },
  updateContentGames: async (games: any[]) => {
    const res = await api.put('/admin/content/games', { games })
    return res.data.data
  },
  getContentSponsors: async () => {
    const res = await api.get('/admin/content/sponsors')
    return res.data.data
  },
  updateContentSponsors: async (sponsors: any[]) => {
    const res = await api.put('/admin/content/sponsors', { sponsors })
    return res.data.data
  },
  getContentReviews: async () => {
    const res = await api.get('/admin/content/reviews')
    return res.data.data
  },
  updateContentReviews: async (reviews: any[]) => {
    const res = await api.put('/admin/content/reviews', { reviews })
    return res.data.data
  },
}
