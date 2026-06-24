'use client'

import { motion } from 'framer-motion'

const SPONSORS = [
  { name: 'Razorpay', logo: 'RP' },
  { name: 'JioFiber', logo: 'JF' },
  { name: 'Noise', logo: 'NS' },
  { name: 'boAt', logo: 'bT' },
  { name: 'Cloudinary', logo: 'CL' },
  { name: 'AWS India', logo: 'AWS' },
]

export default function SponsorsSection() {
  return (
    <section className="py-16 border-y border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500 text-sm uppercase tracking-widest mb-10">Trusted Partners & Sponsors</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
          {SPONSORS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 flex items-center justify-center h-16 hover:border-white/20 transition-all duration-200 group"
            >
              <span className="font-gaming font-bold text-slate-500 group-hover:text-slate-300 transition-colors text-sm">{s.logo}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
