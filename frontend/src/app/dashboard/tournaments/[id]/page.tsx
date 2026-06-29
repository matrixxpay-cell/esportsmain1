'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy, Users, Calendar, IndianRupee, Shield, Medal, Clock, CheckCircle, AlertCircle, X, Gamepad2, UserCircle2, Search, Swords, ChevronRight } from 'lucide-react'
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
  const [rzpKey, setRzpKey] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '')

  useEffect(() => {
    if (tournament.entryFee > 0) {
      api.get('/content/config/razorpay-key').then(r => {
        if (r.data?.data?.keyId) setRzpKey(r.data.data.keyId)
      }).catch(() => {})
    }
  }, [tournament.entryFee])

  const updatePlayer = (i: number, field: string, val: string | boolean) => {
    const next = [...players]; next[i] = { ...next[i], [field]: val }; setPlayers(next)
  }

  const updateSub = (i: number, field: string, val: string | boolean) => {
    const next = [...subs]; next[i] = { ...next[i], [field]: val }; setSubs(next)
  }

  const lookupMlbbUsername = async (i: number, isSub: boolean = false) => {
    const list = isSub ? subs : players
    const p = list[i]
    if (!p.inGameId.trim() || !p.zone?.trim()) { toast.error('Enter User ID and Zone'); return }

    const updater = isSub ? updateSub : updatePlayer
    updater(i, 'lookingUp', true)

    try {
      const { default: api } = await import('@/services/api')
      const res = await api.get('/tournaments/lookup/mlbb', { params: { id: p.inGameId.trim(), zone: p.zone.trim() } })
      const nickname = res.data?.data?.nickname
      if (nickname) {
        updater(i, 'username', nickname)
        updater(i, 'inGameId', p.inGameId.trim())
        // username shown inline in form
      } else {
        toast.error('Player not found. Check User ID and Zone.')
      }
    } catch (e: any) {
      toast.error(e instanceof Error ? e.message : 'Player not found. Check User ID and Zone.')
    } finally {
      updater(i, 'lookingUp', false)
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

    const registrationData = {
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
    }

    setSubmitting(true)
    try {
      const res = await api.post(`/tournaments/${tournament._id}/register`, registrationData)
      const data = res.data?.data

      if (data?.orderId) {
        const options = {
          key: rzpKey,
          amount: data.amount,
          currency: data.currency || 'INR',
          name: 'EsportsG',
          description: `Entry Fee: ${tournament.title}`,
          order_id: data.orderId,
          handler: async function (response: any) {
            try {
              await api.post(`/tournaments/${tournament._id}/confirm-payment`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                inGameId: registrationData.inGameId,
                teamName: registrationData.teamName,
                teamMembers: registrationData.teamMembers,
              })
              toast.success('Payment successful! You are registered.')
              onSuccess()
            } catch (err: any) {
              toast.error(err?.response?.data?.message || err?.message || 'Payment confirmation failed')
            }
          },
          prefill: { email: user?.email },
          theme: { color: '#FF6B2B' },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled')
            },
          },
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', function (resp: any) {
          toast.error(resp.error?.description || 'Payment failed')
        })
        rzp.open()
      } else {
        toast.success('Successfully registered!')
        onSuccess()
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Registration failed')
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
                        disabled={p.lookingUp || !p.inGameId.trim() || !p.zone?.trim()}
                        className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-saffron/20 text-saffron hover:bg-saffron/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {p.lookingUp ? <span className="w-3 h-3 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        {p.lookingUp ? 'Looking up...' : 'Lookup Username'}
                      </button>
                      <input value={p.username || ''} readOnly
                        placeholder="Username (auto-filled after lookup)"
                        className="input-glass text-sm !bg-saffron/5 !border-saffron/20 text-saffron font-medium placeholder:text-slate-500 placeholder:font-normal" />
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
                          disabled={s.lookingUp || !s.inGameId.trim() || !s.zone?.trim()}
                          className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg bg-saffron/20 text-saffron hover:bg-saffron/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {s.lookingUp ? <span className="w-3 h-3 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          {s.lookingUp ? 'Looking up...' : 'Lookup Username'}
                        </button>
                        <input value={s.username || ''} readOnly
                          placeholder="Username (auto-filled after lookup)"
                          className="input-glass text-sm !bg-saffron/5 !border-saffron/20 text-saffron font-medium placeholder:text-slate-500 placeholder:font-normal" />
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
            {/* Status / Register CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="glass-card rounded-2xl p-5">
              {tournament.status === 'completed' ? (
                <div className="text-center py-2">
                  {(() => {
                    const finalMatch = tournament.brackets?.find((m: any) => m.roundName === 'Final' && m.status === 'completed')
                    const winnerName = finalMatch
                      ? (finalMatch.team1?.participantIndex === finalMatch.winner ? finalMatch.team1?.teamName : finalMatch.team2?.teamName)
                      : null
                    const myTeam = tournament.participants?.find((p: any) =>
                      p.userId === user?._id || p.userId?._id === user?._id || p.userId?.toString() === user?._id
                    )
                    const myIndex = tournament.participants?.indexOf(myTeam)
                    const isWinner = finalMatch && finalMatch.winner === myIndex
                    return (
                      <>
                        <Trophy className={`w-10 h-10 mx-auto mb-2 ${isWinner ? 'text-yellow-400' : 'text-slate-400'}`} />
                        <p className="font-gaming font-bold text-lg text-white mb-1">Tournament Completed</p>
                        {winnerName && (
                          <p className="text-yellow-400 font-semibold text-sm mb-1">🏆 Winner: {winnerName}</p>
                        )}
                        {isRegistered && (
                          <p className={`text-xs mt-1 ${isWinner ? 'text-yellow-400' : 'text-slate-500'}`}>
                            {isWinner ? 'Congratulations! You won!' : 'Better luck next time!'}
                          </p>
                        )}
                      </>
                    )
                  })()}
                </div>
              ) : isRegistered ? (
                <div className="text-center py-2">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-semibold">You're Registered!</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {tournament.status === 'ongoing' ? 'Tournament is Live — check your bracket progress below' : 'Room ID will be shared before match starts'}
                  </p>
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

            {/* Your Team Progress */}
            {isRegistered && (() => {
              const myTeam = tournament.participants?.find((p: any) =>
                p.userId === user?._id || p.userId?._id === user?._id || p.userId?.toString() === user?._id
              )
              if (!myTeam) return null
              const isTeam = ['duo', 'squad', '5v5'].includes(tournament.gameMode)
              const members = myTeam.teamMembers || []
              const myIndex = tournament.participants?.indexOf(myTeam)

              const myMatches = (tournament.brackets || []).filter((m: any) =>
                m.team1?.participantIndex === myIndex || m.team2?.participantIndex === myIndex
              ).sort((a: any, b: any) => (a.round || 0) - (b.round || 0))

              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="glass-card rounded-2xl p-5">
                  <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Swords className="w-4 h-4 text-saffron" /> Your Team
                  </h2>

                  {/* Team info */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 mb-4">
                    <div className="text-white font-semibold text-sm flex items-center gap-2 mb-1">
                      {isTeam && myTeam.teamName ? myTeam.teamName : (myTeam.username || 'Player')}
                      {isTeam && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-neon-blue/10 text-neon-blue">
                          {members.length + 1} players
                        </span>
                      )}
                    </div>
                    {myTeam.inGameId && <div className="text-neon-blue text-xs mb-2">ID: {myTeam.inGameId}</div>}

                    {isTeam && members.length > 0 && (
                      <div className="space-y-1 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-5 h-5 rounded bg-yellow-400/15 flex items-center justify-center text-yellow-400 text-[9px] font-bold">C</div>
                          <span className="text-slate-300">{myTeam.username || 'Captain'}</span>
                          {myTeam.inGameId && <span className="text-slate-600 ml-auto">#{myTeam.inGameId}</span>}
                        </div>
                        {members.map((m: any, mi: number) => (
                          <div key={mi} className="flex items-center gap-2 text-xs">
                            <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${
                              m.isSubstitute ? 'bg-orange-400/15 text-orange-400' : 'bg-neon-blue/15 text-neon-blue'
                            }`}>{m.isSubstitute ? 'S' : mi + 2}</div>
                            <span className="text-slate-300">{m.username || m.inGameId || `Player ${mi + 2}`}</span>
                            {m.inGameId && <span className="text-slate-600 ml-auto">#{m.inGameId}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bracket Progress */}
                  {myMatches.length > 0 ? (
                    <div>
                      <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Bracket Progress</h3>
                      <div className="space-y-2">
                        {myMatches.map((match: any) => {
                          const isTeam1 = match.team1?.participantIndex === myIndex
                          const myName = isTeam1 ? (match.team1?.teamName || 'You') : (match.team2?.teamName || 'You')
                          const oppName = isTeam1 ? (match.team2?.teamName || 'TBD') : (match.team1?.teamName || 'TBD')
                          const myScore = isTeam1 ? match.team1?.score : match.team2?.score
                          const oppScore = isTeam1 ? match.team2?.score : match.team1?.score
                          const matchDone = match.status === 'completed' || match.winner !== undefined && match.winner !== null
                          const myParticipantIndex = isTeam1 ? match.team1?.participantIndex : match.team2?.participantIndex
                          const won = matchDone && match.winner === myParticipantIndex
                          const lost = matchDone && !won
                          const isBye = match.isBye

                          return (
                            <div key={match.matchNumber} className={`rounded-xl border p-3 ${
                              won ? 'border-green-400/20 bg-green-400/5' :
                              lost ? 'border-red-400/20 bg-red-400/5' :
                              isBye ? 'border-slate-500/20 bg-white/[0.02]' :
                              'border-saffron/20 bg-saffron/5'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-slate-500 uppercase font-medium">
                                  {match.roundName || `Round ${match.round}`}
                                </span>
                                {isBye ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-400/10 text-slate-400 font-medium">BYE</span>
                                ) : won ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-400/10 text-green-400 font-medium">WON</span>
                                ) : lost ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 font-medium">LOST</span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-saffron/10 text-saffron font-medium">UPCOMING</span>
                                )}
                              </div>
                              {isBye ? (
                                <div className="text-sm text-slate-400">Auto-advanced (bye)</div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className={`font-medium ${won ? 'text-green-400' : lost ? 'text-red-400' : 'text-white'}`}>{myName}</span>
                                  {matchDone && (
                                    <span className="text-xs text-slate-500">{myScore ?? 0} - {oppScore ?? 0}</span>
                                  )}
                                  <ChevronRight className="w-3 h-3 text-slate-600" />
                                  <span className="text-slate-400">{oppName}</span>
                                </div>
                              )}
                              {match.roomId && (
                                <div className="mt-1.5 pt-1.5 border-t border-white/5 text-xs">
                                  <span className="text-slate-500">Room: </span>
                                  <span className="text-neon-blue font-medium">{match.roomId}</span>
                                  {match.roomPassword && (
                                    <><span className="text-slate-500 ml-2">Pass: </span><span className="text-neon-blue font-medium">{match.roomPassword}</span></>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : tournament.bracketsGenerated ? (
                    <p className="text-slate-500 text-xs text-center py-2">Brackets generated — matches loading...</p>
                  ) : (
                    <p className="text-slate-500 text-xs text-center py-2">Brackets not yet generated by admin</p>
                  )}
                </motion.div>
              )
            })()}

            {/* Participant Count */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-white mb-2">Participants</h2>
              <p className="text-slate-400 text-sm">{filled} / {tournament.maxSlots} teams registered</p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
