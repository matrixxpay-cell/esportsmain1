'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy, Users, Calendar, IndianRupee, Shield, Medal, Clock, CheckCircle, AlertCircle, X, Gamepad2, UserCircle2, Search } from 'lucide-react'
import { tournamentService } from '@/services/tournamentService'
import { useAuthStore } from '@/store/authStore'
import { GAMES } from '@/constants/games'
import api from '@/services/api'
import toast from 'react-hot-toast'

const GAME_COLORS: Record<string, string> = {
  csgo: '#F4A418', 'mobile-legends': '#00E5FF', bgmi: '#FF6B2B',
  'free-fire': '#FF4E16', valorant: '#FF4655', dota2: '#A84500', efootball: '#1B5E20',
}
const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming', registration_open: 'Registration Open', registration_closed: 'Closed',
  ongoing: 'Live', completed: 'Completed', cancelled: 'Cancelled',
}
const STATUS_COLORS: Record<string, string> = {
  ongoing: 'bg-red-400/15 text-red-400', registration_open: 'bg-green-400/15 text-green-400',
  upcoming: 'bg-yellow-400/15 text-yellow-400', completed: 'bg-slate-400/15 text-slate-400',
  registration_closed: 'bg-slate-400/15 text-slate-400', cancelled: 'bg-red-900/15 text-red-600',
}

const TEAM_SIZES: Record<string, number> = { solo: 1, duo: 2, squad: 4, '5v5': 5 }

function RegistrationModal({ tournament, user, onClose, onSuccess }: any) {
  const isTeam = ['duo', 'squad', '5v5'].includes(tournament.gameMode)
  const isMlbb = tournament.game === 'mobile-legends'
  const teamSize = TEAM_SIZES[tournament.gameMode] || 1
  const maxSubs = tournament.maxSubstitutes || 0

  const [teamName, setTeamName] = useState('')
  const [players, setPlayers] = useState<{ inGameId: string; zone?: string; username?: string; email: string; lookingUp?: boolean }[]>(
    Array(teamSize).fill(null).map(() => ({ inGameId: '', zone: '', username: '', email: '', lookingUp: false }))
  )
  const [subs, setSubs] = useState<{ inGameId: string; zone?: string; username?: string; email: string; lookingUp?: boolean }[]>(
    Array(maxSubs).fill(null).map(() => ({ inGameId: '', zone: '', username: '', email: '', lookingUp: false }))
  )
  const [submitting, setSubmitting] = useState(false)

  const updatePlayer = (i: number, field: string, val: string) => {
    const next = [...players]; next[i] = { ...next[i], [field]: val }; setPlayers(next)
  }

  const updateSub = (i: number, field: string, val: string) => {
    const next = [...subs]; next[i] = { ...next[i], [field]: val }; setSubs(next)
  }

  const lookupMlbbUsername = async (i: number, isSub: boolean = false) => {
    const list = isSub ? subs : players
    const p = list[i]
    if (!p.inGameId.trim() || !p.zone?.trim()) { toast.error('Enter User ID and Zone'); return }

    const updater = isSub ? updateSub : updatePlayer
    updater(i, 'lookingUp', 'true')

    try {
      const res = await fetch(`https://api.isan.eu.org/nickname/ml?id=${p.inGameId.trim()}&zone=${p.zone.trim()}`)
      const data = await res.json()
      if (data.nickname) {
        updater(i, 'username', data.nickname)
        updater(i, 'inGameId', p.inGameId.trim())
        toast.success(`Found: ${data.nickname}`)
      } else {
        toast.error('User not found')
      }
    } catch (e) {
      toast.error('Lookup failed')
    } finally {
      updater(i, 'lookingUp', 'false')
    }
  }

  const handleSubmit = async () => {
    if (isTeam && !teamName.trim()) { toast.error('Enter team name'); return }

    for (let i = 0; i < players.length; i++) {
      if (!players[i].inGameId.trim()) { toast.error(`Enter user ID for Player ${i + 1}`); return }
      if (isMlbb && !players[i].zone?.trim()) { toast.error(`Enter zone for Player ${i + 1}`); return }
      if (!players[i].email.trim()) { toast.error(`Enter email for Player ${i + 1}`); return }
    }

    const filledSubs = subs.filter(s => s.inGameId.trim() || s.email.trim())

    for (const s of filledSubs) {
      if (!s.inGameId.trim()) { toast.error('Each sub needs a user ID'); return }
      if (isMlbb && !s.zone?.trim()) { toast.error('Each sub needs a zone'); return }
      if (!s.email.trim()) { toast.error('Each sub needs an email'); return }
    }

    setSubmitting(true)
    try {
      await api.post(`/tournaments/${tournament._id}/register`, {
        inGameId: players[0].inGameId.trim(),
        playerEmail: players[0].email.trim(),
        teamName: teamName.trim() || undefined,
        teamMembers: players.slice(1).map(p => ({
          inGameId: p.inGameId.trim(),
          email: p.email.trim(),
          ...(isMlbb && { zone: p.zone?.trim(), username: p.username })
        })).concat(
          filledSubs.map(s => ({
            inGameId: s.inGameId.trim(),
            email: s.email.trim(),
            isSubstitute: true,
            ...(isMlbb && { zone: s.zone?.trim(), username: s.username })
          }))
        ),
      })
      toast.success('Successfully registered! 🎉')
      onSuccess()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative glass-card rounded-2xl p-6 w-full max-w-md z-10 border border-saffron/20 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h2 className="font-gaming font-bold text-lg text-white">Register for Tournament</h2>
            <p className="text-slate-400 text-xs mt-0.5">{tournament.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Account Email (read-only) */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Account Email</label>
            <input value={user?.email || ''} readOnly
              className="input-glass opacity-60 cursor-not-allowed text-sm" />
          </div>

          {/* Team Name */}
          {isTeam && (
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Team Name *</label>
              <input value={teamName} onChange={e => setTeamName(e.target.value)}
                placeholder="Team name" className="input-glass text-sm" />
            </div>
          )}

          {/* All Players */}
          <div>
            <label className="block text-xs text-slate-400 mb-2 font-medium">
              {isTeam ? `Players (${teamSize})` : 'Player Details'}
            </label>
            <div className="space-y-3">
              {players.map((p, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-xs text-slate-400">Player {i + 1} *</label>
                  {isMlbb ? (
                    <>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input value={p.inGameId} onChange={e => updatePlayer(i, 'inGameId', e.target.value)}
                          placeholder="User ID"
                          className="input-glass text-sm" />
                        <input value={p.zone || ''} onChange={e => updatePlayer(i, 'zone', e.target.value)}
                          placeholder="Zone"
                          className="input-glass text-sm" />
                      </div>
                      <button type="button" onClick={() => lookupMlbbUsername(i)}
                        disabled={p.lookingUp === 'true' || !p.inGameId.trim() || !p.zone?.trim()}
                        className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-saffron/20 text-saffron hover:bg-saffron/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {p.lookingUp === 'true' ? <span className="w-3 h-3 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        {p.lookingUp === 'true' ? 'Looking up...' : 'Lookup Username'}
                      </button>
                      {p.username && <div className="px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300">Username: <span className="text-saffron font-medium">{p.username}</span></div>}
                    </>
                  ) : (
                    <input value={p.inGameId} onChange={e => updatePlayer(i, 'inGameId', e.target.value)}
                      placeholder="In-game ID"
                      className="input-glass text-sm" />
                  )}
                  <input value={p.email} onChange={e => updatePlayer(i, 'email', e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="input-glass text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes */}
          {maxSubs > 0 && (
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">
                Substitutes (optional, max {maxSubs})
              </label>
              <div className="space-y-3">
                {subs.map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="text-xs text-slate-400">Sub {i + 1}</label>
                    {isMlbb ? (
                      <>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input value={s.inGameId} onChange={e => updateSub(i, 'inGameId', e.target.value)}
                            placeholder="User ID"
                            className="input-glass text-sm" />
                          <input value={s.zone || ''} onChange={e => updateSub(i, 'zone', e.target.value)}
                            placeholder="Zone"
                            className="input-glass text-sm" />
                        </div>
                        <button type="button" onClick={() => lookupMlbbUsername(i, true)}
                          disabled={s.lookingUp === 'true' || !s.inGameId.trim() || !s.zone?.trim()}
                          className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-saffron/20 text-saffron hover:bg-saffron/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {s.lookingUp === 'true' ? <span className="w-3 h-3 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          {s.lookingUp === 'true' ? 'Looking up...' : 'Lookup Username'}
                        </button>
                        {s.username && <div className="px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300">Username: <span className="text-saffron font-medium">{s.username}</span></div>}
                      </>
                    ) : (
                      <input value={s.inGameId} onChange={e => updateSub(i, 'inGameId', e.target.value)}
                        placeholder="In-game ID"
                        className="input-glass text-sm" />
                    )}
                    <input value={s.email} onChange={e => updateSub(i, 'email', e.target.value)}
                      placeholder="Email"
                      type="email"
                      className="input-glass text-sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entry fee info */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-sm">
            <span className="text-slate-400">Entry Fee</span>
            <span className={`font-bold ${tournament.type === 'free' ? 'text-green-400' : 'text-yellow-400'}`}>
              {tournament.type === 'free' ? 'FREE' : `₹${tournament.entryFee}`}
            </span>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="btn-primary w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-4 flex-shrink-0">
          {submitting
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Trophy className="w-4 h-4" />}
          {submitting ? 'Registering...' : 'Confirm Registration'}
        </button>
      </motion.div>
    </div>
  )
}

export default function TournamentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const loadTournament = async () => {
    try {
      const t = await tournamentService.getTournament(id as string)
      setTournament(t)
      if (user && t.participants) {
        setIsRegistered(t.participants.some((p: any) =>
          p.userId === user._id || p.userId?._id === user._id || p.userId?.toString() === user._id
        ))
      }
      setLoading(false)
    } catch {
      toast.error('Tournament not found')
      router.push('/dashboard/tournaments')
    }
  }

  useEffect(() => { loadTournament() }, [id])

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded-xl" />
      <div className="h-64 bg-white/[0.03] rounded-2xl" />
      <div className="h-48 bg-white/[0.03] rounded-2xl" />
    </div>
  )
  if (!tournament) return null

  const game = GAMES.find(g => g.id === tournament.game)
  const color = GAME_COLORS[tournament.game] || '#00D9FF'
  const filled = tournament.filledSlots ?? tournament.participants?.length ?? 0
  const fillPct = Math.min(100, (filled / tournament.maxSlots) * 100)
  const canRegister = tournament.status === 'registration_open' && !isRegistered && filled < tournament.maxSlots

  return (
    <>
      {showModal && tournament && (
        <RegistrationModal
          tournament={tournament}
          user={user}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setIsRegistered(true); loadTournament() }}
        />
      )}

      <div className="pb-20 lg:pb-0 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 glass-card rounded-xl text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ color, background: `${color}20` }}>{game?.shortName ?? tournament.game}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[tournament.status] || ''}`}>
                {STATUS_LABELS[tournament.status]}
              </span>
            </div>
            <h1 className="gaming-heading text-xl sm:text-2xl">{tournament.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                {[
                  { icon: Trophy, label: 'Prize Pool', value: `₹${tournament.prizePool?.toLocaleString('en-IN')}`, color: 'text-neon-blue' },
                  { icon: IndianRupee, label: 'Entry Fee', value: tournament.type === 'free' ? 'FREE' : `₹${tournament.entryFee}`, color: tournament.type === 'free' ? 'text-green-400' : 'text-yellow-400' },
                  { icon: Users, label: 'Mode', value: tournament.gameMode?.toUpperCase(), color: 'text-neon-purple' },
                  { icon: Calendar, label: 'Start Date', value: new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'text-slate-300' },
                  { icon: Clock, label: 'Reg. Deadline', value: new Date(tournament.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), color: 'text-slate-300' },
                  { icon: Shield, label: 'Slots', value: `${filled} / ${tournament.maxSlots}`, color: 'text-slate-300' },
                ].map(({ icon: Icon, label, value, color: c }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <Icon className={`w-4 h-4 ${c} mb-1.5`} />
                    <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                    <div className={`font-semibold text-sm ${c}`}>{value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{filled} registered</span>
                  <span>{tournament.maxSlots - filled} slots left</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${fillPct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                </div>
              </div>
            </motion.div>

            {tournament.description && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-3">About This Tournament</h2>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{tournament.description}</p>
              </motion.div>
            )}

            {tournament.rules && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass-card rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-saffron" /> Rules & Guidelines
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{tournament.rules}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Register CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="glass-card rounded-2xl p-5">
              {isRegistered ? (
                <div className="text-center py-2">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-semibold">You're Registered!</p>
                  <p className="text-slate-500 text-xs mt-1">Room ID will be shared before match starts</p>
                </div>
              ) : canRegister ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-gaming font-bold text-neon-blue mb-1">
                      {tournament.type === 'free' ? 'FREE' : `₹${tournament.entryFee}`}
                    </div>
                    <p className="text-slate-400 text-xs">Entry Fee</p>
                  </div>
                  <button onClick={() => { if (!user) { router.push('/auth/login'); return } setShowModal(true) }}
                    className="btn-primary w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" /> Register Now
                  </button>
                </>
              ) : (
                <div className="text-center py-2">
                  <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 font-medium text-sm">
                    {tournament.status === 'ongoing' ? 'Tournament is Live' :
                     tournament.status === 'completed' ? 'Tournament Ended' :
                     tournament.status === 'registration_closed' ? 'Registration Closed' :
                     filled >= tournament.maxSlots ? 'Tournament Full' : 'Registration Not Open'}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Prize Distribution */}
            {tournament.prizeDistribution?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-5">
                <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-gold" /> Prize Distribution
                </h2>
                <div className="space-y-2">
                  {tournament.prizeDistribution.map((p: any) => {
                    const pos = Number(p.position)
                    const label = pos === 1 ? '🥇 1st' : pos === 2 ? '🥈 2nd' : pos === 3 ? '🥉 3rd' : `#${pos}`
                    return (
                      <div key={p.position} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                        <span className="text-sm text-slate-300">{label} Place</span>
                        <div className="text-right">
                          <div className="text-green-400 font-gaming font-bold text-sm">₹{(p.amount || 0).toLocaleString('en-IN')}</div>
                          <div className="text-slate-500 text-xs">{p.percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Participants */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-white mb-3">
                Participants <span className="text-slate-500 font-normal text-sm">({filled})</span>
              </h2>
              {tournament.participants?.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tournament.participants.slice(0, 20).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-7 h-7 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold text-xs flex-shrink-0">
                        {(p.username || '?')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-300 truncate">{p.teamName || p.username}</div>
                        {p.inGameId && <div className="text-slate-500 text-xs truncate">ID: {p.inGameId}</div>}
                      </div>
                    </div>
                  ))}
                  {filled > 20 && <p className="text-slate-500 text-xs text-center pt-1">+{filled - 20} more</p>}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-4">No participants yet. Be the first!</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
