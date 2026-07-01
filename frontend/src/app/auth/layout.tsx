import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth — EsportsG',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-neon-blue/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
