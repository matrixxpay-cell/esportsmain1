'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Save, Send, Eye } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const SMTP_FIELDS = [
  { key: 'email_host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
  { key: 'email_port', label: 'SMTP Port', placeholder: '587' },
  { key: 'email_user', label: 'SMTP Username', placeholder: 'your-email@gmail.com' },
  { key: 'email_pass', label: 'SMTP Password', placeholder: '••••••••', sensitive: true },
  { key: 'email_from', label: 'From Address', placeholder: 'EsportsG <noreply@esportsg.com>' },
]

const TEMPLATES = [
  { id: 'verifyEmail', name: 'Email Verification', desc: 'Sent when user registers' },
  { id: 'resetPassword', name: 'Password Reset', desc: 'Sent for forgot password' },
  { id: 'tournamentRegistration', name: 'Tournament Registration', desc: 'Sent on successful registration' },
  { id: 'prizeWon', name: 'Prize Won', desc: 'Sent when user wins a prize' },
]

export default function EmailSettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  useEffect(() => {
    api.get('/admin/settings/email')
      .then(r => { setForm(r.data.data || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.put('/admin/settings/email', form)
      const saved = res.data.data || {}
      setForm(prev => {
        const merged = { ...saved }
        for (const f of SMTP_FIELDS) {
          if (f.sensitive && saved[f.key] === '••••••••' && prev[f.key] && prev[f.key] !== '••••••••') {
            merged[f.key] = prev[f.key]
          }
        }
        return merged
      })
      toast.success('Email settings saved')
    } catch (e: any) { toast.error(e?.response?.data?.message || e?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const sendTest = async () => {
    if (!testEmail.trim()) { toast.error('Enter email'); return }
    setSending(true)
    try {
      await api.post('/admin/settings/email/test', { to: testEmail.trim() }, { timeout: 30000 })
      toast.success(`Test email sent to ${testEmail}`)
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to send'
      toast.error(msg)
    }
    finally { setSending(false) }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="gaming-heading text-xl flex items-center gap-2">
            <Bell className="w-6 h-6 text-neon-purple" /> Email Templates
          </h1>
          <p className="text-slate-400 text-sm">Configure SMTP and manage email templates</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />)}</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* SMTP Config */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-1">SMTP Configuration</h3>
            <p className="text-slate-500 text-xs mb-4">Configure your email delivery service</p>
            <div className="space-y-3">
              {SMTP_FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <input
                    type={f.sensitive ? 'password' : 'text'}
                    value={form[f.key] || ''}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="input-glass text-sm"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer mt-2">
                <input type="checkbox" checked={form.email_secure === 'true'}
                  onChange={e => setForm(p => ({ ...p, email_secure: e.target.checked ? 'true' : 'false' }))}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-saffron focus:ring-saffron" />
                Use SSL/TLS (port 465)
              </label>
            </div>
          </div>

          {/* Test Email */}
          <div className="glass-card rounded-2xl p-6 border border-neon-blue/20">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-neon-blue" /> Send Test Email
            </h3>
            <p className="text-slate-500 text-xs mb-3">Verify your SMTP configuration works</p>
            <div className="flex gap-3">
              <input value={testEmail} onChange={e => setTestEmail(e.target.value)}
                placeholder="recipient@email.com" type="email" className="input-glass text-sm flex-1" />
              <button onClick={sendTest} disabled={sending}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 whitespace-nowrap">
                {sending ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>

          {/* Email Templates */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Email Templates</h3>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div>
                    <div className="text-white text-sm font-medium">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/15 text-green-400">Active</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-4">Email templates are defined in <code className="text-neon-blue">backend/src/utils/email.js</code>. Edit the file directly to customize templates.</p>
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Email Settings'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
