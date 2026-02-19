'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useInView() {
  var ref = useRef<HTMLDivElement>(null)
  var [visible, setVisible] = useState(false)
  useEffect(function() {
    if (!ref.current) return
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(ref.current)
    return function() { obs.disconnect() }
  }, [])
  return { ref, visible }
}

function Section({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  var { ref, visible } = useInView()
  return <div ref={ref} className={'transition-all duration-700 ' + (visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6') + ' ' + className}>{children}</div>
}

export default function PlaybookRead() {
  var [scrollPct, setScrollPct] = useState(0)

  useEffect(function() {
    var fn = function() {
      var h = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(h > 0 ? Math.round(window.scrollY / h * 100) : 0)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return function() { window.removeEventListener('scroll', fn) }
  }, [])

  var signalsUrl = 'https://www.pulsewavelabs.io'

  return (
    <div className="min-h-screen bg-[#06060a] text-[#c8c8c8]">
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#06060a}
        .serif{font-family:'Newsreader',Georgia,serif}
        .mono{font-family:'JetBrains Mono',monospace}
        ::selection{background:rgba(0,229,160,.15);color:#fff}
        .prose p{margin-bottom:1.4em}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04) 50%,transparent);margin:3rem 0}
      `}} />

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div className="h-full bg-[#00e5a0]/40 transition-all duration-150" style={{width: scrollPct + '%'}}/>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#06060a]/80 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-2xl mx-auto px-6 h-12 flex items-center justify-between">
          <img src="/logo.webp" alt="PulseWave" className="h-5 opacity-40" />
          <span className="text-[10px] mono text-white/15">{scrollPct}% read</span>
        </div>
      </nav>


      <article className="max-w-2xl mx-auto px-6 md:px-8 py-16 md:py-24">

        {/* ─── HEADER ─── */}
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02]">
            <span className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em]">FREE PLAYBOOK</span>
          </div>
          <h1 className="serif text-[32px] md:text-[42px] font-bold leading-[1.15] tracking-tight text-white mb-5">
            How We Turned $10K Into $218K<br/>Trading 5 Crypto Pairs
          </h1>
          <p className="text-[15px] text-white/35 leading-relaxed max-w-lg mx-auto">
            The exact framework, the real numbers, and the trades we'd rather not show you — but do anyway.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center">
              <span className="text-[11px] mono font-bold text-white/25">M</span>
            </div>
            <div className="text-left">
              <p className="text-[12px] text-white/40">Mason · PulseWave Labs</p>
              <p className="text-[10px] text-white/15 mono">8 min read</p>
            </div>
          </div>
        </header>


        <div className="prose">

        {/* ─── INTRO ─── */}
        <Section>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            I'm going to tell you something that most trading "gurus" never will:
          </p>
          <p className="text-[20px] serif text-white/80 leading-[1.6] italic my-8 pl-5 border-l-2 border-[#00e5a0]/20">
            We lose more trades than we win.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            Our win rate is 40.7%. That means out of every 10 trades, we lose about 6. And yet, a $10,000 account following our signals grew to $218,000 across 624 trades.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            How? That's what this playbook is about. Not hype. Not screenshots of green P&L. The actual system — including the math that makes losing profitable.
          </p>
        </Section>

        <div className="divider"></div>


        {/* ─── CHAPTER 1: THE 5 PAIRS ─── */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[32px] mono font-bold text-[#00e5a0]/10">01</span>
            <h2 className="serif text-[24px] md:text-[28px] font-bold text-white">Why We Only Trade 5 Pairs</h2>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            When I started trading, I had 40 pairs on my watchlist. I'd jump from BTC to some random altcoin because it was "moving." I was everywhere and nowhere. No edge. No consistency. Just chaos.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            The turning point was brutal: I lost $14,000 in two weeks trading pairs I barely understood. I knew the ticker symbol and not much else.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            So I stripped everything back to 5 pairs. The ones with the best liquidity, the cleanest technical setups, and enough volatility to be worth trading:
          </p>

          <div className="my-8 space-y-2">
            {[
              { sym: 'BTC/USDT', why: 'Highest liquidity. Support and resistance levels are respected like law. Institutional money lives here.' },
              { sym: 'ETH/USDT', why: 'Strong trending behavior. When ETH moves, it moves with conviction. Great for momentum plays.' },
              { sym: 'SOL/USDT', why: 'High volatility = high risk:reward. The kind of pair that gives you 3:1 setups regularly.' },
              { sym: 'AVAX/USDT', why: 'Mean-reverting. Tends to bounce between zones. If you\'re patient, it practically tells you where to enter.' },
              { sym: 'XRP/USDT', why: 'News-driven spikes create sharp, fast entries. Great for catching breakouts at key levels.' },
            ].map(function(p, i) { return (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.015] border border-white/[0.03]">
                <span className="mono text-[13px] text-[#00e5a0] font-medium shrink-0 mt-0.5">{p.sym}</span>
                <span className="text-[14px] text-white/40 leading-relaxed">{p.why}</span>
              </div>
            )})}
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            Five pairs. That's it. We know their patterns, their zones, their fake-outs. We're not scanning 200 charts hoping for a setup. We're watching 5 charts and <em>knowing</em> when to strike.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            Mastery beats coverage. Every time.
          </p>
        </Section>

        <div className="divider"></div>


        {/* ─── CHAPTER 2: CONFLUENCE SCORING ─── */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[32px] mono font-bold text-[#00e5a0]/10">02</span>
            <h2 className="serif text-[24px] md:text-[28px] font-bold text-white">The Confluence Scoring System</h2>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            Here's what separates this from every other strategy: we don't trade on gut feel. We don't trade because "it looks like it's going up." Every single trade passes through a multi-factor scoring system rated 0–100.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            If the score is below 45, we don't trade. Period. Doesn't matter how good it "feels." The system doesn't care about feelings.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            There are 7 factors total, but the 3 core pillars carry 80% of the weight:
          </p>

          {/* Pillar 1 */}
          <div className="my-8 p-6 rounded-xl bg-white/[0.015] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <span className="mono text-[12px] text-[#00e5a0]/50">35 PTS</span>
              <h3 className="text-[18px] font-semibold text-white/80">S/R Proximity + Strength</h3>
            </div>
            <p className="text-[14px] text-white/40 leading-[1.7]">
              How close is price to a proven support or resistance zone? And how strong is that zone? A level that's been tested 10+ times is institutional. A level with 3 touches is speculative. We score both distance and strength — you get maximum points when price is sitting right at a battle-tested zone.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="my-8 p-6 rounded-xl bg-white/[0.015] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <span className="mono text-[12px] text-[#00e5a0]/50">20 PTS</span>
              <h3 className="text-[18px] font-semibold text-white/80">Regime Alignment</h3>
            </div>
            <p className="text-[14px] text-white/40 leading-[1.7]">
              Is the market trending up, trending down, ranging, or volatile? We classify this using ATR ratios, ADX readings, and EMA position. A long signal in an uptrend gets full marks. A long signal in a downtrend gets penalized. You can have the perfect S/R setup, but if you're fighting the regime, you're fighting the market.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="my-8 p-6 rounded-xl bg-white/[0.015] border border-white/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <span className="mono text-[12px] text-[#00e5a0]/50">25 PTS</span>
              <h3 className="text-[18px] font-semibold text-white/80">RSI + Volume Confirmation</h3>
            </div>
            <p className="text-[14px] text-white/40 leading-[1.7]">
              RSI below 30 on a long setup? Maximum points — the market is oversold and primed to bounce. Volume 1.5x above average on a breakout candle? That's institutional money confirming the move. Both indicators must agree with the trade direction, or the score drops.
            </p>
          </div>

          <p className="text-[14px] text-white/30 italic">
            The remaining 20 points come from trend alignment (EMA position) and multi-timeframe agreement. The full system evaluates every setup on all 7 factors before a single dollar is risked.
          </p>
        </Section>

        <div className="divider"></div>


        {/* ─── CHAPTER 3: S/R READING ─── */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[32px] mono font-bold text-[#00e5a0]/10">03</span>
            <h2 className="serif text-[24px] md:text-[28px] font-bold text-white">Reading Support & Resistance Like Institutions</h2>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            Forget trendlines. Institutions don't draw diagonal lines on their charts. They care about <em>zones</em> — horizontal areas where enough orders are stacked to actually move price.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            Here's how our system identifies them:
          </p>

          <div className="my-8 space-y-4">
            {[
              { n: '1', t: 'Detect Pivot Clusters', d: 'We scan for pivot highs and lows with a 10-bar lookback window. A pivot high is a candle whose high is higher than the 10 candles on either side. Same logic inverted for pivot lows. These are the points where price actually reversed — not where you think it might.' },
              { n: '2', t: 'Cluster Within Channel Width', d: 'Pivots that fall within the same price zone (calculated as a percentage of the total price range) get grouped into a cluster. Multiple pivots in the same zone = a level. The tighter the cluster, the more precise the zone.' },
              { n: '3', t: 'Rank by Strength', d: 'Strength = number of touches. A zone tested 3 times is a suggestion. A zone tested 10 times is a wall. We rank every zone by touch count and only trade the strongest levels on the chart.' },
              { n: '4', t: 'Enter AT the Zone', d: 'The #1 mistake retail traders make: entering between zones. If support is at $95K and price is at $97K, you wait. You don\'t "anticipate." You let price come to the zone, confirm it\'s holding, and then enter. Patience is the edge.' },
            ].map(function(s, i) { return (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08] flex items-center justify-center shrink-0 mt-1">
                  <span className="mono text-[13px] text-[#00e5a0]/60 font-bold">{s.n}</span>
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white/70 mb-1">{s.t}</h4>
                  <p className="text-[14px] text-white/35 leading-[1.7]">{s.d}</p>
                </div>
              </div>
            )})}
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            This is the same algorithm our automated system uses. Green zones are support. Red zones are resistance. The number next to each zone is its strength score. You don't need to interpret anything — the zones tell you exactly where the battle lines are.
          </p>
        </Section>

        <div className="divider"></div>


        {/* ─── CHAPTER 4: WINNING TRADE ─── */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[32px] mono font-bold text-[#00e5a0]/10">04</span>
            <h2 className="serif text-[24px] md:text-[28px] font-bold text-white">Trade Walkthrough: The Win</h2>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            Let me show you what this looks like in practice. Real trade, real numbers, real result.
          </p>

          {/* Trade card */}
          <div className="my-8 rounded-xl border border-[#00e5a0]/[0.1] overflow-hidden" style={{background:'linear-gradient(180deg, rgba(0,229,160,0.02) 0%, rgba(6,6,10,1) 50%)'}}>
            <div className="px-6 py-4 border-b border-white/[0.03] flex items-center justify-between">
              <span className="mono text-[14px] text-[#00e5a0] font-medium">BTC/USDT — 4H</span>
              <span className="mono text-[11px] text-white/20">Feb 12, 2026</span>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { k: 'Direction', v: 'LONG', c: 'text-[#00e5a0]' },
                { k: 'Entry', v: '$96,420', c: 'text-white/70' },
                { k: 'Stop Loss', v: '$95,180 (-1.29%)', c: 'text-[#ff4d4d]/70' },
                { k: 'Take Profit', v: '$99,650 (+3.35%)', c: 'text-[#00e5a0]/70' },
                { k: 'Confluence Score', v: '74 / 100', c: 'text-[#00e5a0]' },
                { k: 'Risk:Reward', v: '2.60', c: 'text-white/70' },
                { k: 'Result', v: '+3.35% WIN ✓', c: 'text-[#00e5a0] font-bold' },
              ].map(function(r, i) { return (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.02] last:border-0">
                  <span className="text-[13px] text-white/30">{r.k}</span>
                  <span className={'mono text-[13px] ' + r.c}>{r.v}</span>
                </div>
              )})}
            </div>
          </div>

          <h3 className="text-[17px] font-semibold text-white/70 mb-3">Why the system took this trade:</h3>

          <div className="my-6 space-y-2">
            {[
              { factor: 'S/R Proximity', score: '18/20', note: 'Price was 0.4% from a support zone with 10 touches' },
              { factor: 'S/R Strength', score: '12/15', note: '10 pivot touches — institutional-grade level' },
              { factor: 'Regime', score: '16/20', note: 'Market in uptrend with 78% confidence' },
              { factor: 'RSI', score: '10/15', note: 'RSI at 38 — approaching oversold in an uptrend' },
              { factor: 'Volume', score: '7/10', note: '1.3x average volume on the bounce candle' },
              { factor: 'Trend', score: '8/10', note: 'Price above 50 EMA, EMA sloping up' },
              { factor: 'MTF', score: '3/10', note: 'Single timeframe mode (conservative score)' },
            ].map(function(f, i) { return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/[0.015]">
                <span className="text-[12px] text-white/30 w-24 shrink-0">{f.factor}</span>
                <span className="mono text-[12px] text-[#00e5a0] w-12 shrink-0">{f.score}</span>
                <span className="text-[12px] text-white/25">{f.note}</span>
              </div>
            )})}
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            Total: 74/100. Well above our 45-point minimum. R:R of 2.6:1. The system entered, set the stop loss below the zone, targeted the next resistance level, and hit TP within 16 hours.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            No guessing. No "I think BTC looks bullish." Math.
          </p>
        </Section>

        <div className="divider"></div>


        {/* ─── CHAPTER 5: THE LOSS ─── */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[32px] mono font-bold text-[#ff4d4d]/10">05</span>
            <h2 className="serif text-[24px] md:text-[28px] font-bold text-white">Trade Walkthrough: The Loss</h2>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            This is the part most signal services skip. The part where they "forget" to screenshot. The part that mysteriously disappears from their track record.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            We don't skip it.
          </p>

          {/* Loss trade card */}
          <div className="my-8 rounded-xl border border-[#ff4d4d]/[0.1] overflow-hidden" style={{background:'linear-gradient(180deg, rgba(255,77,77,0.02) 0%, rgba(6,6,10,1) 50%)'}}>
            <div className="px-6 py-4 border-b border-white/[0.03] flex items-center justify-between">
              <span className="mono text-[14px] text-[#ff4d4d] font-medium">ETH/USDT — 4H</span>
              <span className="mono text-[11px] text-white/20">Feb 8, 2026</span>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { k: 'Direction', v: 'SHORT', c: 'text-[#ff4d4d]' },
                { k: 'Entry', v: '$2,845', c: 'text-white/70' },
                { k: 'Stop Loss', v: '$2,912 (+2.35%)', c: 'text-[#ff4d4d]/70' },
                { k: 'Take Profit', v: '$2,710 (-4.74%)', c: 'text-[#00e5a0]/70' },
                { k: 'Confluence Score', v: '52 / 100', c: 'text-[#ff9f43]' },
                { k: 'Result', v: '-2.35% LOSS ✗', c: 'text-[#ff4d4d] font-bold' },
              ].map(function(r, i) { return (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.02] last:border-0">
                  <span className="text-[13px] text-white/30">{r.k}</span>
                  <span className={'mono text-[13px] ' + r.c}>{r.v}</span>
                </div>
              )})}
            </div>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            ETH broke through the resistance zone that we expected to hold. Price ran straight through the stop loss. Trade over. -2.35%.
          </p>

          <div className="my-8 p-6 rounded-xl bg-white/[0.02] border-l-2 border-[#ff9f43]/30">
            <h3 className="text-[17px] font-semibold text-white/70 mb-3">So how are we still profitable?</h3>
            <p className="text-[15px] text-white/45 leading-[1.7] mb-4">
              Because of one number: <strong className="text-white/70">profit factor</strong>.
            </p>
            <p className="text-[15px] text-white/45 leading-[1.7] mb-4">
              Profit factor = (Average Win × Win Rate) ÷ (Average Loss × Loss Rate)
            </p>
            <p className="text-[15px] text-white/45 leading-[1.7] mb-4">
              Our average win is +3.2%. Our average loss is -1.4%. With a 40.7% win rate:
            </p>
            <div className="mono text-[14px] text-[#00e5a0] bg-[#00e5a0]/[0.03] px-4 py-3 rounded-lg border border-[#00e5a0]/[0.06] mb-4">
              (3.2% × 0.407) ÷ (1.4% × 0.593) = 1.52 profit factor
            </div>
            <p className="text-[15px] text-white/45 leading-[1.7]">
              Anything above 1.0 is profitable. We're at 1.52. For every $1 we risk, we make $1.52 back over time. The wins are bigger than the losses — and that's the only number that matters.
            </p>
          </div>

          <p className="text-[20px] serif text-white/70 italic my-8 pl-5 border-l-2 border-[#00e5a0]/20">
            Any signal service that only shows you wins is lying. We publish every single trade. That's not a marketing angle — it's the bare minimum for trust.
          </p>
        </Section>

        <div className="divider"></div>


        {/* ─── CHAPTER 6: POSITION SIZING ─── */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[32px] mono font-bold text-[#00e5a0]/10">06</span>
            <h2 className="serif text-[24px] md:text-[28px] font-bold text-white">Position Sizing: How Much To Risk</h2>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            The best system in the world will blow your account if you size wrong. This is the unsexy part of trading that everyone skips — and the part that actually keeps you alive.
          </p>
          <p className="text-[16px] text-white/55 leading-[1.8]">
            The golden rule: <strong className="text-white/70">never risk more than 1-2% of your account on a single trade.</strong>
          </p>

          {/* Sizing table */}
          <div className="my-8 rounded-xl border border-white/[0.04] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-4 py-3 text-left mono text-[11px] text-[#00e5a0]/50 font-medium tracking-wider">ACCOUNT</th>
                  <th className="px-4 py-3 text-center mono text-[11px] text-[#00e5a0]/50 font-medium tracking-wider">1% RISK</th>
                  <th className="px-4 py-3 text-center mono text-[11px] text-[#00e5a0]/50 font-medium tracking-wider">2% RISK</th>
                  <th className="px-4 py-3 text-right mono text-[11px] text-[#00e5a0]/50 font-medium tracking-wider hidden md:table-cell">RECOMMENDED</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { acc: '$1,000', r1: '$10', r2: '$20', rec: '1% risk' },
                  { acc: '$5,000', r1: '$50', r2: '$100', rec: '1% risk' },
                  { acc: '$10,000', r1: '$100', r2: '$200', rec: '1-2% risk' },
                  { acc: '$25,000', r1: '$250', r2: '$500', rec: '1% risk' },
                  { acc: '$50,000', r1: '$500', r2: '$1,000', rec: '0.5-1% risk' },
                  { acc: '$100,000', r1: '$1,000', r2: '$2,000', rec: '0.5% risk' },
                ].map(function(r, i) { return (
                  <tr key={i} className={'border-t border-white/[0.02] ' + (i % 2 === 0 ? 'bg-white/[0.005]' : '')}>
                    <td className="px-4 py-3 mono text-white/60 font-medium">{r.acc}</td>
                    <td className="px-4 py-3 text-center text-white/35">{r.r1}</td>
                    <td className="px-4 py-3 text-center text-white/35">{r.r2}</td>
                    <td className="px-4 py-3 text-right text-[#00e5a0]/50 mono text-[11px] hidden md:table-cell">{r.rec}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          <div className="my-8 p-5 rounded-xl bg-white/[0.015] border border-white/[0.04]">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#00e5a0]/50 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <p className="text-[14px] text-white/50 font-medium mb-1">Start conservative.</p>
                <p className="text-[13px] text-white/30 leading-relaxed">Use 0.5-1% risk until you trust the system with real money. You can always size up later. You can never un-blow an account.</p>
              </div>
            </div>
          </div>
        </Section>

        <div className="divider"></div>


        {/* ─── CHAPTER 7: FULL RESULTS ─── */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[32px] mono font-bold text-[#00e5a0]/10">07</span>
            <h2 className="serif text-[24px] md:text-[28px] font-bold text-white">The Full Numbers</h2>
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            624 trades. Every one published. Here's the complete picture:
          </p>

          {/* Big stats */}
          <div className="my-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { v: '$218K', l: 'From $10K', c: 'text-[#00e5a0]' },
              { v: '624', l: 'Total Trades', c: 'text-white/70' },
              { v: '40.7%', l: 'Win Rate', c: 'text-[#ff9f43]' },
              { v: '1.52', l: 'Profit Factor', c: 'text-[#00e5a0]' },
            ].map(function(s, i) { return (
              <div key={i} className="p-4 rounded-lg bg-white/[0.015] border border-white/[0.03] text-center">
                <div className={'mono text-[22px] font-bold ' + s.c}>{s.v}</div>
                <div className="text-[11px] text-white/20 mt-1">{s.l}</div>
              </div>
            )})}
          </div>

          {/* Detailed stats */}
          <div className="my-8 space-y-1">
            {[
              { k: 'Average Winning Trade', v: '+3.2%' },
              { k: 'Average Losing Trade', v: '-1.4%' },
              { k: 'Average Trades per Day', v: '2.8' },
              { k: 'Maximum Drawdown', v: '-12.4%' },
              { k: 'Sharpe Ratio', v: '2.1' },
              { k: 'Expectancy per Trade', v: '+0.47%' },
              { k: 'Longest Winning Streak', v: '8 trades' },
              { k: 'Longest Losing Streak', v: '11 trades' },
            ].map(function(s, i) { return (
              <div key={i} className={'flex items-center justify-between px-4 py-2.5 rounded-lg ' + (i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                <span className="text-[13px] text-white/35">{s.k}</span>
                <span className="mono text-[13px] text-white/55">{s.v}</span>
              </div>
            )})}
          </div>

          <p className="text-[16px] text-white/55 leading-[1.8]">
            Notice the losing streak: 11 trades in a row. That happened. We didn't panic. We didn't change the system. We didn't start revenge trading. We stuck to the math, and the math worked itself out — as it always does with a positive profit factor.
          </p>
        </Section>

        <div className="divider"></div>


        {/* ─── CTA SECTION ─── */}
        <Section>
          <div className="my-8 py-12 px-8 rounded-2xl text-center relative overflow-hidden" style={{background:'linear-gradient(180deg, rgba(0,229,160,0.03) 0%, rgba(6,6,10,1) 70%)'}}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/20 to-transparent"></div>
            
            <p className="text-[13px] mono text-[#00e5a0]/40 tracking-[.2em] mb-4">WHAT IF YOU DIDN'T HAVE TO DO THIS YOURSELF?</p>
            
            <h2 className="serif text-[26px] md:text-[32px] font-bold text-white leading-tight mb-4">
              PulseWave Signals runs this<br/>exact system. 24/7.
            </h2>
            
            <p className="text-[15px] text-white/40 leading-[1.7] max-w-md mx-auto mb-8">
              Every trade from this playbook — the confluence scoring, the S/R zones, the position sizing — automated and delivered to your phone. Including the losses.
            </p>

            <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
              {[
                'Real-time signals on all 5 pairs — entry, SL, TP, size',
                'Telegram + email delivery — trade from anywhere',
                'Every trade published — wins AND losses',
                'Private community of 347+ active traders',
                '30-day money-back guarantee',
              ].map(function(b, i) { return (
                <div key={i} className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#00e5a0]/50 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8l4 4 6-7"/></svg>
                  <span className="text-[13px] text-white/45">{b}</span>
                </div>
              )})}
            </div>

            <a href={signalsUrl} className="inline-block px-8 py-3.5 bg-[#00e5a0] text-[#06060a] rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all shadow-[0_0_30px_rgba(0,229,160,.08),0_2px_8px_rgba(0,229,160,.15)]">
              See PulseWave Signals →
            </a>
            
            <p className="text-[11px] text-white/15 mono mt-5">
              153 spots left at current pricing
            </p>
          </div>
        </Section>


        {/* ─── DISCLAIMER ─── */}
        <Section>
          <div className="mt-16 pt-8 border-t border-white/[0.02]">
            <p className="text-[10px] text-white/12 leading-relaxed text-center">
              Trading cryptocurrency carries significant risk. Past performance is not indicative of future results. Nothing in this playbook constitutes financial advice. You are solely responsible for your trading decisions. PulseWave Labs publishes all trades transparently, including losses. A 40.7% win rate means the system loses more than it wins — profitability comes from risk management, not win rate.
            </p>
            <p className="text-[10px] text-white/10 text-center mt-3">
              © 2026 PulseWave Labs · <Link href="/disclaimer" className="underline hover:text-white/20">Full risk disclosure</Link>
            </p>
          </div>
        </Section>

        </div>{/* end prose */}
      </article>
    </div>
  )
}
