'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Trophy, IndianRupee, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [a, t] = await Promise.all([adminService.getAnalytics(), adminService.getTournaments()])
      setAnalytics(a)
      setTournaments(t || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const gameMap: Record<string, { count: number; prize: number; players: number }> = {}
  tournaments.forEach(t => {
    if (!gameMap[t.game]) gameMap[t.game] = { count: 0, prize: 0, players: 0 }
    gameMap[t.game].count++
    gameMap[t.game].prize += t.prizePool ?? 0
    gameMap[t.game].players += t.registrations?.length ?? 0
  })
  const gameStats = Object.entries(gameMap).sort((a, b) => b[1].count - a[1].count)

  const statusMap: Record<string, number> = {}
  tournaments.forEach(t => { statusMap[t.status] = (statusMap[t.status] ?? 0) + 1 })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Analytics</h1>
          <p className="text-slate-400 text-sm">Real platform stats</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: analytics?.totalUsers?.toLocaleString('en-IN') ?? '—', icon: Users, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
          { label: 'Total Tournaments', value: analytics?.totalTournaments ?? '—', icon: Trophy, color: 'text-saffron', bg: 'bg-orange-400/10' },
          { label: 'Total Revenue', value: analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString('en-IN')}` : '₹0', icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Games Supported', value: gameStats.length, icon: TrendingUp, color: 'text-neon-purple', bg: 'bg-purple-400/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`font-rajdhani font-bold text-xl ${s.color}`}>{loading ? '...' : s.value}</div>
            <div className="text-white text-sm font-medium mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Tournaments by Status</h2>
          <div className="space-y-3">
            {Object.entries(statusMap).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-slate-400 text-sm capitalize w-36">{status.replace('_', ' ')}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-saffron rounded-full" style={{ width: `${(count / tournaments.length) * 100}%` }} />
                </div>
                <span className="text-white text-sm font-rajdhani font-bold w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Performance by Game</h2>
          {loading ? <div className="text-slate-500 text-sm text-center py-6">Loading...</div> : (
            <div className="space-y-3">
              {gameStats.map(([game, data]) => (
                <div key={game} className="p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{game}</span>
                    <span className="text-saffron font-rajdhani font-bold text-sm">₹{data.prize.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-slate-400">{data.count} tournaments • {data.players} players</div>
                </div>
              ))}
              {gameStats.length === 0 && <div className="text-slate-500 text-sm text-center py-6">No tournament data yet</div>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
