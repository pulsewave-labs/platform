'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { WhopCheckoutEmbed } from '@whop/checkout/react'

const PLANS = {
  monthly: { id: 'plan_kaL9L5TvxU8Bg', price: '$149', period: '/mo', label: 'Monthly', save: '' },
  annual: { id: 'plan_KXHGlrE70uC9q', price: '$1,490', period: '/yr', label: 'Annual', save: 'Save $298' },
}

export default function CheckoutClientPage() {
  var searchParams = useSearchParams()
  var initialPlan = searchParams.get('plan') === 'annual' ? 'annual' : 'monthly'
  var [selected, setSelected] = useState(initialPlan)
  var [perf, setPerf] = useState(null)

  var [email, setEmail] = useState('')
  var [password, setPassword] = useState('')
  var [confirmPassword, setConfirmPassword] = useState('')
  var [accountReady, setAccountReady] = useState(false)
  var [accountError, setAccountError] = useState('')
  var [creating, setCreating] = useState(false)

  var supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(function() {
    fetch('/api/performance').then(function(r) { return r.json() }).then(function(d) { if (d) setPerf(d) }).catch(function() {})
  }, [])

  useEffect(function() {
    supabase.auth.getUser().then(function(res) {
      if (res.data.user) {
        setAccountReady(true)
        setEmail(res.data.user.email || '')
      }
    })
  }, [])

  var plan = PLANS[selected]
  var stats = perf ? (perf as any).stats : null
  var returnUrl = typeof window !== 'undefined' ? window.location.origin + '/checkout/complete' : ''
  var formValid = email.trim() && password.length >= 8 && password === confirmPassword

  function handleCreateAccount(e: any) {
    e.preventDefault()
    setAccountError('')

    if (password !== confirmPassword) {
      setAccountError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setAccountError('Password must be at least 8 characters.')
      return
    }

    setCreating(true)
    supabase.auth.signUp({ email: email, password: password }).then(function(result) {
      if (result.error) {
        setAccountError(result.error.message)
        setCreating(false)
      } else {
        setAccountReady(true)
        setCreating(false)
      }
    })
  }

  var inputClass = "w-full px-3.5 py-3 bg-[#0c0c0e] border border-white/[0.06] rounded-lg text-white text-[14px] placeholder-white/20 focus:border-[#00e5a0]/30 focus:ring-1 focus:ring-[#00e5a0]/20 outline-none transition-colors min-h-[48px]"

  return (
    <div className="min-h-screen bg-[#08080a] text-white antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: [
        "body{font-family:'Inter',-apple-system,sans-serif}",
        ".mono{font-family:'JetBrains Mono',monospace}",
        "@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}",
        "@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}",
        ".fu{animation:fadeUp .5s ease-out forwards}",
        // Make Whop iframe never clip — full height, no internal scroll
        "iframe[title='Whop Embedded Checkout']{min-height:400px;overflow:visible!important}",
      ].join('\n') }} />

      {/* Nav */}
      <nav className="border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 md:px-10 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.webp" alt="PulseWave" className="h-7" />
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-white/20 mono tracking-wider">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            SECURE CHECKOUT
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-10 py-6 md:py-14">

        {/* Header */}
        <div className="text-center mb-6 md:mb-10 fu">
          <h1 className="text-xl md:text-[32px] font-bold tracking-tight mb-1.5 md:mb-2 leading-tight">
            Start receiving signals.
          </h1>
          <p className="text-[13px] md:text-[14px] text-white/35 max-w-md mx-auto">
            Create your account, choose your plan, and get instant access.
          </p>
        </div>

        {/* Plan selector */}
        <div className="max-w-md mx-auto mb-6 md:mb-10 fu" style={{animationDelay:'.1s'}}>
          <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/[0.04] rounded-xl">
            {(['monthly', 'annual'] as const).map(function(p) {
              var active = selected === p
              var isAnnual = p === 'annual'
              return (
                <button key={p} onClick={function() { setSelected(p) }}
                  className={'flex-1 relative py-3 rounded-lg text-center transition-all duration-200 ' +
                    (active
                      ? (isAnnual ? 'bg-[#00e5a0]/[0.06] border border-[#00e5a0]/15' : 'bg-white/[0.04] border border-white/[0.06]')
                      : 'border border-transparent hover:bg-white/[0.02]')
                  }>
                  {isAnnual && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#00e5a0] text-black text-[9px] font-bold mono tracking-wider rounded-sm">BEST VALUE</div>}
                  <div className={'text-[11px] mono tracking-wider mb-1 ' + (active ? 'text-white/60' : 'text-white/25')}>{PLANS[p].label.toUpperCase()}</div>
                  <div className={'text-[18px] font-bold mono ' + (active ? (isAnnual ? 'text-[#00e5a0]' : 'text-white') : 'text-white/30')}>
                    {PLANS[p].price}<span className="text-[12px] opacity-40">{PLANS[p].period}</span>
                  </div>
                  {PLANS[p].save && <div className="text-[10px] text-[#00e5a0]/50 mono mt-0.5">{PLANS[p].save}</div>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-12 items-start">

          {/* LEFT: Account + Payment (primary on mobile) */}
          <div className="fu order-1" style={{animationDelay:'.2s'}}>

            {/* Step 1: Account */}
            <div className={'bg-[#0a0a0c] border rounded-xl overflow-hidden mb-4 transition-all ' + (accountReady ? 'border-[#00e5a0]/15' : 'border-white/[0.06]')}>
              <div className="px-4 md:px-5 py-3 border-b border-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={'w-5 h-5 rounded-full flex items-center justify-center text-[10px] mono font-bold ' + (accountReady ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-white/[0.04] text-white/30')}>
                    {accountReady ? '✓' : '1'}
                  </div>
                  <span className="text-[11px] text-white/30 mono tracking-wider">ACCOUNT</span>
                </div>
                {accountReady && <span className="text-[11px] text-[#00e5a0]/50 mono truncate ml-2">{email}</span>}
              </div>

              {!accountReady ? (
                <form onSubmit={handleCreateAccount} className="p-4 md:p-5 space-y-3">
                  {accountError && (
                    <div className="text-[12px] text-[#ff4d4d] bg-[#ff4d4d]/[0.05] border border-[#ff4d4d]/10 rounded-lg px-3 py-2">
                      {accountError}
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] text-white/25 mono tracking-wider mb-1.5">EMAIL</label>
                    <input type="email" value={email} onChange={function(e) { setEmail(e.target.value) }} className={inputClass} placeholder="you@example.com" required />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/25 mono tracking-wider mb-1.5">PASSWORD</label>
                    <input type="password" value={password} onChange={function(e) { setPassword(e.target.value) }} className={inputClass} placeholder="Min. 8 characters" minLength={8} required />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/25 mono tracking-wider mb-1.5">CONFIRM PASSWORD</label>
                    <input type="password" value={confirmPassword} onChange={function(e) { setConfirmPassword(e.target.value) }} className={inputClass} placeholder="Re-enter password" minLength={8} required />
                  </div>
                  <button type="submit" disabled={creating || !formValid}
                    className="w-full py-3 bg-[#00e5a0] text-black text-[14px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px]">
                    {creating ? 'Creating...' : 'Continue to Payment'}
                  </button>

                  <p className="text-center text-[11px] text-white/20">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-[#00e5a0]/50 hover:text-[#00e5a0] transition-colors">Sign in</Link>
                  </p>
                </form>
              ) : (
                <div className="px-4 md:px-5 py-3 flex items-center gap-2 text-[13px] text-white/40">
                  <span className="text-[#00e5a0]/40">✓</span> Signed in as {email}
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className={'bg-[#0a0a0c] border rounded-xl transition-all ' + (accountReady ? 'border-white/[0.06] opacity-100' : 'border-white/[0.03] opacity-30 pointer-events-none')}>
              <div className="px-4 md:px-5 py-3 border-b border-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={'w-5 h-5 rounded-full flex items-center justify-center text-[10px] mono font-bold ' + (accountReady ? 'bg-white/[0.04] text-white/30' : 'bg-white/[0.04] text-white/15')}>2</div>
                  <span className="text-[11px] text-white/30 mono tracking-wider">PAYMENT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[18px] mono font-bold text-white/80">{plan.price}</span>
                  <span className="text-[11px] text-white/25 mono">{plan.period}</span>
                </div>
              </div>
              {accountReady ? (
                <div className="overflow-visible">
                  <WhopCheckoutEmbed
                    key={selected}
                    planId={plan.id}
                    theme="dark"
                    returnUrl={returnUrl}
                    hidePrice
                    hideEmail
                    prefill={{ email: email }}
                    styles={{ container: { paddingX: 16, paddingY: 12 } }}
                    fallback={
                      <div className="flex items-center justify-center py-20">
                        <div className="w-32 h-px bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div className="w-12 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    }
                    onComplete={function(planId, receiptId) {
                      window.location.href = '/checkout/complete?status=success&plan=' + selected + '&receipt=' + receiptId
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-[13px] text-white/15 mono">
                  Create your account first
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-white/15 mono">
              <span className="flex items-center gap-1">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                SSL encrypted
              </span>
              <span>Powered by Whop</span>
              <span>Cancel anytime</span>
            </div>

            <p className="text-[10px] text-white/10 text-center mt-2 leading-relaxed max-w-sm mx-auto">
              By subscribing you agree to our <Link href="/terms" className="underline hover:text-white/20">Terms</Link> and <Link href="/privacy" className="underline hover:text-white/20">Privacy Policy</Link>. {selected === 'monthly' ? 'Billed monthly.' : 'Billed annually.'} Cancel anytime.
            </p>
          </div>


          {/* RIGHT: Order summary — hidden on mobile, shown on desktop */}
          <div className="hidden md:block fu order-2" style={{animationDelay:'.3s'}}>

            <div className="bg-[#0a0a0c] border border-white/[0.06] rounded-xl p-6 mb-4">
              <div className="text-[11px] text-white/35 mono tracking-[.2em] mb-4">WHAT YOU GET</div>
              <div className="space-y-3">
                {[
                  { t: 'Real-time signals on 5 pairs', s: 'BTC, ETH, SOL, AVAX, XRP' },
                  { t: 'Instant Telegram delivery', s: 'Under 60 seconds from detection' },
                  { t: 'Complete trade levels', s: 'Entry, stop loss, take profit' },
                  { t: 'Position sizing for your account', s: 'Risk calculated automatically' },
                  { t: 'Full performance dashboard', s: 'Equity curve, trade history, stats' },
                  { t: 'Cancel anytime', s: 'No lock-in, no questions asked' },
                ].map(function(f, i) {
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[8px] text-[#00e5a0]/60 mono">✓</span>
                      </div>
                      <div>
                        <div className="text-[13px] text-white/75">{f.t}</div>
                        <div className="text-[11px] text-white/35">{f.s}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-3 gap-px bg-white/[0.02] rounded-xl overflow-hidden mb-4">
                {[
                  { l: 'RETURN', v: '+' + stats.totalReturn + '%', c: '#00e5a0' },
                  { l: 'PROFIT FACTOR', v: stats.profitFactor.toFixed(2), c: '#e0e0e0' },
                  { l: 'TRADES', v: stats.totalTrades.toString(), c: '#e0e0e0' },
                ].map(function(s, i) {
                  return (
                    <div key={i} className="bg-[#0a0a0c] px-4 py-3 text-center">
                      <div className="text-[9px] text-[#555] mono tracking-[.15em] mb-1">{s.l}</div>
                      <div className="text-[16px] font-bold mono" style={{ color: s.c }}>{s.v}</div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="bg-white/[0.015] border border-white/[0.03] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#00e5a0]/[0.06] flex items-center justify-center">
                  <span className="text-[12px] mono text-[#00e5a0]/50 font-bold">P</span>
                </div>
                <div>
                  <div className="text-[12px] text-white/50 font-medium">PulseWave Engine</div>
                  <div className="text-[10px] text-white/20 mono">Verified track record</div>
                </div>
              </div>
              <p className="text-[13px] text-white/35 leading-relaxed">
                {stats ? stats.totalTrades + ' trades over ' + stats.totalMonths + ' months. ' + stats.profitableMonths + ' profitable months. $10K turned into $' + Math.round(stats.finalBalance).toLocaleString() + '. Every trade published.' : 'Loading verified stats...'}
              </p>
              <Link href="/performance" className="inline-block mt-2 text-[11px] text-[#00e5a0]/40 mono tracking-wider hover:text-[#00e5a0]/60 transition-colors">
                AUDIT EVERY TRADE →
              </Link>
            </div>

          </div>
        </div>

        {/* Mobile-only: compact proof strip below checkout */}
        <div className="md:hidden mt-6 fu" style={{animationDelay:'.3s'}}>
          {stats && (
            <div className="grid grid-cols-3 gap-px bg-white/[0.02] rounded-xl overflow-hidden">
              {[
                { l: 'RETURN', v: '+' + stats.totalReturn + '%', c: '#00e5a0' },
                { l: 'PROFIT FACTOR', v: stats.profitFactor.toFixed(2), c: '#e0e0e0' },
                { l: 'TRADES', v: stats.totalTrades.toString(), c: '#e0e0e0' },
              ].map(function(s, i) {
                return (
                  <div key={i} className="bg-[#0a0a0c] px-3 py-2.5 text-center">
                    <div className="text-[9px] text-[#555] mono tracking-[.15em] mb-0.5">{s.l}</div>
                    <div className="text-[15px] font-bold mono" style={{ color: s.c }}>{s.v}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
