'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function Reveal({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  var ref = useRef<HTMLDivElement>(null)
  var [v, setV] = useState(false)
  useEffect(function() {
    if (!ref.current) return
    var obs = new IntersectionObserver(function(e) { if (e[0].isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.08 })
    obs.observe(ref.current)
    return function() { obs.disconnect() }
  }, [])
  return <div ref={ref} className={'transition-all duration-[800ms] ease-out ' + (v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5') + ' ' + className}>{children}</div>
}

export default function PlaybookRead() {
  var [pct, setPct] = useState(0)
  useEffect(function() {
    var fn = function() { var h = document.documentElement.scrollHeight - window.innerHeight; setPct(h > 0 ? Math.round(window.scrollY / h * 100) : 0) }
    window.addEventListener('scroll', fn, { passive: true })
    return function() { window.removeEventListener('scroll', fn) }
  }, [])

  var cta = 'https://www.pulsewavelabs.io'

  return (
    <div className="min-h-screen bg-[#06060a] text-[#bbb] antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#06060a}
        .serif{font-family:'Newsreader',Georgia,serif}
        .mono{font-family:'JetBrains Mono',monospace}
        ::selection{background:rgba(0,229,160,.15);color:#fff}
        article p{color:rgba(255,255,255,.48);font-size:17px;line-height:1.85;margin-bottom:1.5em}
        @media(max-width:640px){article p{font-size:15.5px;line-height:1.8}}
        article strong{color:rgba(255,255,255,.7);font-weight:600}
        article em{color:rgba(255,255,255,.55)}
        .hr{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.05) 50%,transparent);margin:3.5rem 0}
        @media(max-width:640px){.hr{margin:2.5rem 0}}
      `}} />

      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
        <div className="h-full bg-[#00e5a0]/30 transition-all duration-100" style={{width:pct+'%'}}/>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#06060a]/85 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="max-w-[680px] mx-auto px-5 h-11 flex items-center justify-between">
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-[18px] opacity-30 hover:opacity-50 transition-opacity" /></Link>
          <span className="mono text-[10px] text-white/12">{pct}%</span>
        </div>
      </nav>

      <article className="max-w-[680px] mx-auto px-5 md:px-6">

        {/* ═══════ HEADER ═══════ */}
        <header className="pt-14 md:pt-20 pb-10 md:pb-14">
          <Reveal>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] mono text-[#00e5a0]/30 tracking-[.2em]">FREE PLAYBOOK</span>
              <span className="text-white/10">·</span>
              <span className="text-[10px] mono text-white/15">8 MIN READ</span>
            </div>
            <h1 className="serif text-[34px] md:text-[46px] font-bold leading-[1.1] tracking-[-0.01em] text-white mb-5">
              How We Turned $10K Into $218K Trading 5 Crypto Pairs
            </h1>
            <p className="text-[17px] md:text-[19px] text-white/30 leading-relaxed max-w-lg" style={{fontFamily:'Newsreader,Georgia,serif',fontStyle:'italic'}}>
              The exact framework, the real numbers, and the trades we'd rather not show you — but do anyway.
            </p>

            {/* Author + stats */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/[0.03]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <span className="mono text-[11px] font-bold text-white/25">M</span>
                </div>
                <div>
                  <p className="text-[13px] text-white/45 font-medium">Mason</p>
                  <p className="text-[10px] mono text-white/15">Creator, PulseWave</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-5 ml-auto">
                {[{v:'624',l:'trades'},{v:'40.7%',l:'win rate'},{v:'1.52',l:'profit factor'}].map(function(s,i){return(
                  <div key={i} className="text-right">
                    <div className="mono text-[14px] text-white/40 font-medium">{s.v}</div>
                    <div className="text-[9px] text-white/12">{s.l}</div>
                  </div>
                )})}
              </div>
            </div>
          </Reveal>
        </header>


        {/* ═══════ INTRO ═══════ */}
        <Reveal>
          <p>I'm going to tell you something most trading "gurus" never will:</p>

          <blockquote className="my-8 md:my-10 pl-5 md:pl-6 border-l-2 border-[#00e5a0]/20">
            <p className="serif text-[22px] md:text-[26px] text-white/70 leading-[1.45] italic !mb-0">
              We lose more trades than we win.
            </p>
          </blockquote>

          <p>Our win rate is 40.7%. Out of every 10 trades, we lose about 6. And yet, a $10,000 account following our signals grew to $218,000 across 624 trades.</p>
          <p>How? That's what this playbook is about. Not hype. Not cherry-picked screenshots of green P&L. The actual system — including the math that makes losing profitable.</p>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CH 1: 5 PAIRS ═══════ */}
        <Reveal>
          <div className="mb-6">
            <span className="mono text-[11px] text-[#00e5a0]/25 tracking-[.15em]">CHAPTER 01</span>
            <h2 className="serif text-[28px] md:text-[34px] font-bold text-white leading-[1.15] mt-2">Why We Only Trade 5 Pairs</h2>
          </div>

          <p>When I started trading, I had 40 pairs on my watchlist. I'd chase anything that moved — BTC one minute, some random altcoin the next. No edge. No consistency. Just noise.</p>
          <p>The turning point was brutal. I lost $14,000 in two weeks trading pairs I barely understood. I knew the ticker and nothing else.</p>
          <p>So I stripped it down to 5. The ones with the best liquidity, cleanest S/R levels, and enough volatility to matter:</p>

          <div className="my-8 space-y-1">
            {[
              {s:'BTC',d:'Highest liquidity. S/R levels hold like law. Institutional money lives here.'},
              {s:'ETH',d:'Strong trending behavior. When it moves, it moves with conviction.'},
              {s:'SOL',d:'High volatility = high R:R. Regularly gives 3:1 setups.'},
              {s:'AVAX',d:'Mean-reverting. Bounces between zones. Patient entries get rewarded.'},
              {s:'XRP',d:'News-driven spikes create sharp, fast entries at key levels.'},
            ].map(function(p,i){return(
              <div key={i} className="flex items-start gap-4 px-4 py-3.5 rounded-lg bg-white/[0.015] border border-white/[0.025] hover:border-white/[0.05] transition-colors">
                <span className="mono text-[13px] text-[#00e5a0]/60 font-medium shrink-0 mt-[2px] w-11">{p.s}</span>
                <span className="text-[14px] text-white/35 leading-relaxed">{p.d}</span>
              </div>
            )})}
          </div>

          <p>Five pairs. We know their patterns, their fakeouts, their behavior at 3am. We're not scanning 200 charts hoping for a setup. We're watching 5 and <em>knowing</em> when to strike.</p>

          <div className="my-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
            <p className="text-[15px] text-white/50 leading-relaxed !mb-0">
              <strong>The insight:</strong> Mastery beats coverage. A trader who knows 5 pairs deeply will outperform a trader who skims 50. Every time.
            </p>
          </div>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CH 2: CONFLUENCE ═══════ */}
        <Reveal>
          <div className="mb-6">
            <span className="mono text-[11px] text-[#00e5a0]/25 tracking-[.15em]">CHAPTER 02</span>
            <h2 className="serif text-[28px] md:text-[34px] font-bold text-white leading-[1.15] mt-2">The Confluence Scoring System</h2>
          </div>

          <p>Here's what makes this different: we don't trade on gut feel. Every single trade passes through a multi-factor scoring system rated 0 to 100.</p>
          <p>Below 45? We don't trade. Period. Doesn't matter how "bullish" the chart looks. The system doesn't care about feelings.</p>
          <p>There are 7 factors. The 3 core pillars carry 80% of the weight:</p>

          {[
            {pts:'35',title:'S/R Proximity + Strength',body:'How close is price to a proven zone, and how strong is it? A level tested 10+ times is institutional. We score both distance and touch count — maximum points when price sits right at a battle-tested zone.'},
            {pts:'20',title:'Regime Alignment',body:'Is the market trending up, down, ranging, or volatile? We classify using ATR, ADX, and EMA position. A long signal in an uptrend gets full marks. A long in a downtrend gets penalized. Perfect S/R setup means nothing if you\'re fighting the regime.'},
            {pts:'25',title:'RSI + Volume Confirmation',body:'RSI below 30 on a long = maximum points. The market is oversold and primed to bounce. Volume 1.5x above average = institutional money confirming the move. Both must align with direction or the score drops.'},
          ].map(function(p,i){return(
            <Reveal key={i}>
              <div className="my-6 p-5 md:p-6 rounded-xl bg-white/[0.015] border border-white/[0.03]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="mono text-[11px] px-2 py-0.5 rounded bg-[#00e5a0]/[0.06] text-[#00e5a0]/50 font-medium">{p.pts} PTS</span>
                  <h3 className="text-[17px] md:text-[18px] font-semibold text-white/70">{p.title}</h3>
                </div>
                <p className="text-[14px] text-white/35 leading-[1.75] !mb-0">{p.body}</p>
              </div>
            </Reveal>
          )})}

          <p className="text-[14px] !text-white/20 italic">The remaining 20 points: trend alignment (EMA position) + multi-timeframe agreement. The full system evaluates every setup before a dollar is risked.</p>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CH 3: S/R ═══════ */}
        <Reveal>
          <div className="mb-6">
            <span className="mono text-[11px] text-[#00e5a0]/25 tracking-[.15em]">CHAPTER 03</span>
            <h2 className="serif text-[28px] md:text-[34px] font-bold text-white leading-[1.15] mt-2">Reading S/R Like Institutions</h2>
          </div>

          <p>Forget trendlines. Institutions don't draw diagonal lines. They care about <em>zones</em> — horizontal areas where enough orders sit to move price.</p>

          <div className="my-8 space-y-4">
            {[
              {n:'1',t:'Find Pivot Clusters',d:'Scan for pivot highs and lows with a 10-bar lookback. A pivot high = a candle whose high is higher than the 10 candles on either side. These are points where price actually reversed — not where you think it might.'},
              {n:'2',t:'Cluster Into Zones',d:'Pivots within the same price band get grouped. Multiple pivots = a level. The tighter the cluster, the more precise the zone. A single pivot is noise. Five pivots in the same zone is a wall.'},
              {n:'3',t:'Rank by Strength',d:'Strength = number of touches. 3 touches is a suggestion. 10+ touches is institutional. We rank every zone and only trade the strongest levels on the chart.'},
              {n:'4',t:'Enter AT the Zone',d:'The #1 retail mistake: entering between zones. Support at $95K and price at $97K? You wait. Enter when price reaches the zone, confirms it\'s holding, then act. Patience is the edge.'},
            ].map(function(s,i){return(
              <div key={i} className="flex gap-4">
                <div className="w-7 h-7 rounded-md bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="mono text-[12px] text-[#00e5a0]/50 font-bold">{s.n}</span>
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white/60 mb-1">{s.t}</h4>
                  <p className="text-[14px] text-white/30 leading-[1.7] !mb-0">{s.d}</p>
                </div>
              </div>
            )})}
          </div>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CH 4: WIN ═══════ */}
        <Reveal>
          <div className="mb-6">
            <span className="mono text-[11px] text-[#00e5a0]/25 tracking-[.15em]">CHAPTER 04</span>
            <h2 className="serif text-[28px] md:text-[34px] font-bold text-white leading-[1.15] mt-2">Trade Walkthrough: The Win</h2>
          </div>

          <p>Let me show you what this looks like live. Real trade, real money, real result.</p>

          {/* Trade card */}
          <div className="my-8 rounded-xl overflow-hidden border border-[#00e5a0]/[0.1]" style={{background:'linear-gradient(180deg,rgba(0,229,160,.015) 0%,rgba(6,6,10,1) 40%)'}}>
            <div className="px-5 py-3.5 border-b border-white/[0.03] flex items-center justify-between">
              <span className="mono text-[13px] text-[#00e5a0]/70 font-medium">BTC/USDT — 4H</span>
              <span className="mono text-[10px] text-white/15">Feb 12, 2026</span>
            </div>
            <div className="px-5 py-4 space-y-0">
              {[
                {k:'Direction',v:'LONG',c:'text-[#00e5a0]'},
                {k:'Entry',v:'$96,420',c:'text-white/60'},
                {k:'Stop Loss',v:'$95,180 (-1.29%)',c:'text-[#ff4d4d]/60'},
                {k:'Take Profit',v:'$99,650 (+3.35%)',c:'text-[#00e5a0]/60'},
                {k:'Confluence',v:'74 / 100',c:'text-[#00e5a0]/80'},
                {k:'R:R',v:'2.60',c:'text-white/60'},
                {k:'Result',v:'+3.35% WIN',c:'text-[#00e5a0] font-semibold'},
              ].map(function(r,i){return(
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.02] last:border-0">
                  <span className="text-[13px] text-white/25">{r.k}</span>
                  <span className={'mono text-[13px] '+r.c}>{r.v}</span>
                </div>
              )})}
            </div>
          </div>

          <p><strong>Why the system took it:</strong> Price sat 0.4% from a 10-touch support zone (18/20 proximity points). Market regime: uptrend, 78% confidence (16/20). RSI at 38, approaching oversold (10/15). Volume 1.3x average on the bounce candle. Total score: 74/100 — well above the 45-point cutoff.</p>
          <p>Entry at $96,420. Stop below the zone. Target at next resistance. Hit TP in 16 hours. No guessing. Math.</p>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CH 5: LOSS ═══════ */}
        <Reveal>
          <div className="mb-6">
            <span className="mono text-[11px] text-[#ff4d4d]/25 tracking-[.15em]">CHAPTER 05</span>
            <h2 className="serif text-[28px] md:text-[34px] font-bold text-white leading-[1.15] mt-2">Trade Walkthrough: The Loss</h2>
          </div>

          <p>This is the part most services skip. The screenshot that "accidentally" gets deleted. The trade that vanishes from the track record.</p>
          <p>We don't skip it.</p>

          {/* Loss card */}
          <div className="my-8 rounded-xl overflow-hidden border border-[#ff4d4d]/[0.08]" style={{background:'linear-gradient(180deg,rgba(255,77,77,.015) 0%,rgba(6,6,10,1) 40%)'}}>
            <div className="px-5 py-3.5 border-b border-white/[0.03] flex items-center justify-between">
              <span className="mono text-[13px] text-[#ff4d4d]/60 font-medium">ETH/USDT — 4H</span>
              <span className="mono text-[10px] text-white/15">Feb 8, 2026</span>
            </div>
            <div className="px-5 py-4 space-y-0">
              {[
                {k:'Direction',v:'SHORT',c:'text-[#ff4d4d]/70'},
                {k:'Entry',v:'$2,845',c:'text-white/60'},
                {k:'Stop Loss',v:'$2,912 (+2.35%)',c:'text-[#ff4d4d]/60'},
                {k:'Confluence',v:'52 / 100',c:'text-[#ff9f43]/70'},
                {k:'Result',v:'-2.35% LOSS',c:'text-[#ff4d4d] font-semibold'},
              ].map(function(r,i){return(
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.02] last:border-0">
                  <span className="text-[13px] text-white/25">{r.k}</span>
                  <span className={'mono text-[13px] '+r.c}>{r.v}</span>
                </div>
              )})}
            </div>
          </div>

          <p>ETH broke through the resistance zone we expected to hold. Ran straight through the stop. -2.35%. Done.</p>

          <blockquote className="my-8 md:my-10 pl-5 md:pl-6 border-l-2 border-[#ff9f43]/20">
            <p className="serif text-[20px] md:text-[22px] text-white/60 leading-[1.5] italic !mb-0">
              So how are we still profitable losing 60% of our trades?
            </p>
          </blockquote>

          <p>One number: <strong>profit factor</strong>.</p>

          <div className="my-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
            <p className="text-[14px] text-white/40 leading-[1.7] mb-3 !mb-3">Average win: +3.2%. Average loss: -1.4%. Win rate: 40.7%.</p>
            <div className="mono text-[14px] text-[#00e5a0]/70 bg-[#00e5a0]/[0.03] px-4 py-2.5 rounded-lg border border-[#00e5a0]/[0.06] mb-3">
              (3.2% × 0.407) ÷ (1.4% × 0.593) = <strong className="text-[#00e5a0]">1.52</strong>
            </div>
            <p className="text-[14px] text-white/35 leading-[1.7] !mb-0">Above 1.0 = profitable. For every $1 risked, we make $1.52 back over time. The wins are bigger than the losses — that's the only number that matters.</p>
          </div>

          <p className="serif text-[18px] text-white/50 italic">Any service that only shows wins is lying. We publish every single trade. That's not marketing — it's the bare minimum for trust.</p>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CH 6: POSITION SIZING ═══════ */}
        <Reveal>
          <div className="mb-6">
            <span className="mono text-[11px] text-[#00e5a0]/25 tracking-[.15em]">CHAPTER 06</span>
            <h2 className="serif text-[28px] md:text-[34px] font-bold text-white leading-[1.15] mt-2">Position Sizing</h2>
          </div>

          <p>The best system in the world will blow your account with bad sizing. This is the unsexy part everyone skips — and the part that keeps you alive.</p>
          <p>Golden rule: <strong>never risk more than 1-2% per trade.</strong></p>

          <div className="my-8 rounded-xl border border-white/[0.04] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.03]">
                  <th className="px-4 py-2.5 text-left mono text-[10px] text-[#00e5a0]/40 font-medium tracking-wider">ACCOUNT</th>
                  <th className="px-4 py-2.5 text-center mono text-[10px] text-[#00e5a0]/40 font-medium tracking-wider">1% RISK</th>
                  <th className="px-4 py-2.5 text-center mono text-[10px] text-[#00e5a0]/40 font-medium tracking-wider">2% RISK</th>
                  <th className="px-4 py-2.5 text-right mono text-[10px] text-[#00e5a0]/40 font-medium tracking-wider hidden sm:table-cell">REC.</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {a:'$1K',r1:'$10',r2:'$20',r:'1%'},
                  {a:'$5K',r1:'$50',r2:'$100',r:'1%'},
                  {a:'$10K',r1:'$100',r2:'$200',r:'1-2%'},
                  {a:'$25K',r1:'$250',r2:'$500',r:'1%'},
                  {a:'$50K',r1:'$500',r2:'$1K',r:'0.5-1%'},
                  {a:'$100K',r1:'$1K',r2:'$2K',r:'0.5%'},
                ].map(function(r,i){return(
                  <tr key={i} className={'border-b border-white/[0.02] '+(i%2===0?'bg-white/[0.005]':'')}>
                    <td className="px-4 py-2.5 mono text-white/50 font-medium">{r.a}</td>
                    <td className="px-4 py-2.5 text-center text-white/30">{r.r1}</td>
                    <td className="px-4 py-2.5 text-center text-white/30">{r.r2}</td>
                    <td className="px-4 py-2.5 text-right mono text-[11px] text-[#00e5a0]/35 hidden sm:table-cell">{r.r}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          <div className="my-6 flex items-start gap-3 p-4 rounded-xl bg-white/[0.015] border border-white/[0.03]">
            <svg className="w-4 h-4 text-[#00e5a0]/40 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round"/></svg>
            <p className="text-[13px] text-white/35 leading-relaxed !mb-0"><strong>Start at 0.5-1%</strong> until you trust the system with real money. Size up later. You can never un-blow an account.</p>
          </div>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CH 7: RESULTS ═══════ */}
        <Reveal>
          <div className="mb-6">
            <span className="mono text-[11px] text-[#00e5a0]/25 tracking-[.15em]">CHAPTER 07</span>
            <h2 className="serif text-[28px] md:text-[34px] font-bold text-white leading-[1.15] mt-2">The Full Numbers</h2>
          </div>

          <p>624 trades. Every one published. Here's the complete picture:</p>

          {/* Big stats */}
          <div className="my-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {v:'$218K',l:'from $10K',c:'text-[#00e5a0]'},
              {v:'624',l:'total trades',c:'text-white/60'},
              {v:'40.7%',l:'win rate',c:'text-[#ff9f43]'},
              {v:'1.52',l:'profit factor',c:'text-[#00e5a0]'},
            ].map(function(s,i){return(
              <div key={i} className="p-4 rounded-lg bg-white/[0.015] border border-white/[0.03] text-center">
                <div className={'mono text-[20px] font-bold '+s.c}>{s.v}</div>
                <div className="text-[10px] text-white/15 mt-0.5">{s.l}</div>
              </div>
            )})}
          </div>

          {/* Detail stats */}
          <div className="my-6 space-y-0.5">
            {[
              {k:'Average Win',v:'+3.2%'},{k:'Average Loss',v:'-1.4%'},
              {k:'Trades/Day',v:'2.8'},{k:'Max Drawdown',v:'-12.4%'},
              {k:'Sharpe Ratio',v:'2.1'},{k:'Expectancy/Trade',v:'+0.47%'},
              {k:'Best Streak',v:'8 wins'},{k:'Worst Streak',v:'11 losses'},
            ].map(function(s,i){return(
              <div key={i} className={'flex items-center justify-between px-4 py-2 rounded '+(i%2===0?'bg-white/[0.01]':'')}>
                <span className="text-[13px] text-white/25">{s.k}</span>
                <span className="mono text-[13px] text-white/45">{s.v}</span>
              </div>
            )})}
          </div>

          <p>Notice the worst streak: 11 losses in a row. That happened. We didn't panic. Didn't change the system. Didn't revenge trade. We stuck to the math, and the math worked — as it always does with a positive profit factor.</p>
        </Reveal>

        <div className="hr"></div>


        {/* ═══════ CTA ═══════ */}
        <Reveal>
          <div className="my-6 py-10 md:py-14 px-6 md:px-10 rounded-2xl text-center relative overflow-hidden" style={{background:'linear-gradient(180deg,rgba(0,229,160,.025) 0%,rgba(6,6,10,1) 60%)'}}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/20 to-transparent"></div>

            <span className="mono text-[10px] text-[#00e5a0]/30 tracking-[.2em]">WHAT IF YOU DIDN'T HAVE TO DO THIS YOURSELF?</span>

            <h2 className="serif text-[24px] md:text-[30px] font-bold text-white leading-tight mt-4 mb-3">
              PulseWave Signals runs this exact system. 24/7.
            </h2>

            <p className="text-[14px] text-white/30 leading-relaxed max-w-md mx-auto mb-8">
              Every trade from this playbook — the scoring, the zones, the sizing — automated and delivered to your phone. Including the losses.
            </p>

            <div className="space-y-2 text-left max-w-xs mx-auto mb-8">
              {[
                'Real-time signals on all 5 pairs',
                'Entry, SL, TP + position size',
                'Telegram + email delivery',
                'Every trade published — wins & losses',
                '30-day money-back guarantee',
              ].map(function(b,i){return(
                <div key={i} className="flex items-center gap-2.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#00e5a0" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6l3 3 5-5.5"/></svg>
                  <span className="text-[13px] text-white/35">{b}</span>
                </div>
              )})}
            </div>

            <a href={cta} className="inline-block px-8 py-3.5 bg-[#00e5a0] text-[#06060a] rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all shadow-[0_0_40px_rgba(0,229,160,.06),0_2px_8px_rgba(0,229,160,.12)]">
              See PulseWave Signals →
            </a>

            <p className="mono text-[10px] text-white/12 mt-4">153 spots left at current pricing</p>
          </div>
        </Reveal>


        {/* ═══════ FOOTER ═══════ */}
        <footer className="py-10 mt-8 border-t border-white/[0.02]">
          <p className="text-[10px] text-white/10 leading-relaxed text-center max-w-lg mx-auto">
            Trading cryptocurrency carries significant risk. Past performance is not indicative of future results. Nothing here constitutes financial advice. A 40.7% win rate means the system loses more than it wins — profitability comes from risk management, not win rate. © 2026 PulseWave Labs · <Link href="/disclaimer" className="underline hover:text-white/20">Risk disclosure</Link>
          </p>
        </footer>

      </article>
    </div>
  )
}
