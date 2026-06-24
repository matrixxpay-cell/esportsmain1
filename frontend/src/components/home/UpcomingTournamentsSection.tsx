'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, ChevronRight, Clock } from 'lucide-react'

const MOCK_UPCOMING = [
  {
    id: '4', title: 'CS:GO India Championship', game: 'CS:GO', gameColor: '#F4A418',
    prizePool: '₹2,00,000', totalSlots: 16, filledSlots: 9, entryFee: 999, mode: 'Squad',
    startDate: '2026-06-28', registrationDeadline: '2026-06-27',
  },
  {
    id: '5', title: 'Mobile Legends Sunday Clash', game: 'MLBB', gameColor: '#00E5FF',
    prizePool: '₹30,000', totalSlots: 64, filledSlots: 41, entryFee: 0, mode: 'Squad',
    startDate: '2026-06-29', registrationDeadline: '2026-06-28',
  },
  {
    id: '6', title: 'Dota 2 Grand Prix', game: 'Dota 2', gameColor: '#A84500',
    prizePool: '₹75,000', totalSlots: 16, filledSlots: 7, entryFee: 499, mode: 'Squad',
    startDate: '2026-06-30', registrationDeadline: '2026-06-29',
  },
  {
    id: '7', title: 'eFootball Pro Series', game: 'eFootball', gameColor: '#1B5E20',
    prizePool: '₹20,000', totalSlots: 32, filledSlots: 18, entryFee: 0, mode: 'Solo',
    startDate: '2026-07-01', registrationDeadline: '2026-06-30',
  },
  {
    id: '8', title: 'BGMI Duo Showdown', game: 'BGMI', gameColor: '#FF6B2B',
    prizePool: '₹40,000', totalSlots: 50, filledSlots: 32, entryFee: 199, mode: 'Duo',
    startDate: '2026-07-02', registrationDeadline: '2026-07-01',
  },
  {
    id: '9', title: 'Free Fire Solo Cup', game: 'Free Fire', gameColor: '#FF4E16',
    prizePool: '₹15,000', totalSlots: 100, filledSlots: 67, entryFee: 0, mode: 'Solo',
    startDate: '2026-07-03', registrationDeadline: '2026-07-02',
  },
]

export default function UpcomingTournamentsSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-neon-blue text-sm font-semibold uppercase tracking-widest mb-2 block">Registration Open</span>
            <h2 className="gaming-heading text-2xl sm:text-3xl">Upcoming Tournaments</h2>
          </div>
          <Link href="/dashboard/tournaments?status=upcoming"
            className="flex items-center gap-1 text-neon-blue text-sm hover:gap-2 transition-all duration-200">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_UPCOMING.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={`/dashboard/tournaments/${t.id}`} className="tournament-card block p-5">
                {/* Game tag + prize */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ color: t.gameColor, background: `${t.gameColor}20`, border: `1px solid ${t.gameColor}40` }}>
                    {t.game}
                  </span>
                  <div className="text-right">
                    <div className="font-gaming font-bold text-neon-blue text-sm">{t.prizePool}</div>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-4 text-base leading-tight">{t.title}</h3>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="glass-card-light rounded-lg p-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs text-white font-medium">{t.filledSlots}/{t.totalSlots}</div>
                    <div className="text-xs text-slate-500">Players</div>
                  </div>
                  <div className="glass-card-light rounded-lg p-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs text-white font-medium">{new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-xs text-slate-500">Start</div>
                  </div>
                  <div className="glass-card-light rounded-lg p-2">
                    <Trophy className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs text-white font-medium">{t.mode}</div>
                    <div className="text-xs text-slate-500">Mode</div>
                  </div>
                </div>

                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                    style={{ width: `${(t.filledSlots / t.totalSlots) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.entryFee === 0
                      ? <span className="badge-free">FREE</span>
                      : <span className="badge-paid">₹{t.entryFee} Entry</span>
                    }
                  </div>
                  <span className="flex items-center gap-1 text-neon-blue text-sm font-medium">
                    Register <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
