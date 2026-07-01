'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, Wallet, ChevronDown, LogOut, User, Settings, Shield } from 'lucide-react'
import { PLATFORM_NAME, NAV_LINKS } from '@/constants'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    api.get('/content/logo').then(r => {
      if (r.data?.data?.url) setLogoUrl(r.data.data.url)
    }).catch(() => {})
  }, [])
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'nav-blur' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image src={logoUrl || '/logo-eg.svg'} alt="EsportsG" width={36} height={36} className="rounded-xl object-contain" style={{ boxShadow: '0 0 16px rgba(255,107,43,0.4)' }} priority />
            <div className="flex flex-col leading-none">
              <span className="font-rajdhani font-black text-xl tracking-wide" style={{
                background: 'linear-gradient(135deg, #FF6B2B, #F59E0B)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Esports<span className="text-white" style={{ WebkitTextFillColor: 'white' }}>G</span></span>
              <span className="text-slate-500 text-[9px] tracking-widest uppercase font-medium">India&apos;s #1 Platform</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-saffron bg-saffron-100'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Wallet Balance */}
                <Link href="/dashboard/wallet" className="flex items-center gap-2 glass-card px-3 py-2 rounded-lg text-sm hover:border-neon-blue/30 transition-all duration-200">
                  <Wallet className="w-4 h-4 text-neon-cyan" />
                  <span className="text-white font-medium">
                    ₹{user.wallet?.balance?.toFixed(2) ?? '0.00'}
                  </span>
                </Link>

                {/* Notifications */}
                <Link href="/dashboard/notifications" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200">
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 glass-card px-3 py-2 rounded-lg hover:border-white/20 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #FF6B2B, #F59E0B)' }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{user.username}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl overflow-hidden z-50"
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link href="/dashboard/profile" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link href="/dashboard/wallet" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
                            <Wallet className="w-4 h-4" /> Wallet
                          </Link>
                          <Link href="/dashboard/notifications" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
                            <Bell className="w-4 h-4" /> Notifications
                          </Link>
                          {(user.role === 'admin' || user.role === 'super_admin') && (
                            <Link href="/admin/dashboard" onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-neon-purple hover:bg-purple-500/10 text-sm transition-colors">
                              <Shield className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <div className="border-t border-white/10 mt-2 pt-2">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors w-full">
                              <LogOut className="w-4 h-4" /> Logout
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
                  Login
                </Link>
                <Link href="/auth/register"
                  className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white">
                  Play Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden nav-blur border-t border-white/10"
          >
            <div className="p-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-neon-blue bg-neon-blue/10 border border-neon-blue/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}>
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated ? (
                <div className="flex gap-3 pt-2">
                  <Link href="/auth/login" onClick={() => setIsMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium glass-card text-slate-300">
                    Login
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileOpen(false)}
                    className="flex-1 text-center btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold text-white">
                    Play Now
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{user?.username}</span>
                  <button onClick={handleLogout} className="text-red-400 text-sm hover:text-red-300">Logout</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
