'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Shield, Star, Award, Globe } from 'lucide-react'

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])
  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>
}

export default function StatsSection() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Globe,  value: 50000,    suffix: '+',    label: 'Registered Players',        sublabel: 'Registered Khiladi',    color: 'text-saffron',    bg: 'bg-orange-400/10' },
            { icon: Shield, value: 1200,     suffix: '+',    label: 'Tournaments Hosted',        sublabel: 'Tournaments Host Kiye', color: 'text-gold',       bg: 'bg-yellow-400/10' },
            { icon: Award,  value: 12000000, suffix: '+',    label: 'Prize Pool (₹) Distributed', sublabel: 'Total Inaam Baante',    color: 'text-neon-cyan',  bg: 'bg-emerald-400/10' },
            { icon: Star,   value: 4.8,      suffix: '/5',   label: 'Player Satisfaction',       sublabel: 'Khiladiyon Ki Rating',  color: 'text-neon-blue',  bg: 'bg-blue-400/10' },
          ].map(({ icon: Icon, value, suffix, label, sublabel, color, bg }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center indian-border group hover:scale-105 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className={`font-rajdhani font-bold text-3xl lg:text-4xl ${color} mb-1`}>
                <CountUp end={value} />{suffix}
              </div>
              <p className="text-white text-sm font-semibold mb-0.5">{label}</p>
              <p className="text-slate-500 text-xs">{sublabel}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
