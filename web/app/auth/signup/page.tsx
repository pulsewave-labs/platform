'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div>
      {/* Logo */}
      <div className="text-center mb-8">
        <img src="/logo.webp" alt="PulseWave" className="h-8 w-auto mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-white">Start your free trial</h1>
        <p className="text-sm text-secondary mt-1">14 days free. No credit card required.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-short bg-short/10 border border-short/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-secondary mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-white text-sm placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-white text-sm placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-white text-sm placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
            placeholder="Min. 8 characters"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-accent text-[#0a0e17] font-semibold text-sm rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-xs text-muted text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p className="text-center text-sm text-secondary mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-accent hover:text-accent-hover transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
