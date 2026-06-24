'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Users, Clock, ChevronRight, Flame } from 'lucide-react'

const MOCK_LIVE = [
  {
    id: '1', title: 'BGMI Pro League Season 4', game: 'BGMI', gameColor: '#FF6B2B',
    prizePool: '₹50,000', totalSlots: 100, filledSlots: 87, entryFee: 0, mode: 'Squad',
    status: 'ongoing', endsIn: '2h 30m',
  },
  {
    id: '2', title: 'Valorant India Masters', game: 'Valorant', gameColor: '#FF4655',
    prizePool: '₹1,00,000', totalSlots: 32, filledSlots: 28, entryFee: 499, mode: 'Squad',
    status: 'ongoing', endsIn: '5h 10m',
  },
  {
    id: '3', title: 'Free Fire Knockout Cup', game: 'Free Fire', gameColor: '#FF4E16',
    prizePool: '₹25,000', totalSlots: 200, filledSlots: 195, entryFee: 0, mode: 'Squad',
    status: 'ongoing', endsIn: '1h 15m',
  },
]

export default function LiveTournamentsSection() {
  if (!MOCK_LIVE.length) return null

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
          {MOCK_LIVE.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link href={`/dashboard/tournaments/${t.id}`} className="tournament-card block p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-live">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        LIVE
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ color: t.gameColor, background: `${t.gameColor}20` }}>
                        {t.game}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mt-2">{t.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-neon-blue font-gaming font-bold">{t.prizePool}</div>
                    <div className="text-xs text-slate-400">Prize Pool</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.filledSlots}/{t.totalSlots} players</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Ends in {t.endsIn}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(t.filledSlots / t.totalSlots) * 100}%`,
                        background: `linear-gradient(90deg, ${t.gameColor}, ${t.gameColor}88)`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{t.mode}</span>
                    <span className="text-xs text-slate-600">•</span>
                    {t.entryFee === 0 ? (
                      <span className="badge-free">FREE</span>
                    ) : (
                      <span className="badge-paid">₹{t.entryFee}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-neon-blue font-medium">
                    Watch Live <ChevronRight className="w-3.5 h-3.5" />
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
