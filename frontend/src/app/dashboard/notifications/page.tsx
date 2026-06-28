'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Trophy, Info, AlertTriangle, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import toast from 'react-hot-toast'

const TYPE_ICONS: Record<string, any> = { success: Trophy, info: Info, warning: AlertTriangle, error: AlertTriangle }
const TYPE_COLORS: Record<string, string> = {
  success: 'text-green-400 bg-green-400/10',
  info: 'text-neon-blue bg-neon-blue/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
  error: 'text-red-400 bg-red-400/10',
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/notifications')
      .then(res => { setNotifications(res.data.data || []); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [])

  const markAllRead = async () => {
    try {
      await api.put('/users/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to update notifications')
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="pb-20 lg:pb-0 max-w-2xl">
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="gaming-heading flex items-center gap-2">
            <Bell className="w-7 h-7 text-saffron" />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="btn-ghost px-4 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 glass-card rounded-xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Bell className="w-8 h-8 text-saffron/40" />
          </div>
          <p className="text-slate-400 font-medium mb-1">No notifications yet</p>
          <p className="text-slate-500 text-xs">You&apos;ll see tournament updates and alerts here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any, i: number) => {
            const Icon = TYPE_ICONS[n.type] || Info
            const colorClass = TYPE_COLORS[n.type] || TYPE_COLORS.info
            return (
              <motion.div key={n._id || i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className={`stat-card-v2 p-4 flex gap-3 ${!n.isRead ? '!border-saffron/15' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-white text-sm">{n.title}</h3>
                    {!n.isRead && <span className="w-2 h-2 bg-neon-blue rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-slate-600 text-xs mt-1">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
