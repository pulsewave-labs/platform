'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CompleteClientPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const plan = searchParams.get('plan')
  const [step, setStep] = useState(0)

  // Animate steps in
  useEffect(() => {
    if (status === 'success') {
      const t1 = setTimeout(() => setStep(1), 500)
      const t2 = setTimeout(() => setStep(2), 1200)
      const t3 = setTimeout(() => setStep(3), 1900)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [status])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center px-6">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `body{font-family:'Inter',-apple-system,sans-serif}.mono{font-family:'JetBrains Mono',monospace}` }} />
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full border-2 border-[#ff4d4d]/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-[24px] text-[#ff4d4d]/60 mono font-bold">X</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">Payment didn't go through.</h1>
          <p className="text-[14px] text-white/40 mb-8">No charge was made. Try again or use a different payment method.</p>
          <Link href="/checkout" className="inline-block px-8 py-3 bg-[#00e5a0] text-black text-[14px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center px-6">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .6s ease-out forwards}
        @keyframes checkDraw{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
        .check-draw{stroke-dasharray:24;animation:checkDraw .5s ease-out .3s forwards;stroke-dashoffset:24}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(0,229,160,.1)}50%{box-shadow:0 0 40px 10px rgba(0,229,160,.08)}}
        .pulse-glow{animation:pulseGlow 3s ease-in-out infinite}
      `}} />

      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="pulse-glow w-20 h-20 rounded-full border-2 border-[#00e5a0]/30 flex items-center justify-center mx-auto mb-8 bg-[#00e5a0]/[0.04]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path className="check-draw" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <div className="fu mb-10">
          <h1 className="text-2xl md:text-[32px] font-bold tracking-tight mb-3">You're in.</h1>
          <p className="text-[14px] text-white/40 max-w-sm mx-auto">
            Your {plan === 'annual' ? 'annual' : 'monthly'} subscription is active. Signals start the moment the next setup confirms.
          </p>
        </div>

        {/* Setup steps */}
        <div className="space-y-3 mb-10 text-left max-w-sm mx-auto">
          {[
            { n: '1', title: 'Connect Telegram', desc: 'Link your Telegram account to receive instant signals.', action: '/dashboard/settings', label: 'Connect Now', delay: 1 },
            { n: '2', title: 'Review the dashboard', desc: 'See live performance, equity curve, and trade history.', action: '/dashboard', label: 'Open Dashboard', delay: 2 },
            { n: '3', title: 'Wait for the next signal', desc: 'The engine scans 24/7. Average ~1 signal per day across 5 pairs.', action: null, label: null, delay: 3 },
          ].map((s, i) => (
            <div key={i} className="fu" style={{ animationDelay: s.delay * 0.7 + 's', opacity: step >= s.delay ? 1 : 0 }}>
              <div className="flex gap-4 items-start bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 hover:border-white/[0.06] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center shrink-0">
                  <span className="text-[12px] mono font-bold text-[#00e5a0]/60">{s.n}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-white/80 mb-0.5">{s.title}</div>
                  <div className="text-[13px] text-white/35">{s.desc}</div>
                  {s.action && (
                    <Link href={s.action} className="inline-block mt-2 text-[12px] text-[#00e5a0]/60 mono tracking-wider hover:text-[#00e5a0] transition-colors">
                      {s.label} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="fu" style={{ animationDelay: '2.5s', opacity: step >= 3 ? 1 : 0 }}>
          <Link href="/dashboard/settings" className="inline-block px-10 py-4 bg-[#00e5a0] text-black text-[14px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors shadow-[0_0_30px_rgba(0,229,160,.1)]">
            Connect Telegram and Start
          </Link>
          <div className="mt-3">
            <Link href="/dashboard" className="text-[12px] text-white/25 mono hover:text-white/40 transition-colors">
              Skip to dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
