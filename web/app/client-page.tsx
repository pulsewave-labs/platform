'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useCountUp(end: number, decimals = 0, duration = 2200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)
  const visible = useRef(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
      if (e.isIntersecting && end > 0 && !animated.current) {
        animated.current = true
        let s: number
        const step = (t: number) => { if (!s) s = t; const p = Math.min((t - s) / duration, 1); setValue(p * p * (3 - 2 * p) * end); if (p < 1) requestAnimationFrame(step) }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.3 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])
  // If data arrives after element is already visible, animate now
  useEffect(() => {
    if (end > 0 && visible.current && !animated.current) {
      animated.current = true
      let s: number
      const step = (t: number) => { if (!s) s = t; const p = Math.min((t - s) / duration, 1); setValue(p * p * (3 - 2 * p) * end); if (p < 1) requestAnimationFrame(step) }
      requestAnimationFrame(step)
    }
  }, [end, duration])
  return { display: decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString(), ref }
}

export default function LandingClientPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [perf, setPerf] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [time, setTime] = useState('')
  const [openFaq, setOpenFaq] = useState<number|null>(null)

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => { if (d?.trades) setTrades(d.trades); if (d) setPerf(d) }).catch(() => {})
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    const tick = () => setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    tick(); const iv = setInterval(tick, 1000)
    return () => { window.removeEventListener('scroll', fn); clearInterval(iv) }
  }, [])

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenu(false) }

  // Compute all stats from API data
  const allTrades = perf?.trades || []
  const totalTrades = allTrades.length
  const totalProfit = allTrades.reduce((s:number,t:any)=>s+Number(t.pnl||0),0)
  const finalBalance = 10000 + totalProfit
  const wins = allTrades.filter((t:any)=>t.pnl>0)
  const losses = allTrades.filter((t:any)=>t.pnl<0)
  const winRate = totalTrades > 0 ? (wins.length/totalTrades*100) : 0
  const grossProfit = wins.reduce((s:number,t:any)=>s+Number(t.pnl),0)
  const grossLoss = Math.abs(losses.reduce((s:number,t:any)=>s+Number(t.pnl),0))
  const profitFactor = grossLoss > 0 ? grossProfit/grossLoss : 0
  const mo = perf?.monthly || []
  const greenMonths = mo.filter((m:any)=>m.pnl>0).length
  const redMonths = mo.filter((m:any)=>m.pnl<=0).length
  const totalMonths = mo.length
  const winMonthPct = totalMonths > 0 ? (greenMonths/totalMonths*100) : 0
  const avgMonthly = totalMonths > 0 ? totalProfit/totalMonths : 0
  const avgWinTrade = wins.length > 0 ? grossProfit/wins.length : 0
  const avgPerMonth = totalMonths > 0 ? totalTrades/totalMonths : 0

  // Pair stats from trades
  const pairStats:{[k:string]:{pnl:number,n:number}} = {}
  allTrades.forEach((t:any)=>{const p=(t.pair||'').replace('/USDT','');if(!pairStats[p])pairStats[p]={pnl:0,n:0};pairStats[p].pnl+=Number(t.pnl||0);pairStats[p].n++})
  const pairList = Object.entries(pairStats).map(([p,v])=>({p,...v})).sort((a,b)=>b.pnl-a.pnl)

  const dataReady = allTrades.length > 0
  const equity = useCountUp(dataReady ? Math.round(finalBalance) : 0, 0, 2500)
  const tradeCountUp = useCountUp(dataReady ? totalTrades : 0, 0, 2000)
  const pfUp = useCountUp(dataReady ? profitFactor : 0, 2, 2000)
  const winMoUp = useCountUp(dataReady ? Math.round(winMonthPct) : 0, 0, 2000)

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const fmtK = (n:number) => n>=1000?'$'+Math.round(n).toLocaleString():n>=0?'$'+Math.round(n).toLocaleString():'-$'+Math.abs(Math.round(n)).toLocaleString()
  const fmtKShort = (n:number) => Math.abs(n)>=1000?(n>0?'+':'')+('$'+(n/1000).toFixed(0)+'K'):(n>0?'+':'')+('$'+Math.round(n))

  return (
    <div className="min-h-screen bg-[#08080a] text-[#c8c8c8] overflow-x-hidden antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .7s ease-out forwards}.fu1{animation:fadeUp .7s ease-out .1s forwards;opacity:0}.fu2{animation:fadeUp .7s ease-out .2s forwards;opacity:0}.fu3{animation:fadeUp .7s ease-out .3s forwards;opacity:0}.fu4{animation:fadeUp .7s ease-out .4s forwards;opacity:0}
        @keyframes pd{0%,100%{opacity:.35}50%{opacity:1}}.pd{animation:pd 2s ease-in-out infinite}
        .glow{text-shadow:0 0 60px rgba(0,229,160,.15)}
        .t{background:#0a0a0c;border:1px solid rgba(255,255,255,.04);border-radius:10px;overflow:hidden}
        .t-visible{background:#0a0a0c;border:1px solid rgba(255,255,255,.04);border-radius:10px}
        .th{border-bottom:1px solid rgba(255,255,255,.04);padding:8px 14px;display:flex;align-items:center;gap:7px}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.007) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.007) 1px,transparent 1px);background-size:50px 50px}
        .lift{transition:all .3s cubic-bezier(.25,.1,.25,1)}.lift:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.08)}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04) 50%,transparent)}
      `}} />

      {/* NAV */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 '+(scrolled?'bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.04]':'')}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="PulseWave" className="h-7" />
          </div>
          <div className="hidden md:flex items-center gap-7">
            <button onClick={()=>scrollTo('proof')} className="text-[14px] text-white/55 hover:text-white/85 transition-colors">Performance</button>
            <button onClick={()=>scrollTo('how')} className="text-[14px] text-white/55 hover:text-white/85 transition-colors">How It Works</button>
            <button onClick={()=>scrollTo('pricing')} className="text-[14px] text-white/55 hover:text-white/85 transition-colors">Pricing</button>
            <Link href="/auth/login" className="text-[14px] text-white/55 hover:text-white/85 transition-colors">Log In</Link>
            <Link href="/auth/signup" className="text-[14px] px-5 py-2 bg-[#00e5a0] text-black rounded font-bold tracking-wide hover:bg-[#00cc8e] transition-colors">GET ACCESS</Link>
          </div>
          <button className="md:hidden text-white/65" onClick={()=>setMenu(!menu)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={menu?"M18 6L6 18M6 6l12 12":"M4 8h16M4 16h16"}/></svg>
          </button>
        </div>
        {menu&&<div className="md:hidden px-6 pb-4 space-y-3 border-t border-white/5 mt-1 bg-[#08080a]">
          <button onClick={()=>scrollTo('proof')} className="block text-white/55 text-[14px]">Performance</button>
          <button onClick={()=>scrollTo('how')} className="block text-white/55 text-[14px]">How It Works</button>
          <button onClick={()=>scrollTo('pricing')} className="block text-white/55 text-[14px]">Pricing</button>
          <Link href="/auth/login" className="block text-white/55 text-[14px]">Log In</Link>
          <Link href="/auth/signup" className="inline-block px-5 py-2 bg-[#00e5a0] text-black rounded font-bold text-[14px]">GET ACCESS</Link>
        </div>}
      </nav>


      {/* ════════ 1. HERO ════════ */}
      <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-10 pt-16 relative grid-bg">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-4xl mx-auto relative z-10">
          <div className="fu flex items-center gap-2 mb-8">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
            <span className="text-[14px] text-white/55 mono tracking-[.15em]">LIVE · SCANNING 5 PAIRS · 24/7</span>
          </div>

          <h1 className="fu1 text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-[1.08] tracking-tight mb-6">
            While you were sleeping,<br/>our engine made <span className="text-[#00e5a0] glow">{totalProfit>0?'+$'+Math.round(totalProfit).toLocaleString():'—'}</span>
          </h1>
          <p className="fu2 text-[16px] text-white/85 leading-relaxed max-w-xl mb-4">
            Most traders lose because they trade on emotion. Our Market Structure engine doesn't have emotions. It scans. It waits. It strikes.
          </p>
          <p className="fu2 text-[14px] text-white/65 max-w-md mb-10 leading-relaxed">
            {totalTrades} verified trades. {Math.round(winMonthPct)}% profitable months. Now it sends you the exact same signals. straight to Telegram.
          </p>

          <div className="fu3 flex flex-col sm:flex-row gap-3 mb-16 max-w-md">
            <Link href="/auth/signup" className="px-8 py-4 bg-[#00e5a0] text-black rounded-lg font-bold text-[14px] hover:bg-[#00cc8e] transition-colors text-center shadow-[0_0_30px_rgba(0,229,160,.1)]">
              Start receiving signals
            </Link>
            <Link href="/performance" className="px-8 py-4 rounded-lg text-[14px] font-semibold text-white/55 border border-white/[0.06] hover:border-white/[0.12] hover:text-white/85 transition-all text-center">
              See all {totalTrades} trades
            </Link>
          </div>

          {/* Stats bar */}
          <div className="fu4 t">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { label:'STARTING BALANCE', sub:'→ CURRENT', ref:equity.ref, val:'$10K → $'+Math.round(Number(equity.display.replace(/,/g,''))/1000)+'K', c:'#00e5a0' },
                { label:'TOTAL TRADES', sub:'VERIFIED', ref:tradeCountUp.ref, val:tradeCountUp.display, c:'#e0e0e0' },
                { label:'PROFIT FACTOR', sub:'$'+profitFactor.toFixed(2)+' PER $1 LOST', ref:pfUp.ref, val:pfUp.display, c:'#e0e0e0' },
                { label:'PROFITABLE MONTHS', sub:greenMonths+' OF '+totalMonths, ref:winMoUp.ref, val:winMoUp.display+'%', c:'#e0e0e0' },
              ].map((s,i)=>(
                <div key={i} ref={s.ref} className="px-5 py-4 border-r border-b border-white/[0.02] last:border-r-0 md:last:border-b-0 md:[&:nth-child(n+3)]:border-b-0">
                  <div className="text-[14px] text-white/55 mono tracking-[.12em] mb-0.5">{s.label}</div>
                  <div className="text-[24px] font-bold mono" style={{color:s.c}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="fu4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-[16px] text-white/55">
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>No hidden fees</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>Cancel anytime</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>All trades public</span>
            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#00e5a0]/30"></span>Telegram delivery</span>
          </div>
        </div>
      </section>


      {/* ═══ divider ═══ */}
      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 2. PROBLEM AGITATION ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-[#ff4d4d]/40 mono tracking-[.2em] mb-3">THE UGLY TRUTH</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">
              90% of signal services exist to<br className="hidden md:block"/> take your money, not make it.
            </h2>
          </div>

          <div className="space-y-3 mb-12">
            {[
              { title:'They show you 5 winning screenshots. They hide the 40 losses.', desc:'Cherry-picked results are the oldest trick in trading. If a service won\'t show you EVERY trade. they\'re hiding something. We publish all '+totalTrades+' trades, including the 59% that lost.'},
              { title:'"Trust me bro" is not a track record.', desc:'Lamborghini photos. Vague "10x this week" claims. No timestamps. No stop losses. No data. Just vibes and desperation disguised as confidence.'},
              { title:'5 signals before lunch. Zero risk management.', desc:'High-frequency signal spam with no position sizing. You\'re not trading. you\'re feeding the house. One bad streak and your account is gone because nobody told you how much to risk.'},
            ].map((p,i)=>(
              <div key={i} className="border border-[#ff4d4d]/[0.04] rounded-xl p-6 md:p-7 flex gap-5 items-start hover:border-[#ff4d4d]/[0.08] transition-colors">
                
                <div>
                  <h3 className="text-[16px] font-bold text-white/85 mb-2 leading-snug">{p.title}</h3>
                  <p className="text-[14px] text-white/45 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 md:p-8 text-center">
            <p className="text-[15px] text-white/60 leading-relaxed max-w-xl mx-auto">
              We built PulseWave because we got burned too. So we made one rule: <strong className="text-white/90">publish everything</strong>: wins, losses, fees, drawdowns. Every entry. Every exit. Every dollar.
            </p>
            <Link href="/performance" className="inline-flex items-center gap-2 mt-4 text-[13px] text-[#00e5a0]/60 hover:text-[#00e5a0] mono tracking-wider transition-colors">
              AUDIT ALL {totalTrades} TRADES <span className="text-[16px]">→</span>
            </Link>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 3. MECHANISM ════════ */}
      <section id="how" className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.2em] mb-3">HOW IT WORKS</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight mb-4">
              The same method institutions use.<br className="hidden md:block"/> Automated. Delivered to your phone.
            </h2>
            <p className="text-[14px] text-white/45 max-w-xl mx-auto leading-relaxed">
              While retail chases RSI crossovers, institutional traders follow <strong className="text-white/70">Break of Structure</strong> and <strong className="text-white/70">Order Blocks</strong>, where real money enters the market. Our engine runs this 24/7 across 5 pairs.
            </p>
          </div>

          <div className="relative">
            {/* Connector line. desktop only */}
            <div className="hidden md:block absolute top-[52px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#00e5a0]/10 via-[#00e5a0]/20 to-[#00e5a0]/10 z-0"></div>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {[
                {n:'1',t:'Engine scans',sub:'You don\'t.',d:'BTC, ETH, SOL, AVAX, XRP, monitored around the clock. No fatigue. No FOMO. No emotion. It waits for the exact setup, then fires.', accent:'from-[#00e5a0]/20 to-[#00e5a0]/5'},
                {n:'2',t:'Signal hits Telegram',sub:'In under 60 seconds.',d:'Entry, stop loss, take profit, position size for YOUR account, calculated instantly. One notification. Everything you need to place the trade.', accent:'from-[#00e5a0]/15 to-[#00e5a0]/5'},
                {n:'3',t:'You place it',sub:'Done.',d:'Copy 5 numbers into your exchange. Same risk management every time. 10% fixed risk, mathematically sized. The system removes the thing that kills traders: you.', accent:'from-[#00e5a0]/10 to-[#00e5a0]/5'},
              ].map((s,i)=>(
                <div key={i} className="relative group">
                  <div className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-7 hover:border-[#00e5a0]/[0.08] transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#00e5a0]/[0.08] to-transparent border border-[#00e5a0]/[0.12] flex items-center justify-center mb-5">
                      <span className="text-[14px] mono font-bold text-[#00e5a0]/60">{s.n}</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-white/90 mb-0.5">{s.t}</h3>
                    <p className="text-[14px] text-[#00e5a0]/40 mono mb-3">{s.sub}</p>
                    <p className="text-[14px] text-white/45 leading-relaxed">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 4. PROOF ════════ */}
      <section id="proof" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[12px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">THE PROOF</p>
              <h2 className="text-2xl md:text-[32px] font-bold tracking-tight leading-tight">
                {totalTrades} trades. Every one public.
              </h2>
              <p className="text-[14px] text-white/55 mt-2">Not screenshots. Not highlights. The complete, unedited record.</p>
            </div>
            <Link href="/performance" className="text-[14px] text-white/65 mono tracking-wider hover:text-white/65 transition-colors shrink-0">VIEW FULL LOG →</Link>
          </div>

          {/* Monthly returns grid */}
          {perf?.monthly&&(()=>{
            const byYear:{[y:string]:any[]}={}
            perf.monthly.forEach((m:any)=>{const y=m.month.slice(0,4);if(!byYear[y])byYear[y]=[];byYear[y].push(m)})
            const years=Object.keys(byYear).sort()
            return(
            <div className="t mb-5">
              <div className="px-5 py-3 border-b border-white/[0.03] flex items-center justify-between">
                <span className="text-[14px] text-white/55 mono">MONTHLY P&L</span>
                <span className="text-[14px] text-white/55 mono">{perf.monthly.length} months tracked</span>
              </div>
              <div className="p-5 space-y-4">
                {years.map((year:string)=>{
                  const yearTotal=byYear[year].reduce((s:number,x:any)=>s+x.pnl,0)
                  return(
                    <div key={year}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[14px] text-white/65 mono font-semibold">{year}</span>
                        <span className={'text-[14px] mono font-bold '+(yearTotal>=0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{yearTotal>=0?'+':''}${(yearTotal/1000).toFixed(1)}K</span>
                      </div>
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
                        {Array.from({length:12},(_,mi)=>{
                          const monthKey=`${year}-${String(mi+1).padStart(2,'0')}`
                          const md=byYear[year].find((x:any)=>x.month===monthKey)
                          if(!md) return <div key={mi} className="rounded-md bg-white/[0.015] py-3 px-1 text-center"><div className="text-[14px] text-white/55 mono">{months[mi]}</div><div className="text-[14px] text-white/55 mono mt-0.5">—</div></div>
                          const pnl=md.pnl, int=Math.min(Math.abs(pnl)/12000,1)
                          const bg=pnl>0?`rgba(0,229,160,${.05+int*.25})`:`rgba(255,77,77,${.05+int*.25})`
                          return(
                            <div key={mi} className="rounded-md py-3 px-1 text-center" style={{background:bg}}>
                              <div className="text-[14px] text-white/65 mono">{months[mi]}</div>
                              <div className={'text-[16px] font-bold mono mt-0.5 '+(pnl>0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{pnl>0?'+':''}{(pnl/1000).toFixed(1)}k</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            )
          })()}

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            {perf?.monthly&&(()=>{
              const m=perf.monthly, total=m.reduce((s:number,x:any)=>s+x.pnl,0), avg=total/m.length
              const best=m.reduce((a:any,b:any)=>a.pnl>b.pnl?a:b,m[0]), worst=m.reduce((a:any,b:any)=>a.pnl<b.pnl?a:b,m[0])
              return[
                {l:'TOTAL PROFIT',v:'+$'+Math.round(total).toLocaleString(),c:'#00e5a0'},
                {l:'MONTHLY AVG',v:'+$'+Math.round(avg).toLocaleString(),c:'#00e5a0'},
                {l:'BEST MONTH',v:'+$'+Math.round(best.pnl).toLocaleString(),c:'#00e5a0'},
                {l:'WORST MONTH',v:'-$'+Math.abs(Math.round(worst.pnl)).toLocaleString(),c:'#ff4d4d'},
              ].map((s,i)=>(
                <div key={i} className="t px-5 py-4">
                  <div className="text-[14px] text-white/55 mono tracking-[.12em] mb-1">{s.l}</div>
                  <div className="text-[24px] font-bold mono" style={{color:s.c}}>{s.v}</div>
                </div>
              ))
            })()}
          </div>

          {/* Trade feed */}
          <div className="t">
            <div className="px-5 py-3 border-b border-white/[0.03] flex items-center justify-between">
              <span className="text-[14px] text-white/55 mono">RECENT TRADES</span>
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-white/55 mono">2-day delay</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pd"></span><span className="text-[14px] text-[#00e5a0]/40 mono">LIVE</span></span>
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[90px_80px_60px_1fr_1fr_90px_60px] text-[14px] text-white/55 mono tracking-[.1em] px-5 py-2 border-b border-white/[0.02]">
                <div>DATE</div><div>PAIR</div><div>SIDE</div><div>ENTRY</div><div>EXIT</div><div className="text-right">P&L</div><div className="text-right">RESULT</div>
              </div>
              {trades.slice(0,8).map((t,i)=>(
                <div key={'d'+i} className={'grid grid-cols-[90px_80px_60px_1fr_1fr_90px_60px] items-center px-5 py-3 border-b border-white/[0.015] hover:bg-white/[0.01] transition-colors '+(i%2===0?'bg-white/[0.003]':'')}>
                  <div className="text-[14px] text-white/65 mono">{new Date(t.entry_time).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                  <div className="text-[14px] text-white/85 mono font-medium">{t.pair.replace('/USDT','')}</div>
                  <div><span className={'text-[14px] mono font-bold '+(t.action==='LONG'?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.action}</span></div>
                  <div className="text-[14px] text-white/55 mono">${Number(t.entry_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                  <div className="text-[14px] text-white/55 mono">${Number(t.exit_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                  <div className={'text-[14px] mono font-medium text-right '+(t.pnl>0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.pnl>0?'+':''}${Number(t.pnl).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                  <div className="text-right"><span className={'text-[14px] mono tracking-wider '+(t.exit_reason==='TP'?'text-[#00e5a0]/50':'text-[#ff4d4d]/50')}>{t.exit_reason==='TP'?'WIN':'LOSS'}</span></div>
                </div>
              ))}
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-white/[0.02]">
              {trades.slice(0,8).map((t,i)=>(
                <div key={'m'+i} className={'px-4 py-4 '+(i%2===0?'bg-white/[0.003]':'')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={'text-[14px] mono font-bold px-2 py-0.5 rounded '+(t.action==='LONG'?'bg-[#00e5a0]/10 text-[#00e5a0]':'bg-[#ff4d4d]/10 text-[#ff4d4d]')}>{t.action}</span>
                      <span className="text-[14px] text-white/85 mono font-medium">{t.pair.replace('/USDT','')}</span>
                    </div>
                    <span className={'text-[16px] mono font-bold '+(t.pnl>0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.pnl>0?'+':''}${Number(t.pnl).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                  </div>
                  <div className="flex items-center justify-between text-[16px] mono text-white/55">
                    <span>{new Date(t.entry_time).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                    <span>${Number(t.entry_price).toLocaleString(undefined,{maximumFractionDigits:2})} → ${Number(t.exit_price).toLocaleString(undefined,{maximumFractionDigits:2})}</span>
                    <span className={'tracking-wider font-medium '+(t.exit_reason==='TP'?'text-[#00e5a0]/40':'text-[#ff4d4d]/40')}>{t.exit_reason==='TP'?'WIN':'LOSS'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 text-center border-t border-white/[0.02]">
              <Link href="/performance" className="text-[14px] text-white/65 mono tracking-wider hover:text-white/65 transition-colors">VERIFY ALL {totalTrades} TRADES →</Link>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 5. SIGNAL PREVIEW ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div>
            <p className="text-[12px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">WHAT YOU RECEIVE</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
              Not "buy BTC."<br/><span className="text-white/55">The full trade, calculated for you.</span>
            </h2>
            <p className="text-[14px] text-white/65 leading-relaxed mb-8">
              Every signal comes with the exact entry, exit, and position size, calculated for YOUR account. No vague calls. No "I think it'll go up." Just math.
            </p>
            <div className="space-y-3">
              {[
                ['Exact entry, stop loss, and take profit','Every level defined before you enter.'],
                ['Position size for your account','Risk is calculated, not guessed.'],
                ['Risk:reward ratio on every trade','You always know what you\'re risking vs. gaining.'],
                ['Instant Telegram delivery','Signals arrive in under 60 seconds.'],
              ].map((f,i)=>(
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#00e5a0]/50 mono text-[16px] mt-1 shrink-0">→</span>
                  <div>
                    <div className="text-[14px] text-white/65 font-medium">{f[0]}</div>
                    <div className="text-[14px] text-white/55 mt-0.5">{f[1]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(()=>{
            const win = trades.find((t:any) => t.pnl > 0) || null
            if (!win) return <div className="t p-10 text-center text-white/55 mono text-[14px]">Loading latest trade...</div>
            const ep = Number(win.entry_price), xp = Number(win.exit_price), sl = Number(win.stop_loss||0), tp = Number(win.take_profit||xp)
            const isLong = win.action === 'LONG'
            const riskPct = ep > 0 ? Math.abs((ep - sl) / ep * 100) : 0
            const rewPct = ep > 0 ? Math.abs((tp - ep) / ep * 100) : 0
            const rr = riskPct > 0 ? (rewPct / riskPct) : 0
            const riskFrac = riskPct + rewPct > 0 ? riskPct / (riskPct + rewPct) * 100 : 30
            const fmt = (n:number) => n >= 1000 ? '$'+n.toLocaleString(undefined,{maximumFractionDigits:0}) : n >= 1 ? '$'+n.toFixed(2) : '$'+n.toFixed(4)
            const posSizes = [1000,10000,50000].map(acct => {
              const risk = acct * 0.1
              const posSize = sl > 0 && riskPct > 0 ? (risk / (riskPct/100)) : acct * 2
              return { a: '$'+(acct/1000)+'K acct', s: '$'+(posSize/1000).toFixed(1)+'K', r: 'risk $'+risk.toLocaleString() }
            })
            return (
          <div className="t">
            <div className="px-5 py-3 border-b border-white/[0.03] flex items-center justify-between">
              <span className="text-[14px] text-white/55 mono">LATEST WINNER</span>
              <span className="text-[14px] text-[#00e5a0] mono font-bold">+${Number(win.pnl).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={'text-[16px] font-bold mono px-2 py-0.5 rounded '+(isLong?'text-black bg-[#00e5a0]':'text-black bg-[#ff4d4d]')}>{win.action}</span>
                  <span className="text-xl font-bold mono">{win.pair}</span>
                </div>
                <span className="text-[14px] text-white/65 mono">{new Date(win.entry_time).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[{l:'ENTRY',v:fmt(ep),c:''},{l:'STOP LOSS',v:sl>0?fmt(sl):'—',c:'text-[#ff4d4d]'},{l:'TAKE PROFIT',v:fmt(tp),c:'text-[#00e5a0]'}].map((x,i)=>(
                  <div key={i}><div className="text-[14px] text-white/55 mono tracking-wider mb-1.5">{x.l}</div><div className={'text-[14px] font-bold mono '+x.c}>{x.v}</div></div>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-[14px] mono text-white/55 mb-1.5"><span>Risk {riskPct.toFixed(1)}%</span><span>Reward {rewPct.toFixed(1)}%</span></div>
                <div className="h-2 rounded-full bg-white/[0.03] flex overflow-hidden"><div className="bg-[#ff4d4d]/25 rounded-l-full" style={{width:riskFrac+'%'}}></div><div className="bg-[#00e5a0]/25 rounded-r-full" style={{width:(100-riskFrac)+'%'}}></div></div>
                <div className="text-right text-[16px] text-[#00e5a0]/50 mono mt-1 font-medium">{rr.toFixed(1)}:1 R:R</div>
              </div>

              <div className="border-t border-white/[0.03] pt-4">
                <div className="text-[14px] text-white/55 mono tracking-wider mb-2.5">POSITION SIZE BY ACCOUNT</div>
                <div className="grid grid-cols-3 gap-2 text-[16px] mono">
                  {posSizes.map((r,i)=>(
                    <div key={i} className="bg-white/[0.02] rounded-md px-3 py-3"><div className="text-white/65 text-[14px]">{r.a}</div><div className="text-white/85 font-medium mt-0.5">{r.s}</div><div className="text-white/55 text-[14px] mt-0.5">{r.r}</div></div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[14px] mono text-[#00e5a0]/40 font-medium tracking-wider">RESULT: TP HIT</span>
                <span className="text-[14px] mono text-white/55">|</span>
                <span className="text-[14px] mono text-white/55">{win.exit_time ? new Date(win.exit_time).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''}</span>
              </div>
            </div>
          </div>
            )
          })()}
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 6. WHO THIS IS FOR ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-white/25 mono tracking-[.2em] mb-3">HONEST TAKE</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">Most people shouldn't<br className="hidden md:block" /> subscribe to this.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* NOT for you. listed first to disqualify */}
            <div className="order-2 md:order-1 border border-white/[0.04] rounded-xl p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff4d4d]/20 to-transparent"></div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 rounded-full border border-[#ff4d4d]/20 flex items-center justify-center">
                  <span className="text-[#ff4d4d]/50 text-[12px] mono font-bold">X</span>
                </div>
                <span className="text-[13px] mono text-[#ff4d4d]/50 tracking-wider font-semibold">WALK AWAY IF</span>
              </div>
              <div className="space-y-4">
                {[
                  {t:'You want guaranteed profits', s:'Nobody can promise that. Anyone who does is lying.'},
                  {t:'You expect overnight riches', s:'This is a system, not a lottery ticket. $100 won\'t become $100K.'},
                  {t:'You can\'t stomach red days', s:'40% of trades lose. The edge is in the math, not the win streak.'},
                  {t:'You want 50 signals a day', s:'We average ~1 per day. Quality over quantity. Always.'},
                  {t:'You won\'t follow the rules', s:'Position sizing and risk management aren\'t optional.'},
                ].map((item,i)=>(
                  <div key={i}>
                    <div className="text-[14px] text-white/60 font-medium">{item.t}</div>
                    <div className="text-[13px] text-white/30 mt-0.5">{item.s}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOR you */}
            <div className="order-1 md:order-2 bg-[#00e5a0]/[0.02] border border-[#00e5a0]/[0.08] rounded-xl p-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/20 to-transparent"></div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 rounded-full border border-[#00e5a0]/20 flex items-center justify-center">
                  <span className="text-[#00e5a0]/60 text-[12px] mono font-bold">✓</span>
                </div>
                <span className="text-[13px] mono text-[#00e5a0]/50 tracking-wider font-semibold">BUILT FOR YOU IF</span>
              </div>
              <div className="space-y-4">
                {[
                  {t:'You trade crypto but can\'t watch charts all day', s:'Signals fire to Telegram. Open the trade. Done.'},
                  {t:'You\'ve lost money trying to trade on your own', s:'Remove the emotions. Follow a system that\'s been verified over 624 trades.'},
                  {t:'You\'re sick of unverified "gurus"', s:'Every single trade is public. Wins and losses. No screenshots, raw data.'},
                  {t:'You respect risk management', s:'10% risk per trade, hard stops, defined targets. No YOLO.'},
                  {t:'You have $5K+ to trade with', s:'The math works best with proper capital. Not a micro-account play.'},
                ].map((item,i)=>(
                  <div key={i}>
                    <div className="text-[14px] text-white/70 font-medium">{item.t}</div>
                    <div className="text-[13px] text-white/35 mt-0.5">{item.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 7. PAIRS + SYSTEM ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.2em] mb-3">INFRASTRUCTURE</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">
              5 pairs. 24/7 monitoring.<br className="hidden md:block"/> Built like a hedge fund. Priced like a subscription.
            </h2>
          </div>

          {/* Pair cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {pairList.map((x,i)=>{
              const maxPnl = Math.max(...pairList.map(p=>p.pnl))
              const barW = maxPnl > 0 ? (x.pnl / maxPnl * 100) : 0
              return (
              <div key={i} className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-5 hover:border-[#00e5a0]/[0.08] transition-all duration-300 group">
                <div className="text-[18px] font-bold mono text-white/80 mb-0.5 group-hover:text-[#00e5a0] transition-colors">{x.p}</div>
                <div className="text-[11px] mono text-white/30 mb-3">{x.n} trades</div>
                <div className="text-[18px] font-bold mono text-[#00e5a0] mb-2">+${(x.pnl/1000).toFixed(1)}K</div>
                <div className="h-1 rounded-full bg-white/[0.03]">
                  <div className="h-full rounded-full bg-[#00e5a0]/30 transition-all duration-500" style={{width: barW+'%'}}></div>
                </div>
              </div>
            )})}
          </div>

          {/* System specs. horizontal strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/[0.02] rounded-xl overflow-hidden">
            {[
              {v:'24/7', l:'Monitoring', s:'Every candle close'},
              {v:'< 60s', l:'Signal Delivery', s:'Detection → Telegram'},
              {v:'10%', l:'Risk Per Trade', s:'Fixed. Every time.'},
              {v:totalMonths>0?Math.floor(totalMonths/12)+'yr'+(totalMonths>=24?'s':''):'—', l:'Track Record', s:totalTrades+' verified trades'},
              {v:'$0', l:'Hidden Fees', s:'What you see is it'},
            ].map((s,i)=>(
              <div key={i} className="bg-[#0a0a0c] px-5 py-5 text-center">
                <div className="text-[22px] font-bold mono text-white/85 mb-1">{s.v}</div>
                <div className="text-[12px] text-white/50 font-medium mb-0.5">{s.l}</div>
                <div className="text-[11px] text-white/25 mono">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 8. PRICING ════════ */}
      <section id="pricing" className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">PRICING</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-3 leading-tight">
              Less than one winning trade.
            </h2>
            <p className="text-[14px] text-white/65 max-w-lg mx-auto">
              Our average winning trade returns +${Math.round(avgWinTrade).toLocaleString()} on a $10K account. Your subscription pays for itself on the first signal that hits.
            </p>
          </div>

          {/* Price comparison anchor */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-[11px] text-white/30 mono tracking-[.2em] mb-5 text-center">WHAT TRADERS TYPICALLY SPEND</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {n:'Trading Courses',v:'$500 – $5,000',s:'One-time purchase. No ongoing signals. You still trade alone.'},
                {n:'Signal Groups',v:'$200 – $500/mo',s:'Unverified win rates. Cherry-picked screenshots. No transparency.'},
                {n:'Algo Trading Bots',v:'$100 – $300/mo',s:'You configure. You manage. You debug. Breaks when markets shift.'},
                {n:'Trading Indicators',v:'$30 – $100/mo',s:'Still requires you to interpret charts, find entries, and manage risk.'},
              ].map((c,i)=>(
                <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 relative overflow-hidden group hover:border-white/[0.06] transition-colors">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff4d4d]/[0.02] rounded-bl-full"></div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[14px] text-white/70 font-medium">{c.n}</span>
                    <span className="text-[14px] mono font-bold text-[#ff4d4d]/60 text-right leading-none">{c.v}</span>
                  </div>
                  <p className="text-[13px] text-white/35 leading-relaxed">{c.s}</p>
                  <div className="mt-3 h-px bg-gradient-to-r from-[#ff4d4d]/10 to-transparent"></div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-center">
              <div className="inline-flex items-center gap-2 bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08] rounded-full px-5 py-2">
                <span className="text-[14px] text-white/50">PulseWave Signals</span>
                <span className="text-[16px] mono font-bold text-[#00e5a0]">$149/mo</span>
                <span className="text-[13px] text-white/30">· verified results, zero guesswork</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="t lift">
              <div className="p-7">
                <div className="text-[14px] text-white/65 mono tracking-wider mb-4">MONTHLY</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[36px] font-bold mono">$149</span>
                  <span className="text-white/65 text-[14px]">/mo</span>
                </div>
                <div className="space-y-2.5 text-[14px] text-white/55 mb-8">
                  {['Every signal, every pair','Instant Telegram alerts','Full performance dashboard','Position sizing calculator','Cancel anytime, no lock-in'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2.5"><span className="text-[#00e5a0]/40 mono text-[16px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-3 rounded-lg border border-white/[0.08] text-white/65 text-[16px] font-bold text-center hover:border-white/[0.15] hover:text-white/85 transition-all mono tracking-wide">GET STARTED</Link>
              </div>
            </div>

            <div className="t-visible lift relative" style={{borderColor:'rgba(0,229,160,.12)'}}>
              <div className="absolute -top-2.5 right-5 px-3 py-0.5 bg-[#00e5a0] text-black text-[14px] font-bold mono tracking-wider rounded-sm z-10">SAVE $298</div>
              <div className="p-7">
                <div className="text-[12px] text-[#00e5a0]/40 mono tracking-wider mb-4">ANNUAL</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[36px] font-bold mono text-[#00e5a0]">$1,490</span>
                  <span className="text-white/65 text-[14px]">/yr</span>
                </div>
                <div className="text-[14px] text-[#00e5a0]/30 mono mb-6">2 months free</div>
                <div className="space-y-2.5 text-[14px] text-white/55 mb-8">
                  {['Everything in monthly','Priority signal delivery','Advanced analytics','Direct support channel','Early access to new features'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2.5"><span className="text-[#00e5a0]/40 mono text-[16px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-3 rounded-lg bg-[#00e5a0] text-black text-[16px] font-bold text-center hover:bg-[#00cc8e] transition-colors mono tracking-wide">GET STARTED</Link>
              </div>
            </div>
          </div>

          {/* ROI math */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-b from-[#00e5a0]/[0.03] to-transparent border border-[#00e5a0]/[0.08] rounded-xl p-8 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/20 to-transparent"></div>

              <div className="text-center mb-8">
                <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.2em] mb-2">SIMPLE MATH</div>
                <p className="text-[14px] text-white/40">What $149/mo looks like on a $10K account</p>
              </div>

              <div className="flex items-center justify-center gap-3 md:gap-5 mb-8">
                {/* Cost */}
                <div className="text-center">
                  <div className="text-[13px] text-white/30 mono mb-1">You pay</div>
                  <div className="text-[28px] font-bold mono text-white/70">$149</div>
                  <div className="text-[11px] text-white/25 mono">/month</div>
                </div>

                <div className="text-[20px] text-white/15 mono">→</div>

                {/* Avg return */}
                <div className="text-center">
                  <div className="text-[13px] text-white/30 mono mb-1">Avg return</div>
                  <div className="text-[28px] font-bold mono text-[#00e5a0]">+${Math.round(avgMonthly).toLocaleString()}</div>
                  <div className="text-[11px] text-[#00e5a0]/30 mono">/month</div>
                </div>

                <div className="text-[20px] text-white/15 mono">=</div>

                {/* ROI */}
                <div className="text-center">
                  <div className="text-[13px] text-white/30 mono mb-1">ROI</div>
                  <div className="text-[36px] font-bold mono text-[#00e5a0]">{avgMonthly>0?Math.round(avgMonthly/149)+'x':'—'}</div>
                </div>
              </div>

              <div className="h-px bg-white/[0.04] mb-4"></div>
              <p className="text-[10px] text-white/20 text-center">Based on verified results. $10K starting capital, 10% fixed risk, 20x leverage. Past performance does not guarantee future results.</p>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 8.5. ACCOUNT SIMULATOR ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.2em] mb-3">SCALE IT</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight mb-3">
              Same signals. Your account size.
            </h2>
            <p className="text-[14px] text-white/40 max-w-md mx-auto">
              10% fixed risk scales linearly. Here's what the verified track record looks like at different account sizes.
            </p>
          </div>

          <div className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 gap-px bg-white/[0.02]">
              {[1000, 5000, 10000, 25000, 50000].map(function(acct) {
                var multiplier = acct / 10000
                var tp = totalProfit * multiplier
                var ma = avgMonthly * multiplier
                var isBase = acct === 10000
                return (
                  <div key={acct} className={'p-5 text-center relative ' + (isBase ? 'bg-[#00e5a0]/[0.03]' : 'bg-[#0a0a0c]')}>
                    {isBase && <div className="absolute top-0 left-0 right-0 h-px bg-[#00e5a0]/20"></div>}
                    <div className={'text-[12px] mono mb-4 tracking-wider ' + (isBase ? 'text-[#00e5a0]/50 font-bold' : 'text-white/30')}>{isBase ? 'BASE' : ''}&nbsp;</div>
                    <div className={'text-[16px] mono font-bold mb-4 ' + (isBase ? 'text-[#00e5a0]' : 'text-white/50')}>${(acct/1000).toFixed(0)}K</div>
                    <div className="text-[22px] mono font-bold text-[#00e5a0] mb-1">+${Math.round(tp).toLocaleString()}</div>
                    <div className="text-[11px] mono text-white/25 mb-3">total profit</div>
                    <div className="h-px bg-white/[0.04] mb-3"></div>
                    <div className="text-[14px] mono text-white/50 font-medium">${Math.round(ma).toLocaleString()}</div>
                    <div className="text-[11px] mono text-white/20">per month avg</div>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="text-[10px] text-white/15 text-center mt-4">Based on verified results. 10% fixed risk, 20x leverage. Past performance does not guarantee future results.</p>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 9. FAQ ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] text-white/25 mono tracking-[.2em] mb-3">QUESTIONS</div>
            <h2 className="text-2xl md:text-[36px] font-bold tracking-tight leading-tight">Before you decide.</h2>
          </div>

          <div className="space-y-3">
            {[
              {q:'Why is the win rate only '+Math.round(winRate)+'%?',a:'Because our winners are much larger than our losers. Profit factor of '+profitFactor.toFixed(2)+' means for every $1 lost, we make $'+profitFactor.toFixed(2)+' back. Over '+totalTrades+' trades, that turns $10K into $'+Math.round(finalBalance).toLocaleString()+'. Win rate is a vanity metric. profit factor is what matters.'},
              {q:'How do I know the results are real?',a:'Every trade is published with timestamps, entry/exit prices, P&L, and running balance. Audit all '+totalTrades+' trades on our performance page. We show the losses too. '+redMonths+' red month'+(redMonths!==1?'s':'')+' out of '+totalMonths+'. Name one other signal service that does this.'},
              {q:'I\'ve never traded before. Can I still use this?',a:'Yes. Each signal includes: pair, direction, entry price, stop loss, take profit, and position size for your account. If you can copy 5 numbers into Bitget (or any exchange), you can follow the signals. We\'re not teaching you to trade. we\'re giving you the trade.'},
              {q:'What exchange do I need?',a:'We recommend Bitget for USDT-M futures, but signals work on any exchange that supports crypto futures. Bybit, OKX, Binance, etc. The levels are the same everywhere.'},
              {q:'How many signals per month?',a:'Roughly '+Math.round(avgPerMonth)+' signals per month on average across all pairs. Quality over quantity. we only fire when the setup is there. Some weeks you\'ll get 8 signals, some weeks 2. The engine doesn\'t force trades.'},
              {q:'Can I cancel anytime?',a:'Yes. Monthly subscribers cancel anytime, no questions asked. No lock-in, no cancellation fees. If the signals don\'t pay for themselves, you shouldn\'t be paying for them.'},
            ].map((faq,i)=>(
              <div key={i} className="border border-white/[0.04] rounded-xl p-6 hover:border-white/[0.06] transition-colors">
                <h3 className="text-[15px] font-bold text-white/80 mb-2">{faq.q}</h3>
                <p className="text-[14px] text-white/40 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 10. FINAL CTA ════════ */}
      <section className="py-32 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.04) 0%,transparent 60%)'}}/>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08] rounded-full px-5 py-2 mb-8">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
            <span className="text-[12px] text-[#00e5a0]/60 mono tracking-wider">ENGINE SCANNING NOW</span>
          </div>

          <div className="mb-8">
            <span className="text-[48px] md:text-[64px] font-bold mono text-[#00e5a0] glow leading-none">{totalProfit>0?'+$'+Math.round(totalProfit).toLocaleString():'—'}</span>
          </div>

          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
            You've scrolled this far for a reason.
          </h2>
          <p className="text-[15px] text-white/50 mb-3 max-w-md mx-auto leading-relaxed">
            You're either going to keep trading on emotion, gut feelings, and hope, or you're going to plug into a system that's done {totalTrades} trades and turned $10K into ${Math.round(finalBalance).toLocaleString()}.
          </p>
          <p className="text-[14px] text-white/30 mb-10 max-w-sm mx-auto">
            The next signal could fire tonight. Public log is delayed 48 hours. Subscribers get it instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-4">
            <Link href="/auth/signup" className="flex-1 py-4 bg-[#00e5a0] text-black rounded-lg font-bold text-[15px] hover:bg-[#00cc8e] transition-colors text-center shadow-[0_0_40px_rgba(0,229,160,.12)]">
              Start receiving signals. $149/mo
            </Link>
          </div>
          <Link href="/performance" className="text-[13px] text-white/35 mono tracking-wider hover:text-white/55 transition-colors">
            OR AUDIT ALL {totalTrades} TRADES FIRST →
          </Link>
        </div>
      </section>


      {/* DISCLAIMER */}
      <section className="py-8 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] text-white/25 leading-relaxed">Past performance does not guarantee future results. Trading crypto with leverage involves substantial risk of loss. All results from verified historical data. PulseWave Labs provides signals for informational purposes only. Not a registered investment advisor. <Link href="/disclaimer" className="underline hover:text-white/35 transition-colors">Full risk disclosure</Link>.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><img src="/logo.webp" alt="PulseWave" className="h-4 opacity-20"/><span className="text-[11px] text-white/25">© 2026 PulseWave Labs</span></div>
          <div className="flex gap-6 text-[11px] text-white/25">
            <Link href="/performance" className="hover:text-white/40 transition-colors">Trades</Link>
            <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/40 transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white/40 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
