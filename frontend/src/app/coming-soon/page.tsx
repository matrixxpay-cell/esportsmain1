'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Gamepad2, Trophy, Zap, LogIn } from 'lucide-react'

function Countdown() {
  const target = new Date('2025-08-15T00:00:00')
  const [diff, setDiff] = useState(Math.max(0, target.getTime() - Date.now()))

  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [])

  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  const units = [
    { label: 'Days', value: d },
    { label: 'Hours', value: h },
    { label: 'Mins', value: m },
    { label: 'Secs', value: s },
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3 sm:gap-5">
          <div className="text-center">
            <div className="glass-card rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-w-[64px] sm:min-w-[80px]">
              <div className="font-bebas text-4xl sm:text-5xl text-saffron leading-none">
                {String(value).padStart(2, '0')}
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-2 tracking-widest uppercase">{label}</p>
          </div>
          {i < 3 && <span className="text-saffron text-2xl font-bold mb-5 opacity-60">:</span>}
        </div>
      ))}
    </div>
  )
}

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,107,43,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(245,158,11,0.05)' }} />

      {/* Tricolor top bar */}
      <div className="tricolor-bar fixed top-0 left-0 right-0 z-50" />

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-10">
          <Image src="/logo-eg.svg" alt="EsportsG" width={48} height={48} className="rounded-xl" style={{ boxShadow: '0 0 20px rgba(255,107,43,0.4)' }} />
          <div className="flex flex-col leading-none text-left">
            <span className="font-rajdhani font-black text-2xl" style={{ background: 'linear-gradient(135deg,#FF6B2B,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Esports<span style={{ WebkitTextFillColor: 'white' }}>G</span>
            </span>
            <span className="text-slate-500 text-[9px] tracking-widest uppercase">India&apos;s #1 Platform</span>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6 text-sm">
          <Zap className="w-4 h-4 text-saffron" />
          <span className="text-slate-300">Something epic is coming</span>
          <Zap className="w-4 h-4 text-gold" />
        </motion.div>

        {/* Heading */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="font-bebas tracking-wider uppercase leading-none mb-3"
          style={{ fontSize: 'clamp(3rem, 12vw, 6rem)' }}>
          <span className="tagline">We're Leveling Up</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="text-slate-400 text-base sm:text-lg mb-10 max-w-lg mx-auto">
          India's premier esports tournament platform is under construction.
          Get ready to play, compete, and win real cash prizes.
        </motion.p>

        {/* Countdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
          <Countdown />
        </motion.div>

        {/* Notify form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-10">
          {submitted ? (
            <div className="inline-flex items-center gap-2 glass-card rounded-xl px-6 py-4 text-green-400 border border-green-500/20">
              <Trophy className="w-5 h-5" />
              You&apos;re on the waitlist! We&apos;ll notify you at launch.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email for early access"
                className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-saffron/50 text-sm"
              />
              <button
                onClick={() => { if (email) setSubmitted(true) }}
                className="btn-primary px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2 justify-center"
              >
                <Gamepad2 className="w-4 h-4" />
                Notify Me
              </button>
            </div>
          )}
        </motion.div>

        {/* Feature pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {['CS:GO', 'BGMI', 'Valorant', 'Free Fire', 'Real Cash Prizes'].map(tag => (
            <span key={tag} className="glass-card rounded-full px-4 py-1.5 text-slate-400 text-xs font-medium">{tag}</span>
          ))}
        </motion.div>

        {/* Admin login link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors group">
            <LogIn className="w-4 h-4 group-hover:text-saffron transition-colors" />
            Admin Login
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
