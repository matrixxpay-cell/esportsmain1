'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Shuffle, Trophy, Play, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

export default function FixturesPage() {
  const { id } = useParams()
  const router = useRouter()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [demoCount, setDemoCount] = useState('8')
  const [fillingDemo, setFillingDemo] = useState(false)
  const [shuffleSeeding, setShuffleSeeding] = useState(true)
  const [thirdPlace, setThirdPlace] = useState(false)
  const [generating, setGenerating] = useState(false)

  const fetchTournament = () => {
    adminService.getTournament(id as string).then(t => {
      setTournament(t)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchTournament() }, [id])

  const handleFillDemo = async () => {
    const count = parseInt(demoCount)
    if (!count || count < 1) { toast.error('Enter a valid number'); return }
    setFillingDemo(true)
    try {
      const updated = await adminService.fillDemoTeams(id as string, count)
      setTournament(updated)
      toast.success(`Demo teams added!`)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to fill demo teams')
    } finally {
      setFillingDemo(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const updated = await adminService.generateBrackets(id as string, shuffleSeeding, thirdPlace)
      setTournament(updated)
      toast.success('Brackets generated!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to generate brackets')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>
  if (!tournament) return (
    <div className="text-center py-20">
      <p className="text-slate-400 mb-4">Tournament not found.</p>
      <Link href="/admin/tournaments" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white">Back</Link>
    </div>
  )

  const participants = tournament.participants || []
  const filled = participants.length
  const brackets = tournament.brackets || []
  const bracketSize = brackets.length > 0 ? Math.pow(2, Math.ceil(Math.log2(filled))) : 0

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/tournaments/${id}/view`} className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="gaming-heading text-2xl mb-1">{tournament.title}</h1>
          <p className="text-slate-400 text-sm">Fixtures & Brackets</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Demo Mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-saffron" /> Demo Mode
          </h2>
          <p className="text-slate-500 text-xs mb-4">Fill tournament with demo teams for testing brackets</p>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Number of teams</label>
              <input
                type="number"
                value={demoCount}
                onChange={e => setDemoCount(e.target.value)}
                min="1"
                max={tournament.maxSlots - filled}
                className="input-glass text-sm"
              />
            </div>
            <button onClick={handleFillDemo} disabled={fillingDemo || filled >= tournament.maxSlots}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 whitespace-nowrap">
              {fillingDemo ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Users className="w-4 h-4" />}
              Fill Demo Teams
            </button>
          </div>
          {filled > 0 && (
            <p className="text-yellow-400 text-xs mt-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Tournament already has {filled} participants registered
            </p>
          )}
        </motion.div>

        {/* Generate Fixtures */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-saffron" /> Generate Fixtures
          </h2>
          <p className="text-slate-500 text-xs mb-4">
            {filled} teams registered {bracketSize > 0 ? `• Bracket size: ${bracketSize}` : ''}
          </p>
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={shuffleSeeding} onChange={e => setShuffleSeeding(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-saffron accent-saffron" />
              <Shuffle className="w-3.5 h-3.5 text-slate-400" /> Shuffle seeding
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={thirdPlace} onChange={e => setThirdPlace(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-saffron accent-saffron" />
              <Trophy className="w-3.5 h-3.5 text-slate-400" /> 3rd place match
            </label>
          </div>
          <button onClick={handleGenerate} disabled={generating || filled < 2}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50">
            {generating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
            Generate Brackets
          </button>
        </motion.div>

        {/* Bracket Visualization */}
        {brackets.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold text-white mb-4">Tournament Bracket</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-8 min-w-max">
                {Array.from(new Set(brackets.map((b: any) => b.round))).sort((a: any, b: any) => a - b).map((round: any) => {
                  const roundMatches = brackets.filter((b: any) => b.round === round && !b.matchId.includes('3RD'))
                  return (
                    <div key={round} className="flex flex-col gap-4 min-w-[200px]">
                      <h3 className="text-xs text-slate-500 font-semibold uppercase tracking-wider text-center">
                        Round {round}
                      </h3>
                      <div className="flex flex-col justify-around flex-1 gap-4">
                        {roundMatches.map((match: any) => {
                          const p1 = match.player1 ? participants.find((p: any) => p.userId === match.player1 || p.userId?.toString() === match.player1?.toString()) : null
                          const p2 = match.player2 ? participants.find((p: any) => p.userId === match.player2 || p.userId?.toString() === match.player2?.toString()) : null
                          return (
                            <div key={match.matchId} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                              <div className={`p-2.5 text-xs flex justify-between items-center border-b border-white/5 ${match.winner && match.winner.toString() === match.player1?.toString() ? 'bg-green-500/10' : ''}`}>
                                <span className="text-white">{p1?.teamName || p1?.username || 'BYE'}</span>
                              </div>
                              <div className={`p-2.5 text-xs flex justify-between items-center ${match.winner && match.winner.toString() === match.player2?.toString() ? 'bg-green-500/10' : ''}`}>
                                <span className="text-white">{p2?.teamName || p2?.username || 'BYE'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Registered Teams */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold text-white mb-4">Registered Teams ({filled})</h2>
          {filled > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {participants.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] text-sm">
                  <div className="w-8 h-8 rounded-lg bg-saffron/20 flex items-center justify-center text-saffron font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{p.teamName || p.username}</div>
                    {p.teamMembers?.length > 0 && (
                      <div className="text-slate-500 text-xs">{p.teamMembers.length + 1} members</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-6">No teams registered yet.</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
