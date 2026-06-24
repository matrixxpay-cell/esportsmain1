'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, Trophy, Users, Calendar } from 'lucide-react'
import { GAMES } from '@/constants/games'

const MOCK_ADMIN_TOURNAMENTS = [
  { id: '1', title: 'BGMI Pro League Season 4', game: 'BGMI', gameColor: '#FF6B2B', prizePool: '₹50,000', slots: 100, filled: 87, fee: 0, status: 'ongoing', startDate: '2026-06-25' },
  { id: '2', title: 'Valorant India Masters', game: 'Valorant', gameColor: '#FF4655', prizePool: '₹1,00,000', slots: 32, filled: 28, fee: 499, status: 'registration_open', startDate: '2026-06-29' },
  { id: '3', title: 'CS:GO India Championship', game: 'CS:GO', gameColor: '#F4A418', prizePool: '₹2,00,000', slots: 16, filled: 9, fee: 999, status: 'upcoming', startDate: '2026-06-30' },
  { id: '4', title: 'Free Fire Knockout Cup', game: 'Free Fire', gameColor: '#FF4E16', prizePool: '₹25,000', slots: 200, filled: 200, fee: 0, status: 'completed', startDate: '2026-06-20' },
]

const STATUS_COLOR: Record<string, string> = {
  ongoing: 'text-red-400 bg-red-400/10', registration_open: 'text-green-400 bg-green-400/10',
  upcoming: 'text-yellow-400 bg-yellow-400/10', completed: 'text-slate-400 bg-slate-400/10',
  cancelled: 'text-red-500 bg-red-500/10',
}

export default function AdminTournamentsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [gameFilter, setGameFilter] = useState('all')

  const filtered = MOCK_ADMIN_TOURNAMENTS.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (gameFilter !== 'all' && t.game.toLowerCase() !== gameFilter.toLowerCase()) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl mb-1">Tournament Management</h1>
          <p className="text-slate-400 text-sm">Create and manage all platform tournaments</p>
        </div>
        <Link href="/admin/tournaments/create"
          className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
          <Plus className="w-4 h-4" /> Create Tournament
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'ongoing', 'registration_open', 'upcoming', 'completed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30' : 'glass-card text-slate-400 hover:text-white'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ color: t.gameColor, background: t.gameColor + '20' }}>{t.game}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                  {t.fee === 0 && <span className="badge-free">FREE</span>}
                  {t.fee > 0 && <span className="badge-paid">₹{t.fee}</span>}
                </div>
                <h3 className="font-semibold text-white mb-2">{t.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.filled}/{t.slots} players</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(t.startDate).toLocaleDateString('en-IN')}</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-neon-blue" /> {t.prizePool}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/admin/tournaments/${t.id}/view`}
                  className="p-2 rounded-xl glass-card hover:border-neon-blue/30 text-slate-400 hover:text-neon-blue transition-all">
                  <Eye className="w-4 h-4" />
                </Link>
                <Link href={`/admin/tournaments/${t.id}/edit`}
                  className="p-2 rounded-xl glass-card hover:border-yellow-400/30 text-slate-400 hover:text-yellow-400 transition-all">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button className="p-2 rounded-xl glass-card hover:border-red-400/30 text-slate-400 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(t.filled / t.slots) * 100}%`, background: t.gameColor }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
