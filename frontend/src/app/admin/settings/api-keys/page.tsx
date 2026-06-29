'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Key, Eye, EyeOff, Save, Zap, CheckCircle, XCircle } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const FIELDS = [
  { key: 'razorpay_key_id', label: 'Razorpay Key ID', placeholder: 'rzp_live_XXXXXXXXXX', sensitive: false },
  { key: 'razorpay_key_secret', label: 'Razorpay Key Secret', placeholder: '••••••••', sensitive: true },
  { key: 'razorpay_webhook_secret', label: 'Razorpay Webhook Secret', placeholder: '••••••••', sensitive: true },
  { key: 'cloudinary_cloud_name', label: 'Cloudinary Cloud Name', placeholder: 'your-cloud-name', sensitive: false },
  { key: 'cloudinary_api_key', label: 'Cloudinary API Key', placeholder: 'your-api-key', sensitive: false },
  { key: 'cloudinary_api_secret', label: 'Cloudinary API Secret', placeholder: '••••••••', sensitive: true },
]

export default function ApiKeysPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    api.get('/admin/settings/api_keys')
      .then(r => { setForm(r.data.data || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.put('/admin/settings/api_keys', form)
      const saved = res.data.data || {}
      setForm(prev => {
        const merged = { ...saved }
        for (const f of FIELDS) {
          if (f.sensitive && saved[f.key] === '••••••••' && prev[f.key] && prev[f.key] !== '••••••••') {
            merged[f.key] = prev[f.key]
          }
        }
        return merged
      })
      toast.success('API keys saved')
    } catch (e: any) { toast.error(e?.response?.data?.message || e?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/settings" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="gaming-heading text-xl flex items-center gap-2">
            <Key className="w-6 h-6 text-yellow-400" /> API Keys
          </h1>
          <p className="text-slate-400 text-sm">Manage payment gateway and cloud service credentials</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />)}</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Razorpay Section */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-blue" /> Razorpay
            </h3>
            <p className="text-slate-500 text-xs mb-4">Payment gateway configuration</p>
            <div className="space-y-3">
              {FIELDS.filter(f => f.key.startsWith('razorpay')).map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.sensitive && !visible[f.key] ? 'password' : 'text'}
                      value={form[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="input-glass text-sm pr-10"
                    />
                    {f.sensitive && (
                      <button onClick={() => setVisible(v => ({ ...v, [f.key]: !v[f.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {visible[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Razorpay Test */}
          <div className="glass-card rounded-2xl p-6 border border-neon-blue/20">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-blue" /> Test Razorpay Keys
            </h3>
            <p className="text-slate-500 text-xs mb-3">Creates a ₹1 test order to verify your keys are valid</p>
            <div className="flex items-center gap-3">
              <button onClick={async () => {
                setTesting(true); setTestResult(null)
                try {
                  const res = await api.post('/admin/settings/api_keys/test')
                  setTestResult({ ok: true, msg: res.data.message || 'Keys are valid!' })
                } catch (e: any) {
                  setTestResult({ ok: false, msg: e?.response?.data?.message || e?.message || 'Test failed' })
                }
                setTesting(false)
              }} disabled={testing}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 whitespace-nowrap">
                {testing ? 'Testing...' : 'Test Keys'}
              </button>
              {testResult && (
                <div className={`flex items-center gap-2 text-sm ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {testResult.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {testResult.msg}
                </div>
              )}
            </div>
          </div>

          {/* Cloudinary Section */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-purple" /> Cloudinary
            </h3>
            <p className="text-slate-500 text-xs mb-4">Image and media storage</p>
            <div className="space-y-3">
              {FIELDS.filter(f => f.key.startsWith('cloudinary')).map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.sensitive && !visible[f.key] ? 'password' : 'text'}
                      value={form[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="input-glass text-sm pr-10"
                    />
                    {f.sensitive && (
                      <button onClick={() => setVisible(v => ({ ...v, [f.key]: !v[f.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {visible[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save API Keys'}
            </button>
          </div>

          <div className="glass-card rounded-xl p-4 border border-yellow-400/20">
            <p className="text-yellow-400 text-xs font-medium mb-1">Important</p>
            <p className="text-slate-400 text-xs">These keys are stored in the database and used at runtime. For production, also set them in your server&apos;s .env file for the initial boot configuration.</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
