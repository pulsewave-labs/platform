'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WhopCheckoutEmbed } from '@whop/checkout/react'

// TODO: Replace with real Whop plan IDs from Mason
const PLANS = {
  monthly: { id: 'plan_MONTHLY_PLACEHOLDER', price: '$149', period: '/mo', label: 'Monthly', save: '' },
  annual: { id: 'plan_ANNUAL_PLACEHOLDER', price: '$1,490', period: '/yr', label: 'Annual', save: 'Save $298' },
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
      `}} />

      {/* Nav */}
      <nav className="bg-[#08080a] border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.webp" alt="PulseWave" className="h-7" />
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-white/30 mono">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secure checkout
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-16">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-start">

          {/* LEFT: Order summary + social proof */}
          <div>
            <div className="mb-8">
              <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.2em] mb-3">PULSEWAVE SIGNALS</div>
              <h1 className="text-2xl md:text-[32px] font-bold tracking-tight mb-3 leading-tight">
                Get every signal.<br/>The moment it fires.
              </h1>
              <p className="text-[14px] text-white/40 leading-relaxed">
                Real-time crypto trading signals delivered to Telegram. Full dashboard access. Position sizing for your account.
              </p>
            </div>

            {/* Plan toggle */}
            <div className="flex gap-2 mb-6">
              {(['monthly', 'annual'] as const).map(p => (
                <button key={p} onClick={() => setSelected(p)}
                  className={'flex-1 py-3 rounded-lg text-[13px] font-bold mono tracking-wider transition-all ' +
                    (selected === p
                      ? (p === 'annual' ? 'bg-[#00e5a0]/[0.08] border border-[#00e5a0]/20 text-[#00e5a0]' : 'bg-white/[0.04] border border-white/[0.08] text-white')
                      : 'border border-white/[0.04] text-white/30 hover:text-white/50 hover:border-white/[0.06]')
                  }>
                  <div>{PLANS[p].label.toUpperCase()}</div>
                  <div className="text-[16px] mt-1">{PLANS[p].price}<span className="text-[11px] opacity-50">{PLANS[p].period}</span></div>
                  {PLANS[p].save && <div className="text-[10px] text-[#00e5a0]/60 mt-0.5">{PLANS[p].save}</div>}
                </button>
              ))}
            </div>

            {/* What's included */}
            <div className="border border-white/[0.04] rounded-xl p-5 mb-6">
              <div className="text-[11px] text-white/25 mono tracking-[.15em] mb-3">INCLUDED</div>
              <div className="space-y-2.5">
                {[
                  'Real-time signals on BTC, ETH, SOL, AVAX, XRP',
                  'Instant Telegram delivery (under 60 seconds)',
                  'Entry, stop loss, take profit on every signal',
                  'Position sizing calculated for your account',
                  'Full performance dashboard with trade history',
                  'Cancel anytime, no questions asked',
                ].map((f,i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-white/50">
                    <span className="text-[#00e5a0]/40 mono text-[12px]">✓</span>{f}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats proof */}
            {stats && (
              <div className="grid grid-cols-3 gap-px bg-white/[0.02] rounded-xl overflow-hidden">
                {[
                  { l: 'RETURN', v: '+' + stats.totalReturn + '%', c: '#00e5a0' },
                  { l: 'WIN RATE', v: stats.winRate + '%', c: '#e0e0e0' },
                  { l: 'TRADES', v: stats.totalTrades.toString(), c: '#e0e0e0' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#0a0a0c] px-4 py-3 text-center">
                    <div className="text-[10px] text-[#555] mono tracking-[.15em] mb-1">{s.l}</div>
                    <div className="text-[16px] font-bold mono" style={{color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Trust signals */}
            <div className="flex items-center gap-4 mt-5 text-[11px] text-white/20 mono">
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                SSL encrypted
              </span>
              <span>Powered by Whop</span>
              <span>Cancel anytime</span>
            </div>
          </div>


          {/* RIGHT: Whop checkout embed */}
          <div>
            <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-xl overflow-hidden">
              <WhopCheckoutEmbed
                key={selected}
                planId={plan.id}
                theme="dark"
                returnUrl={returnUrl}
                hidePrice
                styles={{ container: { paddingX: 16, paddingY: 20 } }}
                fallback={
                  <div className="flex items-center justify-center py-20">
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

            <p className="text-[10px] text-white/15 text-center mt-3 leading-relaxed">
              By subscribing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>. {selected === 'monthly' ? 'Billed monthly.' : 'Billed annually.'} Cancel anytime.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
