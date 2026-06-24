'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Brain, Wallet, Trophy, Users, Clock, Globe } from 'lucide-react'

const FEATURES = [
  { icon: Brain,  title: 'AI-Powered Fixtures',   desc: 'Smart bracket banata hai khud se. Fraud bhi pakad leta hai AI — bilkul fair game!', color: 'text-neon-blue',   bg: 'bg-blue-500/10' },
  { icon: Wallet, title: 'Turant Paise Milte Hain', desc: 'Jeeto aur seedha wallet mein aaye paise. UPI, bank transfer — jaise chaaho nikalo.', color: 'text-green-400',  bg: 'bg-green-400/10' },
  { icon: Shield, title: 'Verified Fair Play',     desc: 'Anti-cheat system, reporting, aur dispute resolution — cheating ka koi chance nahi.', color: 'text-saffron',     bg: 'bg-orange-400/10' },
  { icon: Trophy, title: 'Sabhi Popular Games',    desc: 'BGMI, Valorant, CS:GO, Free Fire, MLBB, Dota 2, eFootball — sab ek jagah par.', color: 'text-gold',        bg: 'bg-yellow-400/10' },
  { icon: Users,  title: 'Team Finder',            desc: 'Teammates dhundo, squad banao, milke jeeto. India ki sabse badi esports community.', color: 'text-neon-purple', bg: 'bg-purple-500/10' },
  { icon: Clock,  title: 'Live Updates',           desc: 'Match scores, bracket updates, aur notifications — sab real-time mein milenge.', color: 'text-neon-cyan',   bg: 'bg-emerald-400/10' },
  { icon: Zap,    title: 'Refer Karo, Kamao',      desc: 'Dost ko invite karo aur wallet mein bonus pao. Jitne zyada dost, utni zyada earning!', color: 'text-saffron-light', bg: 'bg-orange-300/10' },
  { icon: Globe,  title: 'Poore India Se Players', desc: 'Har state ke khiladi ek platform par. Local hero se national champion ban jao.', color: 'text-neon-blue',   bg: 'bg-blue-400/10' },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="section-badge">Kyun Choose Karein Hume?</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">Champions Ke Liye Banaya Hai</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Har feature Indian gamers ko dhyan mein rakhke banaya gaya — fast, fair, aur rewarding.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass-card rounded-2xl p-6 group hover:scale-105 transition-all duration-300 hover:border-saffron-200">
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2 font-rajdhani text-lg">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
