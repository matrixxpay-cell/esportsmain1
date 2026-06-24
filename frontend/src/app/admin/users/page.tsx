'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, Ban, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_USERS = Array.from({ length: 12 }, (_, i) => ({
  _id: String(i + 1),
  username: ['ProKillerXD', 'ValorantGod_IN', 'HeadshotHero', 'BooyahKing99', 'MLBBMaster', 'Dota2Legend', 'FootballPro', 'SniperElite', 'RushMaster', 'ClutchKing', 'FragGod', 'AWPLegend'][i],
  email: `player${i + 1}@example.com`,
  phone: `9${String(i + 1).padStart(9, '0')}`,
  isVerified: i % 3 !== 0,
  isActive: i % 5 !== 0,
  isBanned: i === 7,
  stats: { tournamentsPlayed: Math.round(5 + Math.random() * 40), tournamentsWon: Math.round(Math.random() * 15) },
  createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
}))

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_USERS.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search)
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl mb-1">User Management</h1>
        <p className="text-slate-400 text-sm">Manage platform users</p>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="input-glass pl-9 py-2 text-sm" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-xs text-slate-500 uppercase border-b border-white/[0.06]">
          <div className="col-span-3">User</div>
          <div className="col-span-3 hidden sm:block">Email</div>
          <div className="col-span-2 hidden md:block">Status</div>
          <div className="col-span-2 hidden md:block">Tournaments</div>
          <div className="col-span-4 md:col-span-2 text-right">Actions</div>
        </div>
        {filtered.map((user, i) => (
          <motion.div key={user._id}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            className="grid grid-cols-12 px-5 py-3.5 items-center border-b border-white/[0.04] hover:bg-white/[0.02]">
            <div className="col-span-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
                {user.username[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white font-medium truncate">{user.username}</div>
                {user.isBanned && <div className="text-xs text-red-400">Banned</div>}
              </div>
            </div>
            <div className="col-span-3 hidden sm:block text-xs text-slate-400 truncate">{user.email}</div>
            <div className="col-span-2 hidden md:flex items-center gap-1">
              {user.isVerified ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />}
              <span className="text-xs text-slate-400">{user.isVerified ? 'Verified' : 'Unverified'}</span>
            </div>
            <div className="col-span-2 hidden md:block text-xs text-slate-400">
              {user.stats.tournamentsPlayed} played / {user.stats.tournamentsWon} won
            </div>
            <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2">
              {!user.isBanned ? (
                <button onClick={() => toast.error(`${user.username} banned`)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 text-xs transition-colors">
                  <Ban className="w-3 h-3" /> Ban
                </button>
              ) : (
                <button onClick={() => toast.success(`${user.username} unbanned`)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 text-xs transition-colors">
                  <Shield className="w-3 h-3" /> Unban
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
