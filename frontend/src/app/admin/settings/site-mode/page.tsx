'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, Clock, UserX, Globe, Shield } from 'lucide-react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'

export default function SiteModePage() {
  const [comingSoon, setComingSoon] = useState(false)
  const [registrationDisabled, setRegistrationDisabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminService.getSiteMode()
      .then(data => { setComingSoon(data.comingSoon); setRegistrationDisabled(data.registrationDisabled) })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminService.updateSiteMode({ comingSoon, registrationDisabled })
      toast.success('Site mode updated successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-saffron" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Site Mode</h1>
        <p className="text-slate-400 text-sm">Control site visibility and registration access.</p>
      </div>

      <div className="max-w-xl space-y-4">
        {/* Coming soon toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-saffron" />
              </div>
              <div>
                <h3 className="font-rajdhani font-bold text-white text-lg">Coming Soon Mode</h3>
                <p className="text-slate-400 text-sm mt-0.5">Show the coming soon page to non-admin users. Admins always have full access.</p>
                <p className={`text-xs mt-2 font-medium ${comingSoon ? 'text-orange-400' : 'text-green-400'}`}>
                  {comingSoon ? '● Site is hidden from public' : '● Site is live and public'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setComingSoon(v => !v)}
              className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 mt-1 ${comingSoon ? 'bg-saffron' : 'bg-white/10'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${comingSoon ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* Registration toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center flex-shrink-0">
                <UserX className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-rajdhani font-bold text-white text-lg">Disable Registration</h3>
                <p className="text-slate-400 text-sm mt-0.5">Prevent new users from creating accounts. Existing users can still log in.</p>
                <p className={`text-xs mt-2 font-medium ${registrationDisabled ? 'text-red-400' : 'text-green-400'}`}>
                  {registrationDisabled ? '● New registrations are blocked' : '● Registrations are open'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRegistrationDisabled(v => !v)}
              className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 mt-1 ${registrationDisabled ? 'bg-red-500' : 'bg-white/10'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${registrationDisabled ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.div>

        <div className="pt-2">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary py-3 px-8 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        {/* Info box */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4 border border-blue-500/10">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-400">
              <p className="text-slate-300 font-medium mb-1">Admin Access</p>
              <p>Admin accounts always bypass coming-soon mode. Log in as admin to access the full site.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
