'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowDownLeft, ArrowUpRight, IndianRupee, Plus, Minus, TrendingUp, Gift, Clock, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { walletService } from '@/services/walletService'
import toast from 'react-hot-toast'

const TX_ICON: Record<string, any> = {
  prize: TrendingUp, deposit: ArrowDownLeft, entry_fee: ArrowUpRight,
  withdrawal: ArrowUpRight, refund: ArrowDownLeft, referral: Gift, bonus: Gift,
}
const TX_CREDIT_TYPES = ['deposit', 'prize', 'referral', 'bonus', 'refund']

export default function WalletPage() {
  const { user } = useAuthStore()
  const [walletData, setWalletData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [upiId, setUpiId] = useState('')
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      walletService.getBalance(),
      walletService.getTransactions(1, 20),
    ]).then(([bal, txRes]) => {
      setWalletData(bal)
      setTransactions((txRes as any).data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const balance = walletData?.balance ?? 0
  const bonusBalance = walletData?.bonusBalance ?? 0
  const totalDeposited = walletData?.totalDeposited ?? 0
  const totalWon = walletData?.totalWon ?? 0

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount < 10) { toast.error('Minimum deposit is ₹10'); return }
    setSubmitting(true)
    try {
      const order = await walletService.createDepositOrder(amount)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order!.amount,
        currency: order!.currency || 'INR',
        name: 'EsportsG',
        description: 'Wallet Deposit',
        order_id: order!.orderId,
        handler: async function (response: any) {
          try {
            await walletService.confirmDeposit({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
            })
            toast.success('Deposit successful!')
            const bal = await walletService.getBalance()
            setWalletData(bal)
            const txRes = await walletService.getTransactions(1, 20)
            setTransactions((txRes as any).data || [])
            setDepositAmount('')
          } catch (err: any) {
            toast.error(err.message || 'Deposit confirmation failed')
          }
        },
        prefill: { email: user?.email },
        theme: { color: '#FF6B2B' },
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (e: any) {
      toast.error(e.message || 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < 100) { toast.error('Minimum withdrawal is ₹100'); return }
    if (!upiId || !upiId.includes('@')) { toast.error('Enter a valid UPI ID'); return }
    if (amount > balance) { toast.error('Insufficient balance'); return }
    setSubmitting(true)
    try {
      await walletService.requestWithdrawal(amount, upiId)
      toast.success('Withdrawal request submitted! Processed within 24 hours.')
      setWithdrawAmount('')
      setUpiId('')
      const bal = await walletService.getBalance()
      setWalletData(bal)
    } catch (e: any) {
      toast.error(e.message || 'Withdrawal failed')
    } finally {
      setSubmitting(false)
    }
  }

  const statCards = [
    { label: 'Available Balance', value: balance, color: '#FF6B2B', icon: Wallet, prefix: '₹' },
    { label: 'Bonus Balance', value: bonusBalance, color: '#10B981', icon: Gift, prefix: '₹' },
    { label: 'Total Deposited', value: totalDeposited, color: '#60A5FA', icon: ArrowDownLeft, prefix: '₹' },
    { label: 'Total Won', value: totalWon, color: '#F59E0B', icon: TrendingUp, prefix: '₹' },
  ]

  return (
    <div className="pb-20 lg:pb-0">
      <div className="page-header">
        <h1 className="gaming-heading flex items-center gap-2">
          <Wallet className="w-7 h-7 text-saffron" />
          My Wallet
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your funds and view transactions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map(({ label, value, color, icon: Icon, prefix }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card-v2 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-24 bg-white/[0.06] rounded animate-pulse mb-1" />
            ) : (
              <div className="font-gaming font-bold text-xl sm:text-2xl" style={{ color }}>
                {prefix}{value.toLocaleString('en-IN')}
              </div>
            )}
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Deposit / Withdraw Panel */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 stat-card-v2 !p-0 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {(['deposit', 'withdraw'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                  activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}>
                <span className="flex items-center justify-center gap-1.5">
                  {tab === 'deposit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  {tab === 'deposit' ? 'Deposit' : 'Withdraw'}
                </span>
                {activeTab === tab && (
                  <motion.div layoutId="wallet-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: tab === 'deposit' ? '#FF6B2B' : '#EF4444' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'deposit' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Amount (₹)</label>
                  <input value={depositAmount} onChange={e => setDepositAmount(e.target.value)} type="number"
                    placeholder="Enter amount (min ₹10)" className="input-glass py-3" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 250, 500].map(amount => (
                    <button key={amount} onClick={() => setDepositAmount(String(amount))}
                      className="py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-saffron transition-all"
                      style={{ background: 'rgba(255,107,43,0.06)', border: '1px solid rgba(255,107,43,0.12)' }}>
                      ₹{amount}
                    </button>
                  ))}
                </div>
                <button onClick={handleDeposit} disabled={submitting}
                  className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <IndianRupee className="w-4 h-4" />}
                  Add Money
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                  <Shield className="w-3 h-3" />
                  Secured via Razorpay • UPI • Net Banking
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">UPI ID</label>
                  <input value={upiId} onChange={e => setUpiId(e.target.value)} type="text"
                    placeholder="yourname@upi" className="input-glass py-3" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Amount (₹)</label>
                  <input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number"
                    placeholder="Min ₹100" className="input-glass py-3" />
                </div>
                <div className="rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span>Available</span>
                  <span className="text-white font-gaming font-bold">₹{balance.toLocaleString('en-IN')}</span>
                </div>
                <button onClick={handleWithdraw} disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                  Withdraw
                </button>
                <p className="text-xs text-slate-600 text-center">Processed within 24 hours</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 stat-card-v2 !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Clock className="w-4 h-4 text-saffron" />
            <h2 className="font-semibold text-white text-sm">Transaction History</h2>
            <span className="text-xs text-slate-500 ml-auto">{transactions.length} transactions</span>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="space-y-1 p-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state !py-12">
                <div className="empty-icon !w-12 !h-12">
                  <Clock className="w-5 h-5 text-saffron/40" />
                </div>
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-0.5 max-h-[420px] overflow-y-auto">
                {transactions.map((tx: any) => {
                  const Icon = TX_ICON[tx.type] || IndianRupee
                  const isCredit = TX_CREDIT_TYPES.includes(tx.type) || tx.amount > 0
                  return (
                    <div key={tx._id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
                        style={{
                          background: isCredit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${isCredit ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                        }}>
                        <Icon className={`w-4 h-4 ${isCredit ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{tx.description}</div>
                        <div className="text-xs text-slate-600">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {tx.status === 'pending' && <span className="ml-2 text-yellow-500">• Pending</span>}
                        </div>
                      </div>
                      <div className={`font-gaming font-bold text-sm flex-shrink-0 ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
