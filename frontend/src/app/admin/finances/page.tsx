'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, TrendingUp, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

export default function AdminFinancesPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const load = async () => {
    setLoading(true)
    try {
      const [w, a] = await Promise.all([adminService.getPendingWithdrawals(), adminService.getAnalytics()])
      setWithdrawals(w || [])
      setAnalytics(a)
    } catch { toast.error('Failed to load data') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (id: string) => {
    try {
      await adminService.approveWithdrawal(id)
      toast.success('Withdrawal approved')
      setWithdrawals(w => w.filter(x => x._id !== id))
    } catch { toast.error('Failed to approve') }
  }

  const reject = async (id: string) => {
    try {
      await adminService.rejectWithdrawal(id)
      toast.success('Rejected & refunded')
      setWithdrawals(w => w.filter(x => x._id !== id))
    } catch { toast.error('Failed to reject') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Finances</h1>
          <p className="text-slate-400 text-sm">Revenue and withdrawal management</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString('en-IN')}` : '₹0', sub: 'All entry fees collected', icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Pending Payouts', value: `${withdrawals.length} requests`, sub: 'Awaiting approval', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Total Tournaments', value: analytics?.totalTournaments ?? '—', sub: 'All time', icon: TrendingUp, color: 'text-saffron', bg: 'bg-orange-400/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`font-rajdhani font-bold text-xl ${s.color}`}>{loading ? '...' : s.value}</div>
            <div className="text-white text-sm font-medium mt-1">{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">Withdrawal Requests</h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-400/15 text-yellow-400">{withdrawals.length} pending</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No pending withdrawals</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-white/5">
                  <th className="text-left pb-3 font-medium">User</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Details</th>
                  <th className="text-left pb-3 font-medium">Requested</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {withdrawals.map(w => (
                  <tr key={w._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 text-white font-medium">{w.userId?.username ?? 'Unknown'}</td>
                    <td className="py-3 text-yellow-400 font-rajdhani font-bold">₹{Math.abs(w.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-400 text-xs">{w.upiId ?? w.description ?? '—'}</td>
                    <td className="py-3 text-slate-400">{new Date(w.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => approve(w._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-400/15 text-green-400 hover:bg-green-400/25 transition-colors">
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => reject(w._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors">
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
