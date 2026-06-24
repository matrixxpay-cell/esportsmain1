'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Is IndiaEsports legal to play on?',
    a: 'Yes! IndiaEsports is a skill-based gaming platform. Esports competitions are recognized as skill-based competitions in India. We comply with all applicable Indian laws and regulations.',
  },
  {
    q: 'How do I withdraw my winnings?',
    a: 'Winnings are credited to your IndiaEsports wallet instantly after tournament results. You can withdraw via UPI, IMPS, or bank transfer. Minimum withdrawal is ₹100. Withdrawals are processed within 24 hours.',
  },
  {
    q: 'Are free tournaments really free?',
    a: 'Yes! Free tournaments have zero entry fee. We host free tournaments regularly to allow all players to compete and win real cash prizes without any investment.',
  },
  {
    q: 'How are Room IDs distributed?',
    a: 'Once a paid tournament\'s registration closes, Room IDs and passwords are automatically distributed to registered participants via email and platform notifications — 15 minutes before match start.',
  },
  {
    q: 'What happens if I get cheaters in my match?',
    a: 'Report them immediately using the in-match reporting system. Our AI fraud detection monitors matches in real-time. Verified cheaters are banned and affected players receive refunds or re-matches.',
  },
  {
    q: 'Can I create my own tournament?',
    a: 'Currently, only platform administrators can create tournaments to maintain quality and fair competition. This ensures all tournaments are properly managed and prizes are guaranteed.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support UPI (all UPI apps), net banking, debit/credit cards, and Razorpay. All payments are secured with 256-bit SSL encryption.',
  },
  {
    q: 'How does the referral program work?',
    a: 'Share your unique referral code with friends. When they register and play their first paid tournament, both you and your friend receive bonus wallet credits. There is no limit on referrals!',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-neon-blue text-sm font-semibold uppercase tracking-widest mb-3 block">FAQs</span>
          <h2 className="gaming-heading text-3xl sm:text-4xl mb-4">Got Questions?</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full glass-card rounded-xl px-5 py-4 text-left flex items-center justify-between gap-4 transition-all duration-200 ${
                  openIndex === i ? 'border-neon-blue/30' : 'hover:border-white/15'
                }`}
              >
                <span className="font-medium text-white text-sm">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neon-blue flex-shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 text-slate-400 text-sm leading-relaxed border-x border-b border-neon-blue/10 rounded-b-xl bg-neon-blue/[0.02]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
