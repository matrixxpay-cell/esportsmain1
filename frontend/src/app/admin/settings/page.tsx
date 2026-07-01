'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Settings, Key, Globe, Shield, Bell, ChevronRight, Clock } from 'lucide-react'

const CARDS = [
  { icon: Clock, title: 'Site Mode', desc: 'Toggle coming soon mode and enable/disable user registration.', color: 'text-saffron', bg: 'bg-orange-400/10', href: '/admin/settings/site-mode' },
  { icon: Key, title: 'API Keys', desc: 'Manage Razorpay, Cloudinary, and other third-party API keys.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/admin/settings/api-keys' },
  { icon: Globe, title: 'Platform Config', desc: 'Configure platform name, tagline, and global settings.', color: 'text-neon-blue', bg: 'bg-blue-400/10', href: '/admin/settings/platform' },
  { icon: Shield, title: 'Security', desc: 'Manage admin roles, 2FA settings, and security policies.', color: 'text-green-400', bg: 'bg-green-400/10', href: '/admin/settings/security' },
  { icon: Bell, title: 'Email Templates', desc: 'Customize email templates for verification, prizes, and notifications.', color: 'text-neon-purple', bg: 'bg-purple-400/10', href: '/admin/settings/email' },
]

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Platform configuration and admin settings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CARDS.map((item, i) => (
          <Link key={item.title} href={item.href}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:border-white/20 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <h3 className="font-rajdhani font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
