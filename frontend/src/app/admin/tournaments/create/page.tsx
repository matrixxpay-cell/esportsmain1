'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Trophy, ArrowLeft, Zap, Plus, Trash2, Medal, Users } from 'lucide-react'
import { GAMES } from '@/constants/games'
import { adminService } from '@/services/adminService'

const MODE_LABELS: Record<string, string> = { solo: 'Solo', duo: 'Duo', squad: 'Squad (4)', '5v5': '5v5 Team' }

const prizeSchema = z.object({
  position: z.number().min(1),
  percentage: z.number().min(1).max(100),
})

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(100),
  description: z.string().min(20, 'Min 20 characters'),
  game: z.string().min(1, 'Select a game'),
  gameMode: z.enum(['solo', 'duo', 'squad', '5v5']),
  type: z.enum(['free', 'paid']),
  entryFee: z.number().min(0),
  prizePool: z.number().min(100, 'Min ₹100'),
  maxSlots: z.number().min(2).max(1000),
  maxSubstitutes: z.number().min(0).max(3),
  registrationDeadline: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  rules: z.string().optional(),
  prizeDistribution: z.array(prizeSchema).optional(),
})

type FormData = z.infer<typeof schema>

const POSITION_LABELS: Record<number, string> = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place', 4: '4th Place', 5: '5th Place' }

export default function CreateTournamentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'free', gameMode: 'solo', entryFee: 0, maxSubstitutes: 0,
      prizeDistribution: [
        { position: 1, percentage: 50 },
        { position: 2, percentage: 30 },
        { position: 3, percentage: 20 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'prizeDistribution' })

  const tournamentType = watch('type')
  const selectedGameId = watch('game')
  const prizePool = watch('prizePool') || 0
  const prizeDistribution = watch('prizeDistribution') || []
  const totalPct = prizeDistribution.reduce((s, p) => s + (Number(p.percentage) || 0), 0)
  const selectedGame = GAMES.find(g => g.id === selectedGameId)
  const availableModes = selectedGame?.modes ?? ['solo', 'duo', 'squad', '5v5']
  const showSubstitutes = ['duo', 'squad', '5v5'].includes(watch('gameMode'))

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const game = GAMES.find(g => g.id === e.target.value)
    setValue('game', e.target.value)
    if (game && !game.modes.includes(watch('gameMode') as any)) {
      setValue('gameMode', game.modes[0])
    }
  }

  const onSubmit = async (data: FormData) => {
    if (totalPct !== 100) { toast.error('Prize distribution must total 100%'); return }
    setIsLoading(true)
    try {
      // Convert percentage to amounts
      const dist = (data.prizeDistribution || []).map(p => ({
        position: p.position,
        percentage: p.percentage,
        amount: Math.floor((p.percentage / 100) * data.prizePool),
      }))
      await adminService.createTournament({ ...data, prizeDistribution: dist })
      toast.success('Tournament created!')
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
                  {availableModes.map(m => <option key={m} value={m}>{MODE_LABELS[m]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Max Slots *</label>
                <input {...register('maxSlots', { valueAsNumber: true })} type="number" placeholder="100" className="input-glass" />
                {errors.maxSlots && <p className="text-red-400 text-xs mt-1">{errors.maxSlots.message}</p>}
              </div>
            </div>

            {/* Substitutes — only for team modes */}
            {showSubstitutes && (
              <div className="p-4 rounded-xl border border-neon-blue/20 bg-neon-blue/5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-neon-blue" />
                  <span className="text-sm font-medium text-white">Substitute Players</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1.5">Max Substitutes per Team</label>
                    <select {...register('maxSubstitutes', { valueAsNumber: true })} className="input-glass">
                      <option value={0}>0 — No substitutes allowed</option>
                      <option value={1}>1 substitute</option>
                      <option value={2}>2 substitutes</option>
                      <option value={3}>3 substitutes</option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 flex-1">Substitutes can replace a player if they drop out before the match starts.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prize & Entry */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-saffron" /> Prize & Entry
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

          {/* Prize Distribution */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Medal className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium text-white">Prize Distribution</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${totalPct === 100 ? 'text-green-400' : totalPct > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                  Total: {totalPct}% {totalPct === 100 ? '✓' : '(must be 100%)'}
                </span>
                {fields.length < 5 && (
                  <button type="button"
                    onClick={() => append({ position: fields.length + 1, percentage: 0 })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-saffron/15 text-saffron hover:bg-saffron/25 transition-colors">
                    <Plus className="w-3 h-3" /> Add Position
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const pct = Number(prizeDistribution[index]?.percentage) || 0
                const amount = prizePool ? Math.floor((pct / 100) * prizePool) : 0
                return (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-28 text-sm font-medium text-white flex-shrink-0">
                      {POSITION_LABELS[index + 1] ?? `#${index + 1} Place`}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        {...register(`prizeDistribution.${index}.percentage`, { valueAsNumber: true })}
                        type="number" min="1" max="100" placeholder="%" className="input-glass w-24 text-center"
                      />
                      <span className="text-slate-500 text-sm">%</span>
                      {prizePool > 0 && (
                        <span className="text-green-400 text-sm font-rajdhani font-bold ml-2">
                          = ₹{amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Schedule */}
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
          <button type="button" onClick={() => router.back()} className="btn-ghost px-6 py-3 rounded-xl text-slate-300 hover:text-white">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
