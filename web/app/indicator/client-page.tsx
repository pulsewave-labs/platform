'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function IndicatorClient() {
  var [scrolled, setScrolled] = useState(false)
  var [menu, setMenu] = useState(false)
  var [openFaq, setOpenFaq] = useState<number|null>(null)

  useEffect(function() {
    var fn = function() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', fn, { passive: true })
    return function() { window.removeEventListener('scroll', fn) }
  }, [])

  var scrollTo = function(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenu(false) }

  var whopUrl = 'https://whop.com/checkout/plan_LFA5ev192mjHb'

  return (
    <div className="min-h-screen bg-[#08080a] text-[#c8c8c8] overflow-x-hidden antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .7s ease-out forwards}.fu1{animation:fadeUp .7s ease-out .1s forwards;opacity:0}.fu2{animation:fadeUp .7s ease-out .2s forwards;opacity:0}.fu3{animation:fadeUp .7s ease-out .3s forwards;opacity:0}.fu4{animation:fadeUp .7s ease-out .4s forwards;opacity:0}
        .glow{text-shadow:0 0 60px rgba(0,229,160,.15)}
        .t{background:#0a0a0c;border:1px solid rgba(255,255,255,.04);border-radius:10px;overflow:hidden}
        .lift{transition:all .3s cubic-bezier(.25,.1,.25,1)}.lift:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.08)}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04) 50%,transparent)}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.007) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.007) 1px,transparent 1px);background-size:50px 50px}
      `}} />


      {/* NAV */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 '+(scrolled?'bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.04]':'')}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="PulseWave" className="h-7" />
          </div>
          <div className="hidden md:flex items-center gap-7">
            <button onClick={function(){scrollTo('how')}} className="text-[14px] text-white/55 hover:text-white/85 transition-colors">How It Works</button>
            <button onClick={function(){scrollTo('reviews')}} className="text-[14px] text-white/55 hover:text-white/85 transition-colors">Reviews</button>
            <button onClick={function(){scrollTo('pricing')}} className="text-[14px] text-white/55 hover:text-white/85 transition-colors">Pricing</button>
            <button onClick={function(){scrollTo('faq')}} className="text-[14px] text-white/55 hover:text-white/85 transition-colors">FAQ</button>
            <a href={whopUrl} className="text-[14px] px-5 py-2 bg-[#00e5a0] text-black rounded font-bold tracking-wide hover:bg-[#00cc8e] transition-colors">GET ACCESS</a>
          </div>
          <button className="md:hidden text-white/65" onClick={function(){setMenu(!menu)}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={menu?"M18 6L6 18M6 6l12 12":"M4 8h16M4 16h16"}/></svg>
          </button>
        </div>
        {menu&&<div className="md:hidden px-6 pb-4 space-y-3 border-t border-white/5 mt-1 bg-[#08080a]">
          <button onClick={function(){scrollTo('how')}} className="block text-white/55 text-[14px]">How It Works</button>
          <button onClick={function(){scrollTo('reviews')}} className="block text-white/55 text-[14px]">Reviews</button>
          <button onClick={function(){scrollTo('pricing')}} className="block text-white/55 text-[14px]">Pricing</button>
          <button onClick={function(){scrollTo('faq')}} className="block text-white/55 text-[14px]">FAQ</button>
          <a href={whopUrl} className="inline-block px-5 py-2 bg-[#00e5a0] text-black rounded font-bold text-[14px]">GET ACCESS</a>
        </div>}
      </nav>


      {/* ════════ HERO ════════ */}
      <section className="min-h-[100svh] flex flex-col items-center justify-center px-5 md:px-10 pt-16 pb-8 relative grid-bg">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-4xl mx-auto relative z-10 text-center">
          <div className="fu inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
            <span className="text-[12px] text-white/50 mono tracking-[.15em]">TRADINGVIEW INDICATOR · ANY MARKET · ANY TIMEFRAME</span>
          </div>

          <h1 className="fu1 text-[clamp(2.2rem,6.5vw,3.8rem)] font-extrabold leading-[1.06] tracking-tight mb-6">
            Support & resistance,<br/><span className="text-[#00e5a0] glow">drawn for you.</span>
          </h1>
          <p className="fu2 text-[17px] text-white/65 leading-relaxed max-w-2xl mx-auto mb-3">
            PulseWave identifies the exact zones where price reverses — automatically. Green zones. Red zones. No analysis. No guesswork. Open your chart and the levels are already there.
          </p>
          <p className="fu2 text-[14px] text-white/30 max-w-lg mx-auto mb-10 mono">
            $87 one-time · Lifetime access · 30-day money-back guarantee
          </p>

          <div className="fu3 flex flex-col sm:flex-row gap-3 justify-center mb-10 max-w-md mx-auto">
            <a href={whopUrl} className="flex-1 px-8 py-4 bg-[#00e5a0] text-black rounded-lg font-bold text-[15px] hover:bg-[#00cc8e] transition-colors text-center shadow-[0_0_30px_rgba(0,229,160,.1)]">
              Get Lifetime Access — $87
            </a>
            <button onClick={function(){scrollTo('how')}} className="flex-1 px-8 py-4 rounded-lg text-[15px] font-semibold text-white/50 border border-white/[0.06] hover:border-white/[0.12] hover:text-white/80 transition-all text-center">
              See how it works
            </button>
          </div>

          {/* VSL */}
          <div className="fu4 max-w-3xl mx-auto mb-10">
            <div className="t" style={{padding:'56.25% 0 0 0', position:'relative'}}>
              <div id="vid_698eb0e7626614ea4811f5b0" style={{position:'absolute',width:'100%',height:'100%',top:0,left:0}}>
                <img id="thumb_698eb0e7626614ea4811f5b0" src="https://images.converteai.net/e239593f-3bad-4c50-b105-6f881c40e6de/players/698eb0e7626614ea4811f5b0/thumbnail.jpg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt="Video thumbnail" />
                <div id="backdrop_698eb0e7626614ea4811f5b0" style={{WebkitBackdropFilter:'blur(5px)',backdropFilter:'blur(5px)',position:'absolute',top:0,height:'100%',width:'100%'}}></div>
              </div>
              <script src="https://scripts.converteai.net/e239593f-3bad-4c50-b105-6f881c40e6de/players/698eb0e7626614ea4811f5b0/v4/player.js" async></script>
            </div>
          </div>

          {/* Trust strip */}
          <div className="fu4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              {v:'Any Market', s:'Crypto · Forex · Futures · Stocks'},
              {v:'Zero Config', s:'Install → open chart → done'},
              {v:'30-Day', s:'Money-back guarantee'},
              {v:'Lifetime', s:'One payment, forever'},
            ].map(function(s,i) { return (
              <div key={i} className="t px-4 py-3 text-center">
                <div className="text-[14px] font-bold text-white/70 mb-0.5">{s.v}</div>
                <div className="text-[11px] text-white/30 mono">{s.s}</div>
              </div>
            )})}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ PROBLEM ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[12px] text-[#ff4d4d]/60 mono tracking-[.2em] mb-3">THE REAL PROBLEM</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">
              The trading industry profits<br className="hidden md:block"/> when you're confused.
            </h2>
            <p className="text-[14px] text-white/35 max-w-lg mx-auto mt-4 leading-relaxed">
              More confusion = more courses sold. More indicators bought. More subscriptions renewed. They don't want you to find something simple that actually works.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title:"15 indicators on your chart. Still can't pull the trigger.", desc:"You've layered RSI, MACD, Bollinger Bands, moving averages, volume profiles — and you're more confused than when you started. The chart looks like a Jackson Pollock painting and you still don't know where to enter."},
              { title:'Your support and resistance levels never seem to hold.', desc:"Drawing levels manually is subjective. You draw them one way, someone else draws them differently. And when the market moves, you're constantly erasing and redrawing. It's busywork disguised as analysis."},
              { title:'You keep making it harder, not easier.', desc:"Every new indicator, every new course, every new strategy adds another layer of complexity. Meanwhile, the traders who are actually profitable use the simplest systems. They know where price will react — and they act on it."},
            ].map(function(p,i) { return (
              <div key={i} className="border border-[#ff4d4d]/[0.04] rounded-xl p-6 md:p-7 hover:border-[#ff4d4d]/[0.08] transition-colors">
                <h3 className="text-[16px] font-bold text-white/85 mb-2 leading-snug">{p.title}</h3>
                <p className="text-[14px] text-white/40 leading-relaxed">{p.desc}</p>
              </div>
            )})}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[15px] text-white/50 leading-relaxed max-w-xl mx-auto">
              Trading doesn't have to be this hard. The best traders in the world use one thing above all else: <strong className="text-white/80">support and resistance</strong>. PulseWave finds it for you — instantly, automatically, on any chart you open.
            </p>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how" className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[12px] text-[#00e5a0]/60 mono tracking-[.2em] mb-3">HOW IT WORKS</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight mb-4">
              Three steps. No learning curve.
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[52px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#00e5a0]/10 via-[#00e5a0]/20 to-[#00e5a0]/10 z-0"></div>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {[
                {n:'01', t:'Install', sub:'60 seconds on TradingView.', d:'Works on free accounts. No paid plan required. Add the indicator to your chart — no settings to configure, no parameters to tweak. It just works.'},
                {n:'02', t:'Read the zones', sub:'Green = buy. Red = sell.', d:'PulseWave identifies the exact support and resistance levels where institutional money sits. The zones appear automatically as price develops. Clear, clean, no clutter.'},
                {n:'03', t:'Take the trade', sub:'Entry at the zone. Stop below it.', d:'No analysis paralysis. No second-guessing. Enter at the zone, stop loss below it, take profit at the next zone. The simplest system you\'ll ever use.'},
              ].map(function(s,i) { return (
                <div key={i} className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-7 hover:border-[#00e5a0]/[0.08] transition-all duration-300">
                  <div className="text-[32px] mono font-bold text-[#00e5a0]/15 mb-4 leading-none">{s.n}</div>
                  <h3 className="text-[18px] font-bold text-white/90 mb-0.5">{s.t}</h3>
                  <p className="text-[13px] text-[#00e5a0]/50 mono mb-3">{s.sub}</p>
                  <p className="text-[14px] text-white/40 leading-relaxed">{s.d}</p>
                </div>
              )})}
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ PROOF STORY ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative border border-white/[0.04] rounded-xl p-8 md:p-10 overflow-hidden" style={{background:'linear-gradient(135deg, rgba(0,229,160,0.02) 0%, transparent 60%)'}}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/15 to-transparent"></div>

            <div className="max-w-2xl">
              <div className="text-[12px] text-[#00e5a0]/40 mono tracking-[.2em] mb-6">REAL RESULT</div>

              <p className="text-[20px] md:text-[22px] text-white/75 leading-relaxed mb-6 font-medium">
                "He bought PulseWave at 2pm. By 2:15pm, he'd made his money back on NQ futures."
              </p>
              <p className="text-[15px] text-white/45 leading-relaxed mb-6">
                No settings changed. No tutorials watched. He just opened his chart and the zones were there. Two entries on the 5-minute timeframe, both hit.
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.04]"></div>
                <span className="text-[12px] mono text-white/25">Verified PulseWave User · 13-Year Veteran</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ WHAT'S INCLUDED ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[12px] text-[#00e5a0]/60 mono tracking-[.2em] mb-3">WHAT YOU GET</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">Everything included. Nothing hidden.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title:'Automatic S/R Zones', desc:'The indicator identifies and draws support and resistance levels in real-time. No manual drawing. Updates automatically as price develops.'},
              { title:'Clear Visual System', desc:'Green zones mark bullish areas. Red zones mark bearish areas. No interpretation needed. Look at the zone, take the trade.'},
              { title:'Any Market, Any Timeframe', desc:'Crypto, forex, NQ, ES, Gold, stocks — anything on TradingView. From 1-minute scalps to weekly swing trades.'},
              { title:'Zero Configuration', desc:'No settings. No parameters. No optimization. Install it, open your chart, the zones appear. That\'s it.'},
              { title:'Lifetime Updates', desc:'Every improvement, every new feature, every optimization — included forever. One payment covers everything.'},
              { title:'Discord Community', desc:'Join other PulseWave traders. Share setups, ask questions, get direct support from the creator.'},
            ].map(function(f,i) { return (
              <div key={i} className="t p-6 lift group">
                <div className="w-8 h-8 rounded-lg bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center mb-4 group-hover:bg-[#00e5a0]/[0.1] transition-colors">
                  <span className="text-[12px] mono font-bold text-[#00e5a0]/50">{String(i+1).padStart(2,'0')}</span>
                </div>
                <h3 className="text-[15px] font-bold text-white/80 mb-2">{f.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ REVIEWS ════════ */}
      <section id="reviews" className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-[12px] text-white/25 mono tracking-[.2em] mb-3">REVIEWS</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">From traders using PulseWave.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { text:'I made fast profits on NQ and Gold futures within minutes of buying it. Just loaded it to my chart and saw 2 great entries on the 5-minute timeframe. Easiest money I\'ve made.', tag:'NQ & Gold Futures'},
              { text:'This has helped me so much with my entries and exits — which were my biggest weakness. Made my money back and then some. Worth every penny.', tag:'Swing Trader'},
              { text:'Saves me a lot of time drawing support and resistance lines. Automatically keeps them up to date and the accuracy is impressive. I don\'t draw levels manually anymore.', tag:'Day Trader'},
              { text:'First of all... I LOVE IT. Well worth the price. Everyone should add this to their toolbox. The zones are clear and the indicator does all the work for you.', tag:'Crypto Trader'},
              { text:'I was drowning in complexity — 15 indicators, 3 strategies, still losing. Stripped everything off my chart except PulseWave. My win rate went up and my stress went down.', tag:'Forex Trader'},
              { text:'Just clear zones that work. No more guessing where support and resistance are. Install it, open a chart, take the trade. This is the only indicator I use now.', tag:'Futures Trader'},
            ].map(function(r,i) { return (
              <div key={i} className="t p-6 group hover:border-white/[0.06] transition-colors">
                <p className="text-[14px] text-white/55 leading-relaxed mb-4">{r.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] mono text-white/25">{r.tag}</span>
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(function(s) { return <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="#00e5a0" fillOpacity="0.5"><path d="M6 0l1.8 3.6L12 4.2 8.9 7.1l.7 4.1L6 9.3 2.4 11.2l.7-4.1L0 4.2l4.2-.6z"/></svg> })}</div>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ PRICING ════════ */}
      <section id="pricing" className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] text-[#00e5a0]/60 mono tracking-[.15em] mb-2">PRICING</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-3 leading-tight">
              One payment. Yours forever.
            </h2>
            <p className="text-[14px] text-white/40 max-w-lg mx-auto">
              No subscriptions. No upsells. No "premium tier." One price, everything included.
            </p>
          </div>

          {/* Comparison */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="text-[11px] text-white/20 mono tracking-[.2em] mb-4 text-center">WHAT TRADERS TYPICALLY PAY</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {n:'Trading Courses', v:'$500 – $5K'},
                {n:'Signal Groups', v:'$200 – $500/mo'},
                {n:'Premium Indicators', v:'$30 – $100/mo'},
                {n:'Comparable Tools', v:'$97/mo'},
              ].map(function(c,i) { return (
                <div key={i} className="bg-white/[0.015] border border-white/[0.03] rounded-lg px-4 py-3">
                  <div className="text-[13px] text-white/50">{c.n}</div>
                  <div className="text-[14px] mono font-bold text-[#ff4d4d]/60 mt-0.5">{c.v}</div>
                </div>
              )})}
            </div>
          </div>

          {/* Main price card */}
          <div className="max-w-lg mx-auto">
            <div className="relative rounded-xl overflow-hidden border border-[#00e5a0]/[0.12]" style={{background:'linear-gradient(180deg, rgba(0,229,160,0.04) 0%, #0a0a0c 50%)'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/30 to-transparent"></div>
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <div className="text-[11px] text-[#00e5a0]/50 mono tracking-[.2em] mb-5">LIFETIME ACCESS</div>
                  <div className="flex items-baseline gap-1 justify-center mb-2">
                    <span className="text-[56px] font-extrabold mono text-[#00e5a0] leading-none">$87</span>
                  </div>
                  <div className="text-[14px] text-white/30 mono">one payment · access forever</div>
                </div>

                <div className="h-px bg-white/[0.04] mb-8"></div>

                <div className="space-y-3 text-[14px] text-white/55 mb-8">
                  {[
                    'PulseWave TradingView indicator',
                    'Automatic support & resistance zones',
                    'Works on any market & timeframe',
                    'Free TradingView compatible',
                    'All future updates included',
                    'Discord community access',
                    '30-day money-back guarantee',
                  ].map(function(f,i) { return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-[#00e5a0]/[0.08] border border-[#00e5a0]/[0.15] flex items-center justify-center shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round"><path d="M1.5 4l2 2 3-3.5"/></svg>
                      </span>
                      <span>{f}</span>
                    </div>
                  )})}
                </div>

                <a href={whopUrl} className="block w-full py-4 rounded-lg bg-[#00e5a0] text-black text-[15px] font-bold text-center hover:bg-[#00cc8e] transition-colors shadow-[0_0_30px_rgba(0,229,160,.1)]">
                  Get Lifetime Access — $87
                </a>

                <p className="text-center text-[12px] text-white/25 mt-4 mono">
                  30-day money-back guarantee · No questions asked
                </p>
              </div>
            </div>
          </div>

          {/* Creator note */}
          <div className="max-w-2xl mx-auto mt-10">
            <div className="border border-white/[0.04] rounded-xl p-6 md:p-8">
              <p className="text-[15px] text-white/50 leading-relaxed mb-3">
                "I could charge $500 — other tools with half the features do. But I remember being broke and confused, and I don't want price to be the reason you stay stuck."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.04]"></div>
                <span className="text-[12px] mono text-white/25">Mason · PulseWave Creator</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ GUARANTEE ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="border border-[#00e5a0]/[0.08] rounded-xl p-8 md:p-10 text-center" style={{background:'linear-gradient(180deg, rgba(0,229,160,0.02) 0%, transparent 60%)'}}>
            <div className="w-14 h-14 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <h2 className="text-xl md:text-[28px] font-bold tracking-tight mb-4">30-Day Money-Back Guarantee</h2>
            <p className="text-[15px] text-white/50 leading-relaxed max-w-md mx-auto mb-2">
              Try it for 30 days. If you don't make your $87 back, we'll refund every penny. No questions asked. No hoops. No hassle.
            </p>
            <p className="text-[13px] text-white/25 mono">You keep the training materials either way.</p>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ FAQ ════════ */}
      <section id="faq" className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[12px] text-white/25 mono tracking-[.2em] mb-3">FAQ</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">Before you decide.</h2>
          </div>

          <div className="space-y-2">
            {[
              {q:'Do I need a paid TradingView account?', a:'No. PulseWave works on free TradingView accounts. No premium subscription required.'},
              {q:'What markets does it work on?', a:'Anything on TradingView — crypto, forex, futures (NQ, ES, Gold, CL), stocks, indices. Any timeframe from 1-minute to monthly.'},
              {q:'Is this a subscription?', a:'No. One payment of $87. Lifetime access. No recurring charges, ever. All future updates are included.'},
              {q:'How is this different from other indicators?', a:'Most indicators tell you what already happened. PulseWave shows you where price is most likely to react next by identifying institutional support and resistance zones. Green zone = buy area. Red zone = sell area. No interpretation required.'},
              {q:'What if it doesn\'t work for me?', a:'30-day money-back guarantee. Email us within 30 days for a full refund. No questions, no hoops, no hassle.'},
              {q:'Do I need to configure anything?', a:'No. Install it, open your chart, done. Zero settings. Zero parameters. It handles everything automatically.'},
              {q:'Will the price go up?', a:'Yes. When we hit 500 members, it goes to $197. Early supporters lock in $87 forever — including all future updates.'},
            ].map(function(faq,i) { return (
              <button key={i} onClick={function(){setOpenFaq(openFaq===i?null:i)}} className="w-full text-left border border-white/[0.04] rounded-xl px-6 py-5 hover:border-white/[0.06] transition-colors block">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-semibold text-white/75">{faq.q}</h3>
                  <span className={'text-white/20 text-[14px] shrink-0 mono transition-transform duration-200 '+(openFaq===i?'rotate-45':'')}>{openFaq===i?'+':'+'}</span>
                </div>
                {openFaq===i && (
                  <div className="mt-3 pt-3 border-t border-white/[0.03]">
                    <p className="text-[14px] text-white/40 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </button>
            )})}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ FINAL CTA ════════ */}
      <section className="py-20 md:py-32 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.04) 0%,transparent 60%)'}}/>
        <div className="max-w-2xl mx-auto text-center relative z-10">

          <div className="mb-8">
            <span className="text-[48px] md:text-[72px] font-extrabold mono text-[#00e5a0] glow leading-none">$87</span>
          </div>

          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
            Stop overcomplicating your charts.
          </h2>
          <p className="text-[15px] text-white/45 mb-3 max-w-md mx-auto leading-relaxed">
            Green zone. Red zone. That's it. One payment, lifetime access, 30-day guarantee. The simplest trading decision you'll make this year.
          </p>
          <p className="text-[13px] text-white/20 mb-10 mono">
            Price increases to $197 at 500 members.
          </p>

          <a href={whopUrl} className="inline-block px-12 py-4 bg-[#00e5a0] text-black rounded-lg font-bold text-[15px] hover:bg-[#00cc8e] transition-colors shadow-[0_0_40px_rgba(0,229,160,.12)]">
            Get Lifetime Access — $87
          </a>
        </div>
      </section>


      {/* DISCLAIMER */}
      <section className="py-8 px-5 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[10px] text-white/15 leading-relaxed space-y-2">
            <p>IMPORTANT DISCLAIMER: PulseWave Labs and its indicator are for educational and research purposes only. Nothing on this site constitutes financial advice, investment advice, trading advice, or any other sort of advice. You should not treat any of the content as such.</p>
            <p>Trading with leverage carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. You are solely responsible for your own investment decisions.</p>
            <p><Link href="/disclaimer" className="underline hover:text-white/25 transition-colors">Full risk disclosure and disclaimer</Link></p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><img src="/logo.webp" alt="PulseWave" className="h-4 opacity-20"/><span className="text-[11px] text-white/20">© 2026 PulseWave Labs</span></div>
          <div className="flex gap-6 text-[11px] text-white/20">
            <Link href="/" className="hover:text-white/40 transition-colors">Signals</Link>
            <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/40 transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white/40 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
