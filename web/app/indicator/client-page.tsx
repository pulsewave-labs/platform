'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function IndicatorClient() {
  var [scrolled, setScrolled] = useState(false)
  var [menu, setMenu] = useState(false)
  var [openFaq, setOpenFaq] = useState<number|null>(null)
  var [time, setTime] = useState('')

  useEffect(function() {
    var fn = function() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', fn, { passive: true })
    var tick = function() { setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC') }
    tick(); var iv = setInterval(tick, 1000)
    return function() { window.removeEventListener('scroll', fn); clearInterval(iv) }
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
            <a href={whopUrl} className="text-[14px] px-5 py-2 bg-[#00e5a0] text-black rounded font-bold tracking-wide hover:bg-[#00cc8e] transition-colors">GET ACCESS — $87</a>
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
          <a href={whopUrl} className="inline-block px-5 py-2 bg-[#00e5a0] text-black rounded font-bold text-[14px]">GET ACCESS — $87</a>
        </div>}
      </nav>


      {/* ════════ HERO ════════ */}
      <section className="min-h-[100svh] flex flex-col items-center justify-center px-5 md:px-10 pt-16 pb-8 relative grid-bg">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-4xl mx-auto relative z-10 text-center">
          <div className="fu flex items-center justify-center gap-2 mb-8">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
            <span className="text-[14px] text-white/55 mono tracking-[.15em]">TRADINGVIEW INDICATOR · WORKS ON FREE ACCOUNTS</span>
          </div>

          <h1 className="fu1 text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-[1.08] tracking-tight mb-6">
            Trading Made <span className="text-[#00e5a0] glow">Stupidly Simple</span>
          </h1>
          <p className="fu2 text-[17px] text-white/75 leading-relaxed max-w-2xl mx-auto mb-4">
            PulseWave automatically draws the exact support and resistance levels on your chart. Green zones = buy. Red zones = sell. No analysis. No guesswork. Results from day one.
          </p>
          <p className="fu2 text-[14px] text-white/40 max-w-lg mx-auto mb-10">
            One payment. $87. Lifetime access. 30-day money-back guarantee.
          </p>

          <div className="fu3 flex flex-col sm:flex-row gap-3 justify-center mb-10 max-w-md mx-auto">
            <a href={whopUrl} className="flex-1 px-8 py-4 bg-[#00e5a0] text-black rounded-lg font-bold text-[14px] hover:bg-[#00cc8e] transition-colors text-center shadow-[0_0_30px_rgba(0,229,160,.1)]">
              Get Lifetime Access — $87
            </a>
          </div>

          {/* VSL Embed */}
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
          <div className="fu4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] md:text-[14px] text-white/55">
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>Works on any market</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>No settings to configure</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>30-day money-back guarantee</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>Lifetime access</span>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ PROBLEM AGITATION ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[12px] text-[#ff4d4d]/75 mono tracking-[.2em] mb-3">SOUND FAMILIAR?</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">
              The trading industry profits when<br className="hidden md:block"/> you're confused.
            </h2>
          </div>

          <div className="space-y-3 mb-12">
            {[
              { title:"You've stacked 15 indicators on your chart and still can't pull the trigger.", desc:"More confusion = more courses sold. More indicators bought. More subscriptions renewed. The industry doesn't want you to find something simple that works."},
              { title:'You know support and resistance matter — but yours never seem to hold.', desc:"Drawing levels manually is subjective. Everyone draws them differently. And when the market moves, you're constantly redrawing. PulseWave removes the guesswork entirely."},
              { title:'You keep overcomplicating it, not easier.', desc:"You tried every indicator, every system, every guru. You were drowning in complexity — and still losing. Trading doesn't have to be this hard."},
            ].map(function(p,i) { return (
              <div key={i} className="border border-[#ff4d4d]/[0.04] rounded-xl p-6 md:p-7 hover:border-[#ff4d4d]/[0.08] transition-colors">
                <h3 className="text-[16px] font-bold text-white/85 mb-2 leading-snug">{p.title}</h3>
                <p className="text-[14px] text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how" className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[12px] text-[#00e5a0]/60 mono tracking-[.2em] mb-3">3 STEPS</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight mb-4">
              Install it. Open your chart.<br className="hidden md:block"/> The zones are already there.
            </h2>
            <p className="text-[14px] text-white/45 max-w-xl mx-auto leading-relaxed">
              No learning curve. No complex setup. No guesswork.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[52px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#00e5a0]/10 via-[#00e5a0]/20 to-[#00e5a0]/10 z-0"></div>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {[
                {n:'1', t:'Install on TradingView', sub:'Takes 60 seconds.', d:'Works on free TradingView accounts. No settings to configure. Just add it to your chart and you\'re done.'},
                {n:'2', t:'Read the zones', sub:'Green = bullish. Red = bearish.', d:'PulseWave automatically identifies the exact support and resistance levels where price is most likely to react. Clear zones that work 99% of the time.'},
                {n:'3', t:'Place your trade', sub:'Entry at the zone. Stop below it. Done.', d:'No analysis paralysis. No guessing. Enter at the zone, set your stop, take your profit. The simplest trading system you\'ll ever use.'},
              ].map(function(s,i) { return (
                <div key={i} className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-7 hover:border-[#00e5a0]/[0.08] transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#00e5a0]/[0.08] to-transparent border border-[#00e5a0]/[0.12] flex items-center justify-center mb-5">
                    <span className="text-[14px] mono font-bold text-[#00e5a0]/60">{s.n}</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-white/90 mb-0.5">{s.t}</h3>
                  <p className="text-[14px] text-[#00e5a0]/60 mono mb-3">{s.sub}</p>
                  <p className="text-[14px] text-white/45 leading-relaxed">{s.d}</p>
                </div>
              )})}
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ SOCIAL PROOF STORY ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/20 to-transparent"></div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/20 flex items-center justify-center">
                <span className="text-[#00e5a0] text-[14px] font-bold">★</span>
              </div>
              <div>
                <div className="text-[14px] font-medium text-white/80">Real result</div>
                <div className="text-[12px] mono text-white/30">From a PulseWave user</div>
              </div>
            </div>

            <p className="text-[17px] text-white/70 leading-relaxed mb-4 italic">
              "He bought PulseWave at 2pm. By 2:15pm, he'd made his money back on NQ futures. No settings changed. No tutorials watched. He just opened his chart and the zones were there."
            </p>
            <p className="text-[13px] text-white/30 mono">— Verified PulseWave User · 13-Year Veteran</p>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ REVIEWS ════════ */}
      <section id="reviews" className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-[12px] text-[#00e5a0]/60 mono tracking-[.2em] mb-3">FROM TRADERS</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">What users are saying.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name:'NQ Futures Trader', text:'I made fast profits on NQ and Gold futures within minutes of buying it! Just loaded it to my chart and saw 2 great entries in 5-minute timeframe and bam! ez money!'},
              { name:'Full-Time Trader', text:'Love this indicator! It has helped me so much with my entries and exits, which were my biggest weakness when trading. Made my money back and then some!'},
              { name:'Swing Trader', text:'Saves me a lot of time drawing support and resist lines and automatically keeps them up to date and seems accurate.'},
              { name:'Day Trader', text:'First of all... I LOVE IT! Well worth the price. Everyone should add this to their toolbox.'},
              { name:'Crypto Trader', text:'I just loaded it to my chart and saw 2 great entries in 5-minute timeframe and bam! ez money! The zones are clear and the indicator does all the work for you.'},
              { name:'Forex Trader', text:'Just clear zones that work 99% of the time. No more guessing where support and resistance are. This is the only indicator I use now.'},
            ].map(function(r,i) { return (
              <div key={i} className="t p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(function(s) { return <span key={s} className="text-[#00e5a0] text-[12px]">★</span> })}</div>
                </div>
                <p className="text-[13px] text-white/55 leading-relaxed mb-3">"{r.text}"</p>
                <div className="text-[12px] mono text-white/30">{r.name}</div>
              </div>
            )})}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ WHAT YOU GET ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[12px] text-[#00e5a0]/60 mono tracking-[.2em] mb-3">INCLUDED</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">Everything you need. Nothing you don't.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon:'📊', title:'Automatic S/R Zones', desc:'The indicator draws exact support and resistance levels automatically. No manual drawing. Updates in real-time as price moves.'},
              { icon:'🟢', title:'Clear Buy/Sell Zones', desc:'Green zones = bullish (buy). Red zones = bearish (sell). That\'s the entire system. No 47-page manual required.'},
              { icon:'⚡', title:'Works on Any Market', desc:'Crypto, forex, futures, stocks — any market, any timeframe. From 1-minute scalping to daily swing trades.'},
              { icon:'🔧', title:'Zero Configuration', desc:'Install on TradingView. Open your chart. Done. No settings to tweak, no parameters to optimize, no backtesting required.'},
              { icon:'🔄', title:'Lifetime Updates', desc:'Every update, every improvement, every new feature — included forever. One payment, lifetime access.'},
              { icon:'💬', title:'Discord Community', desc:'Access to the PulseWave Discord with other traders. Share ideas, ask questions, get support.'},
            ].map(function(f,i) { return (
              <div key={i} className="t p-6 lift">
                <div className="flex items-start gap-4">
                  <span className="text-[24px] shrink-0">{f.icon}</span>
                  <div>
                    <h3 className="text-[15px] font-bold text-white/80 mb-1">{f.title}</h3>
                    <p className="text-[13px] text-white/45 leading-relaxed">{f.desc}</p>
                  </div>
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
            <p className="text-[12px] text-[#00e5a0]/60 mono tracking-[.15em] mb-2">ONE PAYMENT</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-3 leading-tight">
              $87. Once. Forever.
            </h2>
            <p className="text-[14px] text-white/45 max-w-lg mx-auto">
              No subscriptions. No hidden fees. No upsells. One payment gets you lifetime access to PulseWave, every update, and the Discord community.
            </p>
          </div>

          {/* Price comparison */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-[12px] text-white/30 mono tracking-[.2em] mb-5 text-center">WHAT TRADERS TYPICALLY SPEND</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {n:'Trading Courses', v:'$500 – $5,000', s:'One-time. No tools included. You still need indicators.'},
                {n:'Premium Indicators', v:'$30 – $100/mo', s:'Monthly subscriptions that drain your account forever.'},
                {n:'Signal Groups', v:'$200 – $500/mo', s:'Unverified. Cherry-picked screenshots. No transparency.'},
                {n:'Comparable Communities', v:'$97/mo', s:'Monthly recurring fees for tools half as useful.'},
              ].map(function(c,i) { return (
                <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 relative overflow-hidden hover:border-white/[0.06] transition-colors">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff4d4d]/[0.02] rounded-bl-full"></div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[14px] text-white/70 font-medium">{c.n}</span>
                    <span className="text-[14px] mono font-bold text-[#ff4d4d]/75 text-right leading-none">{c.v}</span>
                  </div>
                  <p className="text-[13px] text-white/35 leading-relaxed">{c.s}</p>
                </div>
              )})}
            </div>
          </div>

          {/* Price card */}
          <div className="max-w-lg mx-auto">
            <div className="t-visible relative border border-[#00e5a0]/[0.12] rounded-xl overflow-hidden" style={{background:'linear-gradient(180deg, rgba(0,229,160,0.03) 0%, #0a0a0c 40%)'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/30 to-transparent"></div>
              <div className="p-8 text-center">
                <div className="text-[12px] text-[#00e5a0]/60 mono tracking-wider mb-4">LIFETIME ACCESS</div>
                <div className="flex items-baseline gap-1 justify-center mb-2">
                  <span className="text-[48px] font-bold mono text-[#00e5a0]">$87</span>
                </div>
                <div className="text-[14px] text-white/40 mb-8">One payment. Access forever. No recurring charges.</div>

                <div className="space-y-2.5 text-[14px] text-white/55 mb-8 text-left max-w-xs mx-auto">
                  {[
                    'PulseWave TradingView indicator',
                    'Automatic support & resistance zones',
                    'Works on any market, any timeframe',
                    'Lifetime updates & improvements',
                    'Discord community access',
                    '30-day money-back guarantee',
                  ].map(function(f,i) { return (
                    <div key={i} className="flex items-center gap-2.5"><span className="text-[#00e5a0]/60 mono text-[16px]">→</span>{f}</div>
                  )})}
                </div>

                <a href={whopUrl} className="block w-full py-4 rounded-lg bg-[#00e5a0] text-black text-[16px] font-bold text-center hover:bg-[#00cc8e] transition-colors mono tracking-wide shadow-[0_0_30px_rgba(0,229,160,.12)]">
                  GET LIFETIME ACCESS — $87
                </a>

                <div className="mt-4 text-[13px] text-white/30">
                  30-day money-back guarantee — no questions asked
                </div>
              </div>
            </div>
          </div>

          {/* Creator quote */}
          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 md:p-8">
              <p className="text-[14px] text-white/55 leading-relaxed italic mb-3">
                "I could charge $500 — other tools with half the features do. But I remember being broke and confused, and I don't want price to be the reason you stay stuck."
              </p>
              <p className="text-[13px] text-[#00e5a0]/50 mono">— Mason, Creator of PulseWave</p>
              <p className="text-[11px] text-white/20 mono mt-1">(The Guy Who Actually Responds in Discord)</p>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ GUARANTEE ════════ */}
      <section className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] mb-6">
            <span className="text-[28px]">🛡️</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4">30-Day Money-Back Guarantee</h2>
          <p className="text-[15px] text-white/55 leading-relaxed max-w-xl mx-auto mb-2">
            Try it for 30 days. If you don't make your $87 back, we'll refund every penny. You keep the training.
          </p>
          <p className="text-[14px] text-white/30">No questions asked. No hoops. No hassle.</p>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ FAQ ════════ */}
      <section id="faq" className="py-14 md:py-24 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[12px] text-white/25 mono tracking-[.2em] mb-3">QUESTIONS</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">Before you decide.</h2>
          </div>

          <div className="space-y-3">
            {[
              {q:'Do I need a paid TradingView account?', a:'No. PulseWave works on free TradingView accounts. No premium subscription required.'},
              {q:'What markets does it work on?', a:'Any market available on TradingView — crypto, forex, futures (NQ, ES, Gold), stocks, indices. Any timeframe from 1-minute to monthly.'},
              {q:'Is this a one-time payment or subscription?', a:'One-time payment. $87. Lifetime access. No recurring charges. Ever. You also get every future update for free.'},
              {q:'How is this different from other indicators?', a:'Most indicators tell you what already happened. PulseWave shows you where price is going next by identifying the exact support and resistance zones where institutional money sits. Green zones = buy, red zones = sell. That simple.'},
              {q:'What if it doesn\'t work for me?', a:'30-day money-back guarantee. No questions asked. If you don\'t make your $87 back within 30 days, email us and we\'ll refund every penny.'},
              {q:'Do I need to configure anything?', a:'No. Install it, open your chart, done. Zero settings. Zero parameters. The indicator handles everything automatically.'},
              {q:'This price won\'t last — what does that mean?', a:'When we hit 500 members, the price goes to $197. Early supporters get in at $87 and keep that price forever including all future updates.'},
            ].map(function(faq,i) { return (
              <button key={i} onClick={function(){setOpenFaq(openFaq===i?null:i)}} className="w-full text-left border border-white/[0.04] rounded-xl p-6 hover:border-white/[0.06] transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-bold text-white/80">{faq.q}</h3>
                  <span className="text-white/30 text-[18px] shrink-0 mono">{openFaq===i?'−':'+'}</span>
                </div>
                {openFaq===i && <p className="text-[14px] text-white/40 leading-relaxed mt-3">{faq.a}</p>}
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
          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
            Stop overcomplicating it.
          </h2>
          <p className="text-[15px] text-white/50 mb-3 max-w-md mx-auto leading-relaxed">
            Green zone = buy. Red zone = sell. One payment. Lifetime access. Results from day one.
          </p>
          <p className="text-[14px] text-white/30 mb-10 max-w-sm mx-auto">
            This price won't last. When we hit 500 members, it goes to $197.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-4">
            <a href={whopUrl} className="flex-1 py-4 bg-[#00e5a0] text-black rounded-lg font-bold text-[15px] hover:bg-[#00cc8e] transition-colors text-center shadow-[0_0_40px_rgba(0,229,160,.12)]">
              Get Lifetime Access — $87
            </a>
          </div>
          <div className="text-[13px] text-white/25 mono">30-day money-back guarantee</div>
        </div>
      </section>


      {/* DISCLAIMER */}
      <section className="py-8 px-5 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[10px] text-white/20 leading-relaxed space-y-2">
            <p>IMPORTANT DISCLAIMER: PulseWave Labs and its indicator are for educational and research purposes only. Nothing on this site constitutes financial advice, investment advice, trading advice, or any other sort of advice. You should not treat any of the content as such.</p>
            <p>Trading with leverage carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. You are solely responsible for your own investment decisions.</p>
            <p><Link href="/disclaimer" className="underline hover:text-white/30 transition-colors">Full risk disclosure and disclaimer</Link></p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><img src="/logo.webp" alt="PulseWave" className="h-4 opacity-20"/><span className="text-[11px] text-white/25">© 2026 PulseWave Labs</span></div>
          <div className="flex gap-6 text-[11px] text-white/25">
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
