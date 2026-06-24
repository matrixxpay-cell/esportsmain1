'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, RefreshCw, AlertCircle } from 'lucide-react'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'
import { PLATFORM_NAME } from '@/constants'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending')
  const [resending, setResending] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      setStatus('verifying')
      authService.verifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'))
    }
  }, [token])

  const handleResend = async () => {
    setResending(true)
    try {
      await authService.resendVerification()
      toast.success('Verification email sent!')
    } catch {
      toast.error('Failed to resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="text-center">
      <Link href="/" className="inline-flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
          <span className="text-white font-gaming font-bold">IE</span>
        </div>
        <span className="font-gaming font-bold text-xl gradient-text">{PLATFORM_NAME}</span>
      </Link>

      <div className="glass-card rounded-2xl p-8 sm:p-10">
        {status === 'verifying' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-neon-blue animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-green-400/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Email Verified! 🎉</h2>
            <p className="text-slate-400 mb-6">Your account is now verified. ₹50 bonus added to your wallet!</p>
            <Link href="/dashboard/tournaments" className="btn-neon inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white">
              Start Playing Now
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-red-400/15 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-slate-400 mb-6">The link is invalid or expired. Request a new one.</p>
            <button onClick={handleResend} disabled={resending}
              className="btn-neon inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60">
              {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Resend Email
            </button>
          </div>
        )}
        {status === 'pending' && (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-neon-blue" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 mb-6">We sent a verification link to your email. Click it to activate your account and get ₹50 bonus!</p>
            <button onClick={handleResend} disabled={resending}
              className="btn-ghost inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-300">
              {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Resend Email
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-slate-400 text-sm mt-5">
        <Link href="/auth/login" className="text-neon-blue hover:text-neon-cyan">Back to Login</Link>
      </p>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
