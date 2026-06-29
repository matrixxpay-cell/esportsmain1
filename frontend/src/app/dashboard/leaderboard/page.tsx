'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Crown, Medal, BarChart2 } from 'lucide-react'
import { GAMES } from '@/constants/games'
import { tournamentService } from '@/services/tournamentService'

export default function LeaderboardPage() {
  const [gameFilter, setGameFilter] = useState('all')
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tournamentService.getLeaderboard()
      .then(data => { setLeaders(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = gameFilter === 'all' ? leaders
    : leaders.filter((p: any) => p.game?.toLowerCase().includes(gameFilter.toLowerCase()))

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  return (
    <div className="pb-20 lg:pb-0">
      <div className="page-header">
        <h1 className="gaming-heading flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-saffron" />
          Leaderboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">India&apos;s top esports players ranked by performance</p>
      </div>

      {/* Podium */}
      {!loading && top3.length >= 3 && (
        <div className="flex items-end justify-center gap-2 sm:gap-5 mb-10 px-2 sm:px-4">
          {[top3[1], top3[0], top3[2]].map((player, i) => {
            const heights = ['h-28 sm:h-32', 'h-36 sm:h-40', 'h-24 sm:h-28']
            const badges = ['🥈', '🥇', '🥉']
            const glows = [
              'rgba(192,192,192,0.08)',
              'rgba(255,215,0,0.1)',
              'rgba(205,127,50,0.08)',
            ]
            const borderColors = [
              'rgba(192,192,192,0.2)',
              'rgba(255,215,0,0.25)',
              'rgba(205,127,50,0.15)',
            ]
            return (
              <motion.div key={player.username || i}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className={`rounded-t-2xl ${heights[i]} w-[30%] max-w-[140px] flex flex-col items-center justify-end pb-3 sm:pb-4 relative`}
                style={{
                  background: glows[i],
                  border: `1px solid ${borderColors[i]}`,
                  borderBottom: 'none',
                }}>
                <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{badges[i]}</span>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold text-white mb-1.5 sm:mb-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF6B2B, #F59E0B)' }}>
                  {player.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="font-gaming font-bold text-[10px] sm:text-xs text-white text-center truncate px-1 sm:px-2 w-full">
                  {player.username}
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs mt-0.5 font-gaming">
                  {(player.points ?? 0).toLocaleString('en-IN')} pts
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Game Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button onClick={() => setGameFilter('all')}
          className={`filter-chip ${gameFilter === 'all' ? 'active' : ''}`}>
          All Games
        </button>
        {GAMES.map(g => (
          <button key={g.id} onClick={() => setGameFilter(g.shortName)}
            className={`filter-chip ${gameFilter === g.shortName ? 'active' : ''}`}
            style={gameFilter === g.shortName ? { color: g.color, borderColor: g.color + '40', background: g.color + '10' } : {}}>
            {g.shortName}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="stat-card-v2 !p-0 overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_5rem_5rem] md:grid-cols-[2rem_1fr_5rem_5rem_4rem_5rem] px-3 sm:px-5 py-3 text-[11px] text-slate-500 uppercase tracking-wider border-b border-white/[0.06] font-medium gap-x-2">
          <div>#</div>
          <div>Player</div>
          <div className="hidden sm:block">Game</div>
          <div>Points</div>
          <div className="hidden md:block text-center">Wins</div>
          <div className="text-right hidden sm:block">Earnings</div>
        </div>

        {loading ? (
          <div className="space-y-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_5rem_5rem] md:grid-cols-[2rem_1fr_5rem_5rem_4rem_5rem] px-3 sm:px-5 py-4 items-center border-b border-white/[0.03] gap-x-2">
                <div><div className="w-5 h-5 bg-white/[0.04] rounded animate-pulse" /></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/[0.04] rounded-lg animate-pulse" />
                  <div className="w-20 h-4 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="hidden sm:block"><div className="w-12 h-4 bg-white/[0.04] rounded animate-pulse" /></div>
                <div><div className="w-14 h-4 bg-white/[0.04] rounded animate-pulse" /></div>
                <div className="hidden md:block"><div className="w-8 h-4 bg-white/[0.04] rounded animate-pulse mx-auto" /></div>
                <div className="hidden sm:block"><div className="w-12 h-4 bg-white/[0.04] rounded animate-pulse ml-auto" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state !py-16">
            <div className="empty-icon">
              <Trophy className="w-8 h-8 text-saffron/40" />
            </div>
            <p>No players on the leaderboard yet</p>
          </div>
        ) : (
          rest.map((player, i) => (
            <motion.div key={player.userId || player.username || i}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_5rem_5rem] md:grid-cols-[2rem_1fr_5rem_5rem_4rem_5rem] px-3 sm:px-5 py-3 items-center border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors gap-x-2">
              <div>
                <span className="text-slate-600 text-sm font-gaming">{i + 4}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(255,107,43,0.3), rgba(245,158,11,0.3))' }}>
                  {player.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-white font-medium truncate">{player.username}</div>
                </div>
              </div>
              <div className="hidden sm:block text-xs text-slate-500">{player.game || '-'}</div>
              <div>
                <span className="font-gaming font-bold text-saffron text-xs sm:text-sm">{(player.points ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="hidden md:block text-slate-400 text-sm text-center">{player.tournamentsWon ?? 0}</div>
              <div className="text-right text-emerald-400 text-sm font-medium hidden sm:block">
                ₹{((player.totalEarnings ?? 0) / 100).toFixed(0)}K
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
