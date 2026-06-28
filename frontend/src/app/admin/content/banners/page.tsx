'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Image, Save, ExternalLink } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const bannerFields = [
  { key: 'banner_home', label: 'Homepage Banner', desc: 'Main banner displayed on the homepage' },
  { key: 'banner_tournament', label: 'Tournament Page Banner', desc: 'Banner shown on the tournaments listing page' },
  { key: 'banner_promo', label: 'Promotional Banner', desc: 'Promotional banner for special events' },
]

export default function BannersPage() {
  const [banners, setBanners] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings/platform')
      .then(r => {
        const data = r.data.data || {}
        const initial: Record<string, string> = {}
        bannerFields.forEach(f => { initial[f.key] = data[f.key] || '' })
        setBanners(initial)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const saveBanners = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings/platform', banners)
      toast.success('Banners updated')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/content" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="gaming-heading text-xl flex items-center gap-2">
            <Image className="w-6 h-6 text-green-400" /> Banner Management
          </h1>
          <p className="text-slate-400 text-sm">Manage banner image URLs for different pages</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 glass-card rounded-xl animate-pulse" />)}</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {bannerFields.map(field => (
            <div key={field.key} className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white text-sm mb-1">{field.label}</h3>
              <p className="text-slate-500 text-xs mb-3">{field.desc}</p>
              <input value={banners[field.key] || ''} onChange={e => setBanners(b => ({ ...b, [field.key]: e.target.value }))}
                placeholder="https://example.com/banner.jpg" className="input-glass text-sm w-full" />
              {banners[field.key] && (
                <div className="mt-3">
                  <div className="rounded-xl overflow-hidden border border-white/[0.05] bg-white/[0.02]">
                    <img src={banners[field.key]} alt={field.label} className="w-full h-32 object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <a href={banners[field.key]} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-saffron hover:underline mt-2">
                    <ExternalLink className="w-3 h-3" /> Preview URL
                  </a>
                </div>
              )}
            </div>
          ))}

          <button onClick={saveBanners} disabled={saving}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Banners'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
