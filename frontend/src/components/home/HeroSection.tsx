'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Zap, Trophy, Users, TrendingUp } from 'lucide-react'
import { PLATFORM_TAGLINE, STATS } from '@/constants'

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 4 + 3,
}))

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Floating particles */}
      {mounted && PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-neon-blue/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8 text-sm"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-slate-300">India&apos;s #1 Esports Tournament Platform</span>
            <Zap className="w-3.5 h-3.5 text-neon-blue" />
          </motion.div>

          {/* Main tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-gaming font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-6"
          >
            <span className="tagline block">{PLATFORM_TAGLINE}</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Compete in <span className="text-neon-blue font-semibold">CS:GO, BGMI, Valorant, Free Fire</span> and more.
            Win real cash prizes and glory on India&apos;s most trusted esports platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/dashboard/tournaments"
              className="btn-neon flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white group shadow-neon-blue w-full sm:w-auto justify-center">
              <Trophy className="w-5 h-5" />
              Join Tournament
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/register"
              className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white w-full sm:w-auto justify-center">
              <Users className="w-5 h-5" />
              Create Account
            </Link>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, label: 'Total Players', value: STATS.totalPlayers, color: 'text-neon-blue' },
              { icon: Trophy, label: 'Active Tournaments', value: STATS.activeTournaments, color: 'text-neon-purple' },
              { icon: TrendingUp, label: 'Prize Pool Distributed', value: STATS.prizePoolDistributed, color: 'text-neon-cyan' },
              { icon: Zap, label: 'Winners This Week', value: STATS.winnersThisWeek, color: 'text-yellow-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="stat-card group">
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <div className={`font-gaming font-bold text-2xl sm:text-3xl ${color} mb-1`}>{value}</div>
                <div className="text-slate-400 text-xs sm:text-sm">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent pointer-events-none" />
    </section>
  )
}
