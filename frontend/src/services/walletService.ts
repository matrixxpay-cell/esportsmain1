import api from './api'
import { Transaction, ApiResponse } from '@/types'

export const walletService = {
  async getBalance() {
    const res = await api.get<ApiResponse<{ balance: number; bonusBalance: number; totalDeposited: number; totalWon: number }>>('/wallet/balance')
    return res.data.data!
  },

  async createDepositOrder(amount: number) {
    const res = await api.post<ApiResponse<{ orderId: string; amount: number; currency: string }>>('/wallet/deposit', { amount })
    return res.data.data
  },

  async confirmDeposit(details: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    amount: number
  }) {
    await api.post('/wallet/confirm-deposit', details)
  },

  async requestWithdrawal(amount: number, upiId: string) {
    await api.post('/wallet/withdraw', { amount, upiId })
  },

  async getTransactions(page = 1, limit = 20): Promise<ApiResponse<Transaction[]>> {
    const res = await api.get<ApiResponse<Transaction[]>>(`/wallet/transactions?page=${page}&limit=${limit}`)
    return res.data
  },
}
