'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, CreditCard, Trophy } from 'lucide-react'

const STEPS = [
  {
    step: '01', icon: UserPlus, title: 'Create Account',
    desc: 'Sign up in 30 seconds. Verify your email and set up your gaming profile.',
    color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/20',
  },
  {
    step: '02', icon: Search, title: 'Find Tournament',
    desc: 'Browse free and paid tournaments by game, mode, and prize pool. Register with one click.',
    color: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20',
  },
  {
    step: '03', icon: CreditCard, title: 'Pay & Compete',
    desc: 'For paid tournaments, pay the entry fee via UPI or Razorpay. Get room ID and compete.',
    color: 'text-neon-cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20',
  },
  {
    step: '04', icon: Trophy, title: 'Win & Get Paid',
    desc: 'Win tournaments and prize money is instantly credited to your wallet. Withdraw anytime.',
    color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-neon-cyan text-sm font-semibold uppercase tracking-widest mb-3 block">Simple Process</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">From zero to champion in four simple steps.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg, #00D9FF, #7C3AED, #06B6D4, #FBBF24)' }} />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div className={`glass-card rounded-2xl p-6 border ${step.border}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center relative z-10`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className={`font-gaming font-black text-4xl ${step.color} opacity-30`}>{step.step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
