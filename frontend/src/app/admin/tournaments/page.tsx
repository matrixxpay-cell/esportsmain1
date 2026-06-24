'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, Trophy, Users, Calendar, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  ongoing: 'text-red-400 bg-red-400/10', registration_open: 'text-green-400 bg-green-400/10',
  upcoming: 'text-yellow-400 bg-yellow-400/10', completed: 'text-slate-400 bg-slate-400/10',
  cancelled: 'text-red-500 bg-red-500/10',
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.getTournaments()
      setTournaments(data || [])
    } catch { toast.error('Failed to load tournaments') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await adminService.deleteTournament(id)
      toast.success('Tournament deleted')
      setTournaments(t => t.filter(x => x._id !== id))
    } catch (e: any) { toast.error(e.message || 'Delete failed') }
  }

  const filtered = statusFilter === 'all' ? tournaments : tournaments.filter(t => t.status === statusFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl mb-1">Tournament Management</h1>
          <p className="text-slate-400 text-sm">Create and manage all platform tournaments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-ghost flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/admin/tournaments/create"
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
            <Plus className="w-4 h-4" /> Create Tournament
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'ongoing', 'registration_open', 'upcoming', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? 'bg-saffron/20 text-saffron border border-saffron/30' : 'glass-card text-slate-400 hover:text-white'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading tournaments...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No tournaments found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold text-saffron bg-orange-400/15">{t.game}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[t.status] ?? 'text-slate-400 bg-slate-400/10'}`}>
                      {t.status?.replace('_', ' ')}
                    </span>
                    {t.entryFee === 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/15 text-green-400 font-medium">FREE</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 font-medium">₹{t.entryFee}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.registrations?.length ?? 0}/{t.maxSlots} players</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(t.startDate).toLocaleDateString('en-IN')}</span>
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-saffron" /> ₹{t.prizePool?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/tournaments/${t._id}/view`}
                    className="p-2 rounded-xl glass-card hover:border-neon-blue/30 text-slate-400 hover:text-neon-blue transition-all">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/admin/tournaments/${t._id}/edit`}
                    className="p-2 rounded-xl glass-card hover:border-yellow-400/30 text-slate-400 hover:text-yellow-400 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(t._id, t.title)}
                    className="p-2 rounded-xl glass-card hover:border-red-400/30 text-slate-400 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all bg-saffron"
                  style={{ width: `${Math.min(100, ((t.registrations?.length ?? 0) / t.maxSlots) * 100)}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
