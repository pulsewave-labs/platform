'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function Reveal({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.06 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref} className={`transition-all duration-[900ms] ease-out ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>{children}</div>
}

export default function PlaybookRead() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const fn = () => { const h = document.documentElement.scrollHeight - window.innerHeight; setPct(h > 0 ? Math.round(window.scrollY / h * 100) : 0) }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#09090b}
        .mono{font-family:'JetBrains Mono',monospace}
        ::selection{background:rgba(0,229,160,.15);color:#fff}
        .grid-bg{background-image:radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px);background-size:24px 24px}
        .glow-line{height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,160,.08) 30%,rgba(0,229,160,.08) 70%,transparent)}
      `}} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-white/[0.02]">
        <div className="h-full bg-gradient-to-r from-[#00e5a0]/60 to-[#00e5a0]/30 transition-all duration-150" style={{width:pct+'%'}} />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-5 opacity-40 hover:opacity-60 transition-opacity" /></Link>
          <div className="flex items-center gap-4">
            <span className="mono text-[10px] text-white/10 hidden sm:inline">{pct}% read</span>
            <Link href="/" className="text-[12px] text-zinc-500 hover:text-white transition-colors font-medium">See Signals →</Link>
          </div>
        </div>
      </nav>


      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-30" style={{background:'radial-gradient(circle,rgba(0,229,160,.04) 0%,transparent 70%)'}} />

        <div className="relative max-w-3xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
          <Reveal>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse"></span>
                <span className="mono text-[10px] text-[#00e5a0]/60 tracking-wider font-medium">FREE PLAYBOOK</span>
              </span>
              <span className="mono text-[10px] text-zinc-600">8 MIN READ</span>
            </div>

            <h1 className="text-[36px] md:text-[56px] font-black leading-[1.05] tracking-[-0.03em] mb-6">
              How We Turned $10K<br/>Into <span className="text-[#00e5a0]">$218K</span> Trading<br/>5 Crypto Pairs
            </h1>

            <p className="text-[16px] md:text-[18px] text-zinc-500 leading-relaxed max-w-xl mb-10">
              The exact framework, the real numbers, and the trades we'd rather not show you — but do anyway.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              {[
                {v:'624',l:'VERIFIED TRADES'},
                {v:'40.7%',l:'WIN RATE'},
                {v:'1.52',l:'PROFIT FACTOR'},
                {v:'2,084%',l:'TOTAL RETURN'},
              ].map((s,i) => (
                <div key={i}>
                  <div className="mono text-[22px] md:text-[28px] font-bold text-white/80">{s.v}</div>
                  <div className="mono text-[9px] text-zinc-600 tracking-wider mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ INTRO ═══════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8] mb-6">
            I'm going to tell you something most trading "gurus" never will:
          </p>

          <div className="my-10 md:my-12 py-8 px-6 md:px-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00e5a0]/30 to-transparent"></div>
            <p className="text-[24px] md:text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-white/80">
              We lose more trades<br/>than we win.
            </p>
          </div>

          <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8] mb-6">
            Our win rate is 40.7%. Out of every 10 trades, we lose about 6. And yet, a $10,000 account following our signals grew to <strong className="text-white/70">$218,000</strong> across 624 trades.
          </p>
          <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8]">
            How? That's what this playbook is about. Not hype. Not cherry-picked screenshots of green P&L. The actual system — including the math that makes losing profitable.
          </p>
        </Reveal>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CH 1: 5 PAIRS ═══════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <div className="max-w-3xl">
            <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">01 — THE PAIRS</span>
            <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
              Why we only trade 5 pairs.
            </h2>
            <p className="text-[17px] text-zinc-500 leading-[1.8] mb-4">
              When I started, I had 40 pairs on my watchlist. I'd chase anything that moved. No edge. No consistency. Just noise.
            </p>
            <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10">
              I lost $14,000 in two weeks trading pairs I barely understood. So I stripped it down to 5 — the ones with the best liquidity, cleanest S/R levels, and enough volatility to matter:
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {[
            {s:'BTC',d:'Highest liquidity. S/R levels hold like law. Institutional money lives here.'},
            {s:'ETH',d:'Strong trending behavior. When it moves, it moves with conviction.'},
            {s:'SOL',d:'High volatility = high R:R. Regularly gives 3:1 setups.'},
            {s:'AVAX',d:'Mean-reverting. Bounces between zones. Patient entries get rewarded.'},
            {s:'XRP',d:'News-driven spikes create sharp, fast entries at key levels.'},
          ].map((p,i) => (
            <Reveal key={i}>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#00e5a0]/10 transition-colors h-full">
                <div className="mono text-[16px] text-[#00e5a0]/70 font-bold mb-3">{p.s}</div>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="max-w-3xl">
            <div className="flex items-start gap-3 p-5 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06]">
              <span className="text-[#00e5a0]/40 text-[18px] shrink-0 mt-0.5">→</span>
              <p className="text-[15px] text-zinc-400 leading-relaxed">
                <strong className="text-white/60">The insight:</strong> Mastery beats coverage. A trader who knows 5 pairs deeply will outperform one who skims 50. Every time.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CH 2: CONFLUENCE ═══════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <div className="max-w-3xl">
            <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">02 — THE SCORING</span>
            <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
              The Confluence System
            </h2>
            <p className="text-[17px] text-zinc-500 leading-[1.8] mb-4">
              We don't trade on gut feel. Every trade passes through a multi-factor scoring system rated <strong className="text-white/60">0 to 100</strong>.
            </p>
            <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10">
              Below 45? We don't trade. Period. Doesn't matter how "bullish" the chart looks. The system doesn't care about feelings.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            {pts:'35',title:'S/R Proximity + Strength',body:'How close is price to a proven zone, and how strong is it? A level tested 10+ times is institutional. Maximum points when price sits right at a battle-tested zone.'},
            {pts:'20',title:'Regime Alignment',body:'Is the market trending, ranging, or volatile? We classify using ATR, ADX, and EMA. A long in an uptrend gets full marks. A long in a downtrend gets penalized.'},
            {pts:'25',title:'RSI + Volume',body:'RSI below 30 on a long = maximum points. Volume 1.5x above average = institutional money confirming the move. Both must align with direction.'},
          ].map((p,i) => (
            <Reveal key={i}>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] h-full">
                <div className="inline-block mono text-[11px] px-2.5 py-1 rounded-md bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] text-[#00e5a0]/60 font-semibold mb-4">
                  {p.pts} POINTS
                </div>
                <h3 className="text-[17px] font-bold text-white/70 mb-3">{p.title}</h3>
                <p className="text-[14px] text-zinc-500 leading-[1.7]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-[14px] text-zinc-600 italic max-w-3xl">
            The remaining 20 points come from trend alignment (EMA position) and multi-timeframe agreement. The full system evaluates every setup before a dollar is risked.
          </p>
        </Reveal>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CH 3: S/R ═══════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">03 — THE ZONES</span>
          <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
            Reading S/R like institutions.
          </h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10">
            Forget trendlines. Institutions don't draw diagonal lines. They care about <strong className="text-white/60">zones</strong> — horizontal areas where enough orders sit to move price.
          </p>
        </Reveal>

        <div className="space-y-6">
          {[
            {n:'01',t:'Find Pivot Clusters',d:'Scan for pivot highs and lows with a 10-bar lookback. A pivot high = a candle whose high is higher than the 10 candles on either side. Points where price actually reversed.'},
            {n:'02',t:'Cluster Into Zones',d:'Pivots within the same price band get grouped. Multiple pivots = a level. A single pivot is noise. Five pivots in the same zone is a wall.'},
            {n:'03',t:'Rank by Strength',d:'Strength = number of touches. 3 touches is a suggestion. 10+ touches is institutional. We only trade the strongest levels on the chart.'},
            {n:'04',t:'Enter AT the Zone',d:'The #1 retail mistake: entering between zones. Support at $95K and price at $97K? You wait. Patience is the edge.'},
          ].map((s,i) => (
            <Reveal key={i}>
              <div className="flex gap-5 items-start">
                <div className="mono text-[28px] font-black text-white/[0.04] shrink-0 w-12 text-right leading-none mt-1">{s.n}</div>
                <div className="flex-1 pb-6 border-b border-white/[0.03] last:border-0">
                  <h4 className="text-[17px] font-bold text-white/70 mb-2">{s.t}</h4>
                  <p className="text-[15px] text-zinc-500 leading-[1.7]">{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CH 4: THE WIN ═══════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <div className="max-w-3xl mb-10">
            <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">04 — REAL TRADE</span>
            <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
              The Win.
            </h2>
            <p className="text-[17px] text-zinc-500 leading-[1.8]">
              Real trade. Real money. Here's what a 74-score signal looks like from entry to exit.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trade card */}
          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-[#00e5a0]/[0.1] h-full" style={{background:'linear-gradient(180deg,rgba(0,229,160,.02) 0%,rgba(9,9,11,1) 50%)'}}>
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e5a0]"></span>
                  <span className="mono text-[14px] text-white/70 font-semibold">BTC/USDT</span>
                </div>
                <span className="mono text-[11px] text-zinc-600">4H · Feb 12, 2026</span>
              </div>
              <div className="px-5 py-2">
                {[
                  {k:'Direction',v:'LONG',c:'text-[#00e5a0] font-semibold'},
                  {k:'Entry',v:'$96,420',c:'text-white/60'},
                  {k:'Stop Loss',v:'$95,180 (-1.29%)',c:'text-[#ff4d4d]/50'},
                  {k:'Take Profit',v:'$99,650 (+3.35%)',c:'text-[#00e5a0]/60'},
                  {k:'Confluence',v:'74 / 100',c:'text-[#00e5a0]/70'},
                  {k:'R:R',v:'2.60',c:'text-white/50'},
                  {k:'Result',v:'+3.35% ✓',c:'text-[#00e5a0] font-bold'},
                ].map((r,i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                    <span className="text-[13px] text-zinc-600">{r.k}</span>
                    <span className={`mono text-[13px] ${r.c}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Breakdown */}
          <Reveal>
            <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.04] h-full flex flex-col justify-center">
              <h3 className="text-[15px] font-bold text-white/50 mb-5 mono tracking-wide">WHY THE SYSTEM TOOK IT</h3>
              <div className="space-y-4">
                {[
                  {label:'S/R Proximity',score:'18/20',desc:'Price sat 0.4% from a 10-touch support zone'},
                  {label:'Regime',score:'16/20',desc:'Uptrend, 78% confidence'},
                  {label:'RSI',score:'10/15',desc:'RSI at 38, approaching oversold'},
                  {label:'Volume',score:'8/10',desc:'1.3x average on the bounce candle'},
                ].map((f,i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] text-white/50 font-medium">{f.label}</p>
                      <p className="text-[12px] text-zinc-600 mt-0.5">{f.desc}</p>
                    </div>
                    <span className="mono text-[13px] text-[#00e5a0]/50 font-semibold shrink-0">{f.score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <p className="text-[14px] text-zinc-500">Entry → TP hit in <strong className="text-white/60">16 hours</strong>. No guessing. Math.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CH 5: THE LOSS ═══════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <div className="max-w-3xl mb-10">
            <span className="mono text-[11px] text-[#ff4d4d]/25 tracking-[.2em] font-medium">05 — THE UGLY TRUTH</span>
            <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
              The Loss.
            </h2>
            <p className="text-[17px] text-zinc-500 leading-[1.8]">
              This is the part most services skip. The screenshot that "accidentally" gets deleted. We don't skip it.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Loss card */}
          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-[#ff4d4d]/[0.08] h-full" style={{background:'linear-gradient(180deg,rgba(255,77,77,.02) 0%,rgba(9,9,11,1) 50%)'}}>
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff4d4d]"></span>
                  <span className="mono text-[14px] text-white/70 font-semibold">ETH/USDT</span>
                </div>
                <span className="mono text-[11px] text-zinc-600">4H · Feb 8, 2026</span>
              </div>
              <div className="px-5 py-2">
                {[
                  {k:'Direction',v:'SHORT',c:'text-[#ff4d4d]/70 font-semibold'},
                  {k:'Entry',v:'$2,845',c:'text-white/60'},
                  {k:'Stop Loss',v:'$2,912 (+2.35%)',c:'text-[#ff4d4d]/50'},
                  {k:'Confluence',v:'52 / 100',c:'text-[#ff9f43]/60'},
                  {k:'Result',v:'-2.35% ✗',c:'text-[#ff4d4d] font-bold'},
                ].map((r,i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                    <span className="text-[13px] text-zinc-600">{r.k}</span>
                    <span className={`mono text-[13px] ${r.c}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Profit factor explanation */}
          <Reveal>
            <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.04] h-full flex flex-col justify-center">
              <h3 className="text-[15px] font-bold text-white/50 mb-4 mono tracking-wide">THE MATH THAT MATTERS</h3>
              <p className="text-[15px] text-zinc-500 leading-relaxed mb-5">
                So how are we profitable losing 60% of our trades? One number: <strong className="text-white/60">profit factor</strong>.
              </p>
              <div className="p-4 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06] mb-5">
                <div className="mono text-[11px] text-zinc-500 mb-2">AVG WIN +3.2% · AVG LOSS -1.4% · WIN RATE 40.7%</div>
                <div className="mono text-[16px] text-[#00e5a0]/80">
                  (3.2% × 0.407) ÷ (1.4% × 0.593) = <strong className="text-[#00e5a0]">1.52</strong>
                </div>
              </div>
              <p className="text-[14px] text-zinc-500 leading-relaxed">
                For every $1 risked, we make $1.52 back. The wins are bigger than the losses — that's the only number that matters.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="max-w-3xl py-6 px-6 md:px-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ff9f43]/20 to-transparent"></div>
            <p className="text-[17px] text-zinc-400 leading-[1.7]">
              Any service that only shows wins is <strong className="text-white/60">lying</strong>. We publish every single trade. That's not marketing — it's the bare minimum for trust.
            </p>
          </div>
        </Reveal>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CH 6: POSITION SIZING ═══════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">06 — RISK MANAGEMENT</span>
          <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
            Position Sizing.
          </h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-4">
            The best system in the world will blow your account with bad sizing. Golden rule: <strong className="text-white/60">never risk more than 1-2% per trade.</strong>
          </p>
        </Reveal>

        <Reveal>
          <div className="my-8 rounded-xl border border-white/[0.04] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-4 py-3 text-left mono text-[10px] text-[#00e5a0]/40 font-semibold tracking-wider border-b border-white/[0.04]">ACCOUNT</th>
                  <th className="px-4 py-3 text-center mono text-[10px] text-[#00e5a0]/40 font-semibold tracking-wider border-b border-white/[0.04]">1% RISK</th>
                  <th className="px-4 py-3 text-center mono text-[10px] text-[#00e5a0]/40 font-semibold tracking-wider border-b border-white/[0.04]">2% RISK</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {a:'$1,000',r1:'$10',r2:'$20'},
                  {a:'$5,000',r1:'$50',r2:'$100'},
                  {a:'$10,000',r1:'$100',r2:'$200'},
                  {a:'$25,000',r1:'$250',r2:'$500'},
                  {a:'$50,000',r1:'$500',r2:'$1,000'},
                  {a:'$100,000',r1:'$1,000',r2:'$2,000'},
                ].map((r,i) => (
                  <tr key={i} className={i%2===0 ? 'bg-white/[0.01]' : ''}>
                    <td className="px-4 py-3 mono text-[13px] text-white/50 font-medium border-b border-white/[0.02]">{r.a}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-zinc-500 border-b border-white/[0.02]">{r.r1}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-zinc-500 border-b border-white/[0.02]">{r.r2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex items-start gap-3 p-5 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06]">
            <span className="text-[#00e5a0]/40 text-[18px] shrink-0 mt-0.5">→</span>
            <p className="text-[14px] text-zinc-400 leading-relaxed">
              <strong className="text-white/60">Start at 0.5-1%</strong> until you trust the system with real money. Size up later. You can never un-blow an account.
            </p>
          </div>
        </Reveal>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CH 7: FULL NUMBERS ═══════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal>
          <div className="max-w-3xl mb-10">
            <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">07 — THE PROOF</span>
            <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
              624 trades. Every one public.
            </h2>
          </div>
        </Reveal>

        {/* Big stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            {v:'$218K',l:'FROM $10K',c:'text-[#00e5a0]'},
            {v:'624',l:'TOTAL TRADES',c:'text-white/70'},
            {v:'40.7%',l:'WIN RATE',c:'text-[#ff9f43]'},
            {v:'1.52',l:'PROFIT FACTOR',c:'text-[#00e5a0]'},
          ].map((s,i) => (
            <Reveal key={i}>
              <div className="p-5 md:p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className={`mono text-[24px] md:text-[32px] font-black ${s.c}`}>{s.v}</div>
                <div className="mono text-[9px] text-zinc-600 tracking-wider mt-1">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Detail stats */}
        <Reveal>
          <div className="max-w-3xl">
            <div className="rounded-xl border border-white/[0.04] overflow-hidden">
              {[
                {k:'Average Win',v:'+3.2%'},{k:'Average Loss',v:'-1.4%'},
                {k:'Trades/Day',v:'2.8'},{k:'Max Drawdown',v:'-12.4%'},
                {k:'Sharpe Ratio',v:'2.1'},{k:'Expectancy/Trade',v:'+0.47%'},
                {k:'Best Streak',v:'8 wins'},{k:'Worst Streak',v:'11 losses'},
              ].map((s,i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-3 border-b border-white/[0.03] last:border-0 ${i%2===0?'bg-white/[0.01]':''}`}>
                  <span className="text-[13px] text-zinc-600">{s.k}</span>
                  <span className="mono text-[13px] text-white/50 font-medium">{s.v}</span>
                </div>
              ))}
            </div>

            <p className="text-[17px] text-zinc-500 leading-[1.8] mt-8">
              The worst streak: <strong className="text-white/60">11 losses in a row.</strong> That happened. We didn't panic. Didn't change the system. We stuck to the math, and the math worked — as it always does with a positive profit factor.
            </p>
          </div>
        </Reveal>
      </section>

      <div className="glow-line"></div>


      {/* ═══════════════════════════════ CTA ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full" style={{background:'radial-gradient(circle,rgba(0,229,160,.04) 0%,transparent 70%)'}} />

        <div className="relative max-w-3xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center">
          <Reveal>
            <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">WHAT IF YOU DIDN'T HAVE TO DO THIS YOURSELF?</span>

            <h2 className="text-[28px] md:text-[44px] font-black leading-[1.08] tracking-[-0.02em] mt-4 mb-5">
              PulseWave Signals runs this<br/>exact system. <span className="text-[#00e5a0]">24/7.</span>
            </h2>

            <p className="text-[16px] md:text-[18px] text-zinc-500 leading-relaxed max-w-lg mx-auto mb-10">
              Every trade from this playbook — the scoring, the zones, the sizing — automated and delivered to your phone. Including the losses.
            </p>

            <div className="inline-grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-left mb-10">
              {[
                'Real-time signals on all 5 pairs',
                'Entry, SL, TP + position size',
                'Telegram + email delivery',
                'Every trade published — wins & losses',
                '30-day money-back guarantee',
                'Cancel anytime. No lock-in.',
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-[#00e5a0]/50">→</span>
                  <span className="text-[14px] text-zinc-400">{b}</span>
                </div>
              ))}
            </div>

            <div>
              <a href="/" className="inline-block px-10 py-4 bg-[#00e5a0] text-zinc-950 rounded-xl font-bold text-[16px] hover:bg-[#00d492] transition-all shadow-[0_0_60px_rgba(0,229,160,.08),0_4px_16px_rgba(0,229,160,.15)]">
                See PulseWave Signals →
              </a>
              <p className="mono text-[10px] text-zinc-700 mt-4">153 spots remaining at current pricing</p>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══════════════════════════════ FOOTER ═══════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <p className="text-[11px] text-zinc-700 leading-relaxed text-center">
            Trading cryptocurrency carries significant risk. Past performance is not indicative of future results. Nothing here constitutes financial advice. A 40.7% win rate means the system loses more than it wins — profitability comes from risk management, not win rate. © 2026 PulseWave Labs · <Link href="/disclaimer" className="underline hover:text-zinc-500 transition-colors">Risk disclosure</Link>
          </p>
        </div>
      </footer>

    </div>
  )
}
