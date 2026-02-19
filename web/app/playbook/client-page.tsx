'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PlaybookOptIn() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const params = useSearchParams()

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) { setError('Enter a valid email'); return }
    setLoading(true); setError('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'playbook',
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
        }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      // Redirect to the playbook after short delay
      setTimeout(() => { window.location.href = '/playbook/read' }, 1500)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-[#c8c8c8] flex flex-col items-center justify-center px-5 relative overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#06060a}
        .mono{font-family:'JetBrains Mono',monospace}
        ::selection{background:rgba(0,229,160,.15);color:#fff}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) forwards}
        .fu1{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .1s forwards;opacity:0}
        .fu2{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .2s forwards;opacity:0}
        .fu3{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .3s forwards;opacity:0}
        .fu4{animation:fadeUp .7s cubic-bezier(.16,1,.3,1) .4s forwards;opacity:0}
      `}} />

      {/* Subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.04) 0%,transparent 65%)'}}/>

      <div className="w-full max-w-md mx-auto relative z-10 text-center py-20">
        {/* Logo */}
        <div className="fu mb-12">
          <img src="/logo.webp" alt="PulseWave" className="h-6 mx-auto opacity-50" />
        </div>

        {/* Badge */}
        <div className="fu1 inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02]">
          <span className="text-[10px] text-white/30 mono tracking-[.15em]">FREE PLAYBOOK</span>
        </div>

        {/* Headline */}
        <h1 className="fu1 text-[28px] md:text-[36px] font-extrabold leading-[1.1] tracking-tight text-white mb-5">
          The 5-Pair Crypto Framework<br/>
          <span className="text-[#00e5a0]">That Turned $10K Into $218K</span>
        </h1>

        {/* Subheadline */}
        <p className="fu2 text-[15px] text-white/40 leading-[1.7] mb-3 max-w-sm mx-auto">
          The exact pairs, rules, and position sizing we use across 624 trades. Including the losses.
        </p>

        {/* Social proof */}
        <p className="fu2 text-[11px] mono text-white/20 mb-10">
          4,200+ traders have read this playbook
        </p>

        {done ? (
          <div className="fu bg-[#00e5a0]/[0.05] border border-[#00e5a0]/[0.15] rounded-xl p-6">
            <svg className="w-8 h-8 mx-auto mb-3 text-[#00e5a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            <p className="text-[15px] text-white/70 font-medium mb-1">You're in.</p>
            <p className="text-[13px] text-white/30">Redirecting to your playbook + check your email...</p>
          </div>
        ) : (
          <>
            {/* Email form */}
            <form onSubmit={handleSubmit} className="fu3 flex flex-col gap-3 max-w-sm mx-auto">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-[15px] placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/30 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#00e5a0] text-[#06060a] rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(0,229,160,.08),0_2px_8px_rgba(0,229,160,.15)]"
              >
                {loading ? 'Sending...' : 'Send Me The Playbook'}
              </button>
              {error && <p className="text-[12px] text-[#ff4d4d]/70">{error}</p>}
            </form>

            <p className="fu4 text-[11px] text-white/15 mt-4">
              No spam. No credit card. Unsubscribe anytime.
            </p>
          </>
        )}

        {/* What's inside */}
        <div className="fu4 mt-14 text-left">
          <p className="text-[11px] mono text-white/20 tracking-[.15em] mb-5 text-center">WHAT'S INSIDE</p>
          <div className="space-y-3">
            {[
              'Why we only trade 5 pairs — and ignore everything else',
              'The 3-pillar confluence system that scores every setup 0–100',
              'Real trade walkthrough — with full entry, SL, TP breakdown',
              'A real losing trade — and why 40% win rate is still profitable',
              'Position sizing table for $1K–$100K accounts',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#00e5a0]/40 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8l4 4 6-7"/></svg>
                <span className="text-[13px] text-white/35 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Creator */}
        <div className="fu4 mt-12 flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center">
            <span className="text-[11px] mono font-bold text-white/25">M</span>
          </div>
          <div className="text-left">
            <p className="text-[12px] text-white/40 font-medium">Written by Mason</p>
            <p className="text-[10px] text-white/15 mono">Creator of PulseWave</p>
          </div>
        </div>
      </div>
    </div>
  )
}
