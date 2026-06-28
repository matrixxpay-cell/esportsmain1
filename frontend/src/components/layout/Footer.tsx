'use client'

import Link from 'next/link'
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/constants'
import { GAMES } from '@/constants/games'
import { Twitter, Youtube, Instagram, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/0 to-dark-950/80 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tagline banner */}
        <div className="text-center mb-16">
          <p className="tagline text-2xl sm:text-3xl font-gaming tracking-wider">{PLATFORM_TAGLINE}</p>
          <p className="text-slate-500 text-sm mt-2">India&apos;s Premier Esports Tournament Platform</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
                <span className="text-white font-gaming font-bold text-sm">IE</span>
              </div>
              <span className="font-gaming font-bold text-lg gradient-text">{PLATFORM_NAME}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Compete. Win. Rise. India&apos;s most trusted esports platform for competitive gaming tournaments.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: MessageCircle, href: '#', label: 'Discord' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href}
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-slate-400 hover:text-neon-blue hover:border-neon-blue/30 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Tournaments', href: '/dashboard/tournaments' },
                { label: 'Leaderboard', href: '/dashboard/leaderboard' },
                { label: 'Wallet', href: '/dashboard/wallet' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-neon-blue text-sm transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Games */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Games</h4>
            <ul className="space-y-2.5">
              {GAMES.map((game) => (
                <li key={game.id}>
                  <Link href={`/dashboard/tournaments?game=${game.id}`} className="text-slate-400 hover:text-neon-blue text-sm transition-colors duration-200">
                    {game.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Refund Policy', href: '/refund' },
                { label: 'Fair Play Policy', href: '/fair-play' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-slate-400 hover:text-neon-blue text-sm transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Neon divider */}
        <div className="neon-line mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved. Made with ❤️ in India 🇮🇳
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span>18+ Only</span>
            <span>•</span>
            <span>Play Responsibly</span>
            <span>•</span>
            <span>Skill-based Competition</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
