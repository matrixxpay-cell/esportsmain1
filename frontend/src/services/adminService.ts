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

  fillDemoTeams: async (id: string, count: number) => {
    const res = await api.post(`/tournaments/${id}/demo-teams`, { count })
    return res.data.data
  },

  generateBrackets: async (id: string, shuffle: boolean, thirdPlace: boolean) => {
    const res = await api.post(`/tournaments/${id}/generate-brackets`, { shuffle, thirdPlace })
    return res.data.data
  },
}
