'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, CreditCard, Trophy } from 'lucide-react'

const STEPS = [
  { step: '01', icon: UserPlus,   title: 'Account Banao',     hinglish: 'Sign Up Karo',       desc: '30 second mein register karo. Email verify karo aur apna gaming profile set karo — bilkul free!',    color: 'text-saffron',   bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { step: '02', icon: Search,     title: 'Tournament Dhundo', hinglish: 'Apna Game Chuno',    desc: 'Free aur paid tournaments browse karo — game, mode, aur prize pool ke hisaab se. Ek click mein register!', color: 'text-gold',      bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { step: '03', icon: CreditCard, title: 'Pay Karo & Khelo',  hinglish: 'UPI Se Bhi Ho Sakta', desc: 'Paid tournament ke liye UPI ya wallet se fees bharo. Room ID aur password milega — start karo!', color: 'text-neon-cyan',  bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { step: '04', icon: Trophy,     title: 'Jeeto & Paise Pao', hinglish: 'Inaam Seedha Wallet Mein', desc: 'Tournament jeeto aur prize money turant tumhare wallet mein aa jaati hai. Kabhi bhi nikalo!', color: 'text-neon-blue',  bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="section-badge">Simple Process</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">Kaise Kaam Karta Hai?</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Chaar simple steps mein zero se champion ban jao.</p>
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
                <p className={`text-xs font-semibold ${step.color} mb-2 opacity-80`}>{step.hinglish}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
