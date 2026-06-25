'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, IndianRupee, Shield, Medal, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { tournamentService } from '@/services/tournamentService'
import { useAuthStore } from '@/store/authStore'
import { GAMES } from '@/constants/games'
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

export default function TournamentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    tournamentService.getTournament(id as string)
      .then(t => {
        setTournament(t)
        if (user && t.participants) {
          setIsRegistered(t.participants.some((p: any) => p.userId === user._id || p.userId?._id === user._id))
        }
        setLoading(false)
      })
      .catch(() => { toast.error('Tournament not found'); router.push('/dashboard/tournaments') })
  }, [id])

  const handleRegister = async () => {
    if (!user) { router.push('/auth/login'); return }
    setRegistering(true)
    try {
      await tournamentService.register(id as string)
      toast.success('Successfully registered!')
      setIsRegistered(true)
      const t = await tournamentService.getTournament(id as string)
      setTournament(t)
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

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
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {[
                { icon: Trophy, label: 'Prize Pool', value: `₹${tournament.prizePool?.toLocaleString('en-IN')}`, color: 'text-neon-blue' },
                { icon: IndianRupee, label: 'Entry Fee', value: tournament.type === 'free' ? 'FREE' : `₹${tournament.entryFee}`, color: tournament.type === 'free' ? 'text-green-400' : 'text-yellow-400' },
                { icon: Users, label: 'Mode', value: tournament.gameMode?.toUpperCase(), color: 'text-neon-purple' },
                { icon: Calendar, label: 'Start Date', value: new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'text-slate-300' },
                { icon: Clock, label: 'Reg. Deadline', value: new Date(tournament.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), color: 'text-slate-300' },
                { icon: Shield, label: 'Max Slots', value: `${filled} / ${tournament.maxSlots}`, color: 'text-slate-300' },
              ].map(({ icon: Icon, label, value, color: c }) => (
                <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <Icon className={`w-4 h-4 ${c} mb-1.5`} />
                  <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                  <div className={`font-semibold text-sm ${c}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Slot progress */}
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

          {/* Description */}
          {tournament.description && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-3">About This Tournament</h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{tournament.description}</p>
            </motion.div>
          )}

          {/* Rules */}
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
                <button onClick={handleRegister} disabled={registering}
                  className="btn-primary w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60">
                  {registering ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trophy className="w-4 h-4" />}
                  {registering ? 'Registering...' : 'Register Now'}
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
                {tournament.prizeDistribution.map((p: any) => (
                  <div key={p.position} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                    <span className="text-sm text-slate-300">
                      {Number(p.position) === 1 ? '🥇 1st' : Number(p.position) === 2 ? '🥈 2nd' : Number(p.position) === 3 ? '🥉 3rd' : `#${p.position}`} Place
                    </span>
                    <div className="text-right">
                      <div className="text-green-400 font-gaming font-bold text-sm">₹{(p.amount || 0).toLocaleString('en-IN')}</div>
                      <div className="text-slate-500 text-xs">{p.percentage}%</div>
                    </div>
                  </div>
                ))}
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
                      {(p.username || p.userId?.username || '?')[0]?.toUpperCase()}
                    </div>
                    <span className="text-slate-300 truncate">{p.username || p.userId?.username || 'Player'}</span>
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
  )
}
