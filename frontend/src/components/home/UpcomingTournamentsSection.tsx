'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Calendar, ChevronRight, Clock } from 'lucide-react'
import { tournamentService } from '@/services/tournamentService'
import { GAMES } from '@/constants/games'

const GAME_COLORS: Record<string, string> = {
  csgo: '#F4A418', 'mobile-legends': '#00E5FF', bgmi: '#FF6B2B',
  'free-fire': '#FF4E16', valorant: '#FF4655', dota2: '#A84500', efootball: '#1B5E20',
}

export default function UpcomingTournamentsSection() {
  const [tournaments, setTournaments] = useState<any[]>([])

  useEffect(() => {
    tournamentService.getTournaments({ status: 'registration_open', limit: 6 })
      .then(res => setTournaments(res.data || []))
      .catch(() => {})
  }, [])

  if (!tournaments.length) return null

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-saffron text-sm font-semibold uppercase tracking-widest mb-2 block">Register Now</span>
            <h2 className="gaming-heading text-2xl sm:text-3xl">Open Tournaments</h2>
          </div>
          <Link href="/dashboard/tournaments"
            className="flex items-center gap-1 text-neon-blue text-sm hover:gap-2 transition-all duration-200">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t, i) => {
            const color = GAME_COLORS[t.game] || '#00D9FF'
            const game = GAMES.find(g => g.id === t.game)
            const filled = t.filledSlots ?? t.participants?.length ?? 0
            const deadline = new Date(t.registrationDeadline)
            const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (
              <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Link href={`/dashboard/tournaments/${t._id}`} className="tournament-card block p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ color, background: `${color}20` }}>{game?.shortName ?? t.game}</span>
                    <div className="text-neon-blue font-gaming font-bold text-sm">₹{t.prizePool?.toLocaleString('en-IN')}</div>
                  </div>
                  <h3 className="font-semibold text-white mb-3">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {filled}/{t.maxSlots}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                      {new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    {daysLeft > 0 && <span className="flex items-center gap-1 text-yellow-400"><Clock className="w-3.5 h-3.5" />{daysLeft}d left</span>}
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.min(100,(filled/t.maxSlots)*100)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    {t.type === 'free' ? <span className="badge-free">FREE</span> : <span className="badge-paid">₹{t.entryFee} Entry</span>}
                    <span className="flex items-center gap-1 text-neon-blue text-xs font-medium">
                      Register <ChevronRight className="w-3.5 h-3.5" />
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
