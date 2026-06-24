'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Trophy, TrendingUp, Gift, Edit2, Camera, Copy, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setCopied(true)
      toast.success('Referral code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const stats = user?.stats ?? { tournamentsPlayed: 24, tournamentsWon: 8, totalEarnings: 45000, rank: 142, points: 7840 }

  return (
    <div className="pb-20 lg:pb-0 max-w-3xl">
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">My Profile</h1>
        <p className="text-slate-400">Your gamer identity</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-dark-800 rounded-lg border border-white/10 flex items-center justify-center hover:border-neon-blue/30 transition-colors">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-gaming font-bold text-xl text-white">{user?.username}</h2>
              {user?.isVerified && <CheckCircle className="w-4 h-4 text-green-400" />}
            </div>
            <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue text-xs font-semibold border border-neon-blue/20">
                Rank #{stats.rank}
              </div>
              <div className="px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-xs font-semibold border border-neon-purple/20">
                {stats.points.toLocaleString('en-IN')} pts
              </div>
            </div>
          </div>
          <button className="btn-ghost px-3 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-1.5 hover:text-white">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tournaments', value: stats.tournamentsPlayed, icon: Trophy, color: 'text-neon-blue' },
          { label: 'Won', value: stats.tournamentsWon, icon: Trophy, color: 'text-yellow-400' },
          { label: 'Total Earned', value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Win Rate', value: `${Math.round((stats.tournamentsWon / stats.tournamentsPlayed) * 100)}%`, icon: TrendingUp, color: 'text-neon-purple' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className={`font-gaming font-bold text-lg ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Referral Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5 border border-neon-purple/15">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-neon-purple/15 flex items-center justify-center">
            <Gift className="w-4 h-4 text-neon-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Referral Program</h3>
            <p className="text-slate-400 text-xs">Earn ₹50 for every friend who joins</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 font-mono text-neon-blue font-bold tracking-widest text-sm">
            {user?.referralCode ?? 'INDIA001'}
          </code>
          <button onClick={copyReferralCode}
            className="btn-ghost px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white flex items-center gap-1.5">
            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
