'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Trophy, Users, TrendingUp, Flame } from 'lucide-react'
import { PLATFORM_TAGLINE, STATS } from '@/constants'

const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 3 + 1, delay: Math.random() * 3, duration: Math.random() * 4 + 4,
}))

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg">
      <div className="absolute inset-0 bg-grid opacity-40" />

      {mounted && PARTICLES.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            background: p.id % 3 === 0 ? 'rgba(255,107,43,0.5)' : p.id % 3 === 1 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.2)',
          }}
          animate={{ y: [0, -28, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,107,43,0.07)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(245,158,11,0.06)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-slate-300">India's #1 Esports Platform</span>
            <Flame className="w-3.5 h-3.5 text-saffron" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-bebas tracking-wider text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-none mb-4 uppercase">
            <span className="tagline block">{PLATFORM_TAGLINE}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="font-rajdhani text-slate-400 text-xl mb-4 tracking-wider">
            India's Premier Esports Tournament Platform
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Play <span className="text-saffron font-semibold">CS:GO, BGMI, Valorant, Free Fire</span> and much more.
            Win real cash prizes and put your name on India's gaming map.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard/tournaments"
              className="btn-primary flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold group w-full sm:w-auto justify-center">
              <Trophy className="w-5 h-5" />
              Join Now
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/register"
              className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold w-full sm:w-auto justify-center">
              <Users className="w-5 h-5" />
              Create Free Account
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Users,       label: 'Total Players',          sublabel: 'Registered Gamers',    value: STATS.totalPlayers,        color: 'text-saffron' },
              { icon: Trophy,      label: 'Active Tournaments',     sublabel: 'Live Right Now',        value: STATS.activeTournaments,   color: 'text-gold' },
              { icon: TrendingUp,  label: 'Prize Pool Distributed', sublabel: 'Real Cash Paid Out',    value: STATS.prizePoolDistributed, color: 'text-green-400' },
              { icon: Flame,       label: 'Winners This Week',      sublabel: 'Cash Prizes Claimed',   value: STATS.winnersThisWeek,     color: 'text-neon-blue' },
            ].map(({ icon: Icon, label, sublabel, value, color }) => (
              <div key={label} className="stat-card group">
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <div className={`font-rajdhani font-bold text-2xl sm:text-3xl ${color} mb-0.5`}>{value}</div>
                <div className="text-white text-xs font-semibold mb-0.5">{label}</div>
                <div className="text-slate-500 text-xs">{sublabel}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
    </section>
  )
}
