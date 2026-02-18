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

  return (
    <div className="min-h-screen bg-[#08080a] text-[#c8c8c8] overflow-x-hidden antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .7s ease-out forwards}.fu1{animation:fadeUp .7s ease-out .1s forwards;opacity:0}.fu2{animation:fadeUp .7s ease-out .2s forwards;opacity:0}.fu3{animation:fadeUp .7s ease-out .3s forwards;opacity:0}.fu4{animation:fadeUp .7s ease-out .4s forwards;opacity:0}
        @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}.blink{animation:blink 1.2s step-end infinite}
        @keyframes pd{0%,100%{opacity:.35}50%{opacity:1}}.pd{animation:pd 2s ease-in-out infinite}
        .glow{text-shadow:0 0 60px rgba(0,229,160,.12)}
        .t{background:#0a0a0c;border:1px solid rgba(255,255,255,.04);border-radius:10px;overflow:hidden}
        .th{border-bottom:1px solid rgba(255,255,255,.04);padding:8px 14px;display:flex;align-items:center;gap:7px}
        .td{width:6px;height:6px;border-radius:50%}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.007) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.007) 1px,transparent 1px);background-size:50px 50px}
        .lift{transition:all .3s cubic-bezier(.25,.1,.25,1)}.lift:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.06)}
      `}} />

      {/* NAV */}
      <nav className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 '+(scrolled?'bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.04]':'')}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="PulseWave" className="h-5" />
            <span className="hidden md:inline text-[9px] text-white/70 mono tracking-[.2em] mt-px">SIGNAL ENGINE</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={()=>scrollTo('proof')} className="text-[12px] text-white/70 hover:text-white/70 transition-colors">Performance</button>
            <button onClick={()=>scrollTo('how')} className="text-[12px] text-white/70 hover:text-white/70 transition-colors">How It Works</button>
            <button onClick={()=>scrollTo('pricing')} className="text-[12px] text-white/70 hover:text-white/70 transition-colors">Pricing</button>
            <Link href="/auth/login" className="text-[12px] text-white/70 hover:text-white/70 transition-colors">Log In</Link>
            <Link href="/auth/signup" className="text-[11px] px-4 py-1.5 bg-[#00e5a0] text-black rounded font-bold tracking-wide hover:bg-[#00cc8e] transition-colors">GET ACCESS</Link>
          </div>
          <button className="md:hidden text-white/60" onClick={()=>setMenu(!menu)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={menu?"M18 6L6 18M6 6l12 12":"M4 8h16M4 16h16"}/></svg>
          </button>
        </div>
        {menu&&<div className="md:hidden px-5 pb-4 space-y-3 border-t border-white/5 mt-1 bg-[#08080a]">
          <button onClick={()=>scrollTo('proof')} className="block text-white/55 text-[13px]">Performance</button>
          <button onClick={()=>scrollTo('how')} className="block text-white/55 text-[13px]">How It Works</button>
          <button onClick={()=>scrollTo('pricing')} className="block text-white/55 text-[13px]">Pricing</button>
          <Link href="/auth/login" className="block text-white/55 text-[13px]">Log In</Link>
          <Link href="/auth/signup" className="inline-block px-4 py-1.5 bg-[#00e5a0] text-black rounded font-bold text-[11px]">GET ACCESS</Link>
        </div>}
      </nav>


      {/* ════════════ HERO ════════════ */}
      <section className="min-h-[100svh] flex flex-col items-center justify-center px-5 md:px-8 pt-14 relative grid-bg">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-3xl mx-auto relative z-10">
          {/* Status bar */}
          <div className="fu flex items-center gap-2 mb-8">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
            <span className="text-[10px] text-white/60 mono tracking-[.15em]">LIVE ENGINE · MARKET STRUCTURE · 6 PAIRS</span>
          </div>

          {/* Headline */}
          <h1 className="fu1 text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.1] tracking-tight mb-4">
            The signals that turned $10K<br/>into <span className="text-[#00e5a0] glow">$218,418</span>
          </h1>
          <p className="fu2 text-[15px] text-white/70 leading-relaxed max-w-md mb-10">
            Institutional Market Structure analysis across 6 crypto pairs. 2 years of verified results. Now delivering signals to you.
          </p>

          {/* CTA row */}
          <div className="fu3 flex flex-col sm:flex-row gap-2.5 mb-14 max-w-sm">
            <Link href="/auth/signup" className="px-7 py-3 bg-[#00e5a0] text-black rounded font-bold text-[13px] hover:bg-[#00cc8e] transition-colors text-center">
              Get signals — $97/mo
            </Link>
            <Link href="/performance" className="px-7 py-3 rounded text-[13px] font-semibold text-white/55 border border-white/[0.06] hover:border-white/[0.1] hover:text-white/65 transition-all text-center">
              View trade log
            </Link>
          </div>

          {/* Hero terminal — live stats */}
          <div className="fu4 t">
            <div className="th">
              <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
              <span className="text-[9px] text-white/55 mono ml-1">performance_summary</span>
              <span className="text-[9px] text-white/8 mono ml-auto hidden sm:inline">{time}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { label:'EQUITY', ref:equity.ref, val:'$'+equity.display, c:'#00e5a0' },
                { label:'TRADES', ref:tradeCount.ref, val:tradeCount.display, c:'#c8c8c8' },
                { label:'PROFIT FACTOR', ref:pf.ref, val:pf.display, c:'#c8c8c8' },
                { label:'WIN MONTHS', ref:winMo.ref, val:winMo.display+'%', c:'#c8c8c8' },
              ].map((s,i)=>(
                <div key={i} ref={s.ref} className="px-4 py-3.5 border-r border-b border-white/[0.02] last:border-r-0 md:[&:nth-child(n+3)]:border-b-0 [&:nth-child(n+3)]:border-b-0 md:[&:nth-child(n+3)]:border-b md:[&:nth-child(4)]:border-b-0">
                  <div className="text-[8px] text-white/55 mono tracking-[.15em] mb-1">{s.label}</div>
                  <div className="text-[18px] font-bold mono" style={{color:s.c}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ════════════ PROOF ════════════ */}
      <section id="proof" className="py-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">VERIFIED RESULTS</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Every month. Every trade.</h2>
            </div>
            <Link href="/performance" className="text-[10px] text-white/55 mono tracking-wider hover:text-white/55 transition-colors hidden md:block">FULL TRADE LOG →</Link>
          </div>

          {/* Monthly heatmap */}
          {perf?.monthly&&(()=>{
            const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            const byYear:{[y:string]:any[]}={}
            perf.monthly.forEach((m:any)=>{const y=m.month.slice(0,4);if(!byYear[y])byYear[y]=[];byYear[y].push(m)})
            const years=Object.keys(byYear).sort()
            return(
            <div className="t mb-8">
              <div className="th">
                <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                <span className="text-[9px] text-white/55 mono ml-1">monthly_returns — {perf.monthly.length} months</span>
              </div>
              <div className="p-4 space-y-3">
                {years.map((year:string)=>{
                  const yearTotal=byYear[year].reduce((s:number,x:any)=>s+x.pnl,0)
                  return(
                    <div key={year}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-white/50 mono font-semibold">{year}</span>
                        <span className={'text-[10px] mono font-semibold '+(yearTotal>=0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{yearTotal>=0?'+':''}${(yearTotal/1000).toFixed(1)}K</span>
                      </div>
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
                        {Array.from({length:12},(_,mi)=>{
                          const monthKey=`${year}-${String(mi+1).padStart(2,'0')}`
                          const md=byYear[year].find((x:any)=>x.month===monthKey)
                          if(!md) return <div key={mi} className="rounded bg-white/[0.01] py-2 px-1 text-center"><div className="text-[8px] text-white/15 mono">{months[mi]}</div><div className="text-[9px] text-white/10 mono mt-0.5">—</div></div>
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
                <div className="flex gap-4 mt-2 text-[9px] text-white/40 mono">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#00e5a0]/20"></span>Profit</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#ff4d4d]/20"></span>Loss</span>
                  <span className="text-white/15">|</span>
                  <span>22 green · 3 red</span>
                </div>
              </div>
            </div>
            )
          })()}

          {/* Summary stats */}
          {perf?.monthly&&(()=>{
            const m=perf.monthly, total=m.reduce((s:number,x:any)=>s+x.pnl,0), avg=total/m.length
            const best=m.reduce((a:any,b:any)=>a.pnl>b.pnl?a:b,m[0]), worst=m.reduce((a:any,b:any)=>a.pnl<b.pnl?a:b,m[0])
            return(
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
                {[
                  {l:'TOTAL P&L',v:'+$'+Math.round(total).toLocaleString(),c:'#00e5a0'},
                  {l:'AVG MONTHLY',v:'+$'+Math.round(avg).toLocaleString(),c:'#00e5a0'},
                  {l:'BEST MONTH',v:'+$'+Math.round(best.pnl).toLocaleString(),c:'#00e5a0'},
                  {l:'WORST MONTH',v:'-$'+Math.abs(Math.round(worst.pnl)).toLocaleString(),c:'#ff4d4d'},
                ].map((s,i)=>(
                  <div key={i} className="t px-4 py-3.5">
                    <div className="text-[8px] text-white/70 mono tracking-[.12em] mb-1">{s.l}</div>
                    <div className="text-lg font-bold mono" style={{color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Live trade feed */}
          <div className="t">
            <div className="th">
              <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
              <span className="text-[9px] text-white/55 mono ml-1">recent_executions · 7-day delay</span>
              <span className="flex items-center gap-1 ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pd"></span><span className="text-[8px] text-[#00e5a0]/30 mono">LIVE</span></span>
            </div>
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[90px_80px_60px_1fr_1fr_90px_60px] text-[8px] text-white/70 mono tracking-[.1em] px-4 py-2 border-b border-white/[0.02]">
              <div>DATE</div><div>PAIR</div><div>SIDE</div><div>ENTRY</div><div>EXIT</div><div className="text-right">P&L</div><div className="text-right">RESULT</div>
            </div>
            {trades.map((t,i)=>(
              <div key={i} className={'grid grid-cols-[1fr_50px_70px] md:grid-cols-[90px_80px_60px_1fr_1fr_90px_60px] items-center px-4 py-2.5 border-b border-white/[0.015] hover:bg-white/[0.01] transition-colors '+(i%2===0?'bg-white/[0.003]':'')}>
                <div className="text-[10px] text-white/55 mono">{new Date(t.entry_time).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
                <div className="text-[11px] text-white/65 mono font-medium">{t.pair.replace('/USDT','')}</div>
                <div className="hidden md:block"><span className={'text-[9px] mono font-bold '+(t.action==='LONG'?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.action}</span></div>
                <div className="text-[10px] text-white/55 mono hidden md:block">${Number(t.entry_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                <div className="text-[10px] text-white/55 mono hidden md:block">${Number(t.exit_price).toLocaleString(undefined,{maximumFractionDigits:2})}</div>
                <div className={'text-[11px] mono font-medium text-right '+(t.pnl>0?'text-[#00e5a0]':'text-[#ff4d4d]')}>{t.pnl>0?'+':''}${Number(t.pnl).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                <div className="text-right"><span className={'text-[8px] mono tracking-wider '+(t.exit_reason==='TP'?'text-[#00e5a0]/35':'text-[#ff4d4d]/35')}>{t.exit_reason==='TP'?'WIN':'LOSS'}</span></div>
              </div>
            ))}
            <div className="px-4 py-2.5 text-center">
              <Link href="/performance" className="text-[10px] text-white/55 mono tracking-wider hover:text-white/55 transition-colors">VIEW ALL TRADES →</Link>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how" className="py-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">HOW IT WORKS</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10">
            Scan. Signal. Execute.
          </h2>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              {n:'01',t:'Engine scans 24/7',d:'Monitors BTC, ETH, SOL, AVAX, XRP for Break of Structure and Order Block setups across optimized timeframes.'},
              {n:'02',t:'Signal fires instantly',d:'Entry, stop loss, take profit, and exact position sizing — delivered to Telegram and your dashboard the moment a setup confirms.'},
              {n:'03',t:'You execute',d:'Copy the levels into Bitget. Same risk management, same system behind $218K in verified profits. No interpretation needed.'},
            ].map((s,i)=>(
              <div key={i} className="t lift">
                <div className="th">
                  <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                  <span className="text-[9px] text-white/55 mono ml-1">step_{s.n}</span>
                </div>
                <div className="p-5">
                  <div className="text-[22px] font-bold text-white/[.04] mono mb-3">{s.n}</div>
                  <h3 className="text-[15px] font-semibold mb-2">{s.t}</h3>
                  <p className="text-[12px] text-white/60 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════ SIGNAL PREVIEW ════════════ */}
      <section className="py-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.1fr] gap-10 items-center">
          <div>
            <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">WHAT YOU GET</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Every signal. Fully calculated.
            </h2>
            <p className="text-[13px] text-white/60 leading-relaxed mb-8">
              Each signal includes exact entry, stop loss, take profit, and position sizing for your account. No guesswork, no interpretation — just execute.
            </p>
            <div className="space-y-2.5">
              {['Exact entry, SL, and TP levels','Position sizing for any account size','Risk:reward ratio calculated','Instant Telegram notification','Confidence score and reasoning'].map((f,i)=>(
                <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/70">
                  <span className="text-[#00e5a0]/50 mono text-[10px]">→</span>{f}
                </div>
              ))}
            </div>
          </div>

          {/* Signal card */}
          <div className="t">
            <div className="th">
              <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
              <span className="text-[9px] text-white/55 mono ml-1">signal — live</span>
              <span className="flex items-center gap-1 ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pd"></span></span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-bold mono text-black bg-[#00e5a0] px-1.5 py-px rounded">LONG</span>
                  <span className="text-lg font-bold mono">SOL/USDT</span>
                </div>
                <span className="text-[9px] text-white/55 mono">82% conf</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{l:'ENTRY',v:'$195.40',c:''},{l:'STOP LOSS',v:'$188.20',c:'text-[#ff4d4d]'},{l:'TAKE PROFIT',v:'$213.50',c:'text-[#00e5a0]'}].map((x,i)=>(
                  <div key={i}><div className="text-[8px] text-white/55 mono tracking-wider mb-1">{x.l}</div><div className={'text-[14px] font-bold mono '+x.c}>{x.v}</div></div>
                ))}
              </div>
              {/* R:R bar */}
              <div>
                <div className="flex justify-between text-[8px] mono text-white/70 mb-1"><span>Risk 3.7%</span><span>Reward 9.3%</span></div>
                <div className="h-1 rounded-full bg-white/[0.03] flex overflow-hidden"><div className="bg-[#ff4d4d]/30 rounded-l-full" style={{width:'28%'}}></div><div className="bg-[#00e5a0]/30 rounded-r-full" style={{width:'72%'}}></div></div>
                <div className="text-right text-[9px] text-[#00e5a0]/40 mono mt-1">2.5:1 R:R</div>
              </div>
              {/* Position sizing */}
              <div className="border-t border-white/[0.03] pt-3">
                <div className="text-[8px] text-white/70 mono tracking-wider mb-2">POSITION SIZE</div>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] mono">
                  {[{a:'$1K',s:'$2.7K',r:'$100'},{a:'$10K',s:'$27K',r:'$1,000'},{a:'$50K',s:'$135K',r:'$5,000'}].map((r,i)=>(
                    <div key={i} className="bg-white/[0.02] rounded px-2.5 py-2"><div className="text-white/60 mb-0.5">{r.a} acct</div><div className="text-white/70 font-medium">{r.s}</div><div className="text-white/70 text-[8px]">risk {r.r}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════ PAIRS ════════════ */}
      <section className="py-20 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">TRADING UNIVERSE</p>
          <h2 className="text-xl font-bold tracking-tight mb-6">5 pairs. 6 configurations. $208K+ profit.</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              {p:'AVAX',pnl:33648,n:152},{p:'SOL',pnl:24239,n:98},{p:'ETH',pnl:25678,n:202},{p:'XRP',pnl:14378,n:87},{p:'BTC',pnl:6266,n:85},
            ].map((x,i)=>(
              <div key={i} className="t lift p-4">
                <div className="text-[15px] font-bold text-white/55 mono mb-2">{x.p}</div>
                <div className="text-[15px] font-bold text-[#00e5a0] mono mb-2">+${(x.pnl/1000).toFixed(1)}K</div>
                <div className="text-[9px] text-white/70 mono">{x.n} trades</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════ SOCIAL PROOF STRIP ════════════ */}
      <section className="py-16 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="t">
            <div className="th">
              <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
              <span className="text-[9px] text-white/55 mono ml-1">system_status</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                {v:'24/7',l:'Market monitoring'},{v:'<1 min',l:'Signal delivery'},{v:'$0',l:'Hidden fees'},{v:'2 years',l:'Track record'},
              ].map((s,i)=>(
                <div key={i} className="px-4 py-4 text-center border-r border-white/[0.02] last:border-r-0">
                  <div className="text-lg font-bold mono mb-0.5">{s.v}</div>
                  <div className="text-[9px] text-white/55 mono">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ════════════ PRICING ════════════ */}
      <section id="pricing" className="py-24 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] text-[#00e5a0]/40 mono tracking-[.15em] mb-2">PRICING</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">One plan. Full access.</h2>
            <p className="text-[13px] text-white/60">Same signals behind $218K in verified profits.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 max-w-xl mx-auto">
            {/* Monthly */}
            <div className="t">
              <div className="th">
                <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                <span className="text-[9px] text-white/55 mono ml-1">plan_monthly</span>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold mono">$97</span>
                  <span className="text-white/55 text-[12px]">/mo</span>
                </div>
                <div className="space-y-2 text-[11px] text-white/60 mb-6">
                  {['All signals, all pairs','Telegram instant alerts','Performance dashboard','Position sizing','Cancel anytime'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2"><span className="text-[#00e5a0]/40 mono text-[9px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-2.5 rounded border border-white/[0.07] text-white/60 text-[11px] font-bold text-center hover:border-white/[0.12] hover:text-white/60 transition-all mono tracking-wide">SUBSCRIBE</Link>
              </div>
            </div>

            {/* Annual */}
            <div className="t relative" style={{borderColor:'rgba(0,229,160,.12)'}}>
              <div className="absolute -top-2 right-4 px-2 py-px bg-[#00e5a0] text-black text-[8px] font-bold mono tracking-wider rounded">SAVE $194</div>
              <div className="th">
                <div className="td bg-[#ff5f57]"></div><div className="td bg-[#febc2e]"></div><div className="td bg-[#28c840]"></div>
                <span className="text-[9px] text-white/55 mono ml-1">plan_annual</span>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold mono text-[#00e5a0]">$970</span>
                  <span className="text-white/55 text-[12px]">/yr</span>
                </div>
                <div className="text-[10px] text-[#00e5a0]/30 mono mb-5">2 months free</div>
                <div className="space-y-2 text-[11px] text-white/60 mb-6">
                  {['Everything in monthly','Priority signal delivery','Advanced analytics','Direct support line','Early feature access'].map((f,i)=>(
                    <div key={i} className="flex items-center gap-2"><span className="text-[#00e5a0]/40 mono text-[9px]">→</span>{f}</div>
                  ))}
                </div>
                <Link href="/auth/signup" className="block w-full py-2.5 rounded bg-[#00e5a0] text-black text-[11px] font-bold text-center hover:bg-[#00cc8e] transition-colors mono tracking-wide">SUBSCRIBE</Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════ FINAL CTA ════════════ */}
      <section className="py-24 px-5 md:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.025) 0%,transparent 65%)'}}/>
        <div className="max-w-xl mx-auto text-center relative z-10">
          <div className="t inline-block px-5 py-2 mb-6">
            <span className="text-[32px] md:text-[40px] font-bold mono text-[#00e5a0] glow">+$208,418</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Stop watching charts.<br/>
            <span className="text-white/70">Let the engine find the trades.</span>
          </h2>
          <p className="text-[13px] text-white/60 mb-8">
            Public trades are delayed 7 days. Subscribers get signals the moment they fire.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto">
            <Link href="/auth/signup" className="flex-1 py-3 bg-[#00e5a0] text-black rounded font-bold text-[12px] hover:bg-[#00cc8e] transition-colors text-center">
              Get access — $97/mo
            </Link>
            <Link href="/performance" className="flex-1 py-3 rounded text-[12px] font-semibold text-white/70 border border-white/[0.06] hover:border-white/[0.1] hover:text-white/60 transition-all text-center">
              Verify every trade
            </Link>
          </div>
        </div>
      </section>


      {/* DISCLAIMER */}
      <section className="py-8 px-5 md:px-8 border-t border-white/[0.02]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[9px] text-white/8 leading-relaxed">Past performance does not guarantee future results. Trading crypto with leverage involves substantial risk of loss. All results from verified historical data. PulseWave Labs provides signals for informational purposes only. Not a registered investment advisor. <Link href="/disclaimer" className="underline hover:text-white/60 transition-colors">Full risk disclosure</Link>.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 px-5 md:px-8 border-t border-white/[0.02]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.webp" alt="PulseWave" className="h-3 opacity-20"/>
            <span className="text-[9px] text-white/8">© 2026 PulseWave Labs</span>
          </div>
          <div className="flex gap-5 text-[9px] text-white/8">
            <Link href="/performance" className="hover:text-white/60 transition-colors">Trades</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white/60 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
