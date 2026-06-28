'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import api from '@/services/api'

const DEFAULT_REVIEWS = [
  { name: 'Arjun Sharma', state: 'Delhi', game: 'BGMI', rating: 5, text: 'Won ₹15,000 in my first month! The platform is super clean, payouts are instant. Best esports platform in India!', photoUrl: '' },
  { name: 'Priya Nair', state: 'Kerala', game: 'Valorant', rating: 5, text: 'As a female gamer, I love how inclusive this platform is. Great tournaments, fair matchmaking, and awesome community!', photoUrl: '' },
  { name: 'Rahul Gupta', state: 'UP', game: 'CS:GO', rating: 5, text: 'The AI bracket system is mind-blowing. No manual errors, everything automated. Professional tournament management!', photoUrl: '' },
  { name: 'Sanjay Kumar', state: 'Bihar', game: 'Free Fire', rating: 5, text: 'From a small village to national champion — IndiaEsports made it possible. Ab nahi khelega India toh kab khelega!', photoUrl: '' },
  { name: 'Deepak Verma', state: 'Rajasthan', game: 'BGMI', rating: 5, text: 'The wallet system is seamless. UPI deposits and withdrawals are instant. Trusted the most among all platforms.', photoUrl: '' },
  { name: 'Akash Mehta', state: 'Gujarat', game: 'Dota 2', rating: 5, text: 'Room IDs are shared automatically after registration. No manual coordination needed. Super professional!', photoUrl: '' },
]

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS)

  useEffect(() => {
    api.get('/content/reviews').then(res => {
      const data = res.data?.data
      if (data && data.length > 0) setReviews(data)
    }).catch(() => {})
  }, [])

  if (reviews.length === 0) return null

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-3 block">Player Reviews</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">What Players Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((t: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <Quote className="w-8 h-8 text-neon-blue/40 flex-shrink-0 mt-1" />
                <p className="text-slate-300 text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm overflow-hidden"
                    style={{ background: t.photoUrl ? undefined : 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      t.name?.[0] || '?'
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.state} • {t.game}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
