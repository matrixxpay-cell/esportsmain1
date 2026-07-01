'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, CreditCard, Trophy } from 'lucide-react'

const STEPS = [
  { step: '01', icon: UserPlus,   title: 'Create Your Account',  sub: 'Free & instant signup',         desc: 'Register in 30 seconds. Verify your email and set up your gaming profile — completely free!',               color: 'text-saffron',     bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { step: '02', icon: Search,     title: 'Find a Tournament',    sub: 'Browse by game & prize',         desc: 'Browse free and paid tournaments by game, mode, and prize pool. Register with a single click.',             color: 'text-gold',        bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { step: '03', icon: CreditCard, title: 'Pay & Play',           sub: 'UPI, wallet & more',             desc: 'Pay the entry fee via UPI or your wallet. Get the Room ID and password instantly — let the game begin!',   color: 'text-neon-cyan',   bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { step: '04', icon: Trophy,     title: 'Win & Get Paid',       sub: 'Prize direct to wallet',         desc: 'Win the tournament and the prize money hits your wallet instantly. Withdraw anytime, hassle-free.',         color: 'text-neon-blue',   bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="section-badge">Simple Process</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Go from zero to champion in four simple steps.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg, #FF6B2B, #F59E0B, #34D399, #60A5FA)' }} />

          {STEPS.map((step, i) => (
            <motion.div key={step.step}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}>
              <div className={`glass-card rounded-2xl p-6 border ${step.border} h-full`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center relative z-10`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className={`font-rajdhani font-black text-4xl ${step.color} opacity-30`}>{step.step}</span>
                </div>
                <h3 className="font-rajdhani font-bold text-white text-xl mb-0.5">{step.title}</h3>
                <p className={`text-xs font-semibold ${step.color} mb-2 opacity-80`}>{step.sub}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
