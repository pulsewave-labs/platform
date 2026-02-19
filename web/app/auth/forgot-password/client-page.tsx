'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'

export default function ForgotPasswordPage() {
  var [email, setEmail] = useState('')
  var [loading, setLoading] = useState(false)
  var [sent, setSent] = useState(false)
  var [error, setError] = useState('')
  var supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError('')
    var { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-[100dvh] bg-[#08080a] text-white flex flex-col antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#08080a;-webkit-text-size-adjust:100%}
        .mono{font-family:'JetBrains Mono',monospace}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.007) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.007) 1px,transparent 1px);background-size:50px 50px}
        input{font-size:16px!important}
      `}} />

      <nav className="border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 h-14 flex items-center">
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-6 sm:h-7" /></Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:py-16 grid-bg relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-sm relative z-10">

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center mx-auto mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h1 className="text-[22px] font-bold mb-2">Check your email.</h1>
              <p className="text-[14px] text-white/35 mb-2">
                We sent a reset link to <strong className="text-white/60 break-all">{email}</strong>
              </p>
              <p className="text-[12px] text-white/20 mb-6">
                Click the link in the email to set a new password. Check spam if you don't see it.
              </p>
              <button onClick={() => setSent(false)}
                className="text-[13px] text-[#00e5a0]/50 mono hover:text-[#00e5a0] active:text-[#00e5a0] transition-colors min-h-[44px] bg-transparent border-none cursor-pointer"
                style={{WebkitTapHighlightColor: 'transparent'}}>
                Send again →
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <h1 className="text-[22px] font-bold mb-1">Reset your password</h1>
                <p className="text-[14px] text-white/35">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="text-[13px] text-[#ff4d4d] bg-[#ff4d4d]/[0.05] border border-[#ff4d4d]/10 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 min-h-[48px] bg-[#0a0a0c] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/30 transition-all"
                  required
                  autoFocus
                  autoComplete="email"
                />

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full min-h-[48px] py-3.5 bg-[#00e5a0] text-[#08080a] rounded-xl font-bold text-[15px] hover:bg-[#00cc8e] active:scale-[0.985] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{WebkitTapHighlightColor: 'transparent'}}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-[13px] text-white/20 text-center mt-6">
                <Link href="/auth/login" className="text-[#00e5a0]/40 hover:text-[#00e5a0] transition-colors min-h-[44px] inline-flex items-center">← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
