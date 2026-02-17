'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Check,
  X
} from 'lucide-react'

interface PasswordStrength {
  score: number
  feedback: string[]
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  })
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength({
        score: 0,
        feedback: [],
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
      })
    }
  }, [password])

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const hasMinLength = pwd.length >= 8
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasLowercase = /[a-z]/.test(pwd)
    const hasNumber = /\d/.test(pwd)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)

    let score = 0
    const feedback: string[] = []

    if (hasMinLength) score += 1
    else feedback.push('At least 8 characters')

    if (hasUppercase) score += 1
    else feedback.push('One uppercase letter')

    if (hasLowercase) score += 1
    else feedback.push('One lowercase letter')

    if (hasNumber) score += 1
    else feedback.push('One number')

    if (hasSpecialChar) score += 1
    else feedback.push('One special character')

    return {
      score,
      feedback,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar
    }
  }

  const getStrengthColor = (score: number) => {
    if (score < 2) return '#da3633'
    if (score < 4) return '#fb8500'
    return '#2ea043'
  }

  const getStrengthText = (score: number) => {
    if (score < 2) return 'Weak'
    if (score < 4) return 'Good'
    return 'Strong'
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptTerms) {
      setError('Please accept the Terms of Service')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Password is not strong enough')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        // Check if email confirmation is required
        if (data.user && !data.user.email_confirmed_at) {
          router.push('/login?message=Check your email to confirm your account')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="auth-card rounded-2xl p-8 animate-fade-in-scale">
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00D4AA] to-[#7c3aed] rounded-2xl mb-4 animate-float">
            <span className="text-2xl font-bold text-white font-mono">PW</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join PulseWave Labs</h1>
          <p className="text-[#7d8590]">Start your 14-day free trial today</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Social Signup */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button
            onClick={() => handleSocialSignup('google')}
            disabled={loading}
            className="btn-social flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-[#30363d] rounded-lg text-[#f0f6fc] hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialSignup('github')}
            disabled={loading}
            className="btn-social flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-[#30363d] rounded-lg text-[#f0f6fc] hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="flex items-center my-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex-1 border-t border-[#30363d]"></div>
          <span className="px-4 text-sm text-[#7d8590]">or sign up with email</span>
          <div className="flex-1 border-t border-[#30363d]"></div>
        </motion.div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label htmlFor="fullName" className="block text-sm font-medium text-[#f0f6fc] mb-2">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7d8590]" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-glow w-full pl-10 pr-4 py-3 bg-[#0d1117] text-[#f0f6fc] rounded-lg border border-[#30363d] placeholder-[#7d8590] focus:border-[#00D4AA] transition-colors"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-[#f0f6fc] mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7d8590]" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glow w-full pl-10 pr-4 py-3 bg-[#0d1117] text-[#f0f6fc] rounded-lg border border-[#30363d] placeholder-[#7d8590] focus:border-[#00D4AA] transition-colors"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-[#f0f6fc] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7d8590]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glow w-full pl-10 pr-12 py-3 bg-[#0d1117] text-[#f0f6fc] rounded-lg border border-[#30363d] placeholder-[#7d8590] focus:border-[#00D4AA] transition-colors"
                placeholder="Create a strong password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7d8590] hover:text-[#f0f6fc] transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <motion.div 
                className="mt-3 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#7d8590]">Password strength:</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: getStrengthColor(passwordStrength.score) }}
                  >
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="strength-bar">
                  <div 
                    className="strength-fill transition-all duration-300"
                    style={{ 
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      background: getStrengthColor(passwordStrength.score)
                    }}
                  ></div>
                </div>
                
                {/* Requirements checklist */}
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {[
                    { key: 'hasMinLength', text: 'At least 8 characters' },
                    { key: 'hasUppercase', text: 'One uppercase letter' },
                    { key: 'hasLowercase', text: 'One lowercase letter' },
                    { key: 'hasNumber', text: 'One number' },
                    { key: 'hasSpecialChar', text: 'One special character' }
                  ].map(({ key, text }) => (
                    <div key={key} className="flex items-center gap-2">
                      {passwordStrength[key as keyof PasswordStrength] ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-[#7d8590]" />
                      )}
                      <span className={passwordStrength[key as keyof PasswordStrength] ? 'text-green-400' : 'text-[#7d8590]'}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-[#00D4AA] focus:ring-[#00D4AA] focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="terms" className="text-sm text-[#7d8590]">
              I agree to the{' '}
              <Link href="/terms" className="text-[#00D4AA] hover:text-[#1f6feb] transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#00D4AA] hover:text-[#1f6feb] transition-colors">
                Privacy Policy
              </Link>
            </label>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading || !acceptTerms || passwordStrength.score < 3}
            className="btn-primary w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              'Start your 14-day free trial'
            )}
          </motion.button>
        </form>

        {/* Sign in link */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <p className="text-[#7d8590]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#00D4AA] hover:text-[#1f6feb] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}