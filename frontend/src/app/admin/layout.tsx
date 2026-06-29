'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Trophy, Users, Wallet, BarChart2, Megaphone, Settings, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'

const ADMIN_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Trophy, label: 'Tournaments', href: '/admin/tournaments' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Wallet, label: 'Finances', href: '/admin/finances' },
  { icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
  { icon: Megaphone, label: 'Content', href: '/admin/content' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (user?.role !== 'admin' && user?.role !== 'super_admin') router.push('/dashboard/tournaments')
  }, [isAuthenticated, user, router])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) return null

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 border-r border-neon-purple/20 p-4"
          style={{ background: 'rgba(2, 6, 23, 0.97)' }}>
          <div className="glass-card rounded-xl p-3 mb-5 border-neon-purple/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Admin Panel</div>
                <div className="text-xs text-neon-purple">{user?.username}</div>
              </div>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {ADMIN_LINKS.map(({ icon: Icon, label, href }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
                    ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/[0.06]">
            <button onClick={() => { logout(); router.push('/') }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden p-4 flex flex-col border-r border-neon-purple/20"
                style={{ background: 'rgba(2, 6, 23, 0.98)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Admin Panel</div>
                      <div className="text-xs text-neon-purple">{user?.username}</div>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1 flex-1">
                  {ADMIN_LINKS.map(({ icon: Icon, label, href }) => (
                    <Link key={href} href={href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                        pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
                          ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/25'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="pt-3 border-t border-white/[0.06]">
                  <button onClick={() => { logout(); router.push('/') }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 lg:ml-64">
          {/* Mobile top bar with menu button */}
          <div className="lg:hidden flex items-center gap-3 p-4 pb-0">
            <button onClick={() => setMobileMenuOpen(true)}
              className="p-2 glass-card rounded-xl text-slate-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-semibold text-white">Admin</span>
            </div>
          </div>

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
    </div>
  )
}
