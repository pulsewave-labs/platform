'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useCountUp(end: number, decimals = 0, duration = 2000) {
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
          setValue(p * p * (3 - 2 * p) * end) // smoothstep
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
  const [time, setTime] = useState('')

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => {
      if (d?.trades) setRecentTrades(d.trades.slice(0, 10))
      if (d) setPerfData(d)
    }).catch(() => {})

    const tick = () => setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  const ret = useCountUp(2084, 0, 2500)
  const trades = useCountUp(624, 0, 2000)
  const pf = useCountUp(1.52, 2, 2000)
  const months = useCountUp(88, 0, 2000)

  return (
    <div className="min-h-screen bg-[#08080a] text-[#c8c8c8] overflow-x-hidden" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        .mono { font-family: 'JetBrains Mono', monospace; }
        .sans { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes blink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .scanline { position: fixed; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(0,229,160,0.03), transparent); animation: scan 8s linear infinite; pointer-events: none; z-index: 100; }
        @keyframes pulse-green { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse-dot { animation: pulse-green 2s ease-in-out infinite; }
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px); background-size: 60px 60px; }
        .stat-glow { text-shadow: 0 0 20px rgba(0,229,160,0.3); }
      `}} />

      <div className="scanline" />

      {/* ══ NAV ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#141416]" style={{ background: 'rgba(8,8,10,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-[1400px] mx-auto h-11 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <img src="/logo.webp" alt="PulseWave" className="h-4 opacity-90" />
            <span className="hidden md:inline text-[10px] text-[#333] tracking-widest">QUANTITATIVE SIGNAL ENGINE</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden md:flex items-center gap-1.5 mr-4 text-[10px] text-[#333]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot"></span>
              SYS ONLINE
            </span>
            <Link href="/performance" className="px-3 py-1 text-[10px] text-[#555] hover:text-[#888] tracking-widest transition-colors">TRADES</Link>
            <Link href="/auth/login" className="px-3 py-1 text-[10px] text-[#555] hover:text-[#888] tracking-widest transition-colors">LOGIN</Link>
            <Link href="/auth/signup" className="ml-1 px-3 py-1.5 text-[10px] text-black bg-[#00e5a0] hover:bg-[#00cc8e] tracking-widest transition-colors font-semibold">ACCESS</Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="min-h-screen flex items-center justify-center pt-11 grid-bg relative">
        {/* Subtle corner accents */}
        <div className="absolute top-16 left-6 text-[10px] text-[#1a1a1a] tracking-widest hidden md:block">
          <div>PULSEWAVE LABS</div>
          <div>EST. 2024</div>
        </div>
        <div className="absolute top-16 right-6 text-[10px] text-[#1a1a1a] tracking-widest text-right hidden md:block">
          <div>{time}</div>
          <div>v2.0.0</div>
        </div>

        <div className="max-w-[900px] mx-auto px-6 text-center">
          {/* Status line */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#1a1a1a] rounded mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot"></span>
            <span className="text-[10px] text-[#444] tracking-[0.2em]">LIVE ENGINE — 6 PAIRS — MARKET STRUCTURE</span>
          </div>

          {/* Main number */}
          <div className="mb-3">
            <span className="text-[11px] text-[#333] tracking-[0.3em] block mb-4">VERIFIED 2-YEAR RETURN</span>
            <div ref={ret.ref} className="text-6xl sm:text-7xl md:text-[120px] font-bold text-[#00e5a0] leading-none tracking-tighter stat-glow">
              +{ret.display}%
            </div>
          </div>

          <div className="text-[13px] text-[#444] mb-12 tracking-wide">
            $10,000 → $218,418 <span className="text-[#222]">|</span> 624 TRADES <span className="text-[#222]">|</span> 88% PROFITABLE MONTHS
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto mb-16">
            <Link href="/auth/signup" className="flex-1 py-3 bg-[#00e5a0] text-black text-[11px] font-bold tracking-[0.15em] hover:bg-[#00cc8e] transition-colors text-center">
              GET SIGNALS
            </Link>
            <Link href="/performance" className="flex-1 py-3 border border-[#222] text-[#666] text-[11px] font-bold tracking-[0.15em] hover:border-[#333] hover:text-[#888] transition-colors text-center">
              VIEW ALL TRADES
            </Link>
          </div>

          {/* 4 key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#141416] border border-[#141416] max-w-2xl mx-auto">
            {[
              { label: 'TOTAL TRADES', ref: trades.ref, val: trades.display },
              { label: 'PROFIT FACTOR', ref: pf.ref, val: pf.display },
              { label: 'WIN MONTHS', ref: months.ref, val: months.display + '%' },
              { label: 'MAX DRAWDOWN', ref: null, val: '38%' },
            ].map((s, i) => (
              <div key={i} ref={s.ref} className="bg-[#0a0a0c] px-4 py-5">
                <div className="text-[9px] text-[#333] tracking-[0.2em] mb-2">{s.label}</div>
                <div className="text-xl font-bold text-[#888]">{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LIVE TRADE FEED ══ */}
      <section className="border-t border-[#141416] py-20 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#333] tracking-[0.2em]">RECENT EXECUTIONS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot"></span>
            </div>
            <Link href="/performance" className="text-[10px] text-[#333] hover:text-[#555] tracking-[0.15em] transition-colors">
              VIEW ALL 624 →
            </Link>
          </div>

          <div className="border border-[#141416] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 text-[9px] text-[#333] tracking-[0.15em] bg-[#0c0c0e] border-b border-[#141416]">
              <div className="px-4 py-2.5">TIME</div>
              <div className="px-4 py-2.5">PAIR</div>
              <div className="px-4 py-2.5">SIDE</div>
              <div className="px-4 py-2.5">ENTRY</div>
              <div className="px-4 py-2.5">EXIT</div>
              <div className="px-4 py-2.5 text-right">P&L</div>
              <div className="px-4 py-2.5 text-right">RESULT</div>
            </div>
            {/* Rows */}
            {recentTrades.map((t, i) => (
              <div key={i} className={'grid grid-cols-7 text-[11px] border-b border-[#0e0e10] hover:bg-[#0c0c0e] transition-colors ' + (i % 2 === 0 ? 'bg-[#09090b]' : 'bg-[#08080a]')}>
                <div className="px-4 py-3 text-[#333]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="px-4 py-3 text-[#888] font-medium">{t.pair.replace('/USDT', '')}</div>
                <div className="px-4 py-3">
                  <span className={t.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{t.action}</span>
                </div>
                <div className="px-4 py-3 text-[#555]">${Number(t.entry_price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className="px-4 py-3 text-[#555]">${Number(t.exit_price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className={'px-4 py-3 text-right font-medium ' + (t.pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                  {t.pnl > 0 ? '+' : ''}{Number(t.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="px-4 py-3 text-right">
                  <span className={'text-[9px] tracking-wider px-1.5 py-0.5 ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0] bg-[#00e5a0]/5' : 'text-[#ff4d4d] bg-[#ff4d4d]/5')}>
                    {t.exit_reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MONTHLY PERFORMANCE ══ */}
      <section className="border-t border-[#141416] py-20 px-4 md:px-6 bg-[#09090b]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] text-[#333] tracking-[0.2em]">MONTHLY RETURNS</span>
          </div>

          {perfData?.monthly && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1">
              {perfData.monthly.map((m: any, i: number) => {
                const pnl = m.pnl
                const intensity = Math.min(Math.abs(pnl) / 15000, 1)
                const bg = pnl > 0
                  ? `rgba(0,229,160,${0.05 + intensity * 0.25})`
                  : `rgba(255,77,77,${0.05 + intensity * 0.25})`
                const text = pnl > 0 ? '#00e5a0' : '#ff4d4d'
                return (
                  <div key={i} className="border border-[#141416] p-2 text-center" style={{ background: bg }}>
                    <div className="text-[8px] text-[#333] tracking-wider mb-1">
                      {m.month.slice(5)}
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: text }}>
                      {pnl > 0 ? '+' : ''}{(pnl / 1000).toFixed(1)}K
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Summary row */}
          {perfData?.monthly && (() => {
            const m = perfData.monthly
            const total = m.reduce((s: number, x: any) => s + x.pnl, 0)
            const avg = total / m.length
            const best = m.reduce((a: any, b: any) => a.pnl > b.pnl ? a : b, m[0])
            const worst = m.reduce((a: any, b: any) => a.pnl < b.pnl ? a : b, m[0])
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#141416] border border-[#141416] mt-6">
                {[
                  { label: 'TOTAL P&L', val: '+$' + Math.round(total).toLocaleString(), color: '#00e5a0' },
                  { label: 'AVG MONTHLY', val: '+$' + Math.round(avg).toLocaleString(), color: '#00e5a0' },
                  { label: 'BEST MONTH', val: '+$' + Math.round(best.pnl).toLocaleString(), color: '#00e5a0' },
                  { label: 'WORST MONTH', val: '-$' + Math.abs(Math.round(worst.pnl)).toLocaleString(), color: '#ff4d4d' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#09090b] px-4 py-4">
                    <div className="text-[9px] text-[#333] tracking-[0.2em] mb-1">{s.label}</div>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="border-t border-[#141416] py-20 px-4 md:px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[10px] text-[#333] tracking-[0.2em] mb-10">SYSTEM ARCHITECTURE</div>

          <div className="space-y-0">
            {[
              {
                num: '01',
                title: 'MARKET STRUCTURE DETECTION',
                desc: 'Engine scans 6 crypto pairs 24/7 for Break of Structure (BOS) and Order Block formations. Institutional-grade pattern recognition across optimized timeframes.',
              },
              {
                num: '02',
                title: 'SIGNAL GENERATION',
                desc: 'When a valid setup is detected, the system generates entry, stop loss, and take profit levels. Every signal includes exact position sizing based on 10% fixed risk.',
              },
              {
                num: '03',
                title: 'INSTANT DELIVERY',
                desc: 'Signals fire to your Telegram and dashboard simultaneously. You get the exact same entries our system trades. No delays, no interpretation needed.',
              },
              {
                num: '04',
                title: 'RISK MANAGEMENT',
                desc: 'Fixed 10% risk per trade. No compounding, no martingale. Position size = Risk ÷ Stop Distance. The math is always the same regardless of conviction.',
              },
            ].map((step, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr] border-t border-[#141416] py-8 group">
                <div className="text-[28px] font-bold text-[#141416] group-hover:text-[#1a1a1a] transition-colors">{step.num}</div>
                <div>
                  <div className="text-[12px] text-[#888] tracking-[0.1em] font-semibold mb-2">{step.title}</div>
                  <div className="text-[13px] text-[#444] leading-relaxed sans">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PAIRS ══ */}
      <section className="border-t border-[#141416] py-20 px-4 md:px-6 bg-[#09090b]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[10px] text-[#333] tracking-[0.2em] mb-8">TRADING UNIVERSE</div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-[#141416] border border-[#141416]">
            {[
              { pair: 'AVAX', profit: 33648, trades: 152, wr: 43 },
              { pair: 'SOL', profit: 24239, trades: 98, wr: 41 },
              { pair: 'ETH', profit: 25678, trades: 202, wr: 41 },
              { pair: 'XRP', profit: 14378, trades: 87, wr: 38 },
              { pair: 'BTC', profit: 6266, trades: 85, wr: 39 },
            ].map((p, i) => (
              <div key={i} className="bg-[#09090b] p-5 hover:bg-[#0c0c0e] transition-colors">
                <div className="text-[20px] font-bold text-[#666] mb-3">{p.pair}</div>
                <div className="text-[18px] font-bold text-[#00e5a0] mb-3">+${p.profit.toLocaleString()}</div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-[#333]">TRADES</span>
                    <span className="text-[#555]">{p.trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#333]">WIN RATE</span>
                    <span className="text-[#555]">{p.wr}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="border-t border-[#141416] py-20 px-4 md:px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="text-[10px] text-[#333] tracking-[0.2em] mb-10">ACCESS</div>

          <div className="grid md:grid-cols-2 gap-px bg-[#141416] border border-[#141416]">
            {/* Monthly */}
            <div className="bg-[#0a0a0c] p-8">
              <div className="text-[10px] text-[#333] tracking-[0.2em] mb-4">MONTHLY</div>
              <div className="text-[40px] font-bold text-[#888] leading-none mb-1">$97</div>
              <div className="text-[11px] text-[#333] mb-8">/month — cancel anytime</div>
              <div className="space-y-3 text-[11px] text-[#444] mb-8">
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Real-time signals (6 pairs)</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Telegram instant alerts</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Full trade history</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Performance dashboard</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Position sizing calculator</div>
              </div>
              <Link href="/auth/signup" className="block w-full py-3 border border-[#222] text-[#666] text-[10px] font-bold tracking-[0.15em] hover:border-[#333] hover:text-[#888] transition-colors text-center">
                SUBSCRIBE
              </Link>
            </div>

            {/* Annual */}
            <div className="bg-[#0a0a0c] p-8 relative">
              <div className="absolute top-3 right-3 text-[8px] text-[#00e5a0] bg-[#00e5a0]/5 border border-[#00e5a0]/10 px-2 py-0.5 tracking-[0.15em]">SAVE $194</div>
              <div className="text-[10px] text-[#333] tracking-[0.2em] mb-4">ANNUAL</div>
              <div className="text-[40px] font-bold text-[#00e5a0] leading-none mb-1">$970</div>
              <div className="text-[11px] text-[#333] mb-8">/year — 2 months free</div>
              <div className="space-y-3 text-[11px] text-[#444] mb-8">
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Everything in monthly</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Priority signal delivery</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Advanced analytics</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Early feature access</div>
                <div className="flex items-center gap-2"><span className="text-[#00e5a0]">→</span> Direct support channel</div>
              </div>
              <Link href="/auth/signup" className="block w-full py-3 bg-[#00e5a0] text-black text-[10px] font-bold tracking-[0.15em] hover:bg-[#00cc8e] transition-colors text-center">
                SUBSCRIBE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ RISK / COMPLIANCE ══ */}
      <section className="border-t border-[#141416] py-16 px-4 md:px-6 bg-[#09090b]">
        <div className="max-w-[700px] mx-auto">
          <div className="text-[10px] text-[#333] tracking-[0.2em] mb-6">RISK DISCLOSURE</div>
          <div className="text-[11px] text-[#333] leading-relaxed space-y-3 sans">
            <p className="text-[#444]">Past performance does not guarantee future results. All results shown are from verified historical trading data.</p>
            <p>Trading cryptocurrencies with leverage involves substantial risk of loss. You should carefully consider whether trading is suitable for you in light of your financial situation. Never trade with money you cannot afford to lose.</p>
            <p>PulseWave Labs provides signals for informational purposes. We are not a registered investment advisor. All trading decisions are your own responsibility.</p>
            <div className="flex gap-4 pt-2">
              <Link href="/performance" className="text-[#444] hover:text-[#666] underline underline-offset-4 transition-colors">Full trade log</Link>
              <Link href="/disclaimer" className="text-[#444] hover:text-[#666] underline underline-offset-4 transition-colors">Risk disclosure</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="border-t border-[#141416] py-24 px-4 md:px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="text-[48px] md:text-[64px] font-bold text-[#00e5a0] leading-none mb-4 stat-glow">
            +$208K
          </div>
          <div className="text-[13px] text-[#444] mb-10 tracking-wide">
            VERIFIED PROFIT ACROSS 624 TRADES<span className="cursor-blink text-[#00e5a0]">_</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <Link href="/auth/signup" className="flex-1 py-3.5 bg-[#00e5a0] text-black text-[11px] font-bold tracking-[0.15em] hover:bg-[#00cc8e] transition-colors text-center">
              GET ACCESS
            </Link>
            <Link href="/performance" className="flex-1 py-3.5 border border-[#222] text-[#555] text-[11px] font-bold tracking-[0.15em] hover:border-[#333] hover:text-[#777] transition-colors text-center">
              VERIFY TRADES
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-[#141416] py-8 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.webp" alt="PulseWave" className="h-3 opacity-40" />
            <span className="text-[9px] text-[#222] tracking-[0.15em]">© 2026 PULSEWAVE LABS</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] text-[#222] tracking-[0.1em]">
            <Link href="/privacy" className="hover:text-[#444] transition-colors">PRIVACY</Link>
            <Link href="/terms" className="hover:text-[#444] transition-colors">TERMS</Link>
            <Link href="/disclaimer" className="hover:text-[#444] transition-colors">DISCLAIMER</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
