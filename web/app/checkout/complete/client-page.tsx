'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CompleteClientPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get('status')
  const plan = searchParams.get('plan')
  const [step, setStep] = useState(0)
  const [subActive, setSubActive] = useState(false)

  useEffect(() => {
    if (status === 'success') {
      var t1 = setTimeout(function() { setStep(1) }, 400)
      var t2 = setTimeout(function() { setStep(2) }, 1000)
      var t3 = setTimeout(function() { setStep(3) }, 1600)
      return function() { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [status])

  // Poll subscription status after successful checkout
  useEffect(() => {
    if (status !== 'success') return
    var attempts = 0
    var maxAttempts = 10
    var timer = setInterval(function() {
      attempts++
      fetch('/api/subscription')
        .then(function(r) { return r.json() })
        .then(function(data) {
          if (data.active) {
            setSubActive(true)
            clearInterval(timer)
          }
        })
        .catch(function() {})
      if (attempts >= maxAttempts) {
        clearInterval(timer)
      }
    }, 3000)
    return function() { clearInterval(timer) }
  }, [status])

  if (status === 'error') {
    return (
      <Shell>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full border border-[#ff4d4d]/15 bg-[#ff4d4d]/[0.03] flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment didn't go through.</h1>
          <p className="text-[14px] text-white/35 mb-8">No charge was made. Try again or use a different payment method.</p>
          <Link href="/checkout" className="inline-block px-8 py-3 bg-[#00e5a0] text-black text-[14px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors">
            Try Again
          </Link>
        </div>
      </Shell>
    )
  }

  const steps = [
    { n: '1', title: 'Connect Telegram', desc: 'Link your account to receive instant signals the moment they fire.', href: '/dashboard/settings', label: 'Connect Now' },
    { n: '2', title: 'Open the dashboard', desc: 'See live performance, equity curve, and your complete trade history.', href: '/dashboard', label: 'Open Dashboard' },
    { n: '3', title: 'Wait for the next signal', desc: 'The engine scans 24/7 across 5 pairs. Average ~1 signal per day.', href: null, label: null },
  ]

  return (
    <Shell>
      <div className="max-w-lg w-full">

        {/* Success icon */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full border border-[#00e5a0]/20 bg-[#00e5a0]/[0.04] flex items-center justify-center mx-auto mb-6" style={{boxShadow:'0 0 40px rgba(0,229,160,.06)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" style={{strokeDasharray:24, strokeDashoffset:0}}>
                <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.5s" fill="freeze" begin="0.3s"/>
              </path>
            </svg>
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight mb-2">You're in.</h1>
          <p className="text-[14px] text-white/35">
            {plan === 'annual' ? 'Annual' : 'Monthly'} subscription active. Here's how to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="transition-all duration-500" style={{ opacity: step > i ? 1 : 0, transform: step > i ? 'translateY(0)' : 'translateY(12px)' }}>
              <div className="flex gap-4 items-start bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-5 hover:border-white/[0.06] transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] mono font-bold text-[#00e5a0]/50">{s.n}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-white/75 mb-0.5">{s.title}</div>
                  <div className="text-[12px] text-white/30 leading-relaxed">{s.desc}</div>
                  {s.href && (
                    <Link href={s.href} className="inline-block mt-2 text-[11px] text-[#00e5a0]/50 mono tracking-wider hover:text-[#00e5a0] transition-colors">
                      {s.label} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="text-center transition-all duration-500" style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'translateY(0)' : 'translateY(12px)' }}>
          <Link href="/dashboard/settings" className="inline-block px-10 py-3.5 bg-[#00e5a0] text-black text-[14px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors shadow-[0_0_30px_rgba(0,229,160,.08)]">
            Connect Telegram
          </Link>
          <div className="mt-3">
            <Link href="/dashboard" className="text-[11px] text-white/20 mono tracking-wider hover:text-white/35 transition-colors">
              Skip to dashboard →
            </Link>
          </div>
        </div>

      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `body{font-family:'Inter',-apple-system,sans-serif}.mono{font-family:'JetBrains Mono',monospace}` }} />
      <nav className="border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.webp" alt="PulseWave" className="h-7" />
          </Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  )
}
