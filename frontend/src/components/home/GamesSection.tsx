'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { GAMES } from '@/constants/games'

export default function GamesSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-neon-blue text-sm font-semibold uppercase tracking-widest mb-3 block">Supported Games</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">Choose Your Battleground</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            From tactical shooters to battle royales — find tournaments for your favorite game.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link href={`/dashboard/tournaments?game=${game.id}`}
                className="group block glass-card rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300"
                style={{ borderColor: `rgba(${game.color.slice(1).match(/.{2}/g)?.map(h => parseInt(h, 16)).join(',')}, 0.2)` }}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 flex items-center justify-center"
                  style={{ background: game.glowColor }}>
                  <span className="font-gaming font-black text-2xl" style={{ color: game.color }}>
                    {game.shortName[0]}
                  </span>
                </div>
                <div className="font-gaming font-bold text-xs" style={{ color: game.color }}>{game.shortName}</div>
                <div className="text-slate-500 text-xs mt-0.5">{game.genre}</div>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
