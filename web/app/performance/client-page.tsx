'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface Trade {
  pair: string
  timeframe: string
  action: 'LONG' | 'SHORT'
  entry_price: number
  exit_price: number
  stop_loss: number
  take_profit: number
  pnl: number
  pnl_pct: number
  fees: number
  risk_amount: number
  position_size: number
  notional: number
  exit_reason: string
  confidence: number
  entry_time: string
  exit_time: string
  balance_after: number
  strategy: string
  status: string
}

export default function PerformanceClientPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterPair, setFilterPair] = useState('')
  const [filterDirection, setFilterDirection] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [sortField, setSortField] = useState('entry_time')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const perPage = 50

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!data?.trades) return []
    return data.trades.filter((t: Trade) => {
      if (filterPair && t.pair !== filterPair) return false
      if (filterDirection && t.action !== filterDirection) return false
      if (filterResult === 'WIN' && t.pnl <= 0) return false
      if (filterResult === 'LOSS' && t.pnl > 0) return false
      return true
    }).sort((a: any, b: any) => {
      const av = a[sortField], bv = b[sortField]
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [data, filterPair, filterDirection, filterResult, sortField, sortDir])

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)
  const uniquePairs = data?.trades ? [...new Set(data.trades.map((t: Trade) => t.pair))].sort() : []

  const sort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
    setPage(1)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
      <div className="w-48 h-px bg-[#1a1a1a] rounded-full overflow-hidden">
        <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
      <div className="text-[13px] text-white/50 mono">Failed to load. <button onClick={() => window.location.reload()} className="text-[#00e5a0] underline">Retry</button></div>
    </div>
  )

  const s = data.stats
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // Monthly data grouped by year
  const byYear: {[y:string]:any[]} = {}
  if (data.monthly) {
    data.monthly.forEach((m:any) => { const y = m.month.slice(0,4); if(!byYear[y]) byYear[y]=[]; byYear[y].push(m) })
  }
  const years = Object.keys(byYear).sort()

  // Best/worst month
  const bestMonth = data.monthly?.reduce((a:any,b:any) => a.pnl > b.pnl ? a : b, data.monthly[0])
  const worstMonth = data.monthly?.reduce((a:any,b:any) => a.pnl < b.pnl ? a : b, data.monthly[0])

  return (
    <div className="min-h-screen bg-[#08080a] text-white antialiased">
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
      `}} />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.webp" alt="PulseWave" className="h-7" />
            </Link>
            <span className="hidden sm:inline text-white/10">|</span>
            <span className="hidden sm:inline text-[11px] text-white/30 mono tracking-wider">PERFORMANCE</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-[13px] text-white/40 hover:text-white/60 transition-colors">Log In</Link>
            <Link href="/checkout" className="text-[13px] px-4 py-2 bg-[#00e5a0] text-black rounded-lg font-bold hover:bg-[#00cc8e] transition-colors whitespace-nowrap">Get Signals</Link>
          </div>
        </div>
      </nav>


      {/* ═══ HERO ═══ */}
      <section className="px-4 md:px-10 pt-16 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-[11px] text-[#00e5a0]/40 mono tracking-[.2em] mb-4">FULLY TRANSPARENT. EVERY TRADE PUBLIC.</div>
            <h1 className="text-2xl md:text-[48px] font-extrabold tracking-tight mb-4 leading-[1.1]">
              $10,000 <span className="text-white/30">→</span> <span className="text-[#00e5a0]">${s.finalBalance.toLocaleString()}</span>
            </h1>
            <p className="text-[14px] text-white/40 max-w-lg mx-auto mb-8">
              {s.totalTrades} trades over {s.totalMonths} months. $1,000 fixed risk per trade. 20x leverage. Every entry, exit, and dollar accounted for. No cherry-picking. No hiding losses.
            </p>

            <div className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-full px-5 py-2 mb-10">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
              <span className="text-[12px] text-white/40 mono">Public log delayed 48 hours</span>
              <span className="text-white/10">·</span>
              <span className="text-[12px] text-[#00e5a0]/50 mono">Subscribers get signals instantly</span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/[0.02] rounded-xl overflow-hidden mb-6">
            {[
              { label: 'TOTAL RETURN', val: '+' + s.totalReturn + '%', color: '#00e5a0' },
              { label: 'WIN RATE', val: s.winRate + '%', color: '#e0e0e0' },
              { label: 'PROFIT FACTOR', val: s.profitFactor.toFixed(2), color: '#e0e0e0' },
              { label: 'MAX DRAWDOWN', val: '-' + s.maxDrawdown + '%', color: '#ff4d4d' },
              { label: 'MONTHLY AVG', val: '+$' + Math.round(s.avgMonthlyPnl).toLocaleString(), color: '#00e5a0' },
              { label: 'GREEN MONTHS', val: s.profitableMonths + '/' + s.totalMonths, color: '#e0e0e0' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0a0a0c] px-5 py-5 text-center">
                <div className="text-[10px] text-[#555] mono tracking-[.15em] mb-2">{stat.label}</div>
                <div className="text-[20px] font-bold mono leading-none" style={{ color: stat.color }}>{stat.val}</div>
              </div>
            ))}
          </div>

          {/* Inline CTA */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <Link href="/checkout" className="px-6 py-2.5 bg-[#00e5a0] text-black text-[13px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors">
              Get These Signals for $149/mo
            </Link>
            <span className="text-[12px] text-white/20 mono">or</span>
            <span className="text-[12px] text-white/30 mono">keep scrolling to verify every trade</span>
          </div>
        </div>
      </section>


      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent my-8"></div>
      </div>


      {/* ═══ MONTHLY HEATMAP ═══ */}
      <section className="px-4 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[11px] text-white/25 mono tracking-[.2em] mb-2">MONTH BY MONTH</div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">{s.profitableMonths} green months out of {s.totalMonths}.</h2>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[11px] mono">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#00e5a0]/20"></span><span className="text-white/30">Profit</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#ff4d4d]/20"></span><span className="text-white/30">Loss</span></span>
            </div>
          </div>

          {/* Year heatmaps */}
          <div className="space-y-5 mb-8">
            {years.map(year => {
              const yearTotal = byYear[year].reduce((s:number,x:any)=>s+x.pnl,0)
              return (
                <div key={year}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-white/50 mono font-bold">{year}</span>
                    <span className={'text-[13px] mono font-bold ' + (yearTotal >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{yearTotal >= 0 ? '+' : ''}${(yearTotal/1000).toFixed(1)}K</span>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-12 gap-1">
                    {Array.from({length:12},(_,mi)=>{
                      const monthKey = `${year}-${String(mi+1).padStart(2,'0')}`
                      const md = byYear[year].find((x:any) => x.month === monthKey)
                      if (!md) return (
                        <div key={mi} className="rounded-lg bg-white/[0.015] py-3 px-1 text-center">
                          <div className="text-[11px] text-white/20 mono">{months[mi]}</div>
                        </div>
                      )
                      const pnl = md.pnl
                      const int = Math.min(Math.abs(pnl)/12000,1)
                      const bg = pnl > 0 ? `rgba(0,229,160,${.05+int*.3})` : `rgba(255,77,77,${.05+int*.3})`
                      return (
                        <div key={mi} className="rounded-lg py-3 px-1 text-center hover:scale-105 transition-transform cursor-default" style={{background:bg}}>
                          <div className="text-[11px] text-white/50 mono">{months[mi]}</div>
                          <div className={'text-[13px] font-bold mono mt-0.5 ' + (pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{pnl > 0 ? '+' : ''}{(pnl/1000).toFixed(1)}k</div>
                          <div className="text-[10px] text-white/20 mono mt-0.5">{md.trades}t</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Monthly highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: 'BEST MONTH', v: bestMonth ? '+$'+Math.round(bestMonth.pnl).toLocaleString() : '-', s: bestMonth?.month, c: '#00e5a0' },
              { l: 'WORST MONTH', v: worstMonth ? '-$'+Math.abs(Math.round(worstMonth.pnl)).toLocaleString() : '-', s: worstMonth?.month, c: '#ff4d4d' },
              { l: 'AVG MONTHLY', v: '+$'+Math.round(s.avgMonthlyPnl).toLocaleString(), s: 'across '+s.totalMonths+' months', c: '#00e5a0' },
              { l: 'AVG TRADES/MO', v: Math.round(s.totalTrades/s.totalMonths).toString(), s: s.totalTrades+' total', c: '#e0e0e0' },
            ].map((stat,i) => (
              <div key={i} className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl px-5 py-4">
                <div className="text-[10px] text-[#555] mono tracking-[.15em] mb-2">{stat.l}</div>
                <div className="text-[20px] font-bold mono" style={{color:stat.c}}>{stat.v}</div>
                {stat.s && <div className="text-[11px] text-white/20 mono mt-1">{stat.s}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>


      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"></div>
      </div>


      {/* ═══ PAIRS BREAKDOWN ═══ */}
      <section className="px-4 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] text-white/25 mono tracking-[.2em] mb-2">BY PAIR</div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6">Every pair profitable.</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.pairs.map((p: any, i: number) => {
              const maxPnl = Math.max(...data.pairs.map((x:any) => x.pnl))
              const barW = maxPnl > 0 ? (p.pnl / maxPnl * 100) : 0
              return (
                <div key={i} className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-5 hover:border-[#00e5a0]/[0.08] transition-all group">
                  <div className="text-[16px] mono font-bold text-white/70 mb-0.5 group-hover:text-[#00e5a0] transition-colors">{p.pair.replace('/USDT', '')}</div>
                  <div className="text-[11px] mono text-white/25 mb-3">{p.trades} trades · {p.winRate}% WR</div>
                  <div className="text-[18px] font-bold mono text-[#00e5a0] mb-2">+${p.pnl.toLocaleString()}</div>
                  <div className="h-1 rounded-full bg-white/[0.03]">
                    <div className="h-full rounded-full bg-[#00e5a0]/30" style={{width: barW+'%'}}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[11px] mono">
                    <span className="text-white/20">Avg: ${p.avgPnl}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>


      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"></div>
      </div>


      {/* ═══ MID-PAGE CTA ═══ */}
      <section className="px-4 md:px-10 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-b from-[#00e5a0]/[0.03] to-transparent border border-[#00e5a0]/[0.08] rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5a0]/20 to-transparent"></div>
            <h3 className="text-[18px] font-bold mb-2">Seen enough?</h3>
            <p className="text-[14px] text-white/40 mb-5 max-w-md mx-auto">
              You just reviewed {s.totalTrades} trades. {s.profitableMonths} profitable months. One system. If this doesn't convince you, nothing will.
            </p>
            <Link href="/checkout" className="inline-block px-8 py-3 bg-[#00e5a0] text-black text-[14px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors shadow-[0_0_30px_rgba(0,229,160,.1)]">
              Start Receiving Signals
            </Link>
            <div className="text-[12px] text-white/20 mono mt-3">$149/mo · Cancel anytime</div>
          </div>
        </div>
      </section>


      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"></div>
      </div>


      {/* ═══ TRADE PARAMETERS ═══ */}
      <section className="px-4 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] text-white/25 mono tracking-[.2em] mb-2">METHODOLOGY</div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-6">Exact settings. Nothing hidden.</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-6">
              <div className="text-[13px] text-white/60 font-semibold mb-4">Trade Settings</div>
              <div className="space-y-0">
                {[
                  ['Starting Capital', '$10,000'],
                  ['Risk Per Trade', '10% ($1,000 fixed)'],
                  ['Leverage', '20x'],
                  ['Position Sizing', 'Risk / Stop Distance'],
                  ['Compounding', 'None, fixed dollar risk'],
                  ['Fees', '0.1% maker/taker'],
                  ['Exchange', 'Bitget USDT-M Futures'],
                  ['Strategy', 'Market Structure (BOS + OB)'],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/[0.02] last:border-b-0">
                    <span className="text-[12px] text-[#666]">{label}</span>
                    <span className="text-[12px] text-[#aaa] mono font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0a0a0c] border border-white/[0.04] rounded-xl p-6">
              <div className="text-[13px] text-white/60 font-semibold mb-4">Position Sizing Formula</div>
              <div className="bg-white/[0.02] rounded-lg p-4 mono text-[12px] space-y-2 mb-4">
                <div className="text-[#00e5a0]/60">risk_amount = account x 10%</div>
                <div className="text-[#666]">stop_distance = |entry - stop_loss| / entry</div>
                <div className="text-[#666]">position_size = risk_amount / stop_distance</div>
                <div className="text-[#666]">margin = position_size / leverage</div>
              </div>
              <p className="text-[12px] text-[#555] leading-relaxed">Tighter stop = larger position. Wider stop = smaller position. Risk stays constant at $1,000 regardless of setup.</p>
              <div className="mt-4 p-3 bg-[#00e5a0]/[0.02] border border-[#00e5a0]/[0.06] rounded-lg">
                <p className="text-[12px] text-[#00e5a0]/40 leading-relaxed">Every signal includes the exact position size calculated for multiple account sizes, so you never have to do this math yourself.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"></div>
      </div>


      {/* ═══ COMPLETE TRADE LOG ═══ */}
      <section className="px-4 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[11px] text-white/25 mono tracking-[.2em] mb-2">RAW DATA</div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Every trade. Unedited.</h2>
              <p className="text-[12px] text-[#555] mono mt-1">{filtered.length} trades · Delayed 48 hours on public page</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <select value={filterPair} onChange={e => { setFilterPair(e.target.value); setPage(1) }}
              className="text-[12px] mono bg-[#0a0a0c] border border-white/[0.04] rounded-lg px-3 py-2 text-[#aaa] focus:outline-none focus:border-[#00e5a0]/20">
              <option value="">All Pairs</option>
              {uniquePairs.map((p: string) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterDirection} onChange={e => { setFilterDirection(e.target.value); setPage(1) }}
              className="text-[12px] mono bg-[#0a0a0c] border border-white/[0.04] rounded-lg px-3 py-2 text-[#aaa] focus:outline-none focus:border-[#00e5a0]/20">
              <option value="">All Sides</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
            <select value={filterResult} onChange={e => { setFilterResult(e.target.value); setPage(1) }}
              className="text-[12px] mono bg-[#0a0a0c] border border-white/[0.04] rounded-lg px-3 py-2 text-[#aaa] focus:outline-none focus:border-[#00e5a0]/20">
              <option value="">All Results</option>
              <option value="WIN">Winners</option>
              <option value="LOSS">Losers</option>
            </select>
            {(filterPair || filterDirection || filterResult) && (
              <button onClick={() => { setFilterPair(''); setFilterDirection(''); setFilterResult(''); setPage(1) }}
                className="text-[11px] mono text-[#555] hover:text-[#888] transition-colors px-2">Clear</button>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] mono">
                <thead>
                  <tr className="bg-[#0c0c0c] text-[#555] text-[11px]">
                    {[
                      { key: 'entry_time', label: 'DATE', align: 'left' },
                      { key: 'pair', label: 'PAIR', align: 'left' },
                      { key: 'action', label: 'SIDE', align: 'left' },
                      { key: 'entry_price', label: 'ENTRY', align: 'right' },
                      { key: 'exit_price', label: 'EXIT', align: 'right' },
                      { key: 'risk_amount', label: 'RISK', align: 'right' },
                      { key: 'fees', label: 'FEES', align: 'right' },
                      { key: 'pnl', label: 'P&L', align: 'right' },
                      { key: 'exit_reason', label: 'RESULT', align: 'center' },
                      { key: 'balance_after', label: 'BALANCE', align: 'right' },
                    ].map(col => (
                      <th key={col.key} onClick={() => sort(col.key)}
                        className={'px-4 py-3 font-medium tracking-[.1em] cursor-pointer hover:text-[#888] transition-colors select-none ' + (col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left')}>
                        {col.label}
                        {sortField === col.key && <span className="text-[#00e5a0]/40 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t: Trade, i: number) => (
                    <tr key={i} className={'border-t border-white/[0.02] hover:bg-white/[0.01] transition-colors ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                      <td className="px-4 py-2.5 text-[#666]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                      <td className="px-4 py-2.5 text-[#aaa] font-medium">{t.pair.replace('/USDT', '')}</td>
                      <td className="px-4 py-2.5">
                        <span className={'px-1.5 py-0.5 rounded text-[11px] font-bold ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#666]">${t.entry_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-right text-[#666]">${t.exit_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-right text-[#c9a227]/40">${t.risk_amount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-[#444]">${Math.round(t.fees)}</td>
                      <td className={'px-4 py-2.5 text-right font-bold ' + (t.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {t.pnl >= 0 ? '+' : ''}${Math.round(t.pnl).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={'text-[11px] font-medium tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#777]">${Math.round(t.balance_after).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden border border-white/[0.04] rounded-xl overflow-hidden divide-y divide-white/[0.02]">
            {paginated.map((t: Trade, i: number) => (
              <div key={i} className={'px-4 py-3 ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={'text-[11px] mono font-bold px-1.5 py-0.5 rounded ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                    <span className="text-[14px] text-[#aaa] mono font-medium">{t.pair.replace('/USDT', '')}</span>
                  </div>
                  <span className={'text-[15px] mono font-bold ' + (t.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{t.pnl >= 0 ? '+' : ''}${Math.round(t.pnl).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] mono text-[#555]">
                  <span>{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>${t.entry_price.toLocaleString(undefined, { maximumFractionDigits: 2 })} → ${t.exit_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className={(t.exit_reason === 'TP' ? 'text-[#00e5a0]/40' : 'text-[#ff4d4d]/40')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-[#555] mono">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                {[
                  { label: 'First', action: () => setPage(1), disabled: page === 1 },
                  { label: 'Prev', action: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
                  { label: 'Next', action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                  { label: 'Last', action: () => setPage(totalPages), disabled: page === totalPages },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} disabled={btn.disabled}
                    className="px-3 py-1.5 text-[11px] mono bg-[#0a0a0c] border border-white/[0.04] rounded-lg text-[#666] hover:text-[#aaa] hover:border-white/[0.06] disabled:text-[#333] disabled:hover:border-white/[0.04] transition-colors">
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* ═══ BOTTOM CTA ═══ */}
      <section className="px-4 md:px-10 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[32px] md:text-[56px] font-extrabold mono text-[#00e5a0] mb-4 leading-none" style={{textShadow:'0 0 60px rgba(0,229,160,.15)'}}>
            +${Math.round(s.finalBalance - 10000).toLocaleString()}
          </div>
          <p className="text-[15px] text-white/50 mb-2 max-w-md mx-auto">
            You just audited {s.totalTrades} trades across {s.totalMonths} months. Every entry. Every exit. Every loss.
          </p>
          <p className="text-[14px] text-white/30 mb-8 max-w-sm mx-auto">
            The next signal fires to Telegram the moment a setup confirms. Subscribers get it instantly.
          </p>
          <Link href="/checkout" className="inline-block px-10 py-4 bg-[#00e5a0] text-black text-[15px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors shadow-[0_0_40px_rgba(0,229,160,.12)]">
            Get Signals for $149/mo
          </Link>
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-white/20 mono">
            <span>Cancel anytime</span>
            <span className="text-white/10">·</span>
            <span>Instant Telegram delivery</span>
            <span className="text-white/10">·</span>
            <span>Full dashboard access</span>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-6 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[10px] text-white/20">© 2026 PulseWave Labs · Past performance does not guarantee future results.</span>
          <div className="flex gap-5 text-[11px] text-white/25">
            <Link href="/disclaimer" className="hover:text-white/40 transition-colors">Disclaimer</Link>
            <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/40 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
