'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'

const DEFAULT_STATS = {
  totalPlayers: '50,000+',
  activeTournaments: '120+',
  prizePoolDistributed: '₹1.2Cr+',
  winnersThisWeek: '2,400+',
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    adminService.getHomepageStats()
      .then(data => { if (data) setStats({ ...DEFAULT_STATS, ...data }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMsg(null)
    try {
      await adminService.updateHomepageStats(stats)
      setMsg({ type: 'success', text: 'Stats updated! Homepage will show the new values.' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { key: 'totalPlayers', label: 'Total Players', placeholder: '50,000+', hint: 'Shown in hero section and stats strip' },
    { key: 'activeTournaments', label: 'Active Tournaments', placeholder: '120+', hint: 'Live tournaments count' },
    { key: 'prizePoolDistributed', label: 'Prize Pool Distributed', placeholder: '₹1.2Cr+', hint: 'Total prize money paid out' },
    { key: 'winnersThisWeek', label: 'Winners This Week', placeholder: '2,400+', hint: 'Cash prize claimants this week' },
  ] as const

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-saffron" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Homepage Stats</h1>
        <p className="text-slate-400 text-sm">Edit the stat numbers shown on the homepage hero and stats section.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 max-w-xl">
        <div className="space-y-5 mb-6">
          {fields.map(({ key, label, placeholder, hint }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
              <input
                type="text"
                value={stats[key]}
                placeholder={placeholder}
                onChange={e => setStats(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-saffron/50 text-sm"
              />
              <p className="text-slate-500 text-xs mt-1">{hint}</p>
            </div>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {msg.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {msg.text}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-3 px-6 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Stats</>}
          </button>
          <button
            onClick={() => { setStats(DEFAULT_STATS); setMsg(null) }}
            className="glass-card py-3 px-5 rounded-xl text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset Defaults
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 glass-card rounded-2xl p-5 max-w-xl">
        <h3 className="font-rajdhani font-bold text-white mb-3">Preview</h3>
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ key, label }) => (
            <div key={key} className="bg-dark-800 rounded-xl p-3 text-center">
              <div className="font-rajdhani font-bold text-saffron text-xl">{stats[key] || '—'}</div>
              <div className="text-slate-400 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
