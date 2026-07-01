'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Flame } from 'lucide-react'
import { PLATFORM_TAGLINE } from '@/constants'

export default function CTABanner() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden text-center p-12 sm:p-16"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(245,158,11,0.08) 50%, rgba(255,107,43,0.06) 100%)',
            border: '1px solid rgba(255,107,43,0.25)',
          }}
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(255,107,43,0.12)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(245,158,11,0.1)' }} />

          {/* Tricolor bar at top */}
          <div className="tricolor-bar absolute top-0 left-0 right-0" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6 text-sm">
              <Flame className="w-4 h-4 text-saffron" />
              <span className="text-slate-300">50,000+ Gamers and Counting</span>
            </div>

            <h2 className="tagline text-4xl sm:text-5xl md:text-6xl font-bebas tracking-wider mb-3 leading-none uppercase">
              {PLATFORM_TAGLINE}
            </h2>
            <p className="text-slate-400 text-base mb-4 font-rajdhani tracking-wider">
              India's Premier Esports Tournament Platform
            </p>

            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
              India is rising in gaming. Esports is your arena.
              Don't wait — register now and compete for real cash prizes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register"
                className="btn-primary flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold group w-full sm:w-auto justify-center">
                Get Started Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard/tournaments"
                className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold w-full sm:w-auto justify-center">
                Browse Tournaments
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
