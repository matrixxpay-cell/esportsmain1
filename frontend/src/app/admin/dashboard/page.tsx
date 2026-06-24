'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, IndianRupee, TrendingUp, Plus, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [tournaments, setTournaments] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [a, t, w] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getTournaments(),
        adminService.getPendingWithdrawals(),
      ])
      setAnalytics(a)
      setTournaments((t || []).filter((x: any) => ['ongoing', 'registration_open', 'upcoming'].includes(x.status)).slice(0, 5))
      setWithdrawals(w || [])
    } catch { /* silently show stale */ }
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
      toast.success('Withdrawal rejected & refunded')
      setWithdrawals(w => w.filter(x => x._id !== id))
    } catch { toast.error('Failed to reject') }
  }

  const STATS = [
    { label: 'Total Users', value: analytics?.totalUsers?.toLocaleString('en-IN') ?? '—', sub: 'Registered players', icon: Users, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
    { label: 'Active Tournaments', value: analytics?.totalTournaments ?? '—', sub: 'All time', icon: Trophy, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
    { label: 'Revenue (Entry Fees)', value: analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString('en-IN')}` : '₹0', sub: 'All time collected', icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Pending Withdrawals', value: withdrawals.length, sub: 'Awaiting approval', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Platform overview and quick actions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/admin/tournaments/create"
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
            <Plus className="w-4 h-4" /> New Tournament
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`font-rajdhani font-bold text-xl ${stat.color}`}>{loading ? '...' : stat.value}</div>
            <div className="text-white text-sm font-medium mt-1">{stat.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Active Tournaments</h2>
            <Link href="/admin/tournaments" className="text-saffron text-xs hover:text-gold">Manage All</Link>
          </div>
          {loading ? <div className="text-slate-500 text-sm py-4 text-center">Loading...</div> : tournaments.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">No active tournaments</div>
          ) : (
            <div className="space-y-3">
              {tournaments.map((t) => (
                <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{t.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.game} • {t.registrations?.length ?? 0} participants</div>
                  </div>
                  <div className="text-right">
                    <div className="text-saffron font-rajdhani text-xs">₹{t.prizePool?.toLocaleString('en-IN')}</div>
                    <span className={`text-xs mt-0.5 block ${t.status === 'ongoing' ? 'text-red-400' : t.status === 'registration_open' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {t.status === 'ongoing' ? '🔴 Live' : t.status === 'registration_open' ? '🟢 Open' : '🟡 Soon'}
                    </span>
                  </div>
                  <Link href={`/admin/tournaments/${t._id}/view`}
                    className="btn-ghost px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white ml-2">
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" /> Pending Withdrawals
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">{withdrawals.length}</span>
          </div>
          {loading ? <div className="text-slate-500 text-sm py-4 text-center">Loading...</div> : withdrawals.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">No pending withdrawals</div>
          ) : (
            <div className="space-y-3">
              {withdrawals.slice(0, 3).map((w) => (
                <div key={w._id} className="p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm text-white">{w.userId?.username ?? 'User'}</span>
                    <span className="font-rajdhani font-bold text-sm text-yellow-400">₹{Math.abs(w.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{w.upiId ?? w.description} • {new Date(w.createdAt).toLocaleDateString('en-IN')}</div>
                  <div className="flex gap-2">
                    <button onClick={() => approve(w._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-green-400/15 text-green-400 hover:bg-green-400/25 transition-colors">
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => reject(w._id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors">
                      <AlertTriangle className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/admin/finances" className="block text-center text-saffron text-xs mt-4 hover:text-gold">
            View All Withdrawals
          </Link>
        </div>
      </div>
    </div>
  )
}
