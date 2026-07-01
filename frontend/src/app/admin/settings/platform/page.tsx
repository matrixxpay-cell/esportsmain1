'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Save } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const FIELDS = [
  { key: 'frontend_url', label: 'Frontend URL', placeholder: 'https://esportsg.in', type: 'url' },
  { key: 'platform_name', label: 'Platform Name', placeholder: 'EsportsG', type: 'text' },
  { key: 'platform_tagline', label: 'Tagline', placeholder: 'Play. Compete. Win Real Cash.', type: 'text' },
  { key: 'platform_description', label: 'Short Description', placeholder: 'India Ka Apna Esports Platform', type: 'text' },
  { key: 'contact_email', label: 'Contact Email', placeholder: 'support@esportsg.com', type: 'email' },
  { key: 'contact_phone', label: 'Contact Phone', placeholder: '+91 XXXXXXXXXX', type: 'text' },
  { key: 'discord_link', label: 'Discord Invite Link', placeholder: 'https://discord.gg/...', type: 'url' },
  { key: 'instagram_link', label: 'Instagram Link', placeholder: 'https://instagram.com/...', type: 'url' },
  { key: 'youtube_link', label: 'YouTube Link', placeholder: 'https://youtube.com/...', type: 'url' },
  { key: 'whatsapp_link', label: 'WhatsApp Group Link', placeholder: 'https://chat.whatsapp.com/...', type: 'url' },
  { key: 'referral_bonus', label: 'Referral Bonus (₹)', placeholder: '50', type: 'number' },
  { key: 'min_withdrawal', label: 'Min Withdrawal (₹)', placeholder: '100', type: 'number' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', placeholder: '', type: 'toggle' },
]

export default function PlatformConfigPage() {
  const [form, setForm] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings/platform')
      .then(r => { setForm(r.data.data || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.put('/admin/settings/platform', form)
      setForm(res.data.data || form)
      toast.success('Platform config saved')
    } catch (e: any) { toast.error(e.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="gaming-heading text-xl flex items-center gap-2">
            <Globe className="w-6 h-6 text-saffron" /> Platform Config
          </h1>
          <p className="text-slate-400 text-sm">Configure platform name, social links, and global settings</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />)}</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">General</h3>
            <div className="space-y-3">
              {FIELDS.filter(f => !f.key.includes('link') && f.type !== 'toggle' && f.type !== 'number').map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="input-glass text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Social Links</h3>
            <div className="space-y-3">
              {FIELDS.filter(f => f.key.includes('link')).map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <input type="url" value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="input-glass text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Economy</h3>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.filter(f => f.type === 'number').map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <input type="number" value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="input-glass text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Maintenance Mode</h3>
                <p className="text-slate-500 text-xs mt-0.5">When enabled, users see a maintenance page</p>
              </div>
              <button onClick={() => setForm(p => ({ ...p, maintenance_mode: !p.maintenance_mode }))}
                className={`w-12 h-7 rounded-full transition-colors relative ${form.maintenance_mode ? 'bg-red-500' : 'bg-white/10'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${form.maintenance_mode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Config'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
