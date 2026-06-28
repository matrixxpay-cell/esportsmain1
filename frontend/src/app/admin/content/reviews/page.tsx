'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, Star, Image } from 'lucide-react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Review {
  name: string
  state: string
  game: string
  rating: number
  text: string
  photoUrl: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getContentReviews().then((data: any) => {
      setReviews(data && data.length > 0 ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const addReview = () => {
    setReviews([...reviews, { name: '', state: '', game: '', rating: 5, text: '', photoUrl: '' }])
  }

  const removeReview = (i: number) => {
    setReviews(reviews.filter((_, idx) => idx !== i))
  }

  const updateReview = (i: number, field: string, value: any) => {
    const next = [...reviews]
    next[i] = { ...next[i], [field]: value }
    setReviews(next)
  }

  const handleSave = async () => {
    const valid = reviews.filter(r => r.name.trim() && r.text.trim())
    setSaving(true)
    try {
      await adminService.updateContentReviews(valid)
      toast.success('Reviews updated!')
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
          <h1 className="gaming-heading text-2xl mb-1">Player Reviews</h1>
          <p className="text-slate-400 text-sm">Manage testimonials shown on homepage</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white/[0.05] flex items-center justify-center flex-shrink-0 border border-white/10">
                {r.photoUrl ? (
                  <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg text-slate-500">{r.name ? r.name[0] : '?'}</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input value={r.name} onChange={e => updateReview(i, 'name', e.target.value)}
                    placeholder="Player name" className="input-glass text-sm" />
                  <input value={r.state} onChange={e => updateReview(i, 'state', e.target.value)}
                    placeholder="State/City" className="input-glass text-sm" />
                  <input value={r.game} onChange={e => updateReview(i, 'game', e.target.value)}
                    placeholder="Game (e.g. BGMI)" className="input-glass text-sm" />
                </div>
                <textarea value={r.text} onChange={e => updateReview(i, 'text', e.target.value)}
                  placeholder="Review text..." rows={2} className="input-glass text-sm resize-none" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => updateReview(i, 'rating', star)}>
                        <Star className={`w-4 h-4 ${star <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                  <input value={r.photoUrl} onChange={e => updateReview(i, 'photoUrl', e.target.value)}
                    placeholder="Photo URL (optional)" className="input-glass text-xs flex-1" />
                </div>
              </div>
              <button onClick={() => removeReview(i)}
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={addReview}
        className="mt-4 w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-400 hover:text-white hover:border-saffron/30 transition-colors">
        <Plus className="w-4 h-4" /> Add Review
      </button>
    </div>
  )
}
