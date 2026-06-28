'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Wallet, User, Bell, BarChart2, Home, LogOut, Gamepad2, Users, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'

const SIDEBAR_LINKS = [
  { icon: Trophy, label: 'Tournaments', href: '/dashboard/tournaments' },
  { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
  { icon: BarChart2, label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { icon: User, label: 'My Profile', href: '/dashboard/profile' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 border-r border-white/[0.05] p-4 overflow-y-auto"
          style={{ background: 'rgba(2, 6, 23, 0.95)' }}>
          {/* User card */}
          <div className="glass-card rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-white text-sm truncate">{user?.username}</div>
                <div className="text-xs text-neon-blue">
                  ₹{user?.wallet?.balance?.toFixed(2) ?? '0.00'}
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {SIDEBAR_LINKS.map(({ icon: Icon, label, href }) => (
              <Link key={href} href={href}
                className={`sidebar-link ${pathname === href ? 'active' : ''}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-1 pt-4 border-t border-white/[0.06]">
            <button onClick={() => { logout(); router.push('/') }}
              className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 nav-blur border-t border-white/[0.06] z-40">
        <div className="flex items-center justify-around py-2 px-4">
          {SIDEBAR_LINKS.slice(0, 5).map(({ icon: Icon, label, href }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                pathname === href ? 'text-neon-blue' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
