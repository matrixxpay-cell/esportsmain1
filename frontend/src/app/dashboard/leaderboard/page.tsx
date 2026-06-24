'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Flame } from 'lucide-react'
import { GAMES } from '@/constants/games'

const MOCK_LEADERS = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  username: ['ProKillerXD', 'ValorantGod_IN', 'HeadshotHero', 'BooyahKing99', 'MLBBMaster', 'Dota2Legend', 'FootballPro', 'SniperElite', 'RushMaster', 'ClutchKing', 'FragGod', 'AWPLegend', 'RiflerPro', 'SwiftPlayer', 'AimBot420', 'TacticalGenius', 'GrenadeKing', 'FlankMaster', 'RushBuster', 'IronSight'][i],
  avatar: null,
  game: ['BGMI', 'Valorant', 'CS:GO', 'Free Fire', 'MLBB', 'Dota 2', 'eFootball', 'BGMI', 'Valorant', 'CS:GO', 'Free Fire', 'MLBB', 'Dota 2', 'eFootball', 'BGMI', 'Valorant', 'CS:GO', 'Free Fire', 'MLBB', 'Dota 2'][i],
  points: Math.round(12480 - i * 580 + Math.random() * 100),
  wins: Math.round(47 - i * 2.1 + Math.random() * 3),
  earnings: (2300000 - i * 100000),
  state: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'UP', 'Bihar', 'Rajasthan', 'MP', 'Punjab', 'Haryana', 'AP', 'Kerala', 'Odisha', 'Assam', 'West Bengal', 'Goa', 'Jharkhand', 'Chhattisgarh', 'HP'][i],
}))

export default function LeaderboardPage() {
  const [gameFilter, setGameFilter] = useState('all')

  const filtered = gameFilter === 'all' ? MOCK_LEADERS
    : MOCK_LEADERS.filter(p => p.game.toLowerCase().includes(gameFilter.toLowerCase()))

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">Global Leaderboard</h1>
        <p className="text-slate-400">India&apos;s top esports players</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        {[MOCK_LEADERS[1], MOCK_LEADERS[0], MOCK_LEADERS[2]].map((player, i) => {
          const heights = ['h-28', 'h-36', 'h-24']
          const badges = ['🥈', '🥇', '🥉']
          const colors = ['text-slate-300', 'text-yellow-400', 'text-amber-500']
          const idx = i === 0 ? 1 : i === 1 ? 0 : 2
          return (
            <motion.div key={player.username}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-t-2xl ${heights[i]} w-28 sm:w-36 flex flex-col items-center justify-end pb-4 border ${
                i === 1 ? 'border-yellow-400/30' : 'border-white/[0.08]'
              }`}>
              <span className="text-2xl mb-2">{badges[i]}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white mb-2"
                style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
                {player.username[0]}
              </div>
              <div className={`font-gaming font-bold text-xs ${colors[i]} text-center truncate px-2 w-full`}>{player.username}</div>
              <div className="text-slate-400 text-xs mt-0.5">{player.points.toLocaleString('en-IN')} pts</div>
            </motion.div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button onClick={() => setGameFilter('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${gameFilter === 'all' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'glass-card text-slate-400 hover:text-white'}`}>
          All Games
        </button>
        {GAMES.map(g => (
          <button key={g.id} onClick={() => setGameFilter(g.shortName)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${gameFilter === g.shortName ? 'text-white border' : 'glass-card text-slate-400 hover:text-white'}`}
            style={gameFilter === g.shortName ? { color: g.color, borderColor: g.color + '50', background: g.color + '15' } : {}}>
            {g.shortName}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2 hidden sm:block">Game</div>
          <div className="col-span-2">Points</div>
          <div className="col-span-2 hidden md:block">Wins</div>
          <div className="col-span-3 md:col-span-1 text-right">Earnings</div>
        </div>
        {filtered.map((player, i) => (
          <motion.div key={player.username}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className={`grid grid-cols-12 px-5 py-3.5 items-center border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i < 3 ? 'bg-yellow-400/[0.02]' : ''}`}>
            <div className="col-span-1">
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : <span className="text-slate-500 text-sm">{player.rank}</span>}
            </div>
            <div className="col-span-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
                {player.username[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white font-medium truncate">{player.username}</div>
                <div className="text-xs text-slate-500 hidden sm:block">{player.state}</div>
              </div>
            </div>
            <div className="col-span-2 hidden sm:block text-xs text-slate-400">{player.game}</div>
            <div className="col-span-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-neon-blue hidden sm:block" />
              <span className="font-gaming font-bold text-neon-blue text-sm">{player.points.toLocaleString('en-IN')}</span>
            </div>
            <div className="col-span-2 hidden md:block text-slate-300 text-sm text-center">{player.wins}</div>
            <div className="col-span-3 md:col-span-1 text-right text-green-400 text-sm font-medium">
              ₹{(player.earnings / 100).toFixed(0)}K
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
