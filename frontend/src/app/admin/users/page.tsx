'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Shield, ShieldOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)
  const router = useRouter()

  const load = async (pg = 1, q = '') => {
    setLoading(true)
    try {
      const res = await adminService.getUsers(pg, q)
      setUsers(res.data || [])
      setMeta(res.pagination)
    } catch { toast.error('Failed to load users') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    load(1, search)
  }

  const ban = async (id: string, username: string) => {
    const reason = prompt(`Ban reason for ${username}:`)
    if (!reason) return
    try {
      await adminService.banUser(id, reason)
      toast.success(`${username} banned`)
      setUsers(u => u.map(x => x._id === id ? { ...x, isBanned: true } : x))
    } catch { toast.error('Failed to ban') }
  }

  const unban = async (id: string, username: string) => {
    try {
      await adminService.unbanUser(id)
      toast.success(`${username} unbanned`)
      setUsers(u => u.map(x => x._id === id ? { ...x, isBanned: false } : x))
    } catch { toast.error('Failed to unban') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl mb-1">User Management</h1>
          <p className="text-slate-400 text-sm">View and manage all registered players</p>
        </div>
        <button onClick={() => load(page, search)} className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSearch} className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="input-glass pl-10 pr-24" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-3 py-1.5 rounded-lg text-xs font-bold text-white">
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No users found.</div>
      ) : (
        <>
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-white/5">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Joined</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => router.push(`/admin/users/${u._id}`)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center text-saffron font-bold text-xs flex-shrink-0">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{u.username}</div>
                          <div className="text-slate-500 text-xs sm:hidden">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 hidden sm:table-cell">{u.email}</td>
                    <td className="p-4 text-slate-400 hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.isVerified ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">
                            <XCircle className="w-3 h-3" /> Unverified
                          </span>
                        )}
                        {u.isBanned && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400">Banned</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {u.isBanned ? (
                        <button onClick={() => unban(u._id, u.username)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors">
                          <ShieldOff className="w-3 h-3" /> Unban
                        </button>
                      ) : (
                        <button onClick={() => ban(u._id, u.username)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors">
                          <Shield className="w-3 h-3" /> Ban
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); load(p, search) }}
                className="btn-ghost px-4 py-2 rounded-xl text-sm disabled:opacity-40">Previous</button>
              <span className="text-slate-400 text-sm">{page} / {meta.pages}</span>
              <button disabled={page === meta.pages} onClick={() => { const p = page + 1; setPage(p); load(p, search) }}
                className="btn-ghost px-4 py-2 rounded-xl text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
