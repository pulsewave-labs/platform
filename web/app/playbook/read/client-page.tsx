'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function R({ children, className = '' }: { children: React.ReactNode, className?: string }) {
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

const W = 'max-w-[1080px] mx-auto px-5 md:px-8'

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
        .grid-bg{background-image:radial-gradient(rgba(255,255,255,.015) 1px,transparent 1px);background-size:24px 24px}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04) 20%,rgba(255,255,255,.04) 80%,transparent)}
      `}} />

      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-white/[0.02]">
        <div className="h-full bg-[#00e5a0]/40 transition-all duration-150" style={{width:pct+'%'}} />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className={`${W} h-14 flex items-center justify-between`}>
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-5 opacity-40 hover:opacity-60 transition-opacity" /></Link>
          <div className="flex items-center gap-4">
            <span className="mono text-[10px] text-zinc-700 hidden sm:inline">{pct}%</span>
            <Link href="/" className="text-[13px] text-zinc-500 hover:text-white transition-colors font-medium">See Signals →</Link>
          </div>
        </div>
      </nav>


      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 grid-bg opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 60%)'}} />

        <div className={`relative ${W} pt-16 md:pt-24 pb-16 md:pb-20`}>
          <R>
            <div className="flex items-center gap-2.5 mb-8">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse"></span>
                <span className="mono text-[10px] text-[#00e5a0]/60 tracking-wider font-medium">FREE PLAYBOOK</span>
              </span>
              <span className="mono text-[10px] text-zinc-600">8 MIN READ</span>
            </div>

            <h1 className="text-[32px] md:text-[56px] font-black leading-[1.05] tracking-[-0.03em] mb-6 max-w-3xl">
              We lose 6 out of every 10 trades.
            </h1>

            <p className="text-[18px] md:text-[22px] text-zinc-400 leading-[1.6] max-w-2xl mb-5 font-medium">
              Our account is up 2,084%.
            </p>

            <p className="text-[15px] md:text-[17px] text-zinc-600 leading-relaxed max-w-xl mb-12">
              This playbook explains exactly how that's possible — and gives you the system to do it yourself.
            </p>

            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              {[
                {v:'624',l:'VERIFIED TRADES'},
                {v:'40.7%',l:'WIN RATE'},
                {v:'1.52',l:'PROFIT FACTOR'},
                {v:'$10K → $218K',l:'TOTAL RETURN'},
              ].map((s,i) => (
                <div key={i}>
                  <div className="mono text-[24px] md:text-[30px] font-bold text-white/80">{s.v}</div>
                  <div className="mono text-[9px] text-zinc-600 tracking-wider mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>


      {/* ══════════ THE CONTRADICTION ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <div className="max-w-2xl">
            <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8] mb-6">
              That probably sounds like a contradiction. Losing most of your trades and making money? Every trading guru on Twitter will tell you that's impossible. You need a 70%+ win rate, right?
            </p>
            <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8] mb-6">
              Wrong. And that one misconception is why most retail traders blow their accounts.
            </p>
            <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8] mb-6">
              Here's the number that actually matters: our average winner is <strong className="text-white/70">+3.2%</strong>. Our average loser is <strong className="text-white/70">-1.4%</strong>. The wins are <strong className="text-white/70">2.3x larger</strong> than the losses. So even though we lose more often, the winners more than pay for the losers. Over 624 trades, that turns $10K into $218K.
            </p>
            <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8] mb-6">
              This playbook shows you exactly how:
            </p>
            <div className="space-y-2 mb-6">
              {[
                {ch:'01',t:'Which 5 pairs to trade and why — and how to pick your own'},
                {ch:'02',t:'The 0-100 scoring system that filters out bad trades before you enter'},
                {ch:'03',t:'How to find S/R zones that actually hold (step-by-step on TradingView)'},
                {ch:'04',t:'A real winning trade broken down factor by factor'},
                {ch:'05',t:'A real losing trade — and the math that makes losses profitable'},
                {ch:'06',t:'The position sizing formula that keeps you alive during losing streaks'},
                {ch:'07',t:'The complete 624-trade track record — every number, nothing hidden'},
              ].map((item,i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mono text-[11px] text-[#00e5a0]/30 font-semibold mt-1 w-5 shrink-0">{item.ch}</span>
                  <span className="text-[15px] text-zinc-500 leading-relaxed">{item.t}</span>
                </div>
              ))}
            </div>
            <p className="text-[17px] md:text-[19px] text-zinc-400 leading-[1.8]">
              Every chapter has something you can apply to your trading today. Even if you never use our signals, you'll trade better after reading this.
            </p>
          </div>
        </R>
      </section>

      <div className="divider"></div>


      {/* ══════════ CH 1: WHY 5 PAIRS ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">01 — PAIR SELECTION</span>
          <h2 className="text-[26px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5 max-w-2xl">
            Why only 5 pairs — and which ones.
          </h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-4 max-w-2xl">
            Most traders watch too many charts. 20, 30, 40 tickers. They think more coverage = more opportunities. In practice, it means you know nothing well and you're reacting to every candle.
          </p>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-4 max-w-2xl">
            We filtered down to 5 pairs that meet three criteria: <strong className="text-white/60">deep liquidity</strong> (so S/R levels hold), <strong className="text-white/60">clean structure</strong> (so zones are readable), and <strong className="text-white/60">enough daily range</strong> (so trades can hit 2:1+ R:R).
          </p>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10 max-w-2xl">
            Here's what each one gives us and <strong className="text-white/60">how to think about it</strong> for your own watchlist:
          </p>
        </R>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {[
            {s:'BTC',sub:'$40B+ daily vol',points:['S/R levels hold for weeks/months','Best for swing trades — slower, cleaner','Institutional money anchors the structure']},
            {s:'ETH',sub:'Strong trends',points:['Trends hard — less chop than most alts','Great for regime-based entries','Follows BTC but with its own structure']},
            {s:'SOL',sub:'High range',points:['4-8% daily range is common','Regularly gives 3:1 R:R setups','More aggressive — suited for smaller size']},
            {s:'AVAX',sub:'Mean-reverting',points:['Bounces between zones reliably','Works well with S/R proximity scoring','Rewards patience — enter at the zone, not before']},
            {s:'XRP',sub:'Catalyst-driven',points:['News creates sharp moves to key levels','Fast entries — tight windows','Size down — it\'s the most unpredictable of the 5']},
          ].map((p,i) => (
            <R key={i}>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors h-full">
                <div className="mono text-[18px] text-[#00e5a0]/60 font-bold">{p.s}</div>
                <div className="text-[11px] text-zinc-600 mb-4">{p.sub}</div>
                <div className="space-y-2">
                  {p.points.map((pt,j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-[#00e5a0]/30 text-[10px] mt-[5px] shrink-0">▸</span>
                      <span className="text-[12px] text-zinc-500 leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </R>
          ))}
        </div>

        <R>
          <div className="p-5 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06] max-w-2xl">
            <p className="text-[13px] font-semibold text-white/50 mb-2">Try this yourself</p>
            <p className="text-[14px] text-zinc-400 leading-relaxed">
              Pick 3-5 pairs you actually understand. Check their average daily range on ATR(14). Check that their S/R zones hold (zoom out to daily — do pivots cluster?). If a pair doesn't have clean structure, drop it. You want pairs you can <em className="text-white/50">predict</em>, not pairs that are "exciting."
            </p>
          </div>
        </R>
      </section>

      <div className="divider"></div>


      {/* ══════════ CH 2: CONFLUENCE ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">02 — THE SCORING SYSTEM</span>
          <h2 className="text-[26px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5 max-w-2xl">
            How we score every trade 0-100.
          </h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-4 max-w-2xl">
            This is the core of the system. Every potential entry gets scored across 7 factors. If the total score is below <strong className="text-white/60">45</strong>, we don't take the trade. No exceptions, no overrides, no "but the chart looks good."
          </p>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10 max-w-2xl">
            Here are the 3 primary factors — they carry <strong className="text-white/60">80% of the weight</strong>. You can implement these in your own trading immediately:
          </p>
        </R>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            {pts:'35',title:'S/R Proximity + Strength',
              what:'How close is price to a real support/resistance zone, and how strong is that zone?',
              how:'We measure two things: (1) distance — price must be within 0.5% of the zone for full points, and (2) touch count — zones with 8+ touches get maximum strength score. A level that\'s been tested 10 times and held is institutional.',
              use:'On your chart: find a horizontal level with 3+ touches. Wait for price to reach it. Don\'t enter between levels — that\'s where retail gets chopped up.'},
            {pts:'20',title:'Market Regime',
              what:'Is the market trending up, trending down, ranging, or in volatile chaos?',
              how:'We classify regime using three indicators: ATR (volatility), ADX (trend strength), and EMA crossover (direction). A long signal in an uptrend gets full marks. A long signal in a downtrend gets penalized heavily — you\'re fighting momentum.',
              use:'Quick check: Is price above the 50 EMA? Is ADX above 25? If yes to both, you have a trending market. Trade with that trend, not against it.'},
            {pts:'25',title:'RSI + Volume Confirmation',
              what:'Is momentum aligned with your direction, and is real money behind the move?',
              how:'For longs: RSI below 35 = maximum points (oversold + reversal setup). For shorts: RSI above 65. Volume must be 1.2x+ above the 20-period average — that\'s institutional participation, not retail noise.',
              use:'Add RSI(14) and a volume MA(20) to your chart. If RSI is oversold AND volume is above average on the bounce candle, the setup has confirmation. Without volume, it\'s just an oversold bounce — and those fail constantly.'},
          ].map((p,i) => (
            <R key={i}>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] h-full">
                <div className="inline-block mono text-[11px] px-2.5 py-1 rounded-md bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] text-[#00e5a0]/60 font-semibold mb-4">
                  {p.pts} PTS
                </div>
                <h3 className="text-[16px] font-bold text-white/70 mb-2">{p.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">{p.what}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] mono text-zinc-600 tracking-wider mb-1">HOW WE SCORE IT</p>
                    <p className="text-[13px] text-zinc-400 leading-relaxed">{p.how}</p>
                  </div>
                  <div>
                    <p className="text-[11px] mono text-[#00e5a0]/30 tracking-wider mb-1">USE IT YOURSELF</p>
                    <p className="text-[13px] text-zinc-400 leading-relaxed">{p.use}</p>
                  </div>
                </div>
              </div>
            </R>
          ))}
        </div>

        <R>
          <div className="max-w-2xl">
            <p className="text-[14px] text-zinc-600 mb-6">
              The remaining 20 points: <strong className="text-zinc-500">EMA trend alignment</strong> (10 pts — is price on the right side of the 50/200 EMA?) and <strong className="text-zinc-500">multi-timeframe agreement</strong> (10 pts — does the 1H agree with the 4H?).
            </p>
            <div className="p-5 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06]">
              <p className="text-[13px] font-semibold text-white/50 mb-2">Build your own scorecard</p>
              <p className="text-[14px] text-zinc-400 leading-relaxed">
                You don't need 7 factors. Start with 3: <strong className="text-white/50">Is price at a real level?</strong> (S/R) + <strong className="text-white/50">Am I trading with the trend?</strong> (Regime) + <strong className="text-white/50">Does volume confirm?</strong> Score each 1-10. If your total is below 15/30, skip the trade. This alone will eliminate most bad entries.
              </p>
            </div>
          </div>
        </R>
      </section>

      <div className="divider"></div>


      {/* ══════════ CH 3: S/R ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">03 — SUPPORT & RESISTANCE</span>
          <h2 className="text-[26px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5 max-w-2xl">
            How to find the levels that actually hold.
          </h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10 max-w-2xl">
            Most traders draw too many lines. Institutions don't use trendlines — they use <strong className="text-white/60">horizontal zones</strong> where real orders cluster. Here's the step-by-step method you can do right now on TradingView:
          </p>
        </R>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          {[
            {n:'01',t:'Find Pivot Highs & Lows',
              d:'Open a 4H chart. Look for swing highs (candle high is higher than the 10 candles on each side) and swing lows (opposite). These are real reversal points — not guesses. TradingView\'s pivot indicator does this automatically.',
              tip:'Set lookback to 10 bars. More bars = fewer, stronger pivots.'},
            {n:'02',t:'Group Into Zones',
              d:'Look for clusters — multiple pivots in the same price area (within 0.5-1%). Draw a horizontal rectangle across the cluster. This is your zone. The tighter the cluster, the more precise. Single pivots are noise. 3+ in the same band = a real level.',
              tip:'Use rectangle tool, not lines. Zones have width. A zone from $95,100-$95,400 is more realistic than "support at $95,200."'},
            {n:'03',t:'Count Touches & Rank',
              d:'How many times has price tested this zone? 3 touches = worth watching. 5+ = strong. 8+ = institutional. Rank your zones by touch count and only trade the top 3-4 per pair. Delete the weak ones — they\'ll distract you.',
              tip:'If a zone gets broken cleanly (4H close through it), it flips. Old support becomes resistance. Re-label it.'},
            {n:'04',t:'Enter AT the Zone, Not Before',
              d:'The #1 retail mistake: entering between zones. Support at $95K, price at $97K, and you feel bullish so you buy. Then price drops to $95K (the actual level) and you\'re -2% before the trade even starts. Wait for the zone.',
              tip:'Set alerts on your zones instead of watching charts. Price hits the zone → you evaluate. Otherwise, you\'re spectating.'},
          ].map((s,i) => (
            <R key={i}>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="mono text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-500 font-semibold">{s.n}</span>
                  <h4 className="text-[15px] font-bold text-white/65">{s.t}</h4>
                </div>
                <p className="text-[14px] text-zinc-500 leading-[1.7] mb-3">{s.d}</p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#00e5a0]/[0.02] border border-[#00e5a0]/[0.04]">
                  <span className="text-[#00e5a0]/30 text-xs shrink-0 mt-0.5">TIP</span>
                  <p className="text-[12px] text-zinc-400 leading-relaxed">{s.tip}</p>
                </div>
              </div>
            </R>
          ))}
        </div>

        <R>
          <div className="p-5 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06] max-w-2xl">
            <p className="text-[13px] font-semibold text-white/50 mb-2">Right now, do this</p>
            <p className="text-[14px] text-zinc-400 leading-relaxed">
              Open BTC/USDT on a 4H chart. Zoom out to 3 months. Find the 3 strongest horizontal zones (most touches). Set price alerts on each. Next time BTC reaches one of those zones, check RSI and volume — that's a potential trade. You just built a basic version of our system.
            </p>
          </div>
        </R>
      </section>

      <div className="divider"></div>


      {/* ══════════ CH 4: THE WIN ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">04 — WINNING TRADE BREAKDOWN</span>
          <h2 className="text-[26px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">A real win — step by step.</h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10 max-w-2xl">Here's how the scoring system works on a live trade. Every number is real.</p>
        </R>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <R>
            <div className="rounded-xl overflow-hidden border border-[#00e5a0]/[0.1] h-full" style={{background:'linear-gradient(180deg,rgba(0,229,160,.015) 0%,rgba(9,9,11,1) 50%)'}}>
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e5a0]"></span>
                  <span className="mono text-[14px] text-white/70 font-semibold">BTC/USDT LONG</span>
                </div>
                <span className="mono text-[11px] text-zinc-600">4H · Feb 12</span>
              </div>
              <div className="px-5 py-1">
                {[
                  {k:'Entry',v:'$96,420',c:'text-white/60'},
                  {k:'Stop Loss',v:'$95,180 (-1.29%)',c:'text-[#ff4d4d]/50'},
                  {k:'Take Profit',v:'$99,650 (+3.35%)',c:'text-[#00e5a0]/60'},
                  {k:'Risk:Reward',v:'1 : 2.60',c:'text-white/50'},
                  {k:'Confluence',v:'74 / 100',c:'text-[#00e5a0]/70'},
                  {k:'Time to TP',v:'16 hours',c:'text-white/40'},
                  {k:'Result',v:'+3.35% ✓',c:'text-[#00e5a0] font-bold'},
                ].map((r,i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                    <span className="text-[13px] text-zinc-600">{r.k}</span>
                    <span className={`mono text-[13px] ${r.c}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </R>

          <R>
            <div className="rounded-xl p-6 bg-white/[0.02] border border-white/[0.04] h-full">
              <h3 className="mono text-[11px] text-zinc-500 font-semibold tracking-wider mb-5">SCORE BREAKDOWN</h3>
              <div className="space-y-4">
                {[
                  {label:'S/R Proximity',score:'18/20',pct:90,desc:'Price was 0.4% from a zone tested 10 times over 3 months'},
                  {label:'S/R Strength',score:'13/15',pct:87,desc:'10-touch zone = near-maximum strength score'},
                  {label:'Regime',score:'16/20',pct:80,desc:'Uptrend: price above 50 & 200 EMA, ADX at 31'},
                  {label:'RSI',score:'10/15',pct:67,desc:'RSI(14) at 38 — approaching oversold, not extreme'},
                  {label:'Volume',score:'7/10',pct:70,desc:'1.3x above 20-period average — decent, not exceptional'},
                ].map((f,i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-white/45 font-medium">{f.label}</span>
                      <span className="mono text-[12px] text-[#00e5a0]/50 font-semibold">{f.score}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/[0.04] mb-1">
                      <div className="h-full rounded-full bg-[#00e5a0]/30" style={{width:f.pct+'%'}}></div>
                    </div>
                    <p className="text-[11px] text-zinc-600">{f.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[13px] text-white/50 font-medium">Total Score</span>
                <span className="mono text-[16px] text-[#00e5a0] font-bold">74 / 100</span>
              </div>
            </div>
          </R>
        </div>

        <R>
          <p className="text-[15px] text-zinc-500 leading-[1.8] mt-8 max-w-2xl">
            <strong className="text-white/60">What to learn from this:</strong> The entry wasn't random — it was at a proven zone, with the trend, with RSI leaning oversold, and volume confirming. The stop was below the zone (if the zone breaks, the thesis is dead). The target was the next resistance zone above. Every piece of the trade was defined before entry.
          </p>
        </R>
      </section>

      <div className="divider"></div>


      {/* ══════════ CH 5: THE LOSS ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <span className="mono text-[11px] text-[#ff4d4d]/25 tracking-[.2em] font-medium">05 — LOSING TRADE BREAKDOWN</span>
          <h2 className="text-[26px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">A real loss — and why it's fine.</h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10 max-w-2xl">This is the part 99% of signal services hide. We show every loss because the math behind <em className="text-zinc-400">why losses are fine</em> is the most important thing in this playbook.</p>
        </R>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          <R>
            <div className="rounded-xl overflow-hidden border border-[#ff4d4d]/[0.08] h-full" style={{background:'linear-gradient(180deg,rgba(255,77,77,.015) 0%,rgba(9,9,11,1) 50%)'}}>
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff4d4d]"></span>
                  <span className="mono text-[14px] text-white/70 font-semibold">ETH/USDT SHORT</span>
                </div>
                <span className="mono text-[11px] text-zinc-600">4H · Feb 8</span>
              </div>
              <div className="px-5 py-1">
                {[
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

              <div className="px-5 py-4 border-t border-white/[0.04]">
                <p className="text-[13px] text-zinc-500 leading-relaxed">
                  ETH broke through the resistance zone. Ran through the stop. Trade over. <strong className="text-white/50">Score was 52</strong> — above the 45 cutoff, but not a high-conviction setup.
                </p>
              </div>
            </div>
          </R>

          <R>
            <div className="rounded-xl p-6 bg-white/[0.02] border border-white/[0.04] h-full flex flex-col justify-center">
              <h3 className="mono text-[11px] text-zinc-500 font-semibold tracking-wider mb-5">THE PROFIT FACTOR EQUATION</h3>
              <p className="text-[15px] text-zinc-400 leading-relaxed mb-5">
                This is the single most important concept in this playbook. It's not win rate. It's <strong className="text-white/60">how much you make when you win vs. how much you lose when you lose.</strong>
              </p>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-white/[0.015]">
                  <span className="text-[13px] text-zinc-500">Average win</span>
                  <span className="mono text-[14px] text-[#00e5a0]/70 font-semibold">+3.2%</span>
                </div>
                <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-white/[0.015]">
                  <span className="text-[13px] text-zinc-500">Average loss</span>
                  <span className="mono text-[14px] text-[#ff4d4d]/60 font-semibold">-1.4%</span>
                </div>
                <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-white/[0.015]">
                  <span className="text-[13px] text-zinc-500">Win rate</span>
                  <span className="mono text-[14px] text-white/50 font-semibold">40.7%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06] mb-5">
                <div className="mono text-[10px] text-zinc-500 mb-1 tracking-wide">PROFIT FACTOR</div>
                <div className="mono text-[16px] text-[#00e5a0]/80">
                  (3.2 × .407) ÷ (1.4 × .593) = <strong className="text-[#00e5a0]">1.57</strong>
                </div>
              </div>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Above 1.0 = profitable. <strong className="text-white/50">For every $1 lost, $1.57 comes back.</strong> The wins are 2.3x larger than the losses. That's the edge — not predicting the future, just making sure winners pay more than losers cost.
              </p>
            </div>
          </R>
        </div>

        <R>
          <div className="p-5 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06] max-w-2xl">
            <p className="text-[13px] font-semibold text-white/50 mb-2">Apply this to your own trading</p>
            <p className="text-[14px] text-zinc-400 leading-relaxed">
              Go through your last 20 trades. Calculate your average win size and average loss size. If your losses are bigger than your wins, <em className="text-zinc-300">that's</em> your problem — not your win rate. Fix it by: (1) tightening stop losses, (2) only entering at strong S/R zones (tighter stops), and (3) targeting 2:1 R:R minimum.
            </p>
          </div>
        </R>
      </section>

      <div className="divider"></div>


      {/* ══════════ CH 6: POSITION SIZING ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">06 — POSITION SIZING</span>
          <h2 className="text-[26px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5 max-w-2xl">
            The formula that keeps you alive.
          </h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-4 max-w-2xl">
            Every blown account has the same story: "I was right about the direction but I sized too big." Position sizing isn't optional — it's the difference between a drawdown and a blown account.
          </p>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10 max-w-2xl">
            Here's the exact formula:
          </p>
        </R>

        <R>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.04] max-w-2xl mb-8">
            <div className="mono text-[10px] text-zinc-600 tracking-wider mb-3">POSITION SIZE FORMULA</div>
            <div className="mono text-[15px] md:text-[17px] text-white/70 mb-4 leading-relaxed">
              Position Size = (Account × Risk %) ÷ (Entry − Stop Loss)
            </div>
            <div className="divider mb-4"></div>
            <div className="mono text-[10px] text-zinc-600 tracking-wider mb-3">EXAMPLE: BTC LONG</div>
            <div className="space-y-1.5 mb-4">
              {[
                {k:'Account',v:'$10,000'},
                {k:'Risk %',v:'1% = $100'},
                {k:'Entry',v:'$96,420'},
                {k:'Stop Loss',v:'$95,180'},
                {k:'Distance',v:'$1,240 (1.29%)'},
              ].map((r,i) => (
                <div key={i} className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-500">{r.k}</span>
                  <span className="mono text-white/50">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06]">
              <div className="mono text-[14px] text-[#00e5a0]/80">
                $100 ÷ $1,240 = <strong className="text-[#00e5a0]">0.0806 BTC</strong> (~$7,770 position)
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">If BTC hits stop loss, you lose exactly $100 (1% of account). Not $500. Not $2,000. $100.</p>
            </div>
          </div>
        </R>

        <R>
          <div className="rounded-xl border border-white/[0.04] overflow-hidden max-w-2xl mb-8">
            <div className="px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
              <span className="mono text-[10px] text-[#00e5a0]/40 font-semibold tracking-wider">MAX RISK PER TRADE AT DIFFERENT ACCOUNT SIZES</span>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  {['ACCOUNT','1% RISK','2% RISK'].map((h,i) => (
                    <th key={i} className={`px-5 py-2.5 mono text-[10px] text-zinc-600 font-semibold tracking-wider border-b border-white/[0.04] ${i===0?'text-left':'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['$1,000','$10','$20'],['$5,000','$50','$100'],['$10,000','$100','$200'],
                  ['$25,000','$250','$500'],['$50,000','$500','$1,000'],['$100,000','$1,000','$2,000'],
                ].map((r,i) => (
                  <tr key={i} className={i%2===0 ? 'bg-white/[0.01]' : ''}>
                    <td className="px-5 py-2.5 mono text-[13px] text-white/50 font-medium border-b border-white/[0.02]">{r[0]}</td>
                    <td className="px-5 py-2.5 text-center text-[13px] text-zinc-500 border-b border-white/[0.02]">{r[1]}</td>
                    <td className="px-5 py-2.5 text-center text-[13px] text-zinc-500 border-b border-white/[0.02]">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </R>

        <R>
          <div className="flex items-start gap-3 p-5 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06] max-w-2xl">
            <span className="text-[#00e5a0]/40 text-lg shrink-0 mt-0.5">→</span>
            <div>
              <p className="text-[13px] font-semibold text-white/50 mb-1">The rule that saves accounts</p>
              <p className="text-[14px] text-zinc-400 leading-relaxed">
                Start at <strong className="text-white/50">0.5-1%</strong>. Even if you're "sure" about a trade. Especially if you're sure. Conviction has blown more accounts than bad analysis. Calculate your size before every trade, or don't take the trade.
              </p>
            </div>
          </div>
        </R>
      </section>

      <div className="divider"></div>


      {/* ══════════ CH 7: FULL NUMBERS ══════════ */}
      <section className={`${W} py-16 md:py-24`}>
        <R>
          <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">07 — COMPLETE TRACK RECORD</span>
          <h2 className="text-[26px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em] mt-3 mb-5">
            624 trades. All public.
          </h2>
          <p className="text-[17px] text-zinc-500 leading-[1.8] mb-10 max-w-2xl">
            Not highlights. Not a curated selection. The complete, unedited record — because you should never trust a system that hides its results.
          </p>
        </R>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            {v:'$218K',l:'FROM $10K',c:'text-[#00e5a0]'},
            {v:'624',l:'TOTAL TRADES',c:'text-white/70'},
            {v:'40.7%',l:'WIN RATE',c:'text-[#ff9f43]'},
            {v:'1.52',l:'PROFIT FACTOR',c:'text-[#00e5a0]'},
          ].map((s,i) => (
            <R key={i}>
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className={`mono text-[22px] md:text-[30px] font-black ${s.c}`}>{s.v}</div>
                <div className="mono text-[9px] text-zinc-600 tracking-wider mt-1">{s.l}</div>
              </div>
            </R>
          ))}
        </div>

        <R>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mb-10">
            <div className="rounded-xl border border-white/[0.04] overflow-hidden">
              {[
                {k:'Average Win',v:'+3.2%'},{k:'Average Loss',v:'-1.4%'},
                {k:'Win/Loss Ratio',v:'2.29x'},{k:'Expectancy/Trade',v:'+0.47%'},
              ].map((s,i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-3 border-b border-white/[0.03] last:border-0 ${i%2===0?'bg-white/[0.01]':''}`}>
                  <span className="text-[13px] text-zinc-600">{s.k}</span>
                  <span className="mono text-[13px] text-white/50 font-medium">{s.v}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/[0.04] overflow-hidden">
              {[
                {k:'Trades/Day',v:'2.8 avg'},{k:'Max Drawdown',v:'-12.4%'},
                {k:'Best Streak',v:'8 wins'},{k:'Worst Streak',v:'11 losses'},
              ].map((s,i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-3 border-b border-white/[0.03] last:border-0 ${i%2===0?'bg-white/[0.01]':''}`}>
                  <span className="text-[13px] text-zinc-600">{s.k}</span>
                  <span className="mono text-[13px] text-white/50 font-medium">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </R>

        <R>
          <div className="max-w-2xl">
            <p className="text-[17px] text-zinc-500 leading-[1.8] mb-6">
              The worst stretch: <strong className="text-white/60">11 consecutive losses.</strong> That's real. If you're risking 1% per trade, that's an 11% drawdown. Uncomfortable, but survivable. If you're risking 5% per trade, that's -55% and you're done.
            </p>
            <p className="text-[17px] text-zinc-500 leading-[1.8]">
              This is exactly why position sizing (Chapter 6) exists. The system will have losing streaks. The question isn't whether you'll hit one — it's whether your sizing lets you survive it.
            </p>
          </div>
        </R>
      </section>


      {/* ══════════ CTA ══════════ */}
      <section className="relative overflow-hidden border-t border-white/[0.04]">
        <div className="absolute inset-0 grid-bg opacity-50"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full" style={{background:'radial-gradient(circle,rgba(0,229,160,.04) 0%,transparent 60%)'}} />

        <div className={`relative ${W} py-20 md:py-28 text-center`}>
          <R>
            <span className="mono text-[11px] text-[#00e5a0]/30 tracking-[.2em] font-medium">ONE MORE THING</span>

            <h2 className="text-[26px] md:text-[44px] font-black leading-[1.08] tracking-[-0.02em] mt-4 mb-5 max-w-2xl mx-auto">
              What if you didn't have to do this manually?
            </h2>

            <p className="text-[16px] md:text-[18px] text-zinc-500 leading-relaxed max-w-xl mx-auto mb-10">
              Everything in this playbook — the pair selection, the confluence scoring, the S/R zones, the position sizing — runs automatically as PulseWave Signals. 24/7, across all 5 pairs.
            </p>

            <div className="inline-grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2.5 text-left mb-10">
              {[
                'Signals delivered to Telegram + email',
                'Entry, stop loss, take profit included',
                'Position size calculated for your account',
                'Every single trade published — wins & losses',
                '30-day money-back guarantee',
                'Cancel anytime — no lock-in',
              ].map((b,i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-[#00e5a0]/40">→</span>
                  <span className="text-[14px] text-zinc-400">{b}</span>
                </div>
              ))}
            </div>

            <div>
              <a href="/" className="inline-block px-10 py-4 bg-[#00e5a0] text-zinc-950 rounded-xl font-bold text-[16px] hover:bg-[#00d492] transition-all shadow-[0_0_60px_rgba(0,229,160,.08),0_4px_16px_rgba(0,229,160,.15)]">
                See PulseWave Signals →
              </a>
            </div>
          </R>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className={W}>
          <p className="text-[11px] text-zinc-700 leading-relaxed text-center max-w-2xl mx-auto">
            Trading cryptocurrency carries significant risk. Past performance is not indicative of future results. Nothing here constitutes financial advice. © 2026 PulseWave Labs · <Link href="/disclaimer" className="underline hover:text-zinc-500 transition-colors">Risk disclosure</Link>
          </p>
        </div>
      </footer>

    </div>
  )
}
