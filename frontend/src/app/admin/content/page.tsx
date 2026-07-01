'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Megaphone, Gamepad2, FileText, Image, Users, Star, ArrowRight, BarChart3, Upload } from 'lucide-react'

export default function AdminContentPage() {
  const items = [
    { icon: Upload, title: 'Site Logo', desc: 'Upload your logo to display in the navbar and as the site icon.', color: 'text-saffron', bg: 'bg-orange-400/10', href: '/admin/content/logo' },
    { icon: BarChart3, title: 'Homepage Stats', desc: 'Edit the stat numbers shown on the homepage (players, tournaments, prize pool).', color: 'text-green-400', bg: 'bg-green-400/10', href: '/admin/content/stats' },
    { icon: Megaphone, title: 'Announcements', desc: 'Post platform-wide announcements and news to all users.', color: 'text-gold', bg: 'bg-yellow-400/10', href: '/admin/content/announcements' },
    { icon: Gamepad2, title: 'Games Display', desc: 'Configure which games appear on homepage, their order, and images.', color: 'text-neon-blue', bg: 'bg-neon-blue/10', href: '/admin/content/games' },
    { icon: Users, title: 'Sponsors & Partners', desc: 'Manage sponsor logos and partner links on homepage.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/admin/content/sponsors' },
    { icon: Star, title: 'Player Reviews', desc: 'Manage player testimonials and reviews shown on homepage.', color: 'text-neon-purple', bg: 'bg-purple-400/10', href: '/admin/content/reviews' },
    { icon: Image, title: 'Banner Management', desc: 'Upload and manage homepage banners and promotional images.', color: 'text-slate-300', bg: 'bg-slate-400/10', badge: 'Coming Soon' },
    { icon: FileText, title: 'Static Pages', desc: 'Edit Terms of Service, Privacy Policy, and FAQ content.', color: 'text-slate-400', bg: 'bg-slate-400/10', badge: 'Coming Soon' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="gaming-heading text-2xl sm:text-3xl mb-1">Content Management</h1>
        <p className="text-slate-400 text-sm">Manage announcements, banners, and platform content</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {items.map((item, i) => {
          const content = (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-2xl p-6 ${item.href ? 'hover:border-white/10 transition-colors cursor-pointer' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                {item.badge ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-400/10 text-slate-400 font-medium">{item.badge}</span>
                ) : (
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <h3 className="font-rajdhani font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          )

          return item.href ? (
            <Link key={item.title} href={item.href}>{content}</Link>
          ) : (
            <div key={item.title}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
