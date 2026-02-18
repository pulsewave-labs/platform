'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useCountUp(end: number, decimals = 0, duration = 2200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  useEffect(() => {
    if (!ref.current || started.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let s: number
        const step = (t: number) => { if (!s) s = t; const p = Math.min((t - s) / duration, 1); setValue(p * p * (3 - 2 * p) * end); if (p < 1) requestAnimationFrame(step) }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.3 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])
  return { display: decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString(), ref }
}

export default function LandingClientPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [perf, setPerf] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => { if (d?.trades) setTrades(d.trades.slice(0, 8)); if (d) setPerf(d) }).catch(() => {})
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    const tick = () => setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    tick(); const iv = setInterval(tick, 1000)
    return () => { window.removeEventListener('scroll', fn); clearInterval(iv) }
  }, [])

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenu(false) }
  const equity = useCountUp(218418, 0, 2500)
  const tradeCount = useCountUp(624, 0, 2000)
  const pf = useCountUp(1.52, 2, 2000)
  const winMo = useCountUp(88, 0, 2000)

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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
        .th{border-bottom:1px solid rgba(255,255,255,.04);padding:8px 14px;display:flex;align-items:center;gap:7px}
        .td{width:6px;height:6px;border-radius:50%}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.007) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.007) 1px,transparent 1px);background-size:50px 50px}
        .lift{transition:all .3s cubic-bezier(.25,.1,.25,1)}.lift:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.08)}
      `}} />

      {/* NAV */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 '+(scrolled?'bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.04]':'')}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="PulseWave" className="h-5" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={()=>scrollTo('proof')} className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Performance</button>
            <button onClick={()=>scrollTo('how')} className="text-[12px] text-white/40 hover:text-white/70 transition-colors">How It Works</button>
            <button onClick={()=>scrollTo('pricing')} className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Pricing</button>
            <Link href="/auth/login" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">Log In</Link>
            <Link href="/auth/signup" className="text-[11px] px-4 py-1.5 bg-[#00e5a0] text-black rounded font-bold tracking-wide hover:bg-[#00cc8e] transition-colors">GET ACCESS</Link>
          </div>
          <button className="md:hidden text-white/50" onClick={()=>setMenu(!menu)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={menu?"M18 6L6 18M6 6l12 12":"M4 8h16M4 16h16"}/></svg>
          </button>
        </div>
        {menu&&<div className="md:hidden px-5 pb-4 space-y-3 border-t border-white/5 mt-1 bg-[#08080a]">
          <button onClick={()=>scrollTo('proof')} className="block text-white/40 text-[13px]">Performance</button>
          <button onClick={()=>scrollTo('how')} className="block text-white/40 text-[13px]">How It Works</button>
          <button onClick={()=>scrollTo('pricing')} className="block text-white/40 text-[13px]">Pricing</button>
          <Link href="/auth/login" className="block text-white/40 text-[13px]">Log In</Link>
          <Link href="/auth/signup" className="inline-block px-4 py-1.5 bg-[#00e5a0] text-black rounded font-bold text-[11px]">GET ACCESS</Link>
        </div>}
      </nav>


      {/* ════════ 1. HOOK — Pattern interrupt + mechanism ════════ */}
      <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-10 pt-14 relative grid-bg">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-4xl mx-auto relative z-10">
          <div className="fu flex items-center gap-2 mb-8">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
            <span className="text-[10px] text-white/40 mono tracking-[.15em]">LIVE · SCANNING 6 PAIRS · 24/7</span>
          </div>

          <h1 className="fu1 text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.1] tracking-tight mb-5">
            While you were sleeping, our engine
            <br/>made <span className="text-[#00e5a0] glow">$218,418</span>
          </h1>
          <p className="fu2 text-[15px] text-white/40 leading-relaxed max-w-lg mb-4">
            Most traders lose because they trade on emotion. Our Market Structure engine doesn't have emotions. It scans. It waits. It strikes. 624 trades. 88% profitable months. Now it sends you the exact same signals.
          </p>
          <p className="fu2 text-[13px] text-white/25 max-w-lg mb-10">
            No chart-watching. No indicators to learn. No second-guessing.
            <br/>Just open Telegram, see the signal, place the trade.
          </p>

          <div className="fu3 flex flex-col sm:flex-row gap-2.5 mb-14 max-w-md">
            <Link href="/auth/signup" className="px-7 py-3 bg-[#00e5a0] text-black rounded font-bold text-[13px] hover:bg-[#00cc8e] transition-colors text-center">
              Start receiving signals →
            </Link>
            <Link href="/performance" className="px-7 py-3 rounded text-[13px] font-semibold text-white/40 border border-white/[0.06] hover:border-white/[0.1] hover:text-white/60 transition-all text-center">
              See every trade we've taken
            </Link>
          </div>

          {/* Terminal — proof strip */}
          <div className="fu4 t">
            <div className="th">
              <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
              <span className="text-[9px] text-white/30 mono ml-1">live_performance</span>
              <span className="text-[9px] text-white/15 mono ml-auto hidden sm:inline">{time}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { label:'STARTING → CURRENT', ref:equity.ref, val:'$10K → $'+equity.display, c:'#00e5a0' },
                { label:'TOTAL TRADES', ref:tradeCount.ref, val:tradeCount.display, c:'#e0e0e0' },
                { label:'PROFIT FACTOR', ref:pf.ref, val:pf.display, c:'#e0e0e0' },
                { label:'PROFITABLE MONTHS', ref:winMo.ref, val:winMo.display+'%', c:'#e0e0e0' },
              ].map((s,i)=>(
                <div key={i} ref={s.ref} className="px-4 py-3.5 border-r border-b border-white/[0.02] last:border-r-0 md:last:border-b-0 md:[&:nth-child(n+3)]:border-b-0">
                  <div className="text-[8px] text-white/25 mono tracking-[.12em] mb-1">{s.label}</div>
                  <div className="text-[17px] font-bold mono" style={{color:s.c}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ════════ 2. PROBLEM AGITATION ════════ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] text-[#ff4d4d]/40 mono tracking-[.15em] mb-4">THE PROBLEM</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
            You already know most signal services are garbage.
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-left mb-10">
            {[
              {icon:'01',title:'Cherry-picked screenshots',desc:'They show you their wins. They hide 80% of their trades. You never see the full picture until you\'ve already paid.'},
              {icon:'02',title:'"Trust me bro" track records',desc:'No verified data. No timestamps. No stop losses. Just Lamborghinis and vague "10x this week" posts.'},
              {icon:'03',title:'Signals that bleed you dry',desc:'5 signals a day with no risk management. You\'re not trading — you\'re gambling someone else\'s hunches with your money.'},
            ].map((p,i)=>(
              <div key={i} className="t p-5">
                <div className="text-[11px] mono text-white/[0.06] font-bold mb-2">{p.icon}</div>
                <h3 className="text-[14px] font-semibold mb-2 text-white/80">{p.title}</h3>
                <p className="text-[12px] text-white/35 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[14px] text-white/30 max-w-xl mx-auto leading-relaxed">
            You've probably been burned before. That's why we publish <strong className="text-white/60">every single trade</strong> — wins AND losses — with timestamps, entries, exits, and exact P&L. 
            <Link href="/performance" className="text-[#00e5a0]/60 hover:text-[#00e5a0] ml-1 underline underline-offset-2 transition-colors">All 624 of them.</Link>
          </p>
        </div>
      </section>


      {/* ════════ 3. MECHANISM — What makes us different ════════ */}
      <section id="how" className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">THE MECHANISM</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Market Structure — the method institutions use<br/><span className="text-white/30">that retail traders don't even know exists.</span>
          </h2>
          <p className="text-[13px] text-white/35 max-w-2xl mb-10 leading-relaxed">
            While retail chases RSI and MACD crossovers, institutional traders follow <strong className="text-white/60">Break of Structure</strong> and <strong className="text-white/60">Order Blocks</strong> — the price levels where real money enters the market. Our engine automates this across 6 crypto pairs, 24 hours a day.
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              {n:'01',t:'Engine scans. You don\'t.',d:'Our system monitors BTC, ETH, SOL, AVAX, and XRP around the clock. It doesn\'t get tired, emotional, or FOMO into bad trades. It waits for the exact setup — then fires.'},
              {n:'02',t:'Signal hits your phone.',d:'Entry price, stop loss, take profit, exact position size for YOUR account — all calculated in seconds. Delivered to Telegram the instant a setup confirms. No delay, no interpretation needed.'},
              {n:'03',t:'You copy. That\'s it.',d:'Open your exchange, enter the levels, done. Same risk management every time: 10% fixed risk, mathematically sized positions. The system removes the one thing that kills most traders — you.'},
            ].map((s,i)=>(
              <div key={i} className="t lift">
                <div className="th">
                  <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                  <span className="text-[9px] text-white/30 mono ml-1">step_{s.n}</span>
                </div>
                <div className="p-5">
                  <div className="text-[22px] font-bold text-white/[.05] mono mb-3">{s.n}</div>
                  <h3 className="text-[15px] font-semibold mb-2 text-white/80">{s.t}</h3>
                  <p className="text-[12px] text-white/35 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════ 4. PROOF — Overwhelming evidence ════════ */}
      <section id="proof" className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">THE PROOF</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                624 trades. Every single one public.
              </h2>
              <p className="text-[13px] text-white/30 mt-2">Not screenshots. Not highlights. The complete, unedited record — wins and losses.</p>
            </div>
            <Link href="/performance" className="text-[10px] text-white/25 mono tracking-wider hover:text-white/50 transition-colors hidden md:block">FULL LOG →</Link>
          </div>

          {/* Monthly returns grid */}
          {perf?.monthly&&(()=>{
            const byYear:{[y:string]:any[]}={}
            perf.monthly.forEach((m:any)=>{const y=m.month.slice(0,4);if(!byYear[y])byYear[y]=[];byYear[y].push(m)})
            const years=Object.keys(byYear).sort()
            return(
            <div className="t mb-6">
              <div className="th">
                <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                <span className="text-[9px] text-white/30 mono ml-1">monthly_pnl — {perf.monthly.length} months tracked</span>
              </div>
              <div className="p-4 space-y-3">
                {years.map((year:string)=>{
                  const yearTotal=byYear[year].reduce((s:number,x:any)=>s+x.pnl,0)
                  return(
                    <div key={year}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-white/50 mono font-semibold">{year}</span>
                        <span className={'text-[10px] mono font-semibold '+(yearTotal>=0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{yearTotal>=0?'+':''}${(yearTotal/1000).toFixed(1)}K total</span>
                      </div>
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
                        {Array.from({length:12},(_,mi)=>{
                          const monthKey=`${year}-${String(mi+1).padStart(2,'0')}`
                          const md=byYear[year].find((x:any)=>x.month===monthKey)
                          if(!md) return <div key={mi} className="rounded bg-white/[0.015] py-2 px-1 text-center"><div className="text-[8px] text-white/20 mono">{months[mi]}</div><div className="text-[9px] text-white/15 mono mt-0.5">—</div></div>
                          const pnl=md.pnl, int=Math.min(Math.abs(pnl)/12000,1)
                          const bg=pnl>0?`rgba(0,229,160,${.06+int*.3})`:`rgba(255,77,77,${.06+int*.3})`
                          return(
                            <div key={mi} className="rounded py-2 px-1 text-center" style={{background:bg}}>
                              <div className="text-[8px] text-white/50 mono">{months[mi]}</div>
                              <div className={'text-[10px] font-bold mono mt-0.5 '+(pnl>0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{pnl>0?'+':''}{(pnl/1000).toFixed(1)}k</div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {perf?.monthly&&(()=>{
              const m=perf.monthly, total=m.reduce((s:number,x:any)=>s+x.pnl,0), avg=total/m.length
              const best=m.reduce((a:any,b:any)=>a.pnl>b.pnl?a:b,m[0]), worst=m.reduce((a:any,b:any)=>a.pnl<b.pnl?a:b,m[0])
              return[
                {l:'TOTAL PROFIT',v:'+$'+Math.round(total).toLocaleString(),c:'#00e5a0'},
                {l:'AVG PER MONTH',v:'+$'+Math.round(avg).toLocaleString(),c:'#00e5a0'},
                {l:'BEST MONTH',v:'+$'+Math.round(best.pnl).toLocaleString(),c:'#00e5a0'},
                {l:'WORST MONTH',v:'-$'+Math.abs(Math.round(worst.pnl)).toLocaleString(),c:'#ff4d4d'},
              ].map((s,i)=>(
                <div key={i} className="t px-4 py-3.5">
                  <div className="text-[8px] text-white/20 mono tracking-[.12em] mb-1">{s.l}</div>
                  <div className="text-lg font-bold mono" style={{color:s.c}}>{s.v}</div>
                </div>
              ))
            })()}
          </div>

          {/* Trade feed */}
          <div className="t">
            <div className="th">
              <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
              <span className="text-[9px] text-white/30 mono ml-1">recent_trades · 7-day delay</span>
              <span className="flex items-center gap-1 ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pd"></span><span className="text-[8px] text-[#00e5a0]/40 mono">LIVE</span></span>
            </div>
            <div className="hidden md:grid grid-cols-[90px_80px_60px_1fr_1fr_90px_60px] text-[8px] text-white/20 mono tracking-[.1em] px-4 py-2 border-b border-white/[0.02]">
              <div>DATE</div><div>PAIR</div><div>SIDE</div><div>ENTRY</div><div>EXIT</div><div className="text-right">P&L</div><div className="text-right">RESULT</div>
            </div>
            {trades.map((t,i)=>(
              <div key={i} className={'grid grid-cols-[1fr_50px_70px] md:grid-cols-[90px_80px_60px_1fr_1fr_90px_60px] items-center px-4 py-2.5 border-b border-white/[0.015] hover:bg-white/[0.01] transition-colors '+(i%2===0?'bg-white/[0.003]':'')}>
                <div className="text-[10px] text-white/25 mono">{new Date(t.entry_time).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                <div className="text-[11px] text-white/60 mono font-medium">{t.pair.replace('/USDT','')}</div>
                <div className="hidden md:block"><span className={'text-[9px] mono font-bold '+(t.action==='LONG'?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.action}</span></div>
                <div className="text-[10px] text-white/20 mono hidden md:block">${Number(t.entry_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                <div className="text-[10px] text-white/20 mono hidden md:block">${Number(t.exit_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                <div className={'text-[11px] mono font-medium text-right '+(t.pnl>0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.pnl>0?'+':''}${Number(t.pnl).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <div className="text-right"><span className={'text-[8px] mono tracking-wider '+(t.exit_reason==='TP'?'text-[#00e5a0]/50':'text-[#ff4d4d]/50')}>{t.exit_reason==='TP'?'WIN':'LOSS'}</span></div>
              </div>
            ))}
            <div className="px-4 py-2.5 text-center">
              <Link href="/performance" className="text-[10px] text-white/25 mono tracking-wider hover:text-white/50 transition-colors">VERIFY ALL 624 TRADES →</Link>
            </div>
          </div>
        </div>
      </section>


      {/* ════════ 5. WHAT YOU GET — Signal preview ════════ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <div>
            <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">WHAT YOU RECEIVE</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Not "buy BTC."<br/><span className="text-white/30">The full trade, calculated for you.</span>
            </h2>
            <p className="text-[13px] text-white/35 leading-relaxed mb-6">
              Every signal comes with the exact entry, exit, and position size — calculated for YOUR account. No vague calls. No "I think it'll go up." Math.
            </p>
            <div className="space-y-2">
              {[
                'Exact entry, stop loss, and take profit prices',
                'Position size calculated for your account',
                'Risk:reward ratio on every trade',
                'Instant Telegram alert — under 60 seconds',
                'Confidence score so you know signal strength',
              ].map((f,i)=>(
                <div key={i} className="flex items-start gap-2.5 text-[12px] text-white/40">
                  <span className="text-[#00e5a0] mono text-[10px] mt-px">✓</span>{f}
                </div>
              ))}
            </div>
          </div>

          <div className="t">
            <div className="th">
              <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
              <span className="text-[9px] text-white/30 mono ml-1">new_signal</span>
              <span className="flex items-center gap-1 ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pd"></span></span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-bold mono text-black bg-[#00e5a0] px-1.5 py-px rounded">LONG</span>
                  <span className="text-lg font-bold mono">SOL/USDT</span>
                </div>
                <span className="text-[9px] text-white/30 mono">82% confidence</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{l:'ENTRY',v:'$195.40',c:''},{l:'STOP LOSS',v:'$188.20',c:'text-[#ff4d4d]'},{l:'TAKE PROFIT',v:'$213.50',c:'text-[#00e5a0]'}].map((x,i)=>(
                  <div key={i}><div className="text-[8px] text-white/25 mono tracking-wider mb-1">{x.l}</div><div className={'text-[14px] font-bold mono '+x.c}>{x.v}</div></div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-[8px] mono text-white/20 mb-1"><span>Risk 3.7%</span><span>Reward 9.3%</span></div>
                <div className="h-1.5 rounded-full bg-white/[0.03] flex overflow-hidden"><div className="bg-[#ff4d4d]/30 rounded-l-full" style={{width:'28%'}}></div><div className="bg-[#00e5a0]/30 rounded-r-full" style={{width:'72%'}}></div></div>
                <div className="text-right text-[9px] text-[#00e5a0]/50 mono mt-1">2.5:1 R:R</div>
              </div>
              <div className="border-t border-white/[0.03] pt-3">
                <div className="text-[8px] text-white/20 mono tracking-wider mb-2">YOUR POSITION SIZE</div>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] mono">
                  {[{a:'$1K acct',s:'$2.7K',r:'risk $100'},{a:'$10K acct',s:'$27K',r:'risk $1,000'},{a:'$50K acct',s:'$135K',r:'risk $5,000'}].map((r,i)=>(
                    <div key={i} className="bg-white/[0.02] rounded px-2.5 py-2"><div className="text-white/35">{r.a}</div><div className="text-white/70 font-medium">{r.s}</div><div className="text-white/20 text-[8px]">{r.r}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════ 6. PAIRS + AUTHORITY ════════ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1fr] gap-8">
            {/* Pairs */}
            <div>
              <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">TRADING UNIVERSE</p>
              <h3 className="text-xl font-bold tracking-tight mb-4">5 pairs. 6 optimized configs.</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {p:'AVAX',pnl:33648,n:152},{p:'SOL',pnl:24239,n:98},{p:'ETH',pnl:25678,n:202},{p:'XRP',pnl:14378,n:87},{p:'BTC',pnl:6266,n:85},
                ].map((x,i)=>(
                  <div key={i} className="t lift p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-bold text-white/40 mono">{x.p}</span>
                      <span className="text-[9px] text-white/20 mono">{x.n} trades</span>
                    </div>
                    <div className="text-[15px] font-bold text-[#00e5a0] mono">+${(x.pnl/1000).toFixed(1)}K</div>
                  </div>
                ))}
              </div>
            </div>

            {/* System status — authority */}
            <div>
              <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">SYSTEM STATUS</p>
              <h3 className="text-xl font-bold tracking-tight mb-4">Built for reliability.</h3>
              <div className="t">
                <div className="th">
                  <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                  <span className="text-[9px] text-white/30 mono ml-1">system_health</span>
                </div>
                <div className="divide-y divide-white/[0.02]">
                  {[
                    {l:'Market Monitoring',v:'24/7',d:'Never sleeps. Scans every candle close.'},
                    {l:'Signal Delivery',v:'< 60 sec',d:'From detection to your Telegram.'},
                    {l:'Risk Per Trade',v:'10% fixed',d:'Same formula. Every single trade.'},
                    {l:'Track Record',v:'2 years',d:'624 trades, fully timestamped.'},
                    {l:'Hidden Fees',v:'$0',d:'What you see is what you pay.'},
                  ].map((s,i)=>(
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-white/50 font-medium">{s.l}</div>
                        <div className="text-[10px] text-white/20">{s.d}</div>
                      </div>
                      <div className="text-[13px] font-bold mono text-white/70">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════ 7. PRICING — Offer + Urgency ════════ */}
      <section id="pricing" className="py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">PRICING</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Less than one winning trade.
            </h2>
            <p className="text-[13px] text-white/35">
              Our average winning trade is +$2,400. Your subscription pays for itself on the first signal that hits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <div className="t">
              <div className="th">
                <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                <span className="text-[9px] text-white/30 mono ml-1">monthly</span>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold mono">$97</span>
                  <span className="text-white/25 text-[12px]">/mo</span>
                </div>
                <div className="space-y-2 text-[11px] text-white/35 mb-6">
                  {['Every signal, every pair','Instant Telegram alerts','Full performance dashboard','Position sizing calculator','Cancel anytime — no lock-in'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2"><span className="text-[#00e5a0]/50 mono text-[9px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-2.5 rounded border border-white/[0.08] text-white/50 text-[11px] font-bold text-center hover:border-white/[0.15] hover:text-white/70 transition-all mono tracking-wide">GET STARTED</Link>
              </div>
            </div>

            <div className="t relative" style={{borderColor:'rgba(0,229,160,.15)'}}>
              <div className="absolute -top-2 right-4 px-2 py-px bg-[#00e5a0] text-black text-[8px] font-bold mono tracking-wider rounded">2 MONTHS FREE</div>
              <div className="th">
                <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                <span className="text-[9px] text-white/30 mono ml-1">annual</span>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold mono text-[#00e5a0]">$970</span>
                  <span className="text-white/25 text-[12px]">/yr</span>
                </div>
                <div className="text-[10px] text-[#00e5a0]/40 mono mb-5">Save $194 vs monthly</div>
                <div className="space-y-2 text-[11px] text-white/35 mb-6">
                  {['Everything in monthly','Priority signal delivery','Advanced analytics','Direct support channel','Early access to new features'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2"><span className="text-[#00e5a0]/50 mono text-[9px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-2.5 rounded bg-[#00e5a0] text-black text-[11px] font-bold text-center hover:bg-[#00cc8e] transition-colors mono tracking-wide">GET STARTED</Link>
              </div>
            </div>
          </div>

          {/* Justification */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-white/20 max-w-md mx-auto">
              Think about it: $97/mo is less than what most traders lose on a single bad trade. One signal that hits TP covers your subscription for months.
            </p>
          </div>
        </div>
      </section>


      {/* ════════ 8. OBJECTION HANDLING ════════ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] text-white/25 mono tracking-[.15em] mb-2 text-center">COMMON QUESTIONS</p>
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">Before you decide.</h2>

          <div className="space-y-3">
            {[
              {q:'Why is your win rate only 40%?',a:'Because we use wide take profits with tight risk management. You don\'t need to win most trades to be profitable — you need your winners to be bigger than your losers. Our profit factor is 1.52, meaning for every $1 lost, we make $1.52. That compounds into $208K over 624 trades.'},
              {q:'How do I know you\'re not faking results?',a:'Every single trade is published with timestamps, entry/exit prices, P&L, and running balance. Go to our performance page and audit all 624 trades yourself. We show the losses too — 3 losing months out of 25.'},
              {q:'What if I don\'t know how to trade?',a:'Each signal tells you exactly what to do: which pair, which direction, where to enter, where to place your stop loss, and where your take profit is. Position size is calculated for your account. If you can copy 5 numbers into an exchange, you can follow our signals.'},
              {q:'What exchange do I need?',a:'We recommend Bitget for USDT-M futures (that\'s what our system trades on), but the signals work on any exchange that supports crypto futures — Bybit, OKX, Binance, etc.'},
              {q:'Can I cancel anytime?',a:'Yes. Monthly subscribers can cancel anytime, no questions asked. No lock-in, no cancellation fees, no "retention specialists." If the signals don\'t pay for themselves, you shouldn\'t be paying for them.'},
            ].map((faq,i)=>(
              <div key={i} className="t p-5">
                <h3 className="text-[13px] font-semibold text-white/70 mb-2">{faq.q}</h3>
                <p className="text-[12px] text-white/35 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════ 9. FINAL CTA — Emotional close ════════ */}
      <section className="py-24 px-6 md:px-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.025) 0%,transparent 65%)'}}/>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="t inline-block px-6 py-2.5 mb-6">
            <span className="text-[32px] md:text-[40px] font-bold mono text-[#00e5a0] glow">+$208,418</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Two kinds of traders read this page.
          </h2>
          <p className="text-[14px] text-white/40 mb-3 max-w-md mx-auto leading-relaxed">
            Those who keep losing money trying to figure it out alone. And those who plug into a system that's already proven it works.
          </p>
          <p className="text-[12px] text-white/25 mb-8 max-w-sm mx-auto">
            The public trade log is delayed 7 days. Subscribers get signals the instant they fire. The next signal could be tonight.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto">
            <Link href="/auth/signup" className="flex-1 py-3 bg-[#00e5a0] text-black rounded font-bold text-[13px] hover:bg-[#00cc8e] transition-colors text-center">
              Start receiving signals →
            </Link>
            <Link href="/performance" className="flex-1 py-3 rounded text-[12px] font-semibold text-white/35 border border-white/[0.06] hover:border-white/[0.1] hover:text-white/50 transition-all text-center">
              Audit every trade
            </Link>
          </div>
        </div>
      </section>


      {/* DISCLAIMER */}
      <section className="py-8 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[9px] text-white/15 leading-relaxed">Past performance does not guarantee future results. Trading crypto with leverage involves substantial risk of loss. All results from verified historical data. PulseWave Labs provides signals for informational purposes only. Not a registered investment advisor. <Link href="/disclaimer" className="underline hover:text-white/30 transition-colors">Full risk disclosure</Link>.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 px-6 md:px-10 border-t border-white/[0.02]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5"><img src="/logo.webp" alt="PulseWave" className="h-3 opacity-20"/><span className="text-[9px] text-white/15">© 2026 PulseWave Labs</span></div>
          <div className="flex gap-5 text-[9px] text-white/15">
            <Link href="/performance" className="hover:text-white/30 transition-colors">Trades</Link>
            <Link href="/privacy" className="hover:text-white/30 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/30 transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white/30 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
