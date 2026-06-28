'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Megaphone, Send, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const typeOptions = [
  { value: 'info', label: 'Info', icon: Info, color: 'text-neon-blue', bg: 'bg-neon-blue/15' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/15' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/15' },
  { value: 'error', label: 'Error', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/15' },
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', type: 'info' })

  const loadAnnouncements = () => {
    api.get('/admin/announcements')
      .then(r => { setAnnouncements(r.data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadAnnouncements() }, [])

  const sendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setSending(true)
    try {
      const res = await api.post('/admin/announcements', form)
      toast.success(res.data.message || 'Announcement sent')
      setForm({ title: '', message: '', type: 'info' })
      loadAnnouncements()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const getType = (type: string) => typeOptions.find(t => t.value === type) || typeOptions[0]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/content" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="gaming-heading text-xl flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-saffron" /> Announcements
          </h1>
          <p className="text-slate-400 text-sm">Send platform-wide announcements to all users</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <form onSubmit={sendAnnouncement} className="glass-card rounded-2xl p-6 border border-saffron/20">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-saffron" /> New Announcement
          </h3>
          <div className="space-y-4">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Announcement title" className="input-glass text-sm w-full" required />
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Announcement message..." className="input-glass text-sm w-full min-h-[100px] resize-y" required />
            <div>
              <label className="text-slate-400 text-xs mb-2 block">Type</label>
              <div className="flex gap-2">
                {typeOptions.map(t => (
                  <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      form.type === t.value ? `${t.bg} ${t.color}` : 'bg-white/[0.03] text-slate-500 hover:text-slate-300'
                    }`}>
                    <t.icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={sending || !form.title.trim() || !form.message.trim()}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 w-full">
              {sending ? 'Sending...' : 'Send to All Users'}
            </button>
          </div>
        </form>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Recent Announcements</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />)}</div>
          ) : announcements.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => {
                const t = getType(a.value?.type)
                return (
                  <div key={a._id} className="p-4 rounded-xl bg-white/[0.02]">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <t.icon className={`w-4 h-4 ${t.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">{a.value?.title}</div>
                        <p className="text-slate-400 text-xs mt-1">{a.value?.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-slate-500 text-xs">
                          <span>by {a.value?.createdBy}</span>
                          <span>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
