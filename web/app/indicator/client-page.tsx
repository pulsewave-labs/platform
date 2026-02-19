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
    }, { threshold: 0.15 })
    obs.observe(ref.current)
    return function() { obs.disconnect() }
  }, [])
  return { ref, visible }
}

export default function IndicatorClient() {
  var [scrolled, setScrolled] = useState(false)
  var [menu, setMenu] = useState(false)
  var [openFaq, setOpenFaq] = useState<number|null>(null)
  var [memberCount] = useState(347)

  useEffect(function() {
    var fn = function() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', fn, { passive: true })
    return function() { window.removeEventListener('scroll', fn) }
  }, [])

  var scrollTo = function(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenu(false) }
  var whopUrl = 'https://whop.com/checkout/plan_LFA5ev192mjHb'

  var s1 = useInView(), s2 = useInView(), s3 = useInView(), s4 = useInView(), s5 = useInView(), s6 = useInView(), s7 = useInView(), s8 = useInView()

  return (
    <div className="min-h-screen bg-[#06060a] text-[#c8c8c8] overflow-x-hidden antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#06060a}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .fu{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) forwards}.fu1{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .1s forwards;opacity:0}.fu2{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .2s forwards;opacity:0}.fu3{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .3s forwards;opacity:0}.fu4{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .4s forwards;opacity:0}.fu5{animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .5s forwards;opacity:0}
        .reveal{opacity:0;transform:translateY(24px);transition:all .7s cubic-bezier(.16,1,.3,1)}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .glow{text-shadow:0 0 80px rgba(0,229,160,.12)}
        .card{background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.04);border-radius:12px}
        .card:hover{border-color:rgba(255,255,255,.08)}
        .lift{transition:all .35s cubic-bezier(.25,.1,.25,1)}.lift:hover{transform:translateY(-3px)}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04) 50%,transparent)}
        .grid-bg{background-image:radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px);background-size:24px 24px}
        ::selection{background:rgba(0,229,160,.15);color:#fff}
      `}} />


      {/* NAV */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-500 '+(scrolled?'bg-[#06060a]/85 backdrop-blur-2xl border-b border-white/[0.04]':'')}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <img src="/logo.webp" alt="PulseWave" className="h-6" />
          <div className="hidden md:flex items-center gap-8">
            <button onClick={function(){scrollTo('how')}} className="text-[13px] text-white/40 hover:text-white/75 transition-colors">How It Works</button>
            <button onClick={function(){scrollTo('reviews')}} className="text-[13px] text-white/40 hover:text-white/75 transition-colors">Reviews</button>
            <button onClick={function(){scrollTo('pricing')}} className="text-[13px] text-white/40 hover:text-white/75 transition-colors">Pricing</button>
            <a href={whopUrl} className="text-[13px] px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/80 rounded-lg font-medium transition-colors border border-white/[0.06]">Get Access</a>
          </div>
          <button className="md:hidden text-white/50" onClick={function(){setMenu(!menu)}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={menu?"M18 6L6 18M6 6l12 12":"M4 8h16M4 16h16"}/></svg>
          </button>
        </div>
        {menu&&<div className="md:hidden px-6 pb-5 space-y-4 border-t border-white/[0.03] mt-1 bg-[#06060a]">
          <button onClick={function(){scrollTo('how')}} className="block text-white/50 text-[14px]">How It Works</button>
          <button onClick={function(){scrollTo('reviews')}} className="block text-white/50 text-[14px]">Reviews</button>
          <button onClick={function(){scrollTo('pricing')}} className="block text-white/50 text-[14px]">Pricing</button>
          <a href={whopUrl} className="inline-block px-5 py-2.5 bg-[#00e5a0] text-black rounded-lg font-bold text-[14px]">Get Access — $87</a>
        </div>}
      </nav>


      {/* ════════ HERO ════════ */}
      <section className="min-h-[100svh] flex flex-col items-center justify-center px-5 md:px-10 pt-20 pb-10 relative">
        <div className="absolute inset-0 grid-bg opacity-40"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.04) 0%,transparent 70%)'}}/>

        <div className="w-full max-w-3xl mx-auto relative z-10 text-center">
          <div className="fu inline-flex items-center gap-2.5 mb-10 px-4 py-2 rounded-full border border-white/[0.05] bg-white/[0.02]">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-60"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
            <span className="text-[11px] text-white/40 mono tracking-[.18em]">{memberCount} TRADERS USING PULSEWAVE</span>
          </div>

          <h1 className="fu1 text-[clamp(2.4rem,7vw,4.2rem)] font-extrabold leading-[1.04] tracking-[-0.02em] mb-6 text-white">
            Your chart already has<br/>the answer. <span className="text-[#00e5a0] glow">See it.</span>
          </h1>

          <p className="fu2 text-[17px] md:text-[18px] text-white/50 leading-[1.7] max-w-xl mx-auto mb-4">
            PulseWave draws institutional support and resistance on your chart — automatically. No drawing. No guessing. Just zones where price actually reacts.
          </p>

          <p className="fu3 text-[13px] text-white/25 mono mb-10">
            $87 once · lifetime access · 30-day guarantee
          </p>

          <div className="fu3 flex flex-col sm:flex-row gap-3 justify-center mb-12 max-w-sm mx-auto">
            <a href={whopUrl} className="flex-1 px-8 py-4 bg-[#00e5a0] text-[#06060a] rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all text-center shadow-[0_0_40px_rgba(0,229,160,.08),0_2px_8px_rgba(0,229,160,.15)]">
              Get Lifetime Access — $87
            </a>
          </div>

          {/* VSL */}
          <div className="fu4 max-w-2xl mx-auto mb-12">
            <div className="card p-1" style={{borderRadius:16}}>
              <div style={{padding:'56.25% 0 0 0', position:'relative', borderRadius:12, overflow:'hidden'}}>
                <div id="vid_698eb0e7626614ea4811f5b0" style={{position:'absolute',width:'100%',height:'100%',top:0,left:0}}>
                  <img id="thumb_698eb0e7626614ea4811f5b0" src="https://images.converteai.net/e239593f-3bad-4c50-b105-6f881c40e6de/players/698eb0e7626614ea4811f5b0/thumbnail.jpg" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt="Watch how PulseWave works" />
                  <div id="backdrop_698eb0e7626614ea4811f5b0" style={{WebkitBackdropFilter:'blur(5px)',backdropFilter:'blur(5px)',position:'absolute',top:0,height:'100%',width:'100%'}}></div>
                </div>
                <script src="https://scripts.converteai.net/e239593f-3bad-4c50-b105-6f881c40e6de/players/698eb0e7626614ea4811f5b0/v4/player.js" async></script>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="fu5 flex items-center justify-center gap-8 md:gap-14 text-center">
            {[
              {v:'Any market', s:'Crypto · Forex · Futures'},
              {v:'Zero config', s:'Install and trade'},
              {v:'$87 once', s:'No subscriptions'},
            ].map(function(s,i) { return (
              <div key={i} className={i > 0 ? 'hidden sm:block' : ''}>
                <div className="text-[14px] font-semibold text-white/60">{s.v}</div>
                <div className="text-[11px] text-white/25 mono mt-0.5">{s.s}</div>
              </div>
            )})}
          </div>
        </div>
      </section>


      {/* ════════ BEFORE / AFTER ════════ */}
      <div ref={s1.ref} className={'reveal '+(s1.visible?'visible':'')}>
      <section className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-white/20 mono tracking-[.25em] mb-4">THE DIFFERENCE</div>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight leading-tight">
              Before PulseWave vs. after.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Before */}
            <div className="card p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff4d4d]/15 to-transparent"></div>
              <div className="text-[11px] mono text-[#ff4d4d]/50 tracking-[.2em] mb-6">WITHOUT PULSEWAVE</div>
              <div className="space-y-4">
                {[
                  '15 indicators. Still can\'t find an entry.',
                  'Drawing levels that break every time.',
                  'Second-guessing every trade for 45 minutes.',
                  'Watching charts for hours, taking nothing.',
                  'Buying courses that teach more confusion.',
                ].map(function(t,i) { return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#ff4d4d]/[0.06] border border-[#ff4d4d]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#ff4d4d" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2l4 4M6 2l-4 4"/></svg>
                    </span>
                    <span className="text-[14px] text-white/40 leading-relaxed">{t}</span>
                  </div>
                )})}
              </div>
            </div>

            {/* After */}
            <div className="card p-7 relative overflow-hidden" style={{background:'rgba(0,229,160,0.015)'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/15 to-transparent"></div>
              <div className="text-[11px] mono text-[#00e5a0]/50 tracking-[.2em] mb-6">WITH PULSEWAVE</div>
              <div className="space-y-4">
                {[
                  'Open chart. Zones are already there.',
                  'Green zone = buy area. Red zone = sell area.',
                  'Enter at zone, stop below it, done.',
                  'Average trade setup takes 30 seconds.',
                  'One indicator. Replaces everything else.',
                ].map(function(t,i) { return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#00e5a0" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round"><path d="M1.5 4l2 2 3-3.5"/></svg>
                    </span>
                    <span className="text-[14px] text-white/55 leading-relaxed">{t}</span>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ HOW IT WORKS ════════ */}
      <div ref={s2.ref} className={'reveal '+(s2.visible?'visible':'')}>
      <section id="how" className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.25em] mb-4">HOW IT WORKS</div>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight leading-tight">
              Three steps. Sixty seconds.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {n:'01', t:'Install', d:'Add PulseWave to any TradingView chart. Free accounts work. No settings, no configuration, no tutorials needed.'},
              {n:'02', t:'Read', d:'Green zones mark where buyers are. Red zones mark where sellers are. The indicator finds institutional levels automatically as price develops.'},
              {n:'03', t:'Trade', d:'Enter at the zone. Stop loss on the other side. Take profit at the next zone. Same process, every single time.'},
            ].map(function(s,i) { return (
              <div key={i} className="card p-7 lift group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#00e5a0]/0 via-[#00e5a0]/0 to-transparent group-hover:from-[#00e5a0]/10 group-hover:via-[#00e5a0]/5 transition-all duration-500"></div>
                <div className="text-[40px] mono font-bold text-white/[0.04] leading-none mb-5 group-hover:text-[#00e5a0]/[0.08] transition-colors duration-500">{s.n}</div>
                <h3 className="text-[20px] font-bold text-white/85 mb-3">{s.t}</h3>
                <p className="text-[14px] text-white/35 leading-[1.7]">{s.d}</p>
              </div>
            )})}
          </div>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ SPEED PROOF ════════ */}
      <div ref={s3.ref} className={'reveal '+(s3.visible?'visible':'')}>
      <section className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative card p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 70%)'}}/>

            <div className="relative z-10 max-w-2xl">
              <p className="text-[22px] md:text-[26px] text-white/80 leading-[1.5] font-medium mb-8">
                "Bought it at 2pm. By 2:15, I'd made my money back on NQ futures."
              </p>
              <p className="text-[15px] text-white/35 leading-[1.7] mb-8">
                No settings changed. No tutorial watched. Opened the chart, two entries appeared on the 5-minute, both hit. Fifteen minutes from purchase to profit.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <span className="text-[14px] mono font-bold text-white/30">13Y</span>
                </div>
                <div>
                  <div className="text-[13px] text-white/50 font-medium">Verified User</div>
                  <div className="text-[11px] text-white/20 mono">13-year trading veteran</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ WHAT'S INCLUDED ════════ */}
      <div ref={s4.ref} className={'reveal '+(s4.visible?'visible':'')}>
      <section className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-white/20 mono tracking-[.25em] mb-4">INCLUDED</div>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight leading-tight">
              One purchase. Everything included.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title:'Automatic S/R detection', desc:'Institutional support and resistance levels, identified and drawn in real-time. Updates as price develops. No manual work.'},
              { title:'Green / Red zone system', desc:'Green = buyers are here. Red = sellers are here. One glance tells you the entire trade setup. Nothing to interpret.'},
              { title:'Every market, every timeframe', desc:'Crypto, forex, NQ, ES, Gold, crude, stocks — anything on TradingView. Scalp the 1-minute or swing the daily. Same system.'},
              { title:'Zero-config installation', desc:'No settings page. No parameter optimization. No "watch our 2-hour setup video." Install → open chart → trade.'},
              { title:'Lifetime updates', desc:'Every algorithm improvement, every new feature, every optimization. Included forever. We\'re building this for the long haul.'},
              { title:'Private Discord', desc:'Community of {memberCount}+ traders using PulseWave. Share setups, learn from others, get direct help from the creator.'.replace('{memberCount}', String(memberCount))},
            ].map(function(f,i) { return (
              <div key={i} className="card px-6 py-5 lift group flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#00e5a0]/[0.08] group-hover:border-[#00e5a0]/[0.15] transition-all duration-300">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#00e5a0" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"><path d="M2 6l3 3 5-5.5"/></svg>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-white/70 mb-1">{f.title}</h3>
                  <p className="text-[13px] text-white/30 leading-[1.6]">{f.desc}</p>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ REVIEWS ════════ */}
      <div ref={s5.ref} className={'reveal '+(s5.visible?'visible':'')}>
      <section id="reviews" className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-white/20 mono tracking-[.25em] mb-4">REVIEWS</div>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight leading-tight">From traders using it daily.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { text:'Made fast profits on NQ and Gold within minutes. Loaded it, saw 2 entries on the 5-min, both hit. Easiest money I\'ve made this year.', who:'Futures trader', time:'Within 15 min of purchase'},
              { text:'This fixed my entries and exits — my biggest weakness. Made my money back on the first day. Worth 10x what I paid.', who:'Swing trader', time:'Subscriber for 4 months'},
              { text:'I stripped every indicator off my chart except PulseWave. Win rate went up, screen time went down. It just works.', who:'Forex trader', time:'Subscriber for 6 months'},
              { text:'Saves me hours drawing S/R. Automatically keeps levels current and the accuracy is honestly scary. I don\'t draw manually anymore.', who:'Day trader', time:'Subscriber for 3 months'},
              { text:'I was drowning in complexity. 15 indicators, 3 strategies, still losing. PulseWave is the only thing on my chart now. Profitable 4 months straight.', who:'Crypto trader', time:'Subscriber for 5 months'},
              { text:'Everyone should add this to their toolbox. The zones are clear, the indicator does all the work. I just execute.', who:'Full-time trader', time:'Subscriber for 7 months'},
            ].map(function(r,i) { return (
              <div key={i} className="card p-5 lift">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(function(s) { return <svg key={s} width="11" height="11" viewBox="0 0 12 12" fill="#00e5a0" fillOpacity="0.4"><path d="M6 0l1.8 3.6L12 4.2 8.9 7.1l.7 4.1L6 9.3 2.4 11.2l.7-4.1L0 4.2l4.2-.6z"/></svg> })}
                </div>
                <p className="text-[13px] text-white/45 leading-[1.65] mb-4">{r.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] mono text-white/20">{r.who}</span>
                  <span className="text-[10px] mono text-white/15">{r.time}</span>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ PRICING ════════ */}
      <div ref={s6.ref} className={'reveal '+(s6.visible?'visible':'')}>
      <section id="pricing" className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.25em] mb-4">PRICING</div>
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight mb-3 leading-tight">
              One payment. Yours forever.
            </h2>
            <p className="text-[14px] text-white/30 max-w-md mx-auto leading-relaxed">
              While other tools charge monthly, PulseWave is one price for life. No recurring fees. No "premium tiers." No surprise charges.
            </p>
          </div>

          {/* Comparison strip */}
          <div className="flex items-center justify-center gap-3 md:gap-6 mb-10 flex-wrap">
            {[
              {n:'Courses', v:'$500–5K'},
              {n:'Signals', v:'$200/mo'},
              {n:'Indicators', v:'$50/mo'},
              {n:'Communities', v:'$97/mo'},
            ].map(function(c,i) { return (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-white/25">{c.n}</span>
                <span className="mono text-[#ff4d4d]/40 line-through">{c.v}</span>
              </div>
            )})}
          </div>

          {/* Price card */}
          <div className="max-w-md mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-[#00e5a0]/[0.1]" style={{background:'linear-gradient(180deg, rgba(0,229,160,0.03) 0%, rgba(6,6,10,1) 60%)'}}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/25 to-transparent"></div>
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.25em] mb-6">LIFETIME ACCESS</div>
                  <div className="mb-2">
                    <span className="text-[64px] font-extrabold mono text-white leading-none tracking-tight">$87</span>
                  </div>
                  <div className="text-[13px] text-white/20 mono">one payment · forever</div>
                </div>

                <div className="h-px bg-white/[0.04] mb-7"></div>

                <div className="space-y-3 mb-8">
                  {[
                    'PulseWave TradingView indicator',
                    'Automatic support & resistance zones',
                    'Works on any market & timeframe',
                    'Compatible with free TradingView',
                    'All future updates included',
                    'Private Discord community',
                    '30-day money-back guarantee',
                  ].map(function(f,i) { return (
                    <div key={i} className="flex items-center gap-3 text-[14px] text-white/45">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0"><circle cx="7" cy="7" r="6.5" stroke="#00e5a0" strokeOpacity="0.15"/><path d="M4 7l2.5 2.5L10 5" stroke="#00e5a0" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>{f}</span>
                    </div>
                  )})}
                </div>

                <a href={whopUrl} className="block w-full py-4 rounded-xl bg-[#00e5a0] text-[#06060a] text-[15px] font-bold text-center hover:bg-[#00d492] transition-all shadow-[0_0_30px_rgba(0,229,160,.08),0_2px_8px_rgba(0,229,160,.15)]">
                  Get Lifetime Access — $87
                </a>

                <p className="text-center text-[11px] text-white/15 mt-5 mono leading-relaxed">
                  30-day money-back guarantee · No questions asked<br/>
                  Price increases to $197 at 500 members ({500 - memberCount} spots left)
                </p>
              </div>
            </div>
          </div>

          {/* Creator */}
          <div className="max-w-lg mx-auto mt-10 text-center">
            <p className="text-[14px] text-white/30 leading-[1.7] italic">
              "I could charge $500. Other tools with half the features do. But I remember being broke and confused, and I don't want price to be the reason you stay stuck."
            </p>
            <p className="text-[12px] mono text-white/15 mt-3">— Mason, creator of PulseWave</p>
          </div>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ GUARANTEE ════════ */}
      <div ref={s7.ref} className={'reveal '+(s7.visible?'visible':'')}>
      <section className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08] flex items-center justify-center mx-auto mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <h2 className="text-xl md:text-[26px] font-bold tracking-tight mb-4">Risk-free for 30 days.</h2>
          <p className="text-[15px] text-white/35 leading-[1.7] max-w-md mx-auto">
            If PulseWave doesn't pay for itself within 30 days, email us for a full refund. No forms. No calls. No guilt trip. We'll just send the money back.
          </p>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ FAQ ════════ */}
      <div ref={s8.ref} className={'reveal '+(s8.visible?'visible':'')}>
      <section id="faq" className="py-16 md:py-28 px-5 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-[34px] font-bold tracking-tight leading-tight">Common questions.</h2>
          </div>

          <div className="space-y-2">
            {[
              {q:'Do I need a paid TradingView account?', a:'No. Works on free TradingView. No premium plan required.'},
              {q:'What markets does it work on?', a:'Everything on TradingView. Crypto, forex, NQ, ES, Gold, crude oil, stocks, indices. Any timeframe from 1-minute to monthly.'},
              {q:'Is this a subscription?', a:'No. $87 once. Lifetime access. All future updates included. No recurring charges, ever.'},
              {q:'How is this different from other indicators?', a:'Most indicators react to what already happened. PulseWave identifies where price will react next — the institutional S/R zones where real money sits. Green zone = buy area. Red zone = sell area. No interpretation needed.'},
              {q:'What if it doesn\'t work for me?', a:'Full refund within 30 days. Email us, money back. No questions, no forms, no hassle.'},
              {q:'Do I need to configure anything?', a:'No. Zero settings. Install it, open your chart, zones appear. That\'s it.'},
              {q:'Will the price increase?', a:'Yes. At 500 members it goes to $197. Currently at '+memberCount+' — '+String(500-memberCount)+' spots left at $87.'},
            ].map(function(faq,i) { return (
              <button key={i} onClick={function(){setOpenFaq(openFaq===i?null:i)}} className="w-full text-left card px-6 py-5 block transition-all duration-200" style={openFaq===i?{borderColor:'rgba(255,255,255,.06)'}:{}}>
                <div className="flex items-center justify-between gap-6">
                  <h3 className="text-[14px] font-semibold text-white/65">{faq.q}</h3>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={'shrink-0 text-white/20 transition-transform duration-200 '+(openFaq===i?'rotate-45':'')}><path d="M7 3v8M3 7h8"/></svg>
                </div>
                {openFaq===i && (
                  <p className="text-[13px] text-white/30 leading-[1.7] mt-3 pr-8">{faq.a}</p>
                )}
              </button>
            )})}
          </div>
        </div>
      </section>
      </div>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ FINAL CTA ════════ */}
      <section className="py-24 md:py-36 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>
        <div className="max-w-lg mx-auto text-center relative z-10">

          <h2 className="text-2xl md:text-[30px] font-bold tracking-tight mb-4 leading-tight">
            Your chart already knows where price will go.
          </h2>
          <p className="text-[15px] text-white/35 mb-10 leading-[1.7]">
            PulseWave shows you. One payment. Lifetime access. Money back if it doesn't work.
          </p>

          <a href={whopUrl} className="inline-block px-12 py-4 bg-[#00e5a0] text-[#06060a] rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all shadow-[0_0_40px_rgba(0,229,160,.08),0_2px_8px_rgba(0,229,160,.15)]">
            Get Lifetime Access — $87
          </a>

          <p className="text-[11px] text-white/15 mono mt-6">{500 - memberCount} spots left at this price</p>
        </div>
      </section>


      {/* DISCLAIMER */}
      <section className="py-8 px-5 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-[10px] text-white/12 leading-relaxed space-y-2">
            <p>PulseWave Labs and its indicator are for educational and research purposes only. Nothing on this site constitutes financial advice. Trading carries risk and may not be suitable for all investors. Past performance is not indicative of future results. You are solely responsible for your own trading decisions.</p>
            <p><Link href="/disclaimer" className="underline hover:text-white/20 transition-colors">Full risk disclosure</Link></p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[11px] text-white/15">© 2026 PulseWave Labs</span>
          <div className="flex gap-6 text-[11px] text-white/15">
            <Link href="/" className="hover:text-white/30 transition-colors">Signals</Link>
            <Link href="/privacy" className="hover:text-white/30 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/30 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
