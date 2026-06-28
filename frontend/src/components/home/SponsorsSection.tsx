'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'

const DEFAULT_SPONSORS = [
  { name: 'Razorpay', logoUrl: '', website: '' },
  { name: 'JioFiber', logoUrl: '', website: '' },
  { name: 'Noise', logoUrl: '', website: '' },
  { name: 'boAt', logoUrl: '', website: '' },
  { name: 'Cloudinary', logoUrl: '', website: '' },
  { name: 'AWS India', logoUrl: '', website: '' },
]

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState(DEFAULT_SPONSORS)

  useEffect(() => {
    api.get('/content/sponsors').then(res => {
      const data = res.data?.data
      if (data && data.length > 0) setSponsors(data)
    }).catch(() => {})
  }, [])

  if (sponsors.length === 0) return null

  return (
    <section className="py-16 border-y border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500 text-sm uppercase tracking-widest mb-10">Trusted Partners & Sponsors</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
          {sponsors.map((s: any, i: number) => {
            const inner = (
              <motion.div
                key={s.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-4 flex items-center justify-center h-16 hover:border-white/20 transition-all duration-200 group"
              >
                {s.logoUrl ? (
                  <img src={s.logoUrl} alt={s.name} className="max-h-10 max-w-full object-contain" />
                ) : (
                  <span className="font-gaming font-bold text-slate-500 group-hover:text-slate-300 transition-colors text-sm">
                    {s.name.length <= 4 ? s.name : s.name.split(' ').map((w: string) => w[0]).join('').toUpperCase()}
                  </span>
                )}
              </motion.div>
            )
            return s.website ? (
              <a key={s.name} href={s.website} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <div key={s.name}>{inner}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
