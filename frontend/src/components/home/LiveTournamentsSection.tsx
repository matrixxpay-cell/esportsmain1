'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Users, Clock, ChevronRight, Flame } from 'lucide-react'
import { tournamentService } from '@/services/tournamentService'
import { GAMES } from '@/constants/games'

const GAME_COLORS: Record<string, string> = {
  csgo: '#F4A418', 'mobile-legends': '#00E5FF', bgmi: '#FF6B2B',
  'free-fire': '#FF4E16', valorant: '#FF4655', dota2: '#A84500', efootball: '#1B5E20',
}

export default function LiveTournamentsSection() {
  const [tournaments, setTournaments] = useState<any[]>([])

  useEffect(() => {
    tournamentService.getTournaments({ status: 'ongoing', limit: 3 })
      .then(res => setTournaments(res.data || []))
      .catch(() => {})
  }, [])

  if (!tournaments.length) return null

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-red-400" />
              <span className="badge-live">LIVE NOW</span>
            </div>
            <h2 className="gaming-heading text-2xl sm:text-3xl">Live Tournaments</h2>
          </div>
          <Link href="/dashboard/tournaments?status=ongoing"
            className="flex items-center gap-1 text-neon-blue text-sm hover:gap-2 transition-all duration-200">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t, i) => {
            const color = GAME_COLORS[t.game] || '#00D9FF'
            const game = GAMES.find(g => g.id === t.game)
            const filled = t.filledSlots ?? t.participants?.length ?? 0
            return (
              <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Link href={`/dashboard/tournaments/${t._id}`} className="tournament-card block p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-live">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse inline-block mr-1" />LIVE
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ color, background: `${color}20` }}>{game?.shortName ?? t.game}</span>
                      </div>
                      <h3 className="font-semibold text-white mt-2">{t.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-neon-blue font-gaming font-bold">₹{t.prizePool?.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-slate-400">Prize Pool</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {filled}/{t.maxSlots} players</span>
                      <span className="flex items-center gap-1 capitalize"><Clock className="w-3.5 h-3.5" /> {t.gameMode}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100,(filled/t.maxSlots)*100)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {t.type === 'free' ? <span className="badge-free">FREE</span> : <span className="badge-paid">₹{t.entryFee}</span>}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-neon-blue font-medium">
                      Watch Live <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
