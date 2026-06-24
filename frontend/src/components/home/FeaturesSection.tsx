'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Brain, Wallet, Trophy, Users, Clock, Globe } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain, title: 'AI-Powered Fixtures',
    desc: 'Smart fixture generation, bracket automation, and fraud detection — all powered by AI.',
    color: 'text-neon-blue', bg: 'bg-neon-blue/10',
  },
  {
    icon: Wallet, title: 'Instant Payouts',
    desc: 'Win and get paid instantly. UPI, bank transfer, and Razorpay — your money, your way.',
    color: 'text-green-400', bg: 'bg-green-400/10',
  },
  {
    icon: Shield, title: 'Verified Fair Play',
    desc: 'Anti-cheat AI monitoring, reporting system, and dispute resolution for clean competition.',
    color: 'text-neon-cyan', bg: 'bg-cyan-500/10',
  },
  {
    icon: Trophy, title: 'Multi-Game Tournaments',
    desc: 'BGMI, Valorant, CS:GO, Free Fire, MLBB, Dota 2, and eFootball — all in one platform.',
    color: 'text-yellow-400', bg: 'bg-yellow-400/10',
  },
  {
    icon: Users, title: 'Team Finder',
    desc: 'Find teammates, build squads, and compete together. India\'s largest esports community.',
    color: 'text-neon-purple', bg: 'bg-purple-500/10',
  },
  {
    icon: Clock, title: 'Real-time Updates',
    desc: 'Live match scores, bracket updates, and instant notifications via Socket.io.',
    color: 'text-pink-400', bg: 'bg-pink-400/10',
  },
  {
    icon: Zap, title: 'Referral Rewards',
    desc: 'Invite friends and earn bonus wallet credits. More players, more prizes for everyone.',
    color: 'text-orange-400', bg: 'bg-orange-400/10',
  },
  {
    icon: Globe, title: 'Nation-wide Reach',
    desc: 'Players from every state competing in one platform. Rise from local hero to national legend.',
    color: 'text-emerald-400', bg: 'bg-emerald-400/10',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-neon-purple text-sm font-semibold uppercase tracking-widest mb-3 block">Why Choose Us</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">Built for Champions</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every feature built with the Indian esports player in mind — fast, fair, and rewarding.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass-card rounded-2xl p-6 group hover:scale-105 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
