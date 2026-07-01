import type { Metadata } from 'next'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'EsportsG — Play. Compete. Win Real Cash.',
  description: "India's #1 Esports Tournament Platform. Play CSGO, BGMI, Valorant, Free Fire, Mobile Legends, Dota 2, and eFootball tournaments with real cash prizes.",
  keywords: 'esports india, tournament, bgmi, valorant, free fire, csgo, dota 2, mobile legends, cash prize, gaming',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo-eg.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-32.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'EsportsG — Play. Compete. Win Real Cash.',
    description: "India's Premier Esports Tournament Platform",
    type: 'website',
    images: ['/icons/icon-512x512.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
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
