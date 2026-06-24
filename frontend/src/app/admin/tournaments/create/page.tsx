'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Trophy, ArrowLeft, Zap } from 'lucide-react'
import { GAMES } from '@/constants/games'
import { adminService } from '@/services/adminService'

const MODE_LABELS: Record<string, string> = { solo: 'Solo', duo: 'Duo', squad: 'Squad (4)', '5v5': '5v5 Team' }

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  game: z.string().min(1, 'Select a game'),
  gameMode: z.enum(['solo', 'duo', 'squad', '5v5']),
  type: z.enum(['free', 'paid']),
  entryFee: z.number().min(0),
  prizePool: z.number().min(100, 'Minimum prize pool is ₹100'),
  maxSlots: z.number().min(2).max(1000),
  registrationDeadline: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  rules: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CreateTournamentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'free', gameMode: 'solo', entryFee: 0 },
  })

  const tournamentType = watch('type')
  const selectedGameId = watch('game')
  const selectedGame = GAMES.find(g => g.id === selectedGameId)
  const availableModes = selectedGame?.modes ?? ['solo', 'duo', 'squad']

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const game = GAMES.find(g => g.id === e.target.value)
    setValue('game', e.target.value)
    if (game && !game.modes.includes(watch('gameMode') as any)) {
      setValue('gameMode', game.modes[0])
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await adminService.createTournament(data)
      toast.success('Tournament created successfully!')
      router.push('/admin/tournaments')
    } catch (e: any) {
      toast.error(e.message || 'Failed to create tournament')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 glass-card rounded-xl text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="gaming-heading text-2xl mb-1">Create Tournament</h1>
          <p className="text-slate-400 text-sm">Set up a new tournament for players</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-saffron" /> Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Tournament Title *</label>
              <input {...register('title')} placeholder="e.g., BGMI Pro League Season 5" className="input-glass" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Description *</label>
              <textarea {...register('description')} rows={3} placeholder="Describe the tournament rules, requirements..." className="input-glass resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Game *</label>
                <select {...register('game')} onChange={handleGameChange} className="input-glass">
                  <option value="">Select Game</option>
                  {GAMES.map(g => <option key={g.id} value={g.id}>{g.shortName}</option>)}
                </select>
                {errors.game && <p className="text-red-400 text-xs mt-1">{errors.game.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Mode *</label>
                <select {...register('gameMode')} className="input-glass">
                  {availableModes.map(m => (
                    <option key={m} value={m}>{MODE_LABELS[m]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Max Slots *</label>
                <input {...register('maxSlots', { valueAsNumber: true })} type="number" placeholder="100" className="input-glass" />
                {errors.maxSlots && <p className="text-red-400 text-xs mt-1">{errors.maxSlots.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Prize & Entry */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-saffron" /> Prize & Entry
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Type *</label>
              <select {...register('type')} className="input-glass">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {tournamentType === 'paid' && (
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Entry Fee (₹) *</label>
                <input {...register('entryFee', { valueAsNumber: true })} type="number" placeholder="499" className="input-glass" />
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Prize Pool (₹) *</label>
              <input {...register('prizePool', { valueAsNumber: true })} type="number" placeholder="50000" className="input-glass" />
              {errors.prizePool && <p className="text-red-400 text-xs mt-1">{errors.prizePool.message}</p>}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Registration Deadline *</label>
              <input {...register('registrationDeadline')} type="datetime-local" className="input-glass" />
              {errors.registrationDeadline && <p className="text-red-400 text-xs mt-1">{errors.registrationDeadline.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Start Date *</label>
              <input {...register('startDate')} type="datetime-local" className="input-glass" />
              {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Rules & Guidelines (optional)</h2>
          <textarea {...register('rules')} rows={5} placeholder="Enter tournament rules, prohibited behaviors, dispute resolution process..."
            className="input-glass resize-none" />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={isLoading}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white disabled:opacity-60">
            {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trophy className="w-4 h-4" /> Create Tournament</>}
          </button>
          <button type="button" onClick={() => router.back()}
            className="btn-ghost px-6 py-3 rounded-xl text-slate-300 hover:text-white">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
