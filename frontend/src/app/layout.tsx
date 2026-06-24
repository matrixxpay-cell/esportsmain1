import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'IndiaEsports — Ab Nahi Khelega India Toh Kab Khelega?',
  description: "India's Premier Esports Tournament Platform. Play CSGO, BGMI, Valorant, Free Fire, Mobile Legends, Dota 2, and eFootball tournaments with real cash prizes.",
  keywords: 'esports india, tournament, bgmi, valorant, free fire, csgo, dota 2, mobile legends, cash prize, gaming',
  openGraph: {
    title: 'IndiaEsports — Ab Nahi Khelega India Toh Kab Khelega?',
    description: "India's Premier Esports Tournament Platform",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#F1F5F9',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
