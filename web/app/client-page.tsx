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
            <button onClick={()=>scrollTo('proof')} className="text-[16px] text-white/55 hover:text-white/85 transition-colors">Performance</button>
            <button onClick={()=>scrollTo('how')} className="text-[16px] text-white/55 hover:text-white/85 transition-colors">How It Works</button>
            <button onClick={()=>scrollTo('pricing')} className="text-[16px] text-white/55 hover:text-white/85 transition-colors">Pricing</button>
            <Link href="/auth/login" className="text-[16px] text-white/55 hover:text-white/85 transition-colors">Log In</Link>
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
            <span className="text-[16px] text-white/55 mono tracking-[.15em]">LIVE · SCANNING 5 PAIRS · 24/7</span>
          </div>

          <h1 className="fu1 text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-[1.08] tracking-tight mb-6">
            While you were sleeping,<br/>our engine made <span className="text-[#00e5a0] glow">{totalProfit>0?'+$'+Math.round(totalProfit).toLocaleString():'—'}</span>
          </h1>
          <p className="fu2 text-[16px] text-white/85 leading-relaxed max-w-xl mb-4">
            Most traders lose because they trade on emotion. Our Market Structure engine doesn't have emotions. It scans. It waits. It strikes.
          </p>
          <p className="fu2 text-[14px] text-white/65 max-w-md mb-10 leading-relaxed">
            {totalTrades} verified trades. {Math.round(winMonthPct)}% profitable months. Now it sends you the exact same signals — straight to Telegram.
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
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[16px] text-[#ff4d4d]/50 mono tracking-[.15em] mb-4">THE PROBLEM</p>
          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
            You already know most signal<br className="hidden md:block"/> services are garbage.
          </h2>
          <p className="text-[16px] text-white/55 mb-10 max-w-lg mx-auto">Here's what they don't want you to see.</p>

          <div className="grid md:grid-cols-3 gap-4 text-left mb-10">
            {[
              {n:'01',title:'Cherry-picked screenshots',desc:'They show you their wins. They hide 80% of their trades. You never see the full picture until you\'ve already paid.'},
              {n:'02',title:'"Trust me bro" track records',desc:'No verified data. No timestamps. No stop losses. Just Lamborghinis and vague "10x this week" posts.'},
              {n:'03',title:'Signals that bleed you dry',desc:'5 signals a day with no risk management. You\'re not trading — you\'re gambling someone else\'s hunches with your money.'},
            ].map((p,i)=>(
              <div key={i} className="t p-6 lift">
                <div className="text-[28px] font-bold mono text-white/[0.04] mb-3">{p.n}</div>
                <h3 className="text-[16px] font-semibold mb-2.5 text-white/85">{p.title}</h3>
                <p className="text-[16px] text-white/65 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[16px] text-white/55 max-w-xl mx-auto leading-relaxed">
            You've been burned before. We know — because so have we. That's why we publish <strong className="text-white/85">every single trade</strong> — wins AND losses — with timestamps, entries, exits, and exact P&L. 
            <Link href="/performance" className="text-[#00e5a0]/60 hover:text-[#00e5a0] ml-1 underline underline-offset-2 transition-colors">All {totalTrades} of them.</Link>
          </p>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 3. MECHANISM ════════ */}
      <section id="how" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-[16px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">THE METHOD</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
              Market Structure — the method<br className="hidden md:block"/> institutions use to move markets.
            </h2>
            <p className="text-[16px] text-white/65 leading-relaxed">
              While retail chases RSI crossovers and YouTube indicators, institutional traders follow <strong className="text-white/85">Break of Structure</strong> and <strong className="text-white/85">Order Blocks</strong> — the price levels where real money enters. Our engine automates this across 5 crypto pairs, 24 hours a day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {n:'01',t:'Engine scans. You don\'t.',d:'Our system monitors BTC, ETH, SOL, AVAX, and XRP around the clock. It doesn\'t get tired, emotional, or FOMO into bad trades. It waits for the exact setup — then fires.'},
              {n:'02',t:'Signal hits your phone.',d:'Entry price, stop loss, take profit, exact position size for YOUR account — all calculated in seconds. Delivered to Telegram the instant a setup confirms.'},
              {n:'03',t:'You place the trade.',d:'Open your exchange, enter the levels, done. Same risk management every time — 10% fixed risk, mathematically sized positions. The system removes the one thing that kills traders: emotion.'},
            ].map((s,i)=>(
              <div key={i} className="t lift p-6">
                <div className="text-[32px] font-bold text-white/[0.03] mono mb-4">{s.n}</div>
                <h3 className="text-[14px] font-semibold mb-2 text-white/85">{s.t}</h3>
                <p className="text-[16px] text-white/65 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 4. PROOF ════════ */}
      <section id="proof" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[16px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">THE PROOF</p>
              <h2 className="text-2xl md:text-[32px] font-bold tracking-tight leading-tight">
                {totalTrades} trades. Every one public.
              </h2>
              <p className="text-[16px] text-white/55 mt-2">Not screenshots. Not highlights. The complete, unedited record.</p>
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
                <span className="text-[16px] text-white/55 mono">MONTHLY P&L</span>
                <span className="text-[16px] text-white/55 mono">{perf.monthly.length} months tracked</span>
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
              <span className="text-[16px] text-white/55 mono">RECENT TRADES</span>
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
                  <div className="text-[16px] text-white/65 mono">{new Date(t.entry_time).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                  <div className="text-[14px] text-white/85 mono font-medium">{t.pair.replace('/USDT','')}</div>
                  <div><span className={'text-[14px] mono font-bold '+(t.action==='LONG'?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.action}</span></div>
                  <div className="text-[16px] text-white/55 mono">${Number(t.entry_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                  <div className="text-[16px] text-white/55 mono">${Number(t.exit_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
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
            <p className="text-[16px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">WHAT YOU RECEIVE</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
              Not "buy BTC."<br/><span className="text-white/55">The full trade, calculated for you.</span>
            </h2>
            <p className="text-[16px] text-white/65 leading-relaxed mb-8">
              Every signal comes with the exact entry, exit, and position size — calculated for YOUR account. No vague calls. No "I think it'll go up." Just math.
            </p>
            <div className="space-y-3">
              {[
                ['Exact entry, stop loss, and take profit','Every level defined before you enter.'],
                ['Position size for your account','Risk is calculated — not guessed.'],
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
              <span className="text-[16px] text-white/55 mono">LATEST WINNER</span>
              <span className="text-[14px] text-[#00e5a0] mono font-bold">+${Number(win.pnl).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={'text-[16px] font-bold mono px-2 py-0.5 rounded '+(isLong?'text-black bg-[#00e5a0]':'text-black bg-[#ff4d4d]')}>{win.action}</span>
                  <span className="text-xl font-bold mono">{win.pair}</span>
                </div>
                <span className="text-[16px] text-white/65 mono">{new Date(win.entry_time).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
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
          <p className="text-[16px] text-white/65 mono tracking-[.15em] mb-2 text-center">FIT CHECK</p>
          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-10 text-center leading-tight">This isn't for everyone.</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="t p-6">
              <div className="text-[14px] mono text-[#00e5a0]/50 tracking-wider font-semibold mb-4">THIS IS FOR YOU IF</div>
              <div className="space-y-3">
                {[
                  'You want to trade crypto but don\'t have time to watch charts',
                  'You\'ve tried trading on your own and kept losing',
                  'You\'re tired of signal groups that hide their losses',
                  'You want a system with verified, auditable results',
                  'You understand that risk management matters more than win rate',
                ].map((t,i)=>(
                  <div key={i} className="flex items-start gap-2.5 text-[16px] text-white/85 leading-relaxed">
                    <span className="text-[#00e5a0]/50 mono text-[16px] mt-0.5 shrink-0">+</span>{t}
                  </div>
                ))}
              </div>
            </div>

            <div className="t p-6">
              <div className="text-[14px] mono text-[#ff4d4d]/50 tracking-wider font-semibold mb-4">THIS IS NOT FOR YOU IF</div>
              <div className="space-y-3">
                {[
                  'You\'re looking for guaranteed profits (nobody can guarantee that)',
                  'You want 50 signals a day to "scalp" with',
                  'You can\'t handle losing trades — they happen, even in profitable systems',
                  'You expect to turn $100 into $100K overnight',
                  'You won\'t follow the position sizing and risk rules',
                ].map((t,i)=>(
                  <div key={i} className="flex items-start gap-2.5 text-[16px] text-white/85 leading-relaxed">
                    <span className="text-[#ff4d4d]/50 mono text-[16px] mt-0.5 shrink-0">−</span>{t}
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
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1fr] gap-8">
            <div>
              <p className="text-[16px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">TRADING UNIVERSE</p>
              <h3 className="text-xl font-bold tracking-tight mb-5">5 pairs. 6 optimized configs.</h3>
              <div className="grid grid-cols-2 gap-2">
                {pairList.map((x,i)=>(
                  <div key={i} className="t lift p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[16px] font-bold text-white/55 mono">{x.p}</span>
                      <span className="text-[14px] text-white/55 mono">{x.n} trades</span>
                    </div>
                    <div className="text-[16px] font-bold text-[#00e5a0] mono">+${(x.pnl/1000).toFixed(1)}K</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[16px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">SYSTEM</p>
              <h3 className="text-xl font-bold tracking-tight mb-5">Built for reliability.</h3>
              <div className="t">
                <div className="divide-y divide-white/[0.02]">
                  {[
                    {l:'Market Monitoring',v:'24/7',d:'Never sleeps. Scans every candle close.'},
                    {l:'Signal Delivery',v:'< 60s',d:'From detection to your Telegram.'},
                    {l:'Risk Per Trade',v:'10%',d:'Same formula. Every single trade.'},
                    {l:'Track Record',v:totalMonths>0?Math.floor(totalMonths/12)+' yr'+(totalMonths>=24?'s':''):'—',d:totalTrades+' trades. Fully timestamped.'},
                    {l:'Hidden Fees',v:'$0',d:'What you see is what you pay.'},
                  ].map((s,i)=>(
                    <div key={i} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <div className="text-[16px] text-white/65 font-medium">{s.l}</div>
                        <div className="text-[16px] text-white/55 mt-0.5">{s.d}</div>
                      </div>
                      <div className="text-[16px] font-bold mono text-white/85 shrink-0 ml-4">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 8. PRICING ════════ */}
      <section id="pricing" className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[16px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">PRICING</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-3 leading-tight">
              Less than one winning trade.
            </h2>
            <p className="text-[16px] text-white/65 max-w-lg mx-auto">
              Our average winning trade returns +${Math.round(avgWinTrade).toLocaleString()} on a $10K account. Your subscription pays for itself on the first signal that hits.
            </p>
          </div>

          {/* Price comparison anchor */}
          <div className="t p-5 mb-6 max-w-2xl mx-auto">
            <div className="text-[14px] text-white/55 mono tracking-wider mb-3">WHAT TRADERS TYPICALLY SPEND</div>
            <div className="space-y-2">
              {[
                {n:'Trading courses',v:'$500 – $5,000',s:'One-time. No ongoing signals.'},
                {n:'Premium signal groups',v:'$200 – $500/mo',s:'Unverified. Cherry-picked results.'},
                {n:'Algo trading bots',v:'$100 – $300/mo',s:'You configure. You manage. You debug.'},
                {n:'Trading indicators',v:'$30 – $100/mo',s:'Still requires you to interpret and trade.'},
              ].map((c,i)=>(
                <div key={i} className="flex items-center justify-between text-[14px]">
                  <div className="text-white/65">{c.n}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/55 text-[16px] hidden sm:inline">{c.s}</span>
                    <span className="text-white/65 mono font-medium text-right min-w-[110px]">{c.v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="t lift">
              <div className="p-7">
                <div className="text-[16px] text-white/65 mono tracking-wider mb-4">MONTHLY</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[36px] font-bold mono">$149</span>
                  <span className="text-white/65 text-[14px]">/mo</span>
                </div>
                <div className="space-y-2.5 text-[16px] text-white/55 mb-8">
                  {['Every signal, every pair','Instant Telegram alerts','Full performance dashboard','Position sizing calculator','Cancel anytime — no lock-in'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2.5"><span className="text-[#00e5a0]/40 mono text-[16px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-3 rounded-lg border border-white/[0.08] text-white/65 text-[16px] font-bold text-center hover:border-white/[0.15] hover:text-white/85 transition-all mono tracking-wide">GET STARTED</Link>
              </div>
            </div>

            <div className="t-visible lift relative" style={{borderColor:'rgba(0,229,160,.12)'}}>
              <div className="absolute -top-2.5 right-5 px-3 py-0.5 bg-[#00e5a0] text-black text-[14px] font-bold mono tracking-wider rounded-sm z-10">SAVE $298</div>
              <div className="p-7">
                <div className="text-[16px] text-[#00e5a0]/40 mono tracking-wider mb-4">ANNUAL</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[36px] font-bold mono text-[#00e5a0]">$1,490</span>
                  <span className="text-white/65 text-[14px]">/yr</span>
                </div>
                <div className="text-[14px] text-[#00e5a0]/30 mono mb-6">2 months free</div>
                <div className="space-y-2.5 text-[16px] text-white/55 mb-8">
                  {['Everything in monthly','Priority signal delivery','Advanced analytics','Direct support channel','Early access to new features'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2.5"><span className="text-[#00e5a0]/40 mono text-[16px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-3 rounded-lg bg-[#00e5a0] text-black text-[16px] font-bold text-center hover:bg-[#00cc8e] transition-colors mono tracking-wide">GET STARTED</Link>
              </div>
            </div>
          </div>

          {/* ROI math */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="t p-5">
              <div className="text-[14px] text-white/55 mono tracking-wider mb-3">THE MATH</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[24px] font-bold mono text-white/85">$149</div>
                  <div className="text-[16px] text-white/55 mt-1">Monthly cost</div>
                </div>
                <div>
                  <div className="text-[24px] font-bold mono text-[#00e5a0]">${Math.round(avgMonthly).toLocaleString()}</div>
                  <div className="text-[16px] text-white/55 mt-1">Avg monthly profit*</div>
                </div>
                <div>
                  <div className="text-[24px] font-bold mono text-[#00e5a0]">{avgMonthly>0?Math.round(avgMonthly/149)+'x':'—'}</div>
                  <div className="text-[16px] text-white/55 mt-1">Return on subscription</div>
                </div>
              </div>
              <div className="text-[14px] text-white/55 mt-3 text-center">*Based on $10K account, 10% risk, 20x leverage. Past results don't guarantee future performance.</div>
            </div>
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 8.5. ACCOUNT SIMULATOR ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[16px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">YOUR ACCOUNT</p>
            <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-3 leading-tight">
              What these results look like at your size.
            </h2>
            <p className="text-[16px] text-white/50 max-w-lg mx-auto">
              Same signals. Same risk management. Scaled to your account.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1000, 5000, 10000, 25000, 50000].map(function(acct) {
              var multiplier = acct / 10000
              var tp = totalProfit * multiplier
              var ma = avgMonthly * multiplier
              return (
                <div key={acct} className="t p-5 text-center lift">
                  <div className="text-[14px] mono text-white/40 mb-3">${(acct/1000).toFixed(0)}K</div>
                  <div className="text-[24px] mono font-bold text-[#00e5a0] mb-1">+${Math.round(tp).toLocaleString()}</div>
                  <div className="text-[16px] mono text-white/30">${Math.round(ma).toLocaleString()}/mo avg</div>
                </div>
              )
            })}
          </div>

          <p className="text-[14px] text-white/20 text-center mt-4">Based on verified results with 10% risk per trade, 20x leverage. Past performance does not guarantee future results.</p>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 9. FAQ ════════ */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-[16px] text-white/65 mono tracking-[.15em] mb-2 text-center">FAQ</p>
          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-10 text-center leading-tight">Before you decide.</h2>

          <div className="space-y-2">
            {[
              {q:'Why is your win rate only '+Math.round(winRate)+'%?',a:'Because we use wide take profits with tight risk management. You don\'t need to win most trades — you need your winners to be bigger than your losers. Our profit factor is '+profitFactor.toFixed(2)+': for every $1 lost, we make $'+profitFactor.toFixed(2)+'. Over '+totalTrades+' trades, that turns $10K into $'+Math.round(finalBalance).toLocaleString()+'.'},
              {q:'How do I know the results are real?',a:'Every single trade is published with timestamps, entry/exit prices, P&L, and running balance. Go to our performance page and audit all '+totalTrades+' trades yourself. We show the losses too — '+redMonths+' losing month'+(redMonths!==1?'s':'')+' out of '+totalMonths+'. No other signal service does this.'},
              {q:'What if I don\'t know how to trade?',a:'Each signal tells you exactly what to do: which pair, which direction, where to enter, stop loss, and take profit. Position size is calculated for your account. If you can copy 5 numbers into an exchange, you can follow our signals.'},
              {q:'What exchange do I need?',a:'We recommend Bitget for USDT-M futures, but signals work on any exchange that supports crypto futures — Bybit, OKX, Binance, etc. The levels are the same everywhere.'},
              {q:'How many signals per month?',a:'Roughly '+Math.round(avgPerMonth)+' signals per month on average across all pairs. Quality over quantity — we only fire when the setup is there. Some weeks you\'ll get 8 signals, some weeks 2. The engine doesn\'t force trades.'},
              {q:'Can I cancel anytime?',a:'Yes. Monthly subscribers cancel anytime, no questions asked. No lock-in, no cancellation fees. If the signals don\'t pay for themselves, you shouldn\'t be paying for them.'},
            ].map((faq,i)=>(
              <div key={i} className="t p-5">
                <h3 className="text-[14px] font-semibold text-white/85 mb-2">{faq.q}</h3>
                <p className="text-[16px] text-white/50 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <div className="divider mx-6 md:mx-10"></div>


      {/* ════════ 10. FINAL CTA ════════ */}
      <section className="py-28 px-6 md:px-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.025) 0%,transparent 65%)'}}/>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="t inline-block px-8 py-3 mb-8">
            <span className="text-[36px] md:text-[44px] font-bold mono text-[#00e5a0] glow">{totalProfit>0?'+$'+Math.round(totalProfit).toLocaleString():'—'}</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold tracking-tight mb-4 leading-tight">
            Two kinds of traders read this page.
          </h2>
          <p className="text-[14px] text-white/55 mb-4 max-w-md mx-auto leading-relaxed">
            Those who keep losing money trying to figure it out alone. And those who plug into a system that's already proven it works.
          </p>
          <p className="text-[16px] text-white/65 mb-10 max-w-sm mx-auto leading-relaxed">
            The public trade log is delayed 48 hours. Subscribers get signals the instant they fire. The next one could be tonight.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Link href="/auth/signup" className="flex-1 py-4 bg-[#00e5a0] text-black rounded-lg font-bold text-[14px] hover:bg-[#00cc8e] transition-colors text-center shadow-[0_0_30px_rgba(0,229,160,.1)]">
              Start receiving signals
            </Link>
            <Link href="/performance" className="flex-1 py-4 rounded-lg text-[16px] font-semibold text-white/65 border border-white/[0.06] hover:border-white/[0.12] hover:text-white/65 transition-all text-center">
              Audit every trade
            </Link>
          </div>
        </div>
      </section>


      {/* DISCLAIMER */}
      <section className="py-8 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[14px] text-white/55 leading-relaxed">Past performance does not guarantee future results. Trading crypto with leverage involves substantial risk of loss. All results from verified historical data. PulseWave Labs provides signals for informational purposes only. Not a registered investment advisor. <Link href="/disclaimer" className="underline hover:text-white/55 transition-colors">Full risk disclosure</Link>.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><img src="/logo.webp" alt="PulseWave" className="h-4 opacity-20"/><span className="text-[16px] text-white/55">© 2026 PulseWave Labs</span></div>
          <div className="flex gap-6 text-[16px] text-white/55">
            <Link href="/performance" className="hover:text-white/55 transition-colors">Trades</Link>
            <Link href="/privacy" className="hover:text-white/55 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/55 transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white/55 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
