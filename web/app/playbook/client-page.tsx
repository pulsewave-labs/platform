'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PlaybookOptIn() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [count] = useState(4247)
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
          email, source: 'playbook',
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
        }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      setTimeout(() => { window.location.href = '/playbook/read' }, 1800)
    } catch {
      setError('Something went wrong. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-[#c8c8c8] overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#06060a}
        .mono{font-family:'JetBrains Mono',monospace}
        .serif{font-family:'Newsreader',Georgia,serif}
        ::selection{background:rgba(0,229,160,.15);color:#fff}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .fu{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) forwards}
        .fu1{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .08s forwards;opacity:0}
        .fu2{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .16s forwards;opacity:0}
        .fu3{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .24s forwards;opacity:0}
        .fu4{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .32s forwards;opacity:0}
        .fu5{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .4s forwards;opacity:0}
        .fu6{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .48s forwards;opacity:0}
        .grid-dots{background-image:radial-gradient(rgba(255,255,255,.015) 1px,transparent 1px);background-size:32px 32px}
      `}} />

      {/* Background elements */}
      <div className="fixed inset-0 grid-dots pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 60%)'}}/>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.02) 0%,transparent 70%)'}}/>

      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-10 py-5">
          <img src="/logo.webp" alt="PulseWave" className="h-5 opacity-30" />
          <a href="/" className="text-[11px] text-white/15 hover:text-white/30 transition-colors mono">pulsewavelabs.io</a>
        </nav>

        {/* Main content — two column on desktop */}
        <div className="flex-1 flex items-center justify-center px-5 md:px-10 py-10 md:py-0">
          <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">

            {/* LEFT — Copy */}
            <div>
              {/* Live badge */}
              <div className="fu flex items-center gap-2.5 mb-8">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-50" style={{animation:'pulse 2s ease-in-out infinite'}}></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span>
                </span>
                <span className="text-[11px] text-white/25 mono tracking-[.12em]">{count.toLocaleString()} TRADERS HAVE READ THIS</span>
              </div>

              {/* Headline */}
              <h1 className="fu1 text-[30px] md:text-[40px] font-extrabold leading-[1.08] tracking-[-0.02em] text-white mb-5">
                The 5-Pair Framework<br/>
                That Turned $10K<br/>
                Into <span className="text-[#00e5a0]" style={{textShadow:'0 0 60px rgba(0,229,160,.12)'}}>$218K</span>
              </h1>

              {/* Subheadline */}
              <p className="fu2 text-[15px] md:text-[16px] text-white/40 leading-[1.7] mb-8 max-w-md">
                The exact pairs, confluence scoring rules, and position sizing we use — across 624 real trades. Including the ones we lost.
              </p>

              {/* Stats */}
              <div className="fu3 flex items-center gap-6 mb-10">
                {[
                  { v: '624', l: 'trades' },
                  { v: '40.7%', l: 'win rate' },
                  { v: '1.52', l: 'profit factor' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="mono text-[18px] font-bold text-white/70">{s.v}</div>
                    <div className="text-[10px] text-white/20 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* What's inside — desktop only */}
              <div className="fu4 hidden md:block">
                <p className="text-[11px] mono text-white/15 tracking-[.12em] mb-4">INSIDE THE PLAYBOOK</p>
                <div className="space-y-2.5">
                  {[
                    'Why we trade only BTC, ETH, SOL, AVAX, XRP',
                    'The 3-pillar confluence system (scored 0–100)',
                    'Real winning trade with full breakdown',
                    'Real losing trade — and the math behind profit',
                    'Position sizing for $1K–$100K accounts',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08] flex items-center justify-center shrink-0">
                        <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="#00e5a0" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"><path d="M1.5 4l2 2 3-3.5"/></svg>
                      </div>
                      <span className="text-[13px] text-white/30">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Form card */}
            <div className="fu5">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.04]" style={{background:'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(6,6,10,1) 100%)'}}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/15 to-transparent"></div>

                <div className="p-7 md:p-9">
                  {/* Card header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08]">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="#00e5a0" fillOpacity="0.4"><path d="M8 0l2.4 4.8L16 5.6l-4 3.9.9 5.5L8 12.4l-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/></svg>
                      <span className="text-[10px] mono text-[#00e5a0]/50 tracking-wider">FREE DOWNLOAD</span>
                    </div>
                    <h2 className="text-[20px] md:text-[22px] font-bold text-white/80 mb-2">Get the Playbook</h2>
                    <p className="text-[13px] text-white/25 leading-relaxed">Instant access. No credit card. 8-minute read.</p>
                  </div>

                  {done ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center mx-auto mb-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <p className="text-[16px] text-white/70 font-semibold mb-1">You're in.</p>
                      <p className="text-[13px] text-white/30">Opening your playbook + check your email...</p>
                    </div>
                  ) : (
                    <>
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError('') }}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[15px] text-white placeholder:text-white/15 focus:outline-none focus:border-[#00e5a0]/25 focus:bg-white/[0.03] transition-all"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 bg-[#00e5a0] text-[#06060a] rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(0,229,160,.06),0_2px_8px_rgba(0,229,160,.12)]"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                              Sending...
                            </span>
                          ) : 'Send Me The Playbook →'}
                        </button>
                        {error && <p className="text-[12px] text-[#ff4d4d]/60 text-center">{error}</p>}
                      </form>

                      <p className="text-[10px] text-white/12 text-center mt-4 leading-relaxed">
                        No spam ever. Unsubscribe in one click.
                      </p>
                    </>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent my-7"></div>

                  {/* Credibility strip */}
                  <div className="flex items-center justify-center gap-5 text-center">
                    {[
                      { v: '8 min', l: 'to read' },
                      { v: '7 chapters', l: 'of value' },
                      { v: '$0', l: 'cost' },
                    ].map((s, i) => (
                      <div key={i}>
                        <div className="text-[13px] font-semibold text-white/40">{s.v}</div>
                        <div className="text-[9px] text-white/15 mono mt-0.5">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Below card — social proof */}
              <div className="mt-5 flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  {['M','J','K','A','R'].map((l, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <span className="text-[8px] mono text-white/20">{l}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/15">
                  <span className="text-white/25">{count.toLocaleString()}</span> traders downloaded this month
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile: What's inside */}
        <div className="fu6 md:hidden px-6 pb-12">
          <p className="text-[11px] mono text-white/15 tracking-[.12em] mb-4">INSIDE THE PLAYBOOK</p>
          <div className="space-y-2.5">
            {[
              'Why we trade only BTC, ETH, SOL, AVAX, XRP',
              'The confluence scoring system (0–100)',
              'Real trade walkthroughs — wins AND losses',
              'Position sizing for any account size',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#00e5a0" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6l3 3 5-5.5"/></svg>
                <span className="text-[12px] text-white/25">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-5 border-t border-white/[0.02]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="text-[10px] text-white/10">© 2026 PulseWave Labs</span>
            <span className="text-[10px] text-white/10">
              <a href="/privacy" className="hover:text-white/20 transition-colors">Privacy</a>
              <span className="mx-2">·</span>
              <a href="/terms" className="hover:text-white/20 transition-colors">Terms</a>
            </span>
          </div>
        </footer>

      </div>
    </div>
  )
}
