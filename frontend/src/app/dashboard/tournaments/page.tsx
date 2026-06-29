'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Trophy, Users, Calendar, ChevronRight, Gamepad2, Zap, Filter } from 'lucide-react'
import { GAMES } from '@/constants/games'
import { tournamentService } from '@/services/tournamentService'

const STATUS_LABELS: Record<string, string> = {
  ongoing: 'LIVE', registration_open: 'Open', upcoming: 'Upcoming',
  registration_closed: 'Closed', completed: 'Completed', cancelled: 'Cancelled',
}
const GAME_COLORS: Record<string, string> = {
  csgo: '#F4A418', 'mobile-legends': '#00E5FF', bgmi: '#FF6B2B',
  'free-fire': '#FF4E16', valorant: '#FF4655', dota2: '#A84500', efootball: '#1B5E20',
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gameFilter, setGameFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    tournamentService.getTournaments({ limit: 50 })
      .then(res => { setTournaments(res.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = tournaments.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (gameFilter !== 'all' && t.game !== gameFilter) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (typeFilter === 'free' && t.type !== 'free') return false
    if (typeFilter === 'paid' && t.type !== 'paid') return false
    return true
  })

  return (
    <div className="pb-20 lg:pb-0">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="gaming-heading flex items-center gap-2">
              <Trophy className="w-7 h-7 text-saffron" />
              Tournaments
            </h1>
            <p className="text-slate-400 text-sm mt-1">Find and join tournaments across all games</p>
          </div>
          <div className="text-sm text-slate-500">
            {!loading && <span className="font-gaming text-saffron text-lg font-bold">{filtered.length}</span>}{' '}
            tournaments available
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tournaments by name..."
            className="input-glass pl-12 py-3.5 text-sm rounded-2xl" />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 mr-2 text-xs text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filters
          </div>
          <select value={gameFilter} onChange={e => setGameFilter(e.target.value)}
            className="input-glass py-2 px-3 text-sm rounded-xl min-w-[130px] max-w-[160px]">
            <option value="all">All Games</option>
            {GAMES.map(g => <option key={g.id} value={g.id}>{g.shortName}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="input-glass py-2 px-3 text-sm rounded-xl min-w-[140px] max-w-[180px]">
            <option value="all">All Status</option>
            <option value="ongoing">🔴 Live Now</option>
            <option value="registration_open">🟢 Registration Open</option>
            <option value="upcoming">🟡 Upcoming</option>
            <option value="completed">✅ Completed</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="input-glass py-2 px-3 text-sm rounded-xl min-w-[120px] max-w-[150px]">
            <option value="all">Free + Paid</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>
        </div>
      </div>

      {/* Tournament Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="tournament-card-v2 p-5 h-52">
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 bg-white/[0.06] rounded-md animate-pulse" />
                <div className="h-6 w-12 bg-white/[0.06] rounded-md animate-pulse" />
              </div>
              <div className="h-5 w-3/4 bg-white/[0.06] rounded animate-pulse mb-3" />
              <div className="h-4 w-1/2 bg-white/[0.04] rounded animate-pulse mb-4" />
              <div className="h-1.5 bg-white/[0.04] rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Trophy className="w-8 h-8 text-saffron/40" />
          </div>
          <p className="text-slate-400 font-medium mb-1">No tournaments found</p>
          <p className="text-slate-500 text-xs">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t, i) => {
            const color = GAME_COLORS[t.game] || '#FF6B2B'
            const filled = t.filledSlots ?? t.participants?.length ?? 0
            const game = GAMES.find(g => g.id === t.game)
            const fillPercent = Math.min(100, (filled / t.maxSlots) * 100)
            const isLive = t.status === 'ongoing'
            const isCompleted = t.status === 'completed'

            return (
              <motion.div key={t._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}>
                <Link href={`/dashboard/tournaments/${t._id}`}
                  className={`tournament-card-v2 block group ${isCompleted ? 'opacity-75 hover:opacity-100' : ''}`}>
                  {/* Top accent bar */}
                  <div className="h-1" style={{ background: isCompleted ? 'linear-gradient(90deg, #64748b, #64748b66)' : `linear-gradient(90deg, ${color}, ${color}66)` }} />

                  <div className="p-5">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
                        {game?.shortName ?? t.game}
                      </span>
                      {isLive ? (
                        <span className="badge-live flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          LIVE
                        </span>
                      ) : isCompleted ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-400/10 text-slate-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{STATUS_LABELS[t.status]}</span>
                      )}
                      <span className="ml-auto font-gaming font-bold text-sm" style={{ color }}>
                        ₹{t.prizePool?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-white text-[15px] mb-3 group-hover:text-saffron-light transition-colors line-clamp-1">
                      {t.title}
                    </h3>

                    {/* Info row */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-slate-300 font-medium">{filled}</span>/{t.maxSlots}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span className="capitalize">{t.gameMode}</span>
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {t.type === 'free' ? (
                        <span className="badge-free">FREE ENTRY</span>
                      ) : (
                        <span className="badge-paid">₹{t.entryFee} Entry</span>
                      )}
                      <span className="flex items-center gap-1 text-saffron text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCompleted ? 'Results' : isLive ? 'View' : 'Register'} <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
