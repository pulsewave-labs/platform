'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useCountUp(end: number, decimals = 0, duration = 2200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current || started.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start: number
        const step = (t: number) => {
          if (!start) start = t
          const p = Math.min((t - start) / duration, 1)
          setValue(p * p * (3 - 2 * p) * end)
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.3 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  const display = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()
  return { display, ref }
}

export default function LandingClientPage() {
  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [perfData, setPerfData] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => {
      if (d?.trades) setRecentTrades(d.trades.slice(0, 6))
      if (d) setPerfData(d)
    }).catch(() => {})
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  const ret = useCountUp(218418, 0, 2500)
  const tradeCount = useCountUp(624, 0, 2000)
  const profitFactor = useCountUp(1.52, 2, 2000)
  const winMonths = useCountUp(88, 0, 2000)

  return (
    <div className="min-h-screen bg-[#060608] text-white overflow-x-hidden antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.8s ease-out forwards; }
        .fade-up-delay-1 { animation: fadeUp 0.8s ease-out 0.15s forwards; opacity: 0; }
        .fade-up-delay-2 { animation: fadeUp 0.8s ease-out 0.3s forwards; opacity: 0; }
        .fade-up-delay-3 { animation: fadeUp 0.8s ease-out 0.45s forwards; opacity: 0; }
        .glow { text-shadow: 0 0 80px rgba(0,229,160,0.15); }
        .card-hover { transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.08); }
        .gradient-mask { mask-image: linear-gradient(to bottom, black 60%, transparent); -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent); }
      `}} />

      {/* ══ NAV ══ */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ' + (scrolled ? 'bg-[#060608]/80 backdrop-blur-xl border-b border-white/[0.04]' : '')}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center justify-between">
            <img src="/logo.webp" alt="PulseWave" className="h-6" />
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo('performance')} className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Performance</button>
              <button onClick={() => scrollTo('how')} className="text-[13px] text-white/40 hover:text-white/70 transition-colors">How It Works</button>
              <button onClick={() => scrollTo('pricing')} className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Pricing</button>
              <Link href="/auth/login" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Log In</Link>
              <Link href="/auth/signup" className="text-[13px] px-5 py-2 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors">
                Get Started
              </Link>
            </div>
            <button className="md:hidden text-white/60" onClick={() => setMobileMenu(!mobileMenu)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenu ? "M18 6L6 18M6 6l12 12" : "M4 8h16M4 16h16"} /></svg>
            </button>
          </div>
          {mobileMenu && (
            <div className="md:hidden pt-6 pb-4 space-y-4 border-t border-white/5 mt-4">
              <button onClick={() => scrollTo('performance')} className="block text-white/50 hover:text-white transition-colors">Performance</button>
              <button onClick={() => scrollTo('how')} className="block text-white/50 hover:text-white transition-colors">How It Works</button>
              <button onClick={() => scrollTo('pricing')} className="block text-white/50 hover:text-white transition-colors">Pricing</button>
              <Link href="/auth/login" className="block text-white/50 hover:text-white">Log In</Link>
              <Link href="/auth/signup" className="inline-block px-5 py-2 bg-white text-black rounded-full font-semibold">Get Started</Link>
            </div>
          )}
        </div>
      </nav>


      {/* ══════════════════════════════════════════
          HERO — One clear message. Massive space.
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-10 pt-20 relative">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Eyebrow */}
          <div className="fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span>
            </span>
            <span className="text-[12px] text-white/40 tracking-wide">Live · 624 verified trades</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up-delay-1 text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-6">
            The signals that turned
            <br />
            <span className="text-[#00e5a0] glow">$10K into $218K.</span>
          </h1>

          {/* Sub */}
          <p className="fade-up-delay-2 text-lg md:text-xl text-white/35 leading-relaxed max-w-xl mx-auto mb-10">
            AI-powered Market Structure analysis. 6 crypto pairs. 
            2 years of verified results. Now available to you.
          </p>

          {/* CTA */}
          <div className="fade-up-delay-3 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="px-8 py-3.5 bg-white text-black rounded-full font-semibold text-[15px] hover:bg-white/90 transition-colors">
              Start receiving signals
            </Link>
            <Link href="/performance" className="px-8 py-3.5 rounded-full font-semibold text-[15px] text-white/50 border border-white/[0.08] hover:border-white/[0.15] hover:text-white/70 transition-all">
              View all trades
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30"></div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          PROOF — Let the numbers breathe.
      ══════════════════════════════════════════ */}
      <section id="performance" className="py-32 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          {/* Big number row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-24">
            {[
              { label: 'Final Equity', ref: ret.ref, val: '$' + ret.display, sub: 'from $10,000' },
              { label: 'Total Trades', ref: tradeCount.ref, val: tradeCount.display, sub: 'over 2 years' },
              { label: 'Profit Factor', ref: profitFactor.ref, val: profitFactor.display, sub: 'wins ÷ losses' },
              { label: 'Profitable Months', ref: winMonths.ref, val: winMonths.display + '%', sub: '22 of 25 months' },
            ].map((s, i) => (
              <div key={i} ref={s.ref}>
                <div className="text-[11px] text-white/25 tracking-wide uppercase mb-3">{s.label}</div>
                <div className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{s.val}</div>
                <div className="text-[12px] text-white/20">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Monthly heatmap */}
          {perfData?.monthly && (
            <div>
              <div className="text-[11px] text-white/25 tracking-wide uppercase mb-5">Monthly Returns</div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
                {perfData.monthly.map((m: any, i: number) => {
                  const pnl = m.pnl
                  const intensity = Math.min(Math.abs(pnl) / 12000, 1)
                  const bg = pnl > 0
                    ? `rgba(0,229,160,${0.08 + intensity * 0.35})`
                    : `rgba(255,77,77,${0.08 + intensity * 0.35})`
                  return (
                    <div key={i} className="aspect-square rounded-md flex flex-col items-center justify-center group relative" style={{ background: bg }}>
                      <div className="text-[8px] text-white/30 leading-none">{m.month.slice(5)}</div>
                      <div className={'text-[9px] font-semibold mt-0.5 mono ' + (pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {pnl > 0 ? '+' : ''}{(pnl / 1000).toFixed(1)}k
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-6 mt-4 text-[11px] text-white/20">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#00e5a0]/30"></span>Profit</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#ff4d4d]/30"></span>Loss</span>
                <span>Only 3 red months in 25</span>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* ══════════════════════════════════════════
          TRADE FEED — Social proof in real time
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[11px] text-white/25 tracking-wide uppercase mb-2">Recent Trades</div>
              <p className="text-white/30 text-[14px]">Every trade, fully transparent. No cherry-picking.</p>
            </div>
            <Link href="/performance" className="text-[12px] text-white/30 hover:text-white/50 transition-colors hidden md:block">
              All 624 trades →
            </Link>
          </div>

          <div className="space-y-px rounded-xl overflow-hidden">
            {recentTrades.map((t, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_80px_1fr_80px] md:grid-cols-[120px_100px_80px_1fr_1fr_100px_80px] gap-4 items-center px-5 py-4 bg-white/[0.02] hover:bg-white/[0.035] transition-colors">
                <div className="text-[12px] text-white/25 mono">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</div>
                <div className="text-[13px] font-semibold text-white/70">{t.pair.replace('/USDT', '')}</div>
                <div>
                  <span className={'text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full ' + (t.action === 'LONG' ? 'text-[#00e5a0] bg-[#00e5a0]/8' : 'text-[#ff4d4d] bg-[#ff4d4d]/8')}>
                    {t.action}
                  </span>
                </div>
                <div className="text-[12px] text-white/20 mono hidden md:block">${Number(t.entry_price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="text-[12px] text-white/20 mono hidden md:block">${Number(t.exit_price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className={'text-[13px] font-semibold mono text-right ' + (t.pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                  {t.pnl > 0 ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-right">
                  <span className={'text-[10px] font-semibold tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/60' : 'text-[#ff4d4d]/60')}>
                    {t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 md:hidden">
            <Link href="/performance" className="text-[12px] text-white/30 hover:text-white/50 transition-colors">
              View all 624 trades →
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          HOW IT WORKS — Simple, 3 steps
      ══════════════════════════════════════════ */}
      <section id="how" className="py-32 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg mb-16">
            <div className="text-[11px] text-white/25 tracking-wide uppercase mb-3">How It Works</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Institutional-grade signals,<br />
              <span className="text-white/40">delivered to your phone.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'We scan. 24/7.',
                desc: 'Our engine monitors BTC, ETH, SOL, AVAX, and XRP around the clock — detecting Market Structure setups that institutional traders use.',
              },
              {
                num: '02',
                title: 'You get the signal.',
                desc: 'Entry price, stop loss, take profit, position size — everything calculated for you. Delivered instantly via Telegram and your dashboard.',
              },
              {
                num: '03',
                title: 'You place the trade.',
                desc: 'Copy the exact levels into your exchange. Same signals, same risk management, same system that produced $218K in verified results.',
              },
            ].map((step, i) => (
              <div key={i} className="card-hover p-8 rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                <div className="text-[32px] font-bold text-white/[0.06] mb-6 mono">{step.num}</div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-[14px] text-white/30 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          PAIRS — What we trade
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg mb-12">
            <div className="text-[11px] text-white/25 tracking-wide uppercase mb-3">Trading Universe</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              5 pairs. 6 configurations.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { pair: 'AVAX', profit: 33648, trades: 152 },
              { pair: 'SOL', profit: 24239, trades: 98 },
              { pair: 'ETH', profit: 25678, trades: 202 },
              { pair: 'XRP', profit: 14378, trades: 87 },
              { pair: 'BTC', profit: 6266, trades: 85 },
            ].map((p, i) => (
              <div key={i} className="card-hover p-6 rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                <div className="text-xl font-bold text-white/50 mb-4">{p.pair}</div>
                <div className="text-xl font-bold text-[#00e5a0] mb-1 mono">+${(p.profit / 1000).toFixed(1)}K</div>
                <div className="text-[11px] text-white/20">{p.trades} trades</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          WHAT YOU GET — Value stack
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg mb-16">
            <div className="text-[11px] text-white/25 tracking-wide uppercase mb-3">What's Included</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Everything you need.<br />
              <span className="text-white/40">Nothing you don't.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Real-time signals', desc: '6 crypto pairs, every setup our engine detects — with exact entry, SL, and TP levels.' },
              { title: 'Telegram alerts', desc: 'Instant notification the moment a signal fires. Never miss a trade.' },
              { title: 'Position sizing', desc: 'Every signal includes calculated position sizes for your account. No guesswork.' },
              { title: 'Full transparency', desc: 'Complete trade history with 624+ verified trades. Every win and every loss, public.' },
              { title: 'Performance dashboard', desc: 'Track equity, monthly P&L, win rates, and drawdowns in your personal terminal.' },
              { title: 'Risk management built in', desc: '10% fixed risk per trade. No compounding, no martingale. Math over emotion.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl border border-white/[0.03] bg-white/[0.01] card-hover">
                <div className="w-1 rounded-full bg-[#00e5a0]/20 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-[15px] mb-1.5">{f.title}</h3>
                  <p className="text-[13px] text-white/30 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          PRICING — Clean, decisive
      ══════════════════════════════════════════ */}
      <section id="pricing" className="py-32 px-6 md:px-10 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] text-white/25 tracking-wide uppercase mb-3">Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              One plan. Full access.
            </h2>
            <p className="text-white/30 text-[15px]">
              The same signals that produced $218K in verified results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-[12px] text-white/30 tracking-wide mb-4">Monthly</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$97</span>
                <span className="text-white/25">/mo</span>
              </div>
              <Link href="/auth/signup" className="block w-full py-3 rounded-full border border-white/[0.1] text-white/60 text-[13px] font-semibold text-center hover:border-white/[0.2] hover:text-white/80 transition-all mb-6">
                Get started
              </Link>
              <div className="space-y-3 text-[13px] text-white/30">
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> All signals, all pairs</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> Telegram alerts</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> Performance dashboard</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> Cancel anytime</div>
              </div>
            </div>

            {/* Annual */}
            <div className="p-8 rounded-2xl border border-[#00e5a0]/20 bg-[#00e5a0]/[0.02] relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-[#00e5a0] text-black text-[10px] font-bold tracking-wider rounded-full">BEST VALUE</div>
              <div className="text-[12px] text-white/30 tracking-wide mb-4">Annual</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">$970</span>
                <span className="text-white/25">/yr</span>
              </div>
              <div className="text-[12px] text-[#00e5a0]/60 mb-6">2 months free — save $194</div>
              <Link href="/auth/signup" className="block w-full py-3 rounded-full bg-white text-black text-[13px] font-semibold text-center hover:bg-white/90 transition-all mb-6">
                Get started
              </Link>
              <div className="space-y-3 text-[13px] text-white/30">
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> Everything in monthly</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> Priority signal delivery</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> Advanced analytics</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] text-[10px]">✓</span> Direct support</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SOCIAL PROOF / AUTHORITY
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="grid grid-cols-3 gap-8 mb-16">
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-1">24/7</div>
              <div className="text-[12px] text-white/20">Market monitoring</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-1">&lt;1 min</div>
              <div className="text-[12px] text-white/20">Signal delivery</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-1">$0</div>
              <div className="text-[12px] text-white/20">Hidden fees</div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FINAL CTA — Emotional close
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 md:px-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.03) 0%, transparent 70%)' }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            Stop guessing.<br />
            <span className="text-white/40">Start trading with an edge.</span>
          </h2>
          <p className="text-white/30 text-[15px] mb-10 max-w-md mx-auto">
            624 trades. $208K in verified profit. The same system, now sending signals directly to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="px-10 py-4 bg-white text-black rounded-full font-semibold text-[15px] hover:bg-white/90 transition-colors">
              Get started — $97/mo
            </Link>
            <Link href="/performance" className="px-10 py-4 rounded-full text-[15px] font-semibold text-white/40 border border-white/[0.08] hover:border-white/[0.15] hover:text-white/60 transition-all">
              See every trade
            </Link>
          </div>
        </div>
      </section>


      {/* ══ DISCLAIMER ══ */}
      <section className="py-12 px-6 md:px-10 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] text-white/15 leading-relaxed">
            Past performance does not guarantee future results. Trading cryptocurrencies with leverage involves substantial risk of loss. 
            All results shown are from verified historical data. PulseWave Labs provides signals for informational purposes only. 
            We are not a registered investment advisor. <Link href="/disclaimer" className="underline hover:text-white/30 transition-colors">Full risk disclosure</Link>.
          </p>
        </div>
      </section>


      {/* ══ FOOTER ══ */}
      <footer className="py-8 px-6 md:px-10 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="PulseWave" className="h-4 opacity-30" />
            <span className="text-[11px] text-white/15">© 2026 PulseWave Labs</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-white/15">
            <Link href="/performance" className="hover:text-white/30 transition-colors">Trades</Link>
            <Link href="/privacy" className="hover:text-white/30 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/30 transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white/30 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
