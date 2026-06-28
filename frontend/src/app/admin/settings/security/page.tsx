'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, UserPlus, Trash2, Crown } from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function SecurityPage() {
  const { user } = useAuthStore()
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [promoteEmail, setPromoteEmail] = useState('')
  const [promoting, setPromoting] = useState(false)

  const loadAdmins = () => {
    api.get('/admin/admins')
      .then(r => { setAdmins(r.data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadAdmins() }, [])

  const promoteUser = async () => {
    if (!promoteEmail.trim()) return
    setPromoting(true)
    try {
      const usersRes = await api.get('/admin/users', { params: { search: promoteEmail.trim(), limit: 1 } })
      const found = usersRes.data.data?.[0]
      if (!found) { toast.error('User not found'); return }
      await api.put(`/admin/users/${found._id}/role`, { role: 'admin' })
      toast.success(`${found.username} promoted to admin`)
      setPromoteEmail('')
      loadAdmins()
    } catch (e: any) { toast.error(e.message || 'Failed') }
    finally { setPromoting(false) }
  }

  const demoteUser = async (id: string, username: string) => {
    if (!confirm(`Remove admin access for ${username}?`)) return
    try {
      await api.put(`/admin/users/${id}/role`, { role: 'player' })
      toast.success(`${username} demoted to player`)
      loadAdmins()
    } catch (e: any) { toast.error(e.message || 'Failed') }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="gaming-heading text-xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" /> Security
          </h1>
          <p className="text-slate-400 text-sm">Manage admin roles and access control</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />)}</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Current Admins */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Admin Users ({admins.length})</h3>
            <div className="space-y-2">
              {admins.map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-xl bg-saffron/20 flex items-center justify-center text-saffron font-bold text-sm flex-shrink-0">
                    {a.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium flex items-center gap-2">
                      {a.username}
                      {a.role === 'super_admin' && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                    </div>
                    <div className="text-slate-500 text-xs">{a.email}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.role === 'super_admin' ? 'bg-yellow-400/15 text-yellow-400' : 'bg-neon-blue/15 text-neon-blue'
                  }`}>{a.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                  {a.role !== 'super_admin' && user?.role === 'super_admin' && (
                    <button onClick={() => demoteUser(a._id, a.username)}
                      className="p-1.5 rounded-lg hover:bg-red-400/10 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Promote User */}
          {user?.role === 'super_admin' && (
            <div className="glass-card rounded-2xl p-6 border border-green-400/20">
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-green-400" /> Add Admin
              </h3>
              <p className="text-slate-500 text-xs mb-4">Search by email or username to promote a user to admin</p>
              <div className="flex gap-3">
                <input value={promoteEmail} onChange={e => setPromoteEmail(e.target.value)}
                  placeholder="Email or username" className="input-glass text-sm flex-1" />
                <button onClick={promoteUser} disabled={promoting || !promoteEmail.trim()}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 whitespace-nowrap">
                  {promoting ? 'Promoting...' : 'Promote'}
                </button>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-3">Security Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'JWT Expiry', value: '7 days', status: 'ok' },
                { label: 'Password Hashing', value: 'bcrypt (10 rounds)', status: 'ok' },
                { label: 'Rate Limiting', value: 'Enabled', status: 'ok' },
                { label: 'CORS', value: 'Configured', status: 'ok' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">{item.value}</span>
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
