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
  const [time, setTime] = useState('')

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => {
      if (d?.trades) setRecentTrades(d.trades.slice(0, 8))
      if (d) setPerfData(d)
    }).catch(() => {})
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    const tick = () => setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    tick()
    const iv = setInterval(tick, 1000)
    return () => { window.removeEventListener('scroll', fn); clearInterval(iv) }
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease-out forwards; }
        .fade-up-1 { animation: fadeUp 0.7s ease-out 0.12s forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.7s ease-out 0.24s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s ease-out 0.36s forwards; opacity: 0; }
        @keyframes blink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
        .blink { animation: blink 1.2s step-end infinite; }
        @keyframes pulse-dot { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .glow { text-shadow: 0 0 60px rgba(0,229,160,0.12); }
        .terminal { background: #09090b; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; }
        .terminal-header { border-bottom: 1px solid rgba(255,255,255,0.04); padding: 10px 16px; display: flex; align-items: center; gap: 8px; }
        .terminal-dot { width: 6px; height: 6px; border-radius: 50%; }
        .card-lift { transition: all 0.35s cubic-bezier(0.25,0.1,0.25,1); }
        .card-lift:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.08); }
        .grid-subtle { background-image: linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px); background-size: 48px 48px; }
      `}} />

      {/* ══ NAV ══ */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ' + (scrolled ? 'bg-[#060608]/85 backdrop-blur-xl border-b border-white/[0.04]' : '')}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.webp" alt="PulseWave" className="h-6" />
            </div>
            <div className="hidden md:flex items-center gap-7">
              <button onClick={() => scrollTo('performance')} className="text-[13px] text-white/35 hover:text-white/65 transition-colors">Performance</button>
              <button onClick={() => scrollTo('how')} className="text-[13px] text-white/35 hover:text-white/65 transition-colors">How It Works</button>
              <button onClick={() => scrollTo('pricing')} className="text-[13px] text-white/35 hover:text-white/65 transition-colors">Pricing</button>
              <Link href="/auth/login" className="text-[13px] text-white/35 hover:text-white/65 transition-colors">Log In</Link>
              <Link href="/auth/signup" className="text-[13px] px-5 py-2 bg-[#00e5a0] text-black rounded-lg font-semibold hover:bg-[#00cc8e] transition-colors">
                Get Access
              </Link>
            </div>
            <button className="md:hidden text-white/50" onClick={() => setMobileMenu(!mobileMenu)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenu ? "M18 6L6 18M6 6l12 12" : "M4 8h16M4 16h16"} /></svg>
            </button>
          </div>
          {mobileMenu && (
            <div className="md:hidden pt-6 pb-4 space-y-4 border-t border-white/5 mt-4">
              <button onClick={() => scrollTo('performance')} className="block text-white/40">Performance</button>
              <button onClick={() => scrollTo('how')} className="block text-white/40">How It Works</button>
              <button onClick={() => scrollTo('pricing')} className="block text-white/40">Pricing</button>
              <Link href="/auth/login" className="block text-white/40">Log In</Link>
              <Link href="/auth/signup" className="inline-block px-5 py-2 bg-[#00e5a0] text-black rounded-lg font-semibold">Get Access</Link>
            </div>
          )}
        </div>
      </nav>


      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-10 pt-20 relative grid-subtle">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.035) 0%, transparent 65%)' }} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Live status */}
          <div className="fade-up inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border border-white/[0.05] bg-white/[0.02] mb-10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span>
            </span>
            <span className="text-[11px] text-white/35 mono tracking-wide">LIVE — 624 VERIFIED TRADES</span>
          </div>

          <h1 className="fade-up-1 text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.03em] mb-6">
            The signals that turned
            <br />
            <span className="text-[#00e5a0] glow">$10K into $218K</span>
          </h1>

          <p className="fade-up-2 text-lg text-white/30 leading-relaxed max-w-lg mx-auto mb-12">
            Institutional-grade Market Structure analysis. 
            6 crypto pairs. 2 years of verified results. 
            Now delivering signals directly to you.
          </p>

          <div className="fade-up-3 flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link href="/auth/signup" className="px-8 py-3.5 bg-[#00e5a0] text-black rounded-lg font-semibold text-[14px] hover:bg-[#00cc8e] transition-colors">
              Start receiving signals
            </Link>
            <Link href="/performance" className="px-8 py-3.5 rounded-lg text-[14px] font-semibold text-white/40 border border-white/[0.07] hover:border-white/[0.12] hover:text-white/60 transition-all">
              View all trades
            </Link>
          </div>

          {/* Terminal preview — stats strip */}
          <div className="terminal max-w-2xl mx-auto fade-up-3">
            <div className="terminal-header">
              <div className="terminal-dot bg-[#ff5f57]"></div>
              <div className="terminal-dot bg-[#febc2e]"></div>
              <div className="terminal-dot bg-[#28c840]"></div>
              <span className="text-[10px] text-white/15 mono ml-2">pulsewave — performance</span>
              <span className="text-[10px] text-white/10 mono ml-auto">{time}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.03]">
              {[
                { label: 'RETURN', val: '+2,084%', color: '#00e5a0' },
                { label: 'TRADES', val: '624', color: '#c8c8c8' },
                { label: 'PROFIT FACTOR', val: '1.52', color: '#c8c8c8' },
                { label: 'WIN MONTHS', val: '88%', color: '#c8c8c8' },
              ].map((s, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="text-[9px] text-white/20 mono tracking-[0.15em] mb-1">{s.label}</div>
                  <div className="text-lg font-bold mono" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          PROOF — Numbers + Heatmap
      ═══════════════════════════════════ */}
      <section id="performance" className="py-28 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg mb-16">
            <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">PERFORMANCE</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Every trade, verified.<br />
              <span className="text-white/30">Every month, profitable.</span>
            </h2>
          </div>

          {/* Big metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { label: 'Final equity', ref: ret.ref, val: '$' + ret.display, sub: 'from $10K starting' },
              { label: 'Total trades', ref: tradeCount.ref, val: tradeCount.display, sub: 'over 24 months' },
              { label: 'Profit factor', ref: profitFactor.ref, val: profitFactor.display, sub: 'win $ ÷ loss $' },
              { label: 'Profitable months', ref: winMonths.ref, val: winMonths.display + '%', sub: '22 out of 25' },
            ].map((s, i) => (
              <div key={i} ref={s.ref} className="card-lift p-5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <div className="text-[10px] text-white/20 tracking-wide uppercase mb-3">{s.label}</div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight mb-1 mono">{s.val}</div>
                <div className="text-[11px] text-white/15">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Monthly heatmap in terminal */}
          {perfData?.monthly && (
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dot bg-[#ff5f57]"></div>
                <div className="terminal-dot bg-[#febc2e]"></div>
                <div className="terminal-dot bg-[#28c840]"></div>
                <span className="text-[10px] text-white/15 mono ml-2">monthly returns — 25 months</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-13 gap-1.5">
                  {perfData.monthly.map((m: any, i: number) => {
                    const pnl = m.pnl
                    const intensity = Math.min(Math.abs(pnl) / 12000, 1)
                    const bg = pnl > 0
                      ? `rgba(0,229,160,${0.06 + intensity * 0.3})`
                      : `rgba(255,77,77,${0.06 + intensity * 0.3})`
                    return (
                      <div key={i} className="aspect-square rounded flex flex-col items-center justify-center" style={{ background: bg }}>
                        <div className="text-[7px] text-white/25 mono leading-none">{m.month.slice(5)}</div>
                        <div className={'text-[9px] font-semibold mt-0.5 mono ' + (pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                          {pnl > 0 ? '+' : ''}{(pnl / 1000).toFixed(1)}k
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-5 mt-4 text-[10px] text-white/15 mono">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#00e5a0]/25"></span>Profit</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#ff4d4d]/25"></span>Loss</span>
                  <span className="text-white/10">|</span>
                  <span>Only 3 losing months</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* ═══════════════════════════════════
          LIVE TRADE FEED
      ═══════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">TRADE LOG</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Full transparency. Every trade.
              </h2>
            </div>
            <Link href="/performance" className="text-[11px] text-white/25 hover:text-white/40 transition-colors mono tracking-wide hidden md:block">
              FULL TRADE LOG →
            </Link>
          </div>

          <div className="terminal overflow-hidden">
            <div className="terminal-header">
              <div className="terminal-dot bg-[#ff5f57]"></div>
              <div className="terminal-dot bg-[#febc2e]"></div>
              <div className="terminal-dot bg-[#28c840]"></div>
              <span className="text-[10px] text-white/15 mono ml-2">recent executions · 7-day delay</span>
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot"></span>
                <span className="text-[9px] text-[#00e5a0]/50 mono">LIVE</span>
              </span>
            </div>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[100px_90px_70px_1fr_1fr_100px_70px] text-[9px] text-white/15 mono tracking-wider px-5 py-2.5 border-b border-white/[0.03]">
              <div>DATE</div>
              <div>PAIR</div>
              <div>SIDE</div>
              <div>ENTRY</div>
              <div>EXIT</div>
              <div className="text-right">P&L</div>
              <div className="text-right">RESULT</div>
            </div>
            {recentTrades.map((t, i) => (
              <div key={i} className={'grid grid-cols-[1fr_60px_80px] md:grid-cols-[100px_90px_70px_1fr_1fr_100px_70px] items-center px-5 py-3 border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors ' + (i % 2 === 0 ? 'bg-white/[0.005]' : '')}>
                <div className="text-[11px] text-white/20 mono">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="text-[12px] font-semibold text-white/60 mono">{t.pair.replace('/USDT', '')}</div>
                <div className="hidden md:block">
                  <span className={'text-[9px] font-bold tracking-wider mono ' + (t.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{t.action}</span>
                </div>
                <div className="text-[11px] text-white/15 mono hidden md:block">${Number(t.entry_price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="text-[11px] text-white/15 mono hidden md:block">${Number(t.exit_price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className={'text-[12px] font-semibold mono text-right ' + (t.pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                  {t.pnl > 0 ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-right">
                  <span className={'text-[9px] font-bold mono tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50')}>
                    {t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5 md:hidden">
            <Link href="/performance" className="text-[11px] text-white/25 mono tracking-wide">VIEW ALL 624 TRADES →</Link>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════ */}
      <section id="how" className="py-28 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg mb-16">
            <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Institutional signals.<br />
              <span className="text-white/30">Delivered to your phone.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'We scan. 24/7.',
                desc: 'Our engine monitors BTC, ETH, SOL, AVAX, and XRP around the clock — detecting Break of Structure and Order Block setups that institutional traders rely on.',
              },
              {
                num: '02',
                title: 'Signal fires instantly.',
                desc: 'Entry, stop loss, take profit, and position size — all calculated. Delivered to your Telegram and dashboard the moment a setup confirms.',
              },
              {
                num: '03',
                title: 'You execute the trade.',
                desc: 'Copy the exact levels into your exchange. Same signals, same risk management, same system behind $218K in verified profits.',
              },
            ].map((step, i) => (
              <div key={i} className="card-lift p-7 rounded-xl border border-white/[0.04] bg-white/[0.015]">
                <div className="text-[28px] font-bold text-[#00e5a0]/10 mono mb-5">{step.num}</div>
                <h3 className="text-[16px] font-semibold mb-3">{step.title}</h3>
                <p className="text-[13px] text-white/25 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          WHAT A SIGNAL LOOKS LIKE
      ═══════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">SIGNAL PREVIEW</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5">
                Everything you need.<br />
                <span className="text-white/30">Nothing you don't.</span>
              </h2>
              <p className="text-[14px] text-white/25 leading-relaxed mb-8">
                Every signal comes with exact levels and position sizing calculated for your account. No interpretation needed — just execute.
              </p>
              <div className="space-y-3 text-[13px]">
                {[
                  'Exact entry, stop loss, and take profit',
                  'Position size for any account size',
                  'Risk:reward ratio pre-calculated',
                  'Instant Telegram notification',
                  'Full reasoning and confidence score',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/30">
                    <span className="text-[#00e5a0] text-[11px] mono">→</span> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Mock signal card */}
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dot bg-[#ff5f57]"></div>
                <div className="terminal-dot bg-[#febc2e]"></div>
                <div className="terminal-dot bg-[#28c840]"></div>
                <span className="text-[10px] text-white/15 mono ml-2">signal — live</span>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold mono text-black bg-[#00e5a0] px-2 py-0.5 rounded">LONG</span>
                    <span className="text-lg font-bold mono">SOL/USDT</span>
                  </div>
                  <span className="text-[10px] text-white/20 mono">82% confidence</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[9px] text-white/20 mono tracking-wider mb-1">ENTRY</div>
                    <div className="text-[15px] font-bold mono">$195.40</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/20 mono tracking-wider mb-1">STOP LOSS</div>
                    <div className="text-[15px] font-bold mono text-[#ff4d4d]">$188.20</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/20 mono tracking-wider mb-1">TAKE PROFIT</div>
                    <div className="text-[15px] font-bold mono text-[#00e5a0]">$213.50</div>
                  </div>
                </div>

                {/* R:R bar */}
                <div>
                  <div className="flex justify-between text-[9px] mono text-white/15 mb-1">
                    <span>Risk $7.20 (3.7%)</span>
                    <span>Reward $18.10 (9.3%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden flex">
                    <div className="bg-[#ff4d4d]/40 rounded-l-full" style={{ width: '28%' }}></div>
                    <div className="bg-[#00e5a0]/40 rounded-r-full" style={{ width: '72%' }}></div>
                  </div>
                  <div className="text-right text-[10px] text-[#00e5a0]/50 mono mt-1">2.5:1 R:R</div>
                </div>

                {/* Position sizing */}
                <div className="border-t border-white/[0.03] pt-4">
                  <div className="text-[9px] text-white/15 mono tracking-wider mb-2">POSITION SIZE</div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] mono">
                    {[
                      { acct: '$1K', size: '$2.7K', risk: '$100' },
                      { acct: '$10K', size: '$27K', risk: '$1,000' },
                      { acct: '$50K', size: '$135K', risk: '$5,000' },
                    ].map((r, i) => (
                      <div key={i} className="bg-white/[0.02] rounded px-2.5 py-2">
                        <div className="text-white/30 mb-0.5">{r.acct} acct</div>
                        <div className="text-white/60 font-medium">{r.size}</div>
                        <div className="text-white/15 text-[9px]">risk {r.risk}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          PAIRS
      ═══════════════════════════════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg mb-10">
            <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">TRADING UNIVERSE</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">5 pairs. 6 configurations.</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { pair: 'AVAX', profit: 33648, trades: 152 },
              { pair: 'SOL', profit: 24239, trades: 98 },
              { pair: 'ETH', profit: 25678, trades: 202 },
              { pair: 'XRP', profit: 14378, trades: 87 },
              { pair: 'BTC', profit: 6266, trades: 85 },
            ].map((p, i) => (
              <div key={i} className="card-lift p-5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <div className="text-lg font-bold text-white/40 mono mb-3">{p.pair}</div>
                <div className="text-lg font-bold text-[#00e5a0] mono mb-2">+${(p.profit / 1000).toFixed(1)}K</div>
                <div className="text-[10px] text-white/15 mono">{p.trades} trades</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          PRICING
      ═══════════════════════════════════ */}
      <section id="pricing" className="py-28 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">PRICING</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              One plan. Full access.
            </h2>
            <p className="text-white/25 text-[14px]">
              The same signals behind $218K in verified profits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-8 rounded-xl border border-white/[0.05] bg-white/[0.015]">
              <div className="text-[11px] text-white/25 mono tracking-wide mb-5">MONTHLY</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold mono">$97</span>
                <span className="text-white/20 text-[13px]">/month</span>
              </div>
              <Link href="/auth/signup" className="block w-full py-3 rounded-lg border border-white/[0.08] text-white/50 text-[13px] font-semibold text-center hover:border-white/[0.15] hover:text-white/70 transition-all mb-6">
                Get started
              </Link>
              <div className="space-y-2.5 text-[12px] text-white/25">
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> All signals, all pairs</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> Telegram instant alerts</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> Performance dashboard</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> Cancel anytime</div>
              </div>
            </div>

            <div className="p-8 rounded-xl border border-[#00e5a0]/15 bg-[#00e5a0]/[0.02] relative">
              <div className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#00e5a0] text-black text-[9px] font-bold mono tracking-wider rounded">SAVE $194</div>
              <div className="text-[11px] text-white/25 mono tracking-wide mb-5">ANNUAL</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold mono">$970</span>
                <span className="text-white/20 text-[13px]">/year</span>
              </div>
              <div className="text-[11px] text-[#00e5a0]/40 mono mb-5">2 months free</div>
              <Link href="/auth/signup" className="block w-full py-3 rounded-lg bg-[#00e5a0] text-black text-[13px] font-semibold text-center hover:bg-[#00cc8e] transition-colors mb-6">
                Get started
              </Link>
              <div className="space-y-2.5 text-[12px] text-white/25">
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> Everything in monthly</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> Priority delivery</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> Advanced analytics</div>
                <div className="flex items-center gap-2.5"><span className="text-[#00e5a0] mono text-[10px]">→</span> Direct support</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          AUTHORITY STRIP
      ═══════════════════════════════════ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dot bg-[#ff5f57]"></div>
              <div className="terminal-dot bg-[#febc2e]"></div>
              <div className="terminal-dot bg-[#28c840]"></div>
              <span className="text-[10px] text-white/15 mono ml-2">system status</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.03]">
              {[
                { label: 'UPTIME', val: '24/7', sub: 'market monitoring' },
                { label: 'DELIVERY', val: '<1 min', sub: 'signal to phone' },
                { label: 'HIDDEN FEES', val: '$0', sub: 'what you see is it' },
                { label: 'TRACK RECORD', val: '2 years', sub: '624 verified trades' },
              ].map((s, i) => (
                <div key={i} className="px-5 py-5 text-center">
                  <div className="text-xl font-bold mono mb-1">{s.val}</div>
                  <div className="text-[9px] text-white/15 mono tracking-wider">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════ */}
      <section className="py-28 px-6 md:px-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.03) 0%, transparent 65%)' }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Stop watching charts.<br />
            <span className="text-white/30">Let the engine find the trades.</span>
          </h2>
          <p className="text-white/25 text-[14px] mb-10 max-w-md mx-auto">
            624 trades. $208K profit. The same system, now sending signals directly to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="px-10 py-3.5 bg-[#00e5a0] text-black rounded-lg font-semibold text-[14px] hover:bg-[#00cc8e] transition-colors">
              Start receiving signals
            </Link>
            <Link href="/performance" className="px-10 py-3.5 rounded-lg text-[14px] font-semibold text-white/35 border border-white/[0.07] hover:border-white/[0.12] hover:text-white/55 transition-all">
              Verify every trade
            </Link>
          </div>
        </div>
      </section>


      {/* ══ DISCLAIMER ══ */}
      <section className="py-10 px-6 md:px-10 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] text-white/10 leading-relaxed">
            Past performance does not guarantee future results. Trading cryptocurrencies with leverage involves substantial risk of loss. 
            All results shown are from verified historical data. PulseWave Labs provides signals for informational purposes only. 
            We are not a registered investment advisor. <Link href="/disclaimer" className="underline hover:text-white/25 transition-colors">Full risk disclosure</Link>.
          </p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="py-8 px-6 md:px-10 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="PulseWave" className="h-4 opacity-25" />
            <span className="text-[10px] text-white/10">© 2026 PulseWave Labs</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-white/10">
            <Link href="/performance" className="hover:text-white/25 transition-colors">Trades</Link>
            <Link href="/privacy" className="hover:text-white/25 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/25 transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white/25 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
