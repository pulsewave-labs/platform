'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { 
  Mail, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
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
        {!success ? (
          <>
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00F0B5] to-[#7c3aed] rounded-2xl mb-4 animate-float">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot your password?</h1>
              <p className="text-[#7d8590]">
                No worries! Enter your email address and we'll send you a reset link.
              </p>
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

            {/* Reset Form */}
            <form onSubmit={handleResetPassword} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
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
                    className="input-glow w-full pl-10 pr-4 py-3 bg-[#0d1117] text-[#f0f6fc] rounded-lg border border-[#30363d] placeholder-[#7d8590] focus:border-[#00F0B5] transition-colors"
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Send reset link'
                )}
              </motion.button>
            </form>

            {/* Back to login */}
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[#00F0B5] hover:text-[#1f6feb] font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </motion.div>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6"
            >
              <CheckCircle className="h-12 w-12 text-green-500" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-[#7d8590] mb-6 leading-relaxed">
                We've sent a password reset link to <br />
                <span className="text-[#00F0B5] font-medium">{email}</span>
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-[#7d8590]">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                    }}
                    className="text-[#00F0B5] hover:text-[#1f6feb] font-medium transition-colors"
                  >
                    try again
                  </button>
                </p>
                
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[#00F0B5] hover:text-[#1f6feb] font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}