'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowDownLeft, ArrowUpRight, IndianRupee, Plus, Minus, TrendingUp, Gift, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'prize', desc: 'Tournament Prize - BGMI Pro League', amount: 25000, status: 'completed', date: '2026-06-23' },
  { id: '2', type: 'deposit', desc: 'Wallet Deposit via UPI', amount: 500, status: 'completed', date: '2026-06-22' },
  { id: '3', type: 'entry_fee', desc: 'Entry Fee - Valorant India Masters', amount: -499, status: 'completed', date: '2026-06-21' },
  { id: '4', type: 'withdrawal', desc: 'Withdrawal to Bank Account', amount: -10000, status: 'completed', date: '2026-06-20' },
  { id: '5', type: 'referral', desc: 'Referral Bonus - Friend Joined', amount: 100, status: 'completed', date: '2026-06-19' },
  { id: '6', type: 'bonus', desc: 'Welcome Bonus', amount: 50, status: 'completed', date: '2026-06-18' },
]

const TX_ICON: Record<string, typeof IndianRupee> = {
  prize: TrendingUp, deposit: ArrowDownLeft, entry_fee: ArrowUpRight,
  withdrawal: ArrowUpRight, referral: Gift, bonus: Gift,
}

export default function WalletPage() {
  const { user } = useAuthStore()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [upiId, setUpiId] = useState('')
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')

  const balance = user?.wallet?.balance ?? 14651
  const bonusBalance = user?.wallet?.bonusBalance ?? 150
  const totalDeposited = user?.wallet?.totalDeposited ?? 500
  const totalWon = user?.wallet?.totalWon ?? 25000

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount < 10) { toast.error('Minimum deposit is ₹10'); return }
    toast.success('Redirecting to payment gateway...')
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < 100) { toast.error('Minimum withdrawal is ₹100'); return }
    if (!upiId || !upiId.includes('@')) { toast.error('Enter a valid UPI ID'); return }
    if (amount > balance) { toast.error('Insufficient balance'); return }
    toast.success('Withdrawal request submitted!')
  }

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">My Wallet</h1>
        <p className="text-slate-400">Manage your funds and view transaction history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available Balance', value: `₹${balance.toLocaleString('en-IN')}`, color: 'text-neon-blue', icon: Wallet, bg: 'bg-neon-blue/10' },
          { label: 'Bonus Balance', value: `₹${bonusBalance}`, color: 'text-green-400', icon: Gift, bg: 'bg-green-400/10' },
          { label: 'Total Deposited', value: `₹${totalDeposited.toLocaleString('en-IN')}`, color: 'text-slate-300', icon: ArrowDownLeft, bg: 'bg-white/5' },
          { label: 'Total Won', value: `₹${totalWon.toLocaleString('en-IN')}`, color: 'text-yellow-400', icon: TrendingUp, bg: 'bg-yellow-400/10' },
        ].map(({ label, value, color, icon: Icon, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`font-gaming font-bold text-xl ${color}`}>{value}</div>
            <div className="text-slate-400 text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Deposit / Withdraw */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex rounded-xl overflow-hidden mb-6 bg-white/[0.04]">
            <button onClick={() => setActiveTab('deposit')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'deposit' ? 'bg-neon-blue/20 text-neon-blue' : 'text-slate-400'
              }`}>
              <Plus className="w-4 h-4 inline mr-1.5" />Deposit
            </button>
            <button onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'withdraw' ? 'bg-red-500/20 text-red-400' : 'text-slate-400'
              }`}>
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
                    className="btn-ghost py-2 rounded-lg text-sm text-slate-300 hover:text-neon-blue">
                    ₹{amount}
                  </button>
                ))}
              </div>
              <button onClick={handleDeposit}
                className="btn-neon w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
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
                Available: <span className="text-white font-semibold">₹{balance.toLocaleString('en-IN')}</span>
                {' '}• Processed within 24 hours
              </div>
              <button onClick={handleWithdraw}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all">
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-blue" /> Transaction History
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {MOCK_TRANSACTIONS.map((tx) => {
              const Icon = TX_ICON[tx.type] || IndianRupee
              const isCredit = tx.amount > 0
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                    <Icon className={`w-4 h-4 ${isCredit ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{tx.desc}</div>
                    <div className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className={`font-gaming font-bold text-sm flex-shrink-0 ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                    {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
