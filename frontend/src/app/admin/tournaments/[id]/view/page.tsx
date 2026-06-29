'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, Trash2, Users, Calendar, Trophy, IndianRupee, GamepadIcon, Send, Copy, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminService'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminTournamentViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [roomId, setRoomId] = useState('')
  const [roomPass, setRoomPass] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.getTournament(id as string).then(t => {
      if (!t) { setError('Tournament not found'); setLoading(false); return }
      setTournament(t)
      setRoomId(t.roomId || '')
      setRoomPass(t.roomPassword || '')
      setLoading(false)
    }).catch((e: any) => {
      setError(e?.response?.data?.message || e?.message || 'Failed to load tournament')
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this tournament? This cannot be undone.')) return
    try {
      await adminService.deleteTournament(id as string)
      router.push('/admin/tournaments')
    } catch { alert('Delete failed') }
  }

  const handleSendRoomDetails = async () => {
    if (!roomId.trim()) { toast.error('Enter Room ID first'); return }
    setSending(true)
    try {
      await api.post(`/tournaments/${id}/room-details`, { roomId: roomId.trim(), roomPassword: roomPass.trim() })
      toast.success(`Room details sent to all ${participants.length} participants!`)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send room details')
    } finally {
      setSending(false)
    }
  }

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopied(email)
    setTimeout(() => setCopied(''), 2000)
  }

  const copyAllEmails = () => {
    const emails = participants.map((p: any) => p.email || p.username).join(', ')
    navigator.clipboard.writeText(emails)
    toast.success('All emails copied!')
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>
  if (!tournament) return (
    <div className="text-center py-20">
      <p className="text-slate-400 mb-4">{error || 'Tournament not found.'}</p>
      <Link href="/admin/tournaments" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white">Back</Link>
    </div>
  )

  const participants = tournament.participants || []
  const filled = participants.length

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
          <Link href={`/admin/tournaments/${id}/brackets`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-saffron/10 text-saffron border border-saffron/20 hover:bg-saffron/20 transition-colors">
            <Trophy className="w-4 h-4" /> Brackets
          </Link>
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
          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Tournament Info</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: GamepadIcon, label: 'Game', value: tournament.game },
                { icon: Trophy, label: 'Prize Pool', value: `₹${tournament.prizePool?.toLocaleString('en-IN')}` },
                { icon: Users, label: 'Slots', value: `${filled} / ${tournament.maxSlots}` },
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
          </motion.div>

          {/* Room ID Sender */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-card rounded-2xl p-6 border border-saffron/20">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-saffron" /> Send Room ID to Players
            </h2>
            <p className="text-slate-500 text-xs mb-4">Enter room details and broadcast to all {filled} registered participants via their account email</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Room ID *</label>
                <input value={roomId} onChange={e => setRoomId(e.target.value)}
                  placeholder="e.g. BGMI123456" className="input-glass text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Room Password</label>
                <input value={roomPass} onChange={e => setRoomPass(e.target.value)}
                  placeholder="e.g. esports123" className="input-glass text-sm" />
              </div>
            </div>
            <button onClick={handleSendRoomDetails} disabled={sending || filled === 0}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50">
              {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : `Send to ${filled} Players`}
            </button>
          </motion.div>

          {/* Participants */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Registered Teams / Players ({filled})</h2>
              {filled > 0 && (
                <button onClick={copyAllEmails}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-neon-blue transition-colors px-3 py-1.5 rounded-lg glass-card">
                  <Copy className="w-3.5 h-3.5" /> Copy All Emails
                </button>
              )}
            </div>
            {filled > 0 ? (
              <div className="space-y-3">
                {participants.map((p: any, i: number) => {
                  const members = p.teamMembers || []
                  const isTeam = !!p.teamName || members.length > 0
                  return (
                    <div key={i} className="rounded-xl border border-white/[0.06] overflow-hidden">
                      {/* Team/Player Header */}
                      <div className="flex items-center gap-3 p-4 bg-white/[0.02]">
                        <div className="w-10 h-10 rounded-xl bg-saffron/15 flex items-center justify-center text-saffron font-bold text-sm flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm flex items-center gap-2">
                            {p.teamName || p.username || 'Player'}
                            {isTeam && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/10 text-neon-blue font-medium">
                                {members.length + 1} players
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              p.paymentStatus === 'paid' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                            }`}>{p.paymentStatus || 'paid'}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap text-xs">
                            {p.email && <span className="text-slate-400">{p.email}</span>}
                            {p.inGameId && <span className="text-neon-blue">ID: {p.inGameId}</span>}
                            {p.paymentId && <span className="text-slate-600">Pay: {p.paymentId.slice(0, 16)}...</span>}
                            {p.joinedAt && <span className="text-slate-600">{new Date(p.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {p.email && (
                            <button onClick={() => copyEmail(p.email)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-neon-blue transition-colors">
                              {copied === p.email ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Team Members Table */}
                      {isTeam && (
                        <div className="border-t border-white/[0.04]">
                          <div className="grid grid-cols-12 px-4 py-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium bg-white/[0.01]">
                            <div className="col-span-1">#</div>
                            <div className="col-span-3">Role</div>
                            <div className="col-span-3">Username</div>
                            <div className="col-span-2">In-Game ID</div>
                            <div className="col-span-3">Email</div>
                          </div>
                          {/* Captain */}
                          <div className="grid grid-cols-12 px-4 py-2.5 items-center text-xs border-t border-white/[0.03] bg-yellow-400/[0.02]">
                            <div className="col-span-1 text-slate-500">1</div>
                            <div className="col-span-3">
                              <span className="px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-400 text-[10px] font-bold">CAPTAIN</span>
                            </div>
                            <div className="col-span-3 text-white font-medium">{p.username || '—'}</div>
                            <div className="col-span-2 text-neon-blue">{p.inGameId || '—'}</div>
                            <div className="col-span-3 text-slate-400 truncate">{p.email || '—'}</div>
                          </div>
                          {/* Members */}
                          {members.map((m: any, mi: number) => (
                            <div key={mi} className={`grid grid-cols-12 px-4 py-2.5 items-center text-xs border-t border-white/[0.03] ${
                              m.isSubstitute ? 'bg-orange-400/[0.02]' : ''
                            }`}>
                              <div className="col-span-1 text-slate-500">{mi + 2}</div>
                              <div className="col-span-3">
                                {m.isSubstitute ? (
                                  <span className="px-1.5 py-0.5 rounded bg-orange-400/15 text-orange-400 text-[10px] font-bold">SUB</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-neon-blue/15 text-neon-blue text-[10px] font-bold">PLAYER</span>
                                )}
                              </div>
                              <div className="col-span-3 text-white">{m.username || m.inGameId || '—'}</div>
                              <div className="col-span-2 text-neon-blue">{m.inGameId || '—'}</div>
                              <div className="col-span-3 text-slate-400 truncate">{m.email || '—'}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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
              <div className="h-full bg-saffron rounded-full" style={{ width: `${Math.min(100, (filled / tournament.maxSlots) * 100)}%` }} />
            </div>
            <p className="text-slate-500 text-xs mt-2">{filled} / {tournament.maxSlots} slots filled</p>
          </motion.div>

          {/* Prize Distribution */}
          {tournament.prizeDistribution?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-white mb-3">Prize Distribution</h2>
              <div className="space-y-2">
                {tournament.prizeDistribution.map((p: any) => {
                  const pos = Number(p.position)
                  return (
                    <div key={pos} className="flex justify-between text-sm p-2 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-300">{pos === 1 ? '🥇 1st' : pos === 2 ? '🥈 2nd' : pos === 3 ? '🥉 3rd' : `#${pos}th`} Place</span>
                      <span className="text-green-400 font-bold">₹{(p.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
