'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Eye, EyeOff, ArrowUp, ArrowDown, Gamepad2, Image } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { GAMES } from '@/constants/games'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface GameConfig {
  id: string
  name: string
  shortName: string
  color: string
  imageUrl: string
  visible: boolean
  order: number
}

export default function AdminGamesDisplayPage() {
  const [games, setGames] = useState<GameConfig[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getContentGames().then((data: any) => {
      if (data && data.length > 0) {
        setGames(data)
      } else {
        // Default: all games visible, MLBB first
        const defaultGames: GameConfig[] = GAMES.map((g, i) => ({
          id: g.id,
          name: g.name,
          shortName: g.shortName,
          color: g.color,
          imageUrl: '',
          visible: true,
          order: g.id === 'mobile-legends' ? 0 : i + 1,
        })).sort((a, b) => a.order - b.order)
        setGames(defaultGames)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const moveGame = (index: number, dir: -1 | 1) => {
    const next = [...games]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    next.forEach((g, i) => g.order = i)
    setGames(next)
  }

  const updateGame = (index: number, field: string, value: any) => {
    const next = [...games]
    next[index] = { ...next[index], [field]: value }
    setGames(next)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminService.updateContentGames(games)
      toast.success('Games display updated!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-slate-400 text-center py-20">Loading...</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/content" className="p-2 glass-card rounded-xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="gaming-heading text-2xl mb-1">Games Display</h1>
          <p className="text-slate-400 text-sm">Configure which games appear on homepage, their order, and images</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-3">
        {games.map((game, i) => (
          <motion.div key={game.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-2xl p-4 ${!game.visible ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
              {/* Order controls */}
              <div className="flex flex-col gap-1">
                <button onClick={() => moveGame(i, -1)} disabled={i === 0}
                  className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white disabled:opacity-20 transition-colors">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveGame(i, 1)} disabled={i === games.length - 1}
                  className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white disabled:opacity-20 transition-colors">
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* Image preview */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/[0.05] flex items-center justify-center flex-shrink-0"
                style={{ borderColor: `${game.color}30`, borderWidth: '1px' }}>
                {game.imageUrl ? (
                  <img src={game.imageUrl} alt={game.shortName} className="w-full h-full object-cover" />
                ) : (
                  <Gamepad2 className="w-6 h-6" style={{ color: game.color }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm" style={{ color: game.color }}>{game.shortName}</span>
                  <span className="text-slate-500 text-xs">{game.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <input
                    value={game.imageUrl}
                    onChange={e => updateGame(i, 'imageUrl', e.target.value)}
                    placeholder="Image URL (e.g. https://...)"
                    className="input-glass text-xs flex-1"
                  />
                </div>
              </div>

              {/* Visibility toggle */}
              <button onClick={() => updateGame(i, 'visible', !game.visible)}
                className={`p-2 rounded-xl transition-colors ${game.visible ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                {game.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
