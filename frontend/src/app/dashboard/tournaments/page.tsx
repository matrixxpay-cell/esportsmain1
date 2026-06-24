'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Trophy, Users, Calendar, ChevronRight } from 'lucide-react'
import { GAMES } from '@/constants/games'
import { tournamentService } from '@/services/tournamentService'

const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Live', registration_open: 'Open', upcoming: 'Upcoming',
  registration_closed: 'Closed', completed: 'Ended', cancelled: 'Cancelled',
}
const STATUS_COLORS: Record<string, string> = {
  ongoing: 'badge-live', registration_open: 'badge-free', upcoming: 'badge-upcoming',
  registration_closed: 'text-slate-400', completed: 'text-slate-500', cancelled: 'text-red-500',
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
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">Tournaments</h1>
        <p className="text-slate-400">Find and join tournaments across all games</p>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tournaments..." className="input-glass pl-9 py-2 text-sm" />
        </div>
        <select value={gameFilter} onChange={e => setGameFilter(e.target.value)} className="input-glass py-2 text-sm min-w-[130px]">
          <option value="all">All Games</option>
          {GAMES.map(g => <option key={g.id} value={g.id}>{g.shortName}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-glass py-2 text-sm min-w-[140px]">
          <option value="all">All Status</option>
          <option value="ongoing">Live Now</option>
          <option value="registration_open">Registration Open</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-glass py-2 text-sm min-w-[120px]">
          <option value="all">Free + Paid</option>
          <option value="free">Free Only</option>
          <option value="paid">Paid Only</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-48 animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 text-slate-400 text-sm">{filtered.length} tournaments found</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((t, i) => {
              const color = GAME_COLORS[t.game] || '#00D9FF'
              const filled = t.filledSlots ?? t.participants?.length ?? 0
              const game = GAMES.find(g => g.id === t.game)
              return (
                <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={`/dashboard/tournaments/${t._id}`} className="tournament-card block p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ color, background: `${color}20` }}>
                          {game?.shortName ?? t.game}
                        </span>
                        <span className={`ml-2 text-xs ${STATUS_COLORS[t.status] || 'text-slate-400'}`}>
                          {STATUS_LABELS[t.status]}
                        </span>
                      </div>
                      <div className="font-gaming font-bold text-neon-blue text-sm">
                        ₹{t.prizePool?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white mb-3">{t.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {filled}/{t.maxSlots}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                        {new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="capitalize">{t.gameMode}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (filled / t.maxSlots) * 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      {t.type === 'free' ? <span className="badge-free">FREE</span> : <span className="badge-paid">₹{t.entryFee} Entry</span>}
                      <span className="flex items-center gap-1 text-neon-blue text-xs font-medium">
                        {t.status === 'ongoing' ? 'Watch' : 'Register'} <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tournaments found matching your filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
