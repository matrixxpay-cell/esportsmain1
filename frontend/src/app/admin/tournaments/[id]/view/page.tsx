'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, Trash2, Users, Calendar, Trophy, IndianRupee, GamepadIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { tournamentService } from '@/services/tournamentService'
import { useAuthStore } from '@/store/authStore'

export default function AdminTournamentViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tournamentService.getById(id as string).then(t => { setTournament(t); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this tournament? This cannot be undone.')) return
    try {
      await fetch(`/api/tournaments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      router.push('/admin/tournaments')
    } catch { alert('Delete failed') }
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>
  if (!tournament) return (
    <div className="text-center py-20">
      <p className="text-slate-400 mb-4">Tournament not found.</p>
      <Link href="/admin/tournaments" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white">Back to Tournaments</Link>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/tournaments" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="gaming-heading text-2xl mb-1">{tournament.title}</h1>
          <p className="text-slate-400 text-sm">Tournament Details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/tournaments/${id}/edit`}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Edit2 className="w-4 h-4" /> Edit
          </Link>
          <button onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-400/20 hover:bg-red-500/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Tournament Info</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: GamepadIcon, label: 'Game', value: tournament.game },
                { icon: Trophy, label: 'Prize Pool', value: `₹${tournament.prizePool?.toLocaleString('en-IN')}` },
                { icon: Users, label: 'Slots', value: `${tournament.registrations?.length ?? 0} / ${tournament.maxSlots}` },
                { icon: IndianRupee, label: 'Entry Fee', value: tournament.entryFee ? `₹${tournament.entryFee}` : 'FREE' },
                { icon: Calendar, label: 'Start Date', value: new Date(tournament.startDate).toLocaleDateString('en-IN') },
                { icon: Calendar, label: 'Deadline', value: new Date(tournament.registrationDeadline).toLocaleDateString('en-IN') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                  <Icon className="w-4 h-4 text-saffron flex-shrink-0" />
                  <div>
                    <div className="text-slate-500 text-xs">{label}</div>
                    <div className="text-white font-medium">{value}</div>
                  </div>
                </div>
              ))}
            </div>
            {tournament.description && (
              <div className="mt-4 p-3 rounded-xl bg-white/[0.02]">
                <div className="text-slate-500 text-xs mb-1">Description</div>
                <p className="text-slate-300 text-sm">{tournament.description}</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Registered Players ({tournament.registrations?.length ?? 0})</h2>
            {tournament.registrations?.length > 0 ? (
              <div className="space-y-2">
                {tournament.registrations.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] text-sm">
                    <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center text-saffron font-bold text-xs">
                      {r.user?.username?.[0]?.toUpperCase() ?? '#'}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{r.user?.username ?? 'Unknown'}</div>
                      <div className="text-slate-500 text-xs">{r.user?.email}</div>
                    </div>
                    <div className="text-slate-400 text-xs">{new Date(r.registeredAt).toLocaleDateString('en-IN')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-6">No registrations yet.</p>
            )}
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-3">Status</h2>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              tournament.status === 'ongoing' ? 'bg-red-400/15 text-red-400' :
              tournament.status === 'registration_open' ? 'bg-green-400/15 text-green-400' :
              tournament.status === 'upcoming' ? 'bg-yellow-400/15 text-yellow-400' :
              'bg-slate-400/15 text-slate-400'
            }`}>{tournament.status?.replace('_', ' ')}</span>
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-saffron rounded-full" style={{ width: `${Math.min(100, ((tournament.registrations?.length ?? 0) / tournament.maxSlots) * 100)}%` }} />
            </div>
            <p className="text-slate-500 text-xs mt-2">{tournament.registrations?.length ?? 0} / {tournament.maxSlots} slots filled</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
