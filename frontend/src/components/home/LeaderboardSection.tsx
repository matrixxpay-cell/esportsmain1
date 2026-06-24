'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, ChevronRight, TrendingUp } from 'lucide-react'

const LEADERS = [
  { rank: 1, username: 'ProKillerXD', points: 12480, wins: 47, earnings: '₹2.3L', game: 'BGMI', badge: '🥇' },
  { rank: 2, username: 'ValorantGod_IN', points: 11200, wins: 39, earnings: '₹1.9L', game: 'Valorant', badge: '🥈' },
  { rank: 3, username: 'HeadshotHero', points: 9870, wins: 35, earnings: '₹1.5L', game: 'CS:GO', badge: '🥉' },
  { rank: 4, username: 'BooyahKing99', points: 8540, wins: 31, earnings: '₹1.2L', game: 'Free Fire', badge: null },
  { rank: 5, username: 'MLBBMaster', points: 7200, wins: 28, earnings: '₹95K', game: 'MLBB', badge: null },
  { rank: 6, username: 'Dota2Legend', points: 6900, wins: 24, earnings: '₹80K', game: 'Dota 2', badge: null },
  { rank: 7, username: 'FootballProIN', points: 6100, wins: 22, earnings: '₹65K', game: 'eFootball', badge: null },
]

export default function LeaderboardSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-neon-cyan text-sm font-semibold uppercase tracking-widest mb-2 block">Global Rankings</span>
            <h2 className="gaming-heading text-2xl sm:text-3xl">Top Players</h2>
          </div>
          <Link href="/dashboard/leaderboard"
            className="flex items-center gap-1 text-neon-blue text-sm hover:gap-2 transition-all duration-200">
            Full Leaderboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 hidden sm:block">Game</div>
            <div className="col-span-2 text-right sm:text-left">Points</div>
            <div className="col-span-2 hidden md:block text-right">Wins</div>
            <div className="col-span-3 md:col-span-1 text-right">Earnings</div>
          </div>

          {LEADERS.map((player, i) => (
            <motion.div
              key={player.username}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`grid grid-cols-12 px-5 py-4 items-center border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-150 ${
                i < 3 ? 'bg-neon-blue/[0.02]' : ''
              }`}
            >
              <div className="col-span-1">
                {player.badge ? (
                  <span className="text-xl">{player.badge}</span>
                ) : (
                  <span className="text-slate-500 font-gaming text-sm">{player.rank}</span>
                )}
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, #00D9FF, #7C3AED)` }}>
                  {player.username[0]}
                </div>
                <span className={`font-medium text-sm ${i < 3 ? 'text-white' : 'text-slate-300'}`}>{player.username}</span>
              </div>
              <div className="col-span-2 hidden sm:block text-xs text-slate-400">{player.game}</div>
              <div className="col-span-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-neon-blue hidden sm:block" />
                <span className="text-neon-blue font-gaming font-bold text-sm">{player.points.toLocaleString('en-IN')}</span>
              </div>
              <div className="col-span-2 hidden md:block text-center text-slate-300 text-sm">{player.wins}</div>
              <div className="col-span-3 md:col-span-1 text-right text-sm font-medium text-green-400">{player.earnings}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
