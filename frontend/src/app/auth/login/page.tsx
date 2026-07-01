'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, LogIn, Chrome } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/constants'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const res = await authService.login(data.email, data.password)
      login(res.user, res.token)
      toast.success('Welcome back!')
      const role = res.user?.role
      if (role === 'admin' || role === 'super_admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/coming-soon')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF6B2B 0%, #F59E0B 100%)', boxShadow: '0 0 16px rgba(255,107,43,0.4)' }}>
            <span className="text-white font-rajdhani font-black text-base leading-none">G</span>
            <div className="absolute bottom-0 left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%)' }} />
          </div>
          <span className="font-rajdhani font-black text-xl" style={{ background: 'linear-gradient(135deg, #FF6B2B, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{PLATFORM_NAME}</span>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome Back, Champion</h1>
        <p className="text-slate-400 text-sm">{PLATFORM_TAGLINE}</p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input-glass pl-10"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-neon-blue hover:text-neon-cyan transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className="input-glass pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading}
            className="btn-neon w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login to Play
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs">or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-ghost flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white">
            <Chrome className="w-4 h-4 text-red-400" /> Google
          </button>
          <button className="btn-ghost flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white">
            <span className="text-indigo-400 font-bold text-sm">D</span> Discord
          </button>
        </div>
      </div>

      <p className="text-center text-slate-400 text-sm mt-5">
        New to EsportsG?{' '}
        <Link href="/auth/register" className="text-neon-blue hover:text-neon-cyan font-medium transition-colors">
          Create account
        </Link>
      </p>
    </motion.div>
  )
}
