'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { authService } from '@/services/authService'
import { PLATFORM_NAME } from '@/constants'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch {
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
            <span className="text-white font-gaming font-bold">IE</span>
          </div>
          <span className="font-gaming font-bold text-xl gradient-text">{PLATFORM_NAME}</span>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
        <p className="text-slate-400 text-sm">We&apos;ll send you a recovery link</p>
      </div>

      <div className="glass-card rounded-2xl p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-400/15 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-slate-400 text-sm mb-6">
              We&apos;ve sent a password reset link to your email address. Check your inbox and spam folder.
            </p>
            <Link href="/auth/login" className="btn-neon inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input-glass pl-10" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-neon w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-60">
              {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>

      <p className="text-center mt-5">
        <Link href="/auth/login" className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </p>
    </motion.div>
  )
}
