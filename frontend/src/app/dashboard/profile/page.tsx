'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Trophy, TrendingUp, Gift, Edit2, Save, X, Copy, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [myTournaments, setMyTournaments] = useState<any[]>([])
  const [form, setForm] = useState({ username: '', phone: '' })

  useEffect(() => {
    if (user) setForm({ username: user.username || '', phone: user.phone || '' })
    api.get('/tournaments/my/registered').then(r => setMyTournaments(r.data.data || [])).catch(() => {})
  }, [user])

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      setCopied(true)
      toast.success('Referral code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await api.put('/users/profile', form)
      setUser({ ...user!, ...res.data.data })
      toast.success('Profile updated!')
      setEditing(false)
    } catch (e: any) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const stats = user?.stats ?? { tournamentsPlayed: 0, tournamentsWon: 0, totalEarnings: 0, rank: 0, points: 0 }
  const winRate = stats.tournamentsPlayed > 0
    ? Math.round((stats.tournamentsWon / stats.tournamentsPlayed) * 100)
    : 0

  return (
    <div className="pb-20 lg:pb-0 max-w-3xl">
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">My Profile</h1>
        <p className="text-slate-400">Your gamer identity</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Username</label>
                  <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    className="input-glass text-sm py-2" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-glass text-sm py-2" maxLength={10} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-gaming font-bold text-xl text-white">{user?.username}</h2>
                  {user?.isVerified && <CheckCircle className="w-4 h-4 text-green-400" />}
                </div>
                <p className="text-slate-400 text-sm mb-1">{user?.email}</p>
                {user?.phone && <p className="text-slate-500 text-xs mb-3">{user.phone}</p>}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue text-xs font-semibold border border-neon-blue/20">
                    Rank #{stats.rank || '—'}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-xs font-semibold border border-neon-purple/20">
                    {(stats.points || 0).toLocaleString('en-IN')} pts
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={saveProfile} disabled={saving}
                  className="btn-primary px-3 py-2 rounded-xl text-sm flex items-center gap-1.5 disabled:opacity-60">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost px-3 py-2 rounded-xl text-sm">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-ghost px-3 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-1.5 hover:text-white">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tournaments', value: stats.tournamentsPlayed || 0, icon: Trophy, color: 'text-neon-blue' },
          { label: 'Won', value: stats.tournamentsWon || 0, icon: Trophy, color: 'text-yellow-400' },
          { label: 'Total Earned', value: `₹${(stats.totalEarnings || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-neon-purple' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className={`font-gaming font-bold text-lg ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* My Tournaments */}
      {myTournaments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-saffron" /> My Tournaments ({myTournaments.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {myTournaments.map((t: any) => (
              <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] text-sm">
                <span className="text-white font-medium truncate flex-1">{t.title}</span>
                <span className={`ml-3 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  t.status === 'ongoing' ? 'bg-red-400/15 text-red-400' :
                  t.status === 'registration_open' ? 'bg-green-400/15 text-green-400' :
                  'bg-slate-400/15 text-slate-400'
                }`}>{t.status?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
            {user?.referralCode ?? '—'}
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
