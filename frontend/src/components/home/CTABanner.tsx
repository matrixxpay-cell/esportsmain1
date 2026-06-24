'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Zap } from 'lucide-react'
import { PLATFORM_TAGLINE } from '@/constants'

export default function CTABanner() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden text-center p-12 sm:p-16"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, rgba(124, 58, 237, 0.12) 50%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
          }}
        >
          {/* Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-24 bg-neon-purple/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6 text-sm">
              <Zap className="w-4 h-4 text-neon-blue" />
              <span className="text-slate-300">Join 50,000+ Players Today</span>
            </div>

            <h2 className="tagline text-3xl sm:text-4xl md:text-5xl font-gaming font-black mb-6 leading-tight">
              {PLATFORM_TAGLINE}
            </h2>

            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
              India is rising. Esports is your arena. Don&apos;t wait — register now and compete for real cash prizes today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register"
                className="btn-neon flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold text-white group shadow-neon-blue w-full sm:w-auto justify-center">
                Start Playing Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard/tournaments"
                className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white w-full sm:w-auto justify-center">
                View Tournaments
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
