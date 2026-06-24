'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, IndianRupee } from 'lucide-react'

const WINNERS = [
  { rank: 1, username: 'ProKillerXD', game: 'BGMI', prize: '₹25,000', avatar: null, tournament: 'BGMI Pro League S4', state: 'Maharashtra' },
  { rank: 2, username: 'ValorantGod_IN', game: 'Valorant', prize: '₹15,000', avatar: null, tournament: 'India Masters Cup', state: 'Karnataka' },
  { rank: 3, username: 'HeadshotHero', game: 'CS:GO', prize: '₹10,000', avatar: null, tournament: 'CS:GO Championship', state: 'Delhi' },
  { rank: 1, username: 'BooyahKing99', game: 'Free Fire', prize: '₹8,000', avatar: null, tournament: 'FF Knockout Cup', state: 'Tamil Nadu' },
  { rank: 2, username: 'MLBBMaster', game: 'MLBB', prize: '₹6,000', avatar: null, tournament: 'Sunday Clash', state: 'Gujarat' },
]

const RANK_STYLES = [
  { bg: 'bg-yellow-400/15', border: 'border-yellow-400/30', text: 'text-yellow-400', glow: '#FBBF24' },
  { bg: 'bg-slate-400/15', border: 'border-slate-400/30', text: 'text-slate-300', glow: '#94A3B8' },
  { bg: 'bg-amber-600/15', border: 'border-amber-600/30', text: 'text-amber-500', glow: '#D97706' },
]

export default function FeaturedWinnersSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-glow-purple opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3 block flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> Hall of Champions
          </span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">Recent Winners</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Celebrating India&apos;s finest esports talents. Their wins, their glory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {WINNERS.map((winner, i) => {
            const style = RANK_STYLES[winner.rank - 1] || RANK_STYLES[2]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`glass-card rounded-2xl p-5 text-center border ${style.border} relative overflow-hidden group hover:scale-105 transition-all duration-300`}
              >
                {/* Rank badge */}
                <div className={`absolute top-3 right-3 w-7 h-7 rounded-full ${style.bg} flex items-center justify-center`}>
                  <span className={`text-xs font-gaming font-bold ${style.text}`}>#{winner.rank}</span>
                </div>

                {/* Avatar */}
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white relative"
                  style={{ background: `linear-gradient(135deg, ${style.glow}40, ${style.glow}20)`, border: `2px solid ${style.glow}60` }}>
                  {winner.username[0].toUpperCase()}
                  {winner.rank === 1 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Trophy className={`w-4 h-4 ${style.text} trophy-glow`} />
                    </div>
                  )}
                </div>

                <h3 className="font-gaming font-bold text-sm text-white mb-1">{winner.username}</h3>
                <p className="text-xs text-slate-400 mb-1">{winner.state}</p>
                <p className="text-xs text-slate-500 mb-3">{winner.tournament}</p>

                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${style.bg} ${style.text}`}>
                  <IndianRupee className="w-3 h-3" />
                  {winner.prize.replace('₹', '')}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
