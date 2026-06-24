'use client'

import { motion } from 'framer-motion'
import { Bell, Trophy, IndianRupee, Info, AlertTriangle, Check } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'success', title: 'Prize Credited! 🏆', message: 'You won ₹25,000 in BGMI Pro League Season 4. Amount added to wallet.', time: '2 hours ago', isRead: false },
  { id: '2', type: 'info', title: 'Tournament Starting Soon', message: 'Valorant India Masters starts in 30 minutes. Room ID will be shared 15 minutes before.', time: '30 min ago', isRead: false },
  { id: '3', type: 'success', title: 'Registration Confirmed', message: 'You have successfully registered for CS:GO India Championship.', time: '1 day ago', isRead: true },
  { id: '4', type: 'warning', title: 'Deposit Pending', message: 'Your deposit of ₹500 is being processed. Should reflect in 5 minutes.', time: '2 days ago', isRead: true },
  { id: '5', type: 'info', title: 'New Tournament Available', message: 'Free Fire Knockout Cup is now open for registration. Prize pool ₹25,000.', time: '3 days ago', isRead: true },
]

const TYPE_ICONS = { success: Trophy, info: Info, warning: AlertTriangle, error: AlertTriangle }
const TYPE_COLORS = { success: 'text-green-400 bg-green-400/10', info: 'text-neon-blue bg-neon-blue/10', warning: 'text-yellow-400 bg-yellow-400/10', error: 'text-red-400 bg-red-400/10' }

export default function NotificationsPage() {
  return (
    <div className="pb-20 lg:pb-0 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="gaming-heading text-2xl sm:text-3xl mb-2">Notifications</h1>
          <p className="text-slate-400">Stay updated on your tournaments</p>
        </div>
        <button className="btn-ghost px-4 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-1.5">
          <Check className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((n, i) => {
          const Icon = TYPE_ICONS[n.type as keyof typeof TYPE_ICONS]
          const colorClass = TYPE_COLORS[n.type as keyof typeof TYPE_COLORS]
          return (
            <motion.div key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`glass-card rounded-xl p-4 flex gap-3 ${!n.isRead ? 'border-neon-blue/20' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-white text-sm">{n.title}</h3>
                  {!n.isRead && <span className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-slate-600 text-xs mt-1">{n.time}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {MOCK_NOTIFICATIONS.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  )
}
