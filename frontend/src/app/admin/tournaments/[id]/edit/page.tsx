'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { GAMES } from '@/constants/games'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  game: z.string().min(1),
  gameMode: z.enum(['solo', 'duo', 'squad']),
  type: z.enum(['free', 'paid']),
  entryFee: z.number().min(0),
  prizePool: z.number().min(100),
  maxSlots: z.number().min(2).max(1000),
  registrationDeadline: z.string(),
  startDate: z.string(),
  rules: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function EditTournamentPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(data => {
        const t = data.data
        reset({
          title: t.title, description: t.description, game: t.game,
          gameMode: t.gameMode, type: t.type, entryFee: t.entryFee ?? 0,
          prizePool: t.prizePool, maxSlots: t.maxSlots,
          registrationDeadline: t.registrationDeadline?.slice(0, 16),
          startDate: t.startDate?.slice(0, 16),
          rules: t.rules ?? '',
        })
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Tournament updated!')
      router.push('/admin/tournaments')
    } catch {
      toast.error('Failed to update tournament')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/tournaments" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="gaming-heading text-2xl mb-1">Edit Tournament</h1>
          <p className="text-slate-400 text-sm">Update tournament details</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
            <input {...register('title')} className="input-glass" />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea {...register('description')} rows={3} className="input-glass resize-none" />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Game</label>
              <select {...register('game')} className="input-glass">
                {GAMES.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mode</label>
              <select {...register('gameMode')} className="input-glass">
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
              <select {...register('type')} className="input-glass">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Entry Fee (₹)</label>
              <input {...register('entryFee', { valueAsNumber: true })} type="number" className="input-glass" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prize Pool (₹)</label>
              <input {...register('prizePool', { valueAsNumber: true })} type="number" className="input-glass" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Slots</label>
              <input {...register('maxSlots', { valueAsNumber: true })} type="number" className="input-glass" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Registration Deadline</label>
              <input {...register('registrationDeadline')} type="datetime-local" className="input-glass" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
              <input {...register('startDate')} type="datetime-local" className="input-glass" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Rules (optional)</label>
            <textarea {...register('rules')} rows={3} className="input-glass resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <Link href="/admin/tournaments" className="btn-ghost px-6 py-3 rounded-xl font-semibold">Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
