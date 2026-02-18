'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WhopCheckoutEmbed } from '@whop/checkout/react'

const PLANS = {
  monthly: { id: 'plan_kaL9L5TvxU8Bg', price: '$149', period: '/mo', label: 'Monthly', save: '' },
  annual: { id: 'plan_KXHGlrE70uC9q', price: '$1,490', period: '/yr', label: 'Annual', save: 'Save $298' },
}

export default function CheckoutClientPage() {
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') === 'annual' ? 'annual' : 'monthly'
  const [selected, setSelected] = useState<'monthly' | 'annual'>(initialPlan)
  const [perf, setPerf] = useState<any>(null)

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => { if (d) setPerf(d) }).catch(() => {})
  }, [])

  const plan = PLANS[selected]
  const stats = perf?.stats
  const returnUrl = typeof window !== 'undefined' ? window.location.origin + '/checkout/complete' : ''

  return (
    <div className="min-h-screen bg-[#08080a] text-white antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .5s ease-out forwards}
      `}} />

      {/* Nav */}
      <nav className="border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.webp" alt="PulseWave" className="h-7" />
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-white/20 mono tracking-wider">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            SECURE CHECKOUT
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

        {/* Header */}
        <div className="text-center mb-10 fu">
          <h1 className="text-2xl md:text-[32px] font-bold tracking-tight mb-2 leading-tight">
            Start receiving signals.
          </h1>
          <p className="text-[14px] text-white/35 max-w-md mx-auto">
            Choose your plan. Pay securely. Signals start the moment the next setup confirms.
          </p>
        </div>

        {/* Plan selector */}
        <div className="max-w-md mx-auto mb-10 fu" style={{animationDelay:'.1s'}}>
          <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/[0.04] rounded-xl">
            {(['monthly', 'annual'] as const).map(p => {
              const active = selected === p
              const isAnnual = p === 'annual'
              return (
                <button key={p} onClick={() => setSelected(p)}
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


        <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-start">

          {/* LEFT: Checkout embed */}
          <div className="fu order-1" style={{animationDelay:'.2s'}}>
            <div className="bg-[#0a0a0c] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.03] flex items-center justify-between">
                <span className="text-[11px] text-white/30 mono tracking-wider">PAYMENT</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[18px] mono font-bold text-white/80">{plan.price}</span>
                  <span className="text-[11px] text-white/25 mono">{plan.period}</span>
                </div>
              </div>
              <WhopCheckoutEmbed
                key={selected}
                planId={plan.id}
                theme="dark"
                returnUrl={returnUrl}
                hidePrice
                styles={{ container: { paddingX: 20, paddingY: 16 } }}
                fallback={
                  <div className="flex items-center justify-center py-24">
                    <div className="w-32 h-px bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="w-12 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                }
                onComplete={(planId, receiptId) => {
                  window.location.href = `/checkout/complete?status=success&plan=${selected}&receipt=${receiptId}`
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-white/15 mono">
              <span className="flex items-center gap-1">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                SSL encrypted
              </span>
              <span>Powered by Whop</span>
            </div>

            <p className="text-[10px] text-white/10 text-center mt-2 leading-relaxed max-w-sm mx-auto">
              By subscribing you agree to our <Link href="/terms" className="underline hover:text-white/20">Terms</Link> and <Link href="/privacy" className="underline hover:text-white/20">Privacy Policy</Link>. {selected === 'monthly' ? 'Billed monthly.' : 'Billed annually.'} Cancel anytime.
            </p>
          </div>


          {/* RIGHT: Order summary */}
          <div className="fu order-2" style={{animationDelay:'.3s'}}>

            {/* What you get */}
            <div className="border border-white/[0.04] rounded-xl p-6 mb-4">
              <div className="text-[11px] text-white/20 mono tracking-[.2em] mb-4">WHAT YOU GET</div>
              <div className="space-y-3">
                {[
                  { t: 'Real-time signals on 5 pairs', s: 'BTC, ETH, SOL, AVAX, XRP' },
                  { t: 'Instant Telegram delivery', s: 'Under 60 seconds from detection' },
                  { t: 'Complete trade levels', s: 'Entry, stop loss, take profit' },
                  { t: 'Position sizing for your account', s: 'Risk calculated automatically' },
                  { t: 'Full performance dashboard', s: 'Equity curve, trade history, stats' },
                  { t: 'Cancel anytime', s: 'No lock-in, no questions asked' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[8px] text-[#00e5a0]/60 mono">✓</span>
                    </div>
                    <div>
                      <div className="text-[13px] text-white/60">{f.t}</div>
                      <div className="text-[11px] text-white/20">{f.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-px bg-white/[0.02] rounded-xl overflow-hidden mb-4">
                {[
                  { l: 'RETURN', v: '+' + stats.totalReturn + '%', c: '#00e5a0' },
                  { l: 'PROFIT FACTOR', v: stats.profitFactor.toFixed(2), c: '#e0e0e0' },
                  { l: 'TRADES', v: stats.totalTrades.toString(), c: '#e0e0e0' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#0a0a0c] px-4 py-3 text-center">
                    <div className="text-[9px] text-[#555] mono tracking-[.15em] mb-1">{s.l}</div>
                    <div className="text-[16px] font-bold mono" style={{ color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Social proof quote */}
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
      </div>
    </div>
  )
}
