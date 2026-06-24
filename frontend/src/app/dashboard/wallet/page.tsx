'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowDownLeft, ArrowUpRight, IndianRupee, Plus, Minus, TrendingUp, Gift, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { walletService } from '@/services/walletService'
import toast from 'react-hot-toast'

const TX_ICON: Record<string, any> = {
  prize: TrendingUp, deposit: ArrowDownLeft, entry_fee: ArrowUpRight,
  withdrawal: ArrowUpRight, refund: ArrowDownLeft, referral: Gift, bonus: Gift,
}

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
      toast.success('Redirecting to payment gateway...')
      // Razorpay integration would open here
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

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">My Wallet</h1>
        <p className="text-slate-400">Manage your funds and view transaction history</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available Balance', value: `₹${balance.toLocaleString('en-IN')}`, color: 'text-neon-blue', icon: Wallet, bg: 'bg-neon-blue/10' },
          { label: 'Bonus Balance', value: `₹${bonusBalance.toLocaleString('en-IN')}`, color: 'text-green-400', icon: Gift, bg: 'bg-green-400/10' },
          { label: 'Total Deposited', value: `₹${totalDeposited.toLocaleString('en-IN')}`, color: 'text-slate-300', icon: ArrowDownLeft, bg: 'bg-white/5' },
          { label: 'Total Won', value: `₹${totalWon.toLocaleString('en-IN')}`, color: 'text-yellow-400', icon: TrendingUp, bg: 'bg-yellow-400/10' },
        ].map(({ label, value, color, icon: Icon, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {loading ? <div className="h-6 w-20 bg-white/10 rounded animate-pulse mb-1" /> :
              <div className={`font-gaming font-bold text-xl ${color}`}>{value}</div>}
            <div className="text-slate-400 text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex rounded-xl overflow-hidden mb-6 bg-white/[0.04]">
            <button onClick={() => setActiveTab('deposit')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'deposit' ? 'bg-neon-blue/20 text-neon-blue' : 'text-slate-400'}`}>
              <Plus className="w-4 h-4 inline mr-1.5" />Deposit
            </button>
            <button onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'withdraw' ? 'bg-red-500/20 text-red-400' : 'text-slate-400'}`}>
              <Minus className="w-4 h-4 inline mr-1.5" />Withdraw
            </button>
          </div>

          {activeTab === 'deposit' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Amount (₹)</label>
                <input value={depositAmount} onChange={e => setDepositAmount(e.target.value)} type="number"
                  placeholder="Enter amount (min ₹10)" className="input-glass" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[100, 250, 500].map(amount => (
                  <button key={amount} onClick={() => setDepositAmount(String(amount))}
                    className="btn-ghost py-2 rounded-lg text-sm text-slate-300 hover:text-neon-blue">₹{amount}</button>
                ))}
              </div>
              <button onClick={handleDeposit} disabled={submitting}
                className="btn-neon w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60">
                <IndianRupee className="w-4 h-4" /> Add Money
              </button>
              <p className="text-xs text-slate-500 text-center">Secured via Razorpay • UPI • Net Banking</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">UPI ID</label>
                <input value={upiId} onChange={e => setUpiId(e.target.value)} type="text"
                  placeholder="yourname@upi" className="input-glass" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Amount (₹)</label>
                <input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} type="number"
                  placeholder="Min ₹100" className="input-glass" />
              </div>
              <div className="glass-card-light rounded-lg p-3 text-xs text-slate-400">
                Available: <span className="text-white font-semibold">₹{balance.toLocaleString('en-IN')}</span> • Processed within 24 hours
              </div>
              <button onClick={handleWithdraw} disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-60">
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-blue" /> Transaction History
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />)}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No transactions yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {transactions.map((tx: any) => {
                const Icon = TX_ICON[tx.type] || IndianRupee
                const isCredit = tx.amount > 0
                return (
                  <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                      <Icon className={`w-4 h-4 ${isCredit ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{tx.description}</div>
                      <div className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className={`font-gaming font-bold text-sm flex-shrink-0 ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                      {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
