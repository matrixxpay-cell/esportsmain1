'use client'

import { motion } from 'framer-motion'
import { Settings, Key, Globe, Shield, Bell } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Platform configuration and admin settings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          { icon: Key, title: 'API Keys', desc: 'Manage Razorpay, Cloudinary, and other third-party API keys.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', badge: 'Coming Soon' },
          { icon: Globe, title: 'Platform Config', desc: 'Configure platform name, tagline, and global settings.', color: 'text-saffron', bg: 'bg-orange-400/10', badge: 'Coming Soon' },
          { icon: Shield, title: 'Security', desc: 'Manage admin roles, 2FA settings, and security policies.', color: 'text-green-400', bg: 'bg-green-400/10', badge: 'Coming Soon' },
          { icon: Bell, title: 'Email Templates', desc: 'Customize email templates for verification, prizes, and notifications.', color: 'text-neon-purple', bg: 'bg-purple-400/10', badge: 'Coming Soon' },
        ].map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-400/10 text-slate-400 font-medium">{item.badge}</span>
            </div>
            <h3 className="font-rajdhani font-bold text-white text-lg mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
