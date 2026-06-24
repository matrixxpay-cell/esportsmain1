'use client'

import { motion } from 'framer-motion'
import { Users, Trophy, IndianRupee, TrendingUp, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

const STATS = [
  { label: 'Total Users', value: '50,842', change: '+1,240 this week', icon: Users, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
  { label: 'Active Tournaments', value: '14', change: '3 ending today', icon: Trophy, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
  { label: 'Revenue (This Month)', value: '₹4,82,000', change: '+18% vs last month', icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10' },
  { label: 'Total Prize Distributed', value: '₹1.2 Cr', change: 'All time', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
]

const RECENT_TOURNAMENTS = [
  { title: 'BGMI Pro League S4', game: 'BGMI', status: 'ongoing', participants: 87, prize: '₹50,000' },
  { title: 'Valorant India Masters', game: 'Valorant', status: 'registration_open', participants: 28, prize: '₹1,00,000' },
  { title: 'CS:GO Championship', game: 'CS:GO', status: 'upcoming', participants: 9, prize: '₹2,00,000' },
]

const PENDING_WITHDRAWALS = [
  { username: 'ProKillerXD', amount: '₹15,000', upi: 'prox@okaxis', requestedAt: '2 hours ago' },
  { username: 'ValorantGod', amount: '₹8,500', upi: 'valo@paytm', requestedAt: '4 hours ago' },
  { username: 'HeadshotHero', amount: '₹22,000', upi: 'hero@upi', requestedAt: '6 hours ago' },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Platform overview and quick actions</p>
        </div>
        <Link href="/admin/tournaments/create"
          className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
          <Plus className="w-4 h-4" /> New Tournament
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`font-gaming font-bold text-xl ${stat.color}`}>{stat.value}</div>
            <div className="text-white text-sm font-medium mt-1">{stat.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Tournaments */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Active Tournaments</h2>
            <Link href="/admin/tournaments" className="text-neon-blue text-xs hover:text-neon-cyan">Manage All</Link>
          </div>
          <div className="space-y-3">
            {RECENT_TOURNAMENTS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.game} • {t.participants} participants</div>
                </div>
                <div className="text-right">
                  <div className="text-neon-blue font-gaming text-xs">{t.prize}</div>
                  <span className={`text-xs mt-0.5 block ${
                    t.status === 'ongoing' ? 'text-red-400' : t.status === 'registration_open' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {t.status === 'ongoing' ? '🔴 Live' : t.status === 'registration_open' ? '🟢 Open' : '🟡 Soon'}
                  </span>
                </div>
                <Link href={`/admin/tournaments/${i}`}
                  className="btn-ghost px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white ml-2">
                  Manage
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" /> Pending Withdrawals
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">{PENDING_WITHDRAWALS.length}</span>
          </div>
          <div className="space-y-3">
            {PENDING_WITHDRAWALS.map((w, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm text-white">{w.username}</span>
                  <span className="font-gaming font-bold text-sm text-yellow-400">{w.amount}</span>
                </div>
                <div className="text-xs text-slate-400 mb-2">{w.upi} • {w.requestedAt}</div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-green-400/15 text-green-400 hover:bg-green-400/25 transition-colors">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors">
                    <AlertTriangle className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/finances" className="block text-center text-neon-blue text-xs mt-4 hover:text-neon-cyan">
            View All Withdrawals
          </Link>
        </div>
      </div>
    </div>
  )
}
