'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, Image, ExternalLink } from 'lucide-react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Sponsor {
  name: string
  logoUrl: string
  website: string
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getContentSponsors().then((data: any) => {
      setSponsors(data && data.length > 0 ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const addSponsor = () => {
    setSponsors([...sponsors, { name: '', logoUrl: '', website: '' }])
  }

  const removeSponsor = (i: number) => {
    setSponsors(sponsors.filter((_, idx) => idx !== i))
  }

  const updateSponsor = (i: number, field: string, value: string) => {
    const next = [...sponsors]
    next[i] = { ...next[i], [field]: value }
    setSponsors(next)
  }

  const handleSave = async () => {
    const valid = sponsors.filter(s => s.name.trim())
    setSaving(true)
    try {
      await adminService.updateContentSponsors(valid)
      toast.success('Sponsors updated!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/content" className="p-2 glass-card rounded-xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="gaming-heading text-2xl mb-1">Sponsors & Partners</h1>
          <p className="text-slate-400 text-sm">Manage homepage sponsor logos and links</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-3">
        {sponsors.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/[0.05] flex items-center justify-center flex-shrink-0 border border-white/10">
                {s.logoUrl ? (
                  <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <Image className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input value={s.name} onChange={e => updateSponsor(i, 'name', e.target.value)}
                  placeholder="Sponsor name" className="input-glass text-sm" />
                <input value={s.logoUrl} onChange={e => updateSponsor(i, 'logoUrl', e.target.value)}
                  placeholder="Logo image URL" className="input-glass text-xs" />
                <input value={s.website} onChange={e => updateSponsor(i, 'website', e.target.value)}
                  placeholder="Website URL (optional)" className="input-glass text-xs" />
              </div>
              <button onClick={() => removeSponsor(i)}
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={addSponsor}
        className="mt-4 w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-400 hover:text-white hover:border-saffron/30 transition-colors">
        <Plus className="w-4 h-4" /> Add Sponsor
      </button>
    </div>
  )
}
