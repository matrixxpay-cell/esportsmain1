'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Filter, Trophy, Users, Calendar, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { GAMES } from '@/constants/games'

const MOCK_TOURNAMENTS = [
  { id: '1', title: 'BGMI Pro League Season 4', game: 'BGMI', gameColor: '#FF6B2B', prizePool: '₹50,000', slots: 100, filled: 87, fee: 0, mode: 'Squad', status: 'ongoing', date: '2026-06-28' },
  { id: '2', title: 'Valorant India Masters', game: 'Valorant', gameColor: '#FF4655', prizePool: '₹1,00,000', slots: 32, filled: 28, fee: 499, mode: 'Squad', status: 'registration_open', date: '2026-06-29' },
  { id: '3', title: 'CS:GO India Championship', game: 'CS:GO', gameColor: '#F4A418', prizePool: '₹2,00,000', slots: 16, filled: 9, fee: 999, mode: 'Squad', status: 'registration_open', date: '2026-06-30' },
  { id: '4', title: 'Free Fire Knockout Cup', game: 'Free Fire', gameColor: '#FF4E16', prizePool: '₹25,000', slots: 200, filled: 195, fee: 0, mode: 'Squad', status: 'ongoing', date: '2026-06-27' },
  { id: '5', title: 'MLBB Sunday Clash', game: 'MLBB', gameColor: '#00E5FF', prizePool: '₹30,000', slots: 64, filled: 41, fee: 0, mode: 'Squad', status: 'registration_open', date: '2026-06-29' },
  { id: '6', title: 'Dota 2 Grand Prix', game: 'Dota 2', gameColor: '#A84500', prizePool: '₹75,000', slots: 16, filled: 7, fee: 499, mode: 'Squad', status: 'registration_open', date: '2026-07-01' },
  { id: '7', title: 'eFootball Pro Series', game: 'eFootball', gameColor: '#1B5E20', prizePool: '₹20,000', slots: 32, filled: 18, fee: 0, mode: 'Solo', status: 'upcoming', date: '2026-07-02' },
  { id: '8', title: 'BGMI Duo Showdown', game: 'BGMI', gameColor: '#FF6B2B', prizePool: '₹40,000', slots: 50, filled: 32, fee: 199, mode: 'Duo', status: 'registration_open', date: '2026-07-03' },
]

const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Live', registration_open: 'Open', upcoming: 'Upcoming',
  registration_closed: 'Closed', completed: 'Ended', cancelled: 'Cancelled',
}
const STATUS_COLORS: Record<string, string> = {
  ongoing: 'badge-live', registration_open: 'badge-free', upcoming: 'badge-upcoming',
  registration_closed: 'text-slate-400', completed: 'text-slate-500', cancelled: 'text-red-500',
}

export default function TournamentsPage() {
  const [search, setSearch] = useState('')
  const [gameFilter, setGameFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = MOCK_TOURNAMENTS.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (gameFilter !== 'all' && t.game.toLowerCase() !== gameFilter.toLowerCase()) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (typeFilter === 'free' && t.fee !== 0) return false
    if (typeFilter === 'paid' && t.fee === 0) return false
    return true
  })

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">Tournaments</h1>
        <p className="text-slate-400">Find and join tournaments across all games</p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tournaments..."
            className="input-glass pl-9 py-2 text-sm"
          />
        </div>

        <select value={gameFilter} onChange={e => setGameFilter(e.target.value)}
          className="input-glass py-2 text-sm min-w-[130px]">
          <option value="all">All Games</option>
          {GAMES.map(g => <option key={g.id} value={g.shortName}>{g.shortName}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input-glass py-2 text-sm min-w-[140px]">
          <option value="all">All Status</option>
          <option value="ongoing">Live Now</option>
          <option value="registration_open">Registration Open</option>
          <option value="upcoming">Upcoming</option>
        </select>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="input-glass py-2 text-sm min-w-[120px]">
          <option value="all">Free + Paid</option>
          <option value="free">Free Only</option>
          <option value="paid">Paid Only</option>
        </select>
      </div>

      <div className="mb-4 text-slate-400 text-sm">{filtered.length} tournaments found</div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link href={`/dashboard/tournaments/${t.id}`} className="tournament-card block p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold`}
                    style={{ color: t.gameColor, background: `${t.gameColor}20` }}>
                    {t.game}
                  </span>
                  <span className={`ml-2 text-xs ${STATUS_COLORS[t.status] || 'text-slate-400'}`}>
                    {STATUS_LABELS[t.status]}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-gaming font-bold text-neon-blue text-sm">{t.prizePool}</div>
                </div>
              </div>

              <h3 className="font-semibold text-white mb-3">{t.title}</h3>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.filled}/{t.slots}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <span>{t.mode}</span>
              </div>

              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(t.filled / t.slots) * 100}%`, background: `linear-gradient(90deg, ${t.gameColor}, ${t.gameColor}88)` }} />
              </div>

              <div className="flex items-center justify-between">
                {t.fee === 0 ? <span className="badge-free">FREE</span> : <span className="badge-paid">₹{t.fee} Entry</span>}
                <span className="flex items-center gap-1 text-neon-blue text-xs font-medium">
                  {t.status === 'ongoing' ? 'Watch' : 'Register'} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tournaments found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
