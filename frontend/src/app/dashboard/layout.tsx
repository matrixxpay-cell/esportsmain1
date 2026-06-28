'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Wallet, User, Bell, BarChart2, LogOut, Gamepad2, Crown, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'

const SIDEBAR_LINKS = [
  { icon: Trophy, label: 'Tournaments', href: '/dashboard/tournaments', badge: null },
  { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet', badge: null },
  { icon: BarChart2, label: 'Leaderboard', href: '/dashboard/leaderboard', badge: null },
  { icon: User, label: 'My Profile', href: '/dashboard/profile', badge: null },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', badge: null },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const balance = user?.wallet?.balance ?? 0

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] fixed left-0 top-16 bottom-0 border-r border-white/[0.06] overflow-y-auto sidebar-bg">
          <div className="p-5">
            {/* User card */}
            <div className="relative rounded-2xl p-4 mb-6 overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(255,107,43,0.12) 0%, rgba(245,158,11,0.08) 100%)',
              border: '1px solid rgba(255,107,43,0.15)',
            }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #FF6B2B 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF6B2B, #F59E0B)' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
                    {user?.username}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)' }}>
                <span className="text-xs text-slate-400">Balance</span>
                <span className="font-gaming font-bold text-saffron">
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {SIDEBAR_LINKS.map(({ icon: Icon, label, href }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
                return (
                  <Link key={href} href={href}
                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-saffron/12 text-saffron border border-saffron/20 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                    style={isActive ? { background: 'rgba(255,107,43,0.1)', borderColor: 'rgba(255,107,43,0.2)' } : {}}>
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-saffron' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-saffron" />}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="mt-auto p-5 pt-3 border-t border-white/[0.06]">
            <button onClick={() => { logout(); router.push('/') }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium w-full text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200">
              <LogOut className="w-[18px] h-[18px]" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-[260px] min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — improved */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 mobile-nav-blur">
        <div className="flex items-center justify-around py-1.5 px-2 max-w-lg mx-auto">
          {SIDEBAR_LINKS.slice(0, 5).map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className={`relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-saffron' : 'text-slate-500'
                }`}>
                {isActive && (
                  <motion.div layoutId="mobile-tab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(255,107,43,0.1)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-saffron' : ''}`}>{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
