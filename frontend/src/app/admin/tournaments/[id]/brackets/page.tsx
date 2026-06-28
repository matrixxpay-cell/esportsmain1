'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shuffle, Trophy, Users, Send, Play, RotateCcw, ChevronRight, Crown, Award, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

type Team = { participantIndex?: number; teamName?: string; score?: number; stats?: any }
type Match = {
  matchNumber: number; round: number; roundName: string
  team1?: Team; team2?: Team; winner?: number
  isBye?: boolean; nextMatchNumber?: number
  roomId?: string; roomPassword?: string; roomDetailsSent?: boolean
  status: string
}

export default function BracketsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [tournament, setTournament] = useState<any>(null)
  const [bracketData, setBracketData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [demoCount, setDemoCount] = useState(8)
  const [shuffle, setShuffle] = useState(true)
  const [thirdPlace, setThirdPlace] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [resultModal, setResultModal] = useState(false)
  const [roomModal, setRoomModal] = useState(false)
  const [team1Score, setTeam1Score] = useState(0)
  const [team2Score, setTeam2Score] = useState(0)
  const [matchRoomId, setMatchRoomId] = useState('')
  const [matchRoomPass, setMatchRoomPass] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const [t, b] = await Promise.all([
        adminService.getTournament(id as string),
        adminService.getBrackets(id as string),
      ])
      setTournament(t)
      setBracketData(b)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleDemoFill = async () => {
    try {
      await adminService.demoFill(id as string, demoCount)
      toast.success(`Added ${demoCount} demo teams`)
      load()
    } catch (e: any) { toast.error(e.message || 'Failed') }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await adminService.generateBrackets(id as string, { shuffle, thirdPlace })
      toast.success('Brackets generated!')
      load()
    } catch (e: any) { toast.error(e.message || 'Failed') }
    finally { setGenerating(false) }
  }

  const handleReset = async () => {
    if (!confirm('Reset all brackets? This cannot be undone.')) return
    try {
      await adminService.resetBrackets(id as string)
      toast.success('Brackets reset')
      load()
    } catch (e: any) { toast.error(e.message || 'Failed') }
  }

  const openResult = (match: Match) => {
    setSelectedMatch(match)
    setTeam1Score(match.team1?.score || 0)
    setTeam2Score(match.team2?.score || 0)
    setResultModal(true)
  }

  const openRoom = (match: Match) => {
    setSelectedMatch(match)
    setMatchRoomId(match.roomId || '')
    setMatchRoomPass(match.roomPassword || '')
    setRoomModal(true)
  }

  const submitResult = async (winnerIdx: number) => {
    if (!selectedMatch) return
    setSubmitting(true)
    try {
      await adminService.updateMatchResult(id as string, selectedMatch.matchNumber, {
        winner: winnerIdx,
        team1Score,
        team2Score,
      })
      toast.success('Result saved!')
      setResultModal(false)
      load()
    } catch (e: any) { toast.error(e.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const submitRoom = async () => {
    if (!selectedMatch || !matchRoomId.trim()) { toast.error('Enter Room ID'); return }
    setSubmitting(true)
    try {
      const res = await adminService.sendMatchRoom(id as string, selectedMatch.matchNumber, matchRoomId.trim(), matchRoomPass.trim())
      toast.success(res.message || 'Room details sent!')
      setRoomModal(false)
      load()
    } catch (e: any) { toast.error(e.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>
  if (!tournament) return <div className="text-slate-400 text-center py-20">Tournament not found</div>

  const participants = tournament.participants || []
  const hasParticipants = participants.length > 0
  const bracketsGenerated = bracketData?.bracketsGenerated
  const rounds = bracketData?.rounds || {}
  const roundNames = Object.keys(rounds)

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/tournaments/${id}/view`} className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="gaming-heading text-xl mb-0.5">{tournament.title}</h1>
          <p className="text-slate-400 text-sm">Fixtures & Brackets</p>
        </div>
        {bracketsGenerated && (
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-400/20 hover:bg-red-500/20 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      {/* Pre-bracket: Demo Fill + Generate */}
      {!bracketsGenerated && (
        <div className="space-y-6">
          {/* Demo Fill Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 border border-neon-purple/20">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-purple" /> Demo Mode
            </h2>
            <p className="text-slate-500 text-xs mb-4">Fill tournament with demo teams for testing brackets</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Number of teams</label>
                <input type="number" value={demoCount} onChange={e => setDemoCount(parseInt(e.target.value) || 2)}
                  min={2} max={128} className="input-glass text-sm" />
              </div>
              <button onClick={handleDemoFill} disabled={hasParticipants}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 whitespace-nowrap">
                Fill Demo Teams
              </button>
            </div>
            {hasParticipants && (
              <p className="text-yellow-400 text-xs mt-3">
                ⚠️ Tournament already has {participants.length} participants registered
              </p>
            )}
          </motion.div>

          {/* Generate Brackets Card */}
          {hasParticipants && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 border border-saffron/20">
              <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-saffron" /> Generate Fixtures
              </h2>
              <p className="text-slate-500 text-xs mb-4">
                {participants.length} teams registered • Bracket size: {Math.pow(2, Math.ceil(Math.log2(participants.length)))}
                {participants.length < Math.pow(2, Math.ceil(Math.log2(participants.length))) &&
                  ` (${Math.pow(2, Math.ceil(Math.log2(participants.length))) - participants.length} byes)`
                }
              </p>
              <div className="flex flex-wrap gap-4 mb-5">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-saffron focus:ring-saffron" />
                  <Shuffle className="w-4 h-4" /> Shuffle seeding
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={thirdPlace} onChange={e => setThirdPlace(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-saffron focus:ring-saffron" />
                  <Award className="w-4 h-4" /> 3rd place match
                </label>
              </div>
              <button onClick={handleGenerate} disabled={generating}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50">
                {generating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
                {generating ? 'Generating...' : 'Generate Brackets'}
              </button>
            </motion.div>
          )}

          {/* Participants List */}
          {hasParticipants && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-3">Registered Teams ({participants.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {participants.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] text-sm">
                    <div className="w-7 h-7 rounded-lg bg-saffron/20 flex items-center justify-center text-saffron font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-white truncate text-xs">{p.teamName || p.username}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Bracket View */}
      {bracketsGenerated && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Round {bracketData.currentRound} of {bracketData.totalRounds}</span>
              <span className="text-xs text-slate-500">{tournament.status === 'completed' ? '✅ Tournament Complete' : '🔴 Ongoing'}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-saffron to-yellow-400 rounded-full transition-all"
                style={{ width: `${(bracketData.currentRound / bracketData.totalRounds) * 100}%` }} />
            </div>
          </div>

          {/* Rounds */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: roundNames.length * 280 }}>
              {roundNames.map((roundName, ri) => (
                <div key={roundName} className="flex-shrink-0" style={{ width: 260 }}>
                  <div className={`text-center mb-4 px-3 py-2 rounded-xl text-sm font-semibold ${
                    roundName === 'Final' ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/20' :
                    roundName === '3rd Place' ? 'bg-orange-400/15 text-orange-400 border border-orange-400/20' :
                    roundName === 'Semi Final' ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/20' :
                    'bg-white/[0.05] text-slate-300 border border-white/10'
                  }`}>
                    {roundName === 'Final' && <Crown className="w-4 h-4 inline mr-1" />}
                    {roundName}
                  </div>

                  <div className="space-y-3">
                    {(rounds[roundName] || []).map((match: Match) => {
                      const t1 = match.team1
                      const t2 = match.team2
                      const isCompleted = match.status === 'completed'
                      const canPlay = match.status === 'pending' &&
                        t1?.participantIndex !== undefined &&
                        t2?.participantIndex !== undefined &&
                        !match.isBye

                      return (
                        <motion.div key={match.matchNumber}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: ri * 0.05 }}
                          className={`rounded-xl border overflow-hidden ${
                            isCompleted ? 'border-green-400/20 bg-green-400/[0.03]' :
                            match.isBye ? 'border-white/5 bg-white/[0.01] opacity-60' :
                            canPlay ? 'border-saffron/30 bg-saffron/[0.03]' :
                            'border-white/10 bg-white/[0.02]'
                          }`}>
                          {/* Match header */}
                          <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/5">
                            <span className="text-[10px] text-slate-500 font-medium">Game {match.matchNumber}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              isCompleted ? 'bg-green-400/15 text-green-400' :
                              match.isBye ? 'bg-slate-400/15 text-slate-500' :
                              canPlay ? 'bg-saffron/15 text-saffron' :
                              'bg-white/10 text-slate-500'
                            }`}>
                              {isCompleted ? 'Done' : match.isBye ? 'BYE' : canPlay ? 'Ready' : 'Waiting'}
                            </span>
                          </div>

                          {/* Team 1 */}
                          <div className={`flex items-center justify-between px-3 py-2 ${
                            isCompleted && match.winner === t1?.participantIndex ? 'bg-green-400/[0.06]' : ''
                          }`}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {isCompleted && match.winner === t1?.participantIndex && (
                                <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm truncate ${
                                t1?.teamName ? 'text-white' : 'text-slate-600'
                              }`}>
                                {t1?.teamName || (match.isBye ? '— BYE —' : 'TBD')}
                              </span>
                            </div>
                            {isCompleted && t1?.score !== undefined && (
                              <span className="text-sm font-gaming font-bold text-neon-blue ml-2">{t1.score}</span>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-white/5 mx-3" />

                          {/* Team 2 */}
                          <div className={`flex items-center justify-between px-3 py-2 ${
                            isCompleted && match.winner === t2?.participantIndex ? 'bg-green-400/[0.06]' : ''
                          }`}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {isCompleted && match.winner === t2?.participantIndex && (
                                <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm truncate ${
                                t2?.teamName ? 'text-white' : 'text-slate-600'
                              }`}>
                                {t2?.teamName || (match.isBye ? '— BYE —' : 'TBD')}
                              </span>
                            </div>
                            {isCompleted && t2?.score !== undefined && (
                              <span className="text-sm font-gaming font-bold text-neon-blue ml-2">{t2.score}</span>
                            )}
                          </div>

                          {/* Actions */}
                          {!match.isBye && (canPlay || isCompleted) && (
                            <div className="flex gap-1 px-2 py-2 border-t border-white/5">
                              {canPlay && (
                                <>
                                  <button onClick={() => openRoom(match)}
                                    className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-colors">
                                    <Send className="w-3 h-3" />
                                    {match.roomDetailsSent ? 'Resend Room' : 'Send Room'}
                                  </button>
                                  <button onClick={() => openResult(match)}
                                    className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg bg-saffron/10 text-saffron hover:bg-saffron/20 transition-colors">
                                    <Trophy className="w-3 h-3" /> Enter Result
                                  </button>
                                </>
                              )}
                              {isCompleted && (
                                <div className="flex-1 text-center text-[11px] text-green-400 py-1.5">
                                  ✓ Winner: {match.winner === t1?.participantIndex ? t1?.teamName : t2?.teamName}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setResultModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Enter Match Result</h3>
              <button onClick={() => setResultModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-xs mb-4">{selectedMatch.roundName} — Game {selectedMatch.matchNumber}</p>

            <div className="space-y-4">
              {/* Team 1 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{selectedMatch.team1?.teamName || 'Team 1'}</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Score</label>
                  <input type="number" value={team1Score} onChange={e => setTeam1Score(parseInt(e.target.value) || 0)}
                    className="input-glass text-sm" />
                </div>
              </div>

              <div className="text-center text-slate-500 text-sm font-medium">VS</div>

              {/* Team 2 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{selectedMatch.team2?.teamName || 'Team 2'}</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Score</label>
                  <input type="number" value={team2Score} onChange={e => setTeam2Score(parseInt(e.target.value) || 0)}
                    className="input-glass text-sm" />
                </div>
              </div>

              {/* Select Winner */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Select Winner</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => submitResult(selectedMatch.team1!.participantIndex!)}
                    disabled={submitting}
                    className="p-3 rounded-xl bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20 transition-colors text-sm font-semibold disabled:opacity-50">
                    {submitting ? '...' : `🏆 ${selectedMatch.team1?.teamName}`}
                  </button>
                  <button onClick={() => submitResult(selectedMatch.team2!.participantIndex!)}
                    disabled={submitting}
                    className="p-3 rounded-xl bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20 transition-colors text-sm font-semibold disabled:opacity-50">
                    {submitting ? '...' : `🏆 ${selectedMatch.team2?.teamName}`}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Room Details Modal */}
      {roomModal && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setRoomModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Send Room Details</h3>
              <button onClick={() => setRoomModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 text-xs mb-1">{selectedMatch.roundName} — Game {selectedMatch.matchNumber}</p>
            <p className="text-slate-500 text-xs mb-4">
              {selectedMatch.team1?.teamName} vs {selectedMatch.team2?.teamName}
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Room ID *</label>
                <input value={matchRoomId} onChange={e => setMatchRoomId(e.target.value)}
                  placeholder="e.g. ROOM123456" className="input-glass text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Room Password</label>
                <input value={matchRoomPass} onChange={e => setMatchRoomPass(e.target.value)}
                  placeholder="e.g. pass123" className="input-glass text-sm" />
              </div>
            </div>
            <button onClick={submitRoom} disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50">
              {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Sending...' : 'Send Room Details via Email'}
            </button>
            {selectedMatch.roomDetailsSent && (
              <p className="text-green-400 text-xs mt-3 text-center">✓ Room details were previously sent for this match</p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
