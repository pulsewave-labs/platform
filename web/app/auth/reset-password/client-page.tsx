'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'

export default function ResetPasswordPage() {
  var [password, setPassword] = useState('')
  var [confirm, setConfirm] = useState('')
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState('')
  var [done, setDone] = useState(false)
  var [show, setShow] = useState(false)
  var [sessionReady, setSessionReady] = useState(false)
  var router = useRouter()
  var params = useSearchParams()
  var supabase = createClient()

  useEffect(() => {
    if (typeof window === 'undefined') return

    var hash = window.location.hash
    if (hash) {
      var hashParams = new URLSearchParams(hash.substring(1))
      var access = hashParams.get('access_token')
      var refresh = hashParams.get('refresh_token')
      if (access && refresh) {
        supabase.auth.setSession({ access_token: access, refresh_token: refresh }).then(() => {
          setSessionReady(true)
        })
        return
      }
    }

    var access = params.get('access_token')
    var refresh = params.get('refresh_token')
    if (access && refresh) {
      supabase.auth.setSession({ access_token: access, refresh_token: refresh }).then(() => {
        setSessionReady(true)
      })
      return
    }

    supabase.auth.getUser().then(r => {
      if (r.data.user) setSessionReady(true)
    })
  }, [])

  var valid = password.length >= 8 && password === confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    setError('')

    var { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  var inputClass = 'w-full px-4 py-3.5 bg-[#0a0a0c] border border-white/[0.08] rounded-xl text-[15px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/30 transition-all'

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "body{font-family:'Inter',-apple-system,sans-serif;background:#08080a}.mono{font-family:'JetBrains Mono',monospace}" }} />

      <nav className="border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center">
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-7" /></Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">

          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h1 className="text-[22px] font-bold mb-2">Password updated.</h1>
              <p className="text-[14px] text-white/35 mb-6">Redirecting to your dashboard...</p>
              <Link href="/dashboard" className="text-[13px] text-[#00e5a0]/50 mono hover:text-[#00e5a0] transition-colors">
                Go to dashboard →
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h1 className="text-[22px] font-bold mb-1">Reset your password</h1>
                <p className="text-[14px] text-white/35">Enter a new password for your account.</p>
              </div>

              {!sessionReady && (
                <div className="text-center py-8">
                  <p className="text-[13px] text-white/25 mono">Verifying your link...</p>
                </div>
              )}

              {sessionReady && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="text-[12px] text-[#ff4d4d] bg-[#ff4d4d]/[0.05] border border-[#ff4d4d]/10 rounded-xl px-4 py-2.5">
                      {error}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="New password (min. 8 characters)"
                      className={inputClass}
                      minLength={8}
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/30 transition-colors text-[12px] mono">
                      {show ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className={'h-full rounded-full transition-all duration-300 ' + (password.length < 8 ? 'bg-[#ff4d4d]/50 w-[20%]' : password.length < 12 ? 'bg-[#ff9f43]/50 w-[60%]' : 'bg-[#00e5a0]/50 w-full')} />
                      </div>
                      <span className={'text-[10px] mono ' + (password.length < 8 ? 'text-[#ff4d4d]/50' : password.length < 12 ? 'text-[#ff9f43]/50' : 'text-[#00e5a0]/50')}>
                        {password.length < 8 ? 'TOO SHORT' : password.length < 12 ? 'GOOD' : 'STRONG'}
                      </span>
                    </div>
                  )}

                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    className={inputClass}
                    minLength={8}
                    required
                  />

                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-[11px] text-[#ff4d4d]/50 px-1">Passwords don't match</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !valid}
                    className="w-full py-3.5 bg-[#00e5a0] text-black rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}

              <p className="text-[10px] text-white/10 text-center mt-6">
                Having trouble? <a href="mailto:mason@pulsewavelabs.io" className="underline hover:text-white/20">Contact support</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
