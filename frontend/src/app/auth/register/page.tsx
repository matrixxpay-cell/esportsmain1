'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Gift } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/constants'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Max 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const res = await authService.register({
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        referralCode: data.referralCode,
      })
      login(res.user, res.token)
      toast.success('Account created! 🎮 Please verify your email.')
      router.push('/auth/verify-email')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
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
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00D9FF, #7C3AED)' }}>
            <span className="text-white font-gaming font-bold">IE</span>
          </div>
          <span className="font-gaming font-bold text-xl gradient-text">{PLATFORM_NAME}</span>
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Join the Arena</h1>
        <p className="text-slate-400 text-sm">{PLATFORM_TAGLINE}</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register('username')} placeholder="ProGamer123" className="input-glass pl-10" />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register('phone')} placeholder="9876543210" className="input-glass pl-10" />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-glass pl-10" />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className="input-glass pl-10 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="input-glass pl-10" />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Referral Code <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input {...register('referralCode')} placeholder="Enter referral code for bonus" className="input-glass pl-10" />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5">
            <input {...register('agreeTerms')} type="checkbox" id="terms"
              className="mt-0.5 w-4 h-4 accent-neon-blue cursor-pointer" />
            <label htmlFor="terms" className="text-slate-400 text-xs leading-relaxed cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-neon-blue hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-neon-blue hover:underline">Privacy Policy</Link>.
              I am 18+ years old.
            </label>
          </div>
          {errors.agreeTerms && <p className="text-red-400 text-xs">{errors.agreeTerms.message}</p>}

          <button type="submit" disabled={isLoading}
            className="btn-neon w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-60">
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn-ghost flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-300">
            <span className="text-red-400">G</span> Google
          </button>
          <button className="btn-ghost flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-300">
            <span className="text-indigo-400 font-bold">D</span> Discord
          </button>
        </div>
      </div>

      <p className="text-center text-slate-400 text-sm mt-5">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-neon-blue hover:text-neon-cyan font-medium transition-colors">
          Login here
        </Link>
      </p>
    </motion.div>
  )
}
