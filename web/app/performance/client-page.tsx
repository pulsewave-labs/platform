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
    <div className="min-h-screen bg-[#060608] flex items-center justify-center">
      <div className="text-[11px] text-white/60 mono tracking-widest">LOADING...</div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center">
      <div className="text-[11px] text-white/60 mono">Failed to load. <button onClick={() => window.location.reload()} className="text-[#00e5a0] underline">Retry</button></div>
    </div>
  )

  const s = data.stats

  return (
    <div className="min-h-screen bg-[#060608] text-white antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', -apple-system, sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .terminal { background: #09090b; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; }
        .terminal-header { border-bottom: 1px solid rgba(255,255,255,0.04); padding: 10px 16px; display: flex; align-items: center; gap: 8px; }
        .terminal-dot { width: 6px; height: 6px; border-radius: 50%; }
        @keyframes pulse-dot { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
      `}} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#060608]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.webp" alt="PulseWave" className="h-7 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>
            <span className="text-white/70">|</span>
            <span className="text-[11px] text-white/70 mono tracking-wide">PERFORMANCE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-[12px] text-white/55 hover:text-white/70 transition-colors">Log In</Link>
            <Link href="/auth/signup" className="text-[12px] px-4 py-1.5 bg-[#00e5a0] text-black rounded-lg font-semibold hover:bg-[#00cc8e] transition-colors">Get Access</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">

        {/* Hero stats */}
        <div className="mb-16">
          <div className="mb-8">
            <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">VERIFIED TRACK RECORD</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              $10,000 → <span className="text-[#00e5a0]">${s.finalBalance.toLocaleString()}</span>
            </h1>
            <p className="text-[14px] text-white/70">{s.totalTrades} trades · $1,000 fixed risk · 20x leverage · Market Structure</p>
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dot bg-[#ff5f57]"></div>
              <div className="terminal-dot bg-[#febc2e]"></div>
              <div className="terminal-dot bg-[#28c840]"></div>
              <span className="text-[10px] text-white/55 mono ml-2">overview</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-white/[0.03]">
              {[
                { label: 'RETURN', val: '+' + s.totalReturn + '%', color: '#00e5a0' },
                { label: 'WIN RATE', val: s.winRate + '%', color: '#c8c8c8' },
                { label: 'PROFIT FACTOR', val: s.profitFactor.toFixed(2), color: '#c8c8c8' },
                { label: 'MAX DRAWDOWN', val: s.maxDrawdown + '%', color: '#ff4d4d' },
                { label: 'AVG MONTHLY', val: '+$' + s.avgMonthlyPnl.toLocaleString(), color: '#00e5a0' },
                { label: 'WIN MONTHS', val: s.profitableMonths + '/' + s.totalMonths, color: '#c8c8c8' },
              ].map((stat, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="text-[8px] text-white/55 mono tracking-[0.15em] mb-1">{stat.label}</div>
                  <div className="text-lg font-bold mono" style={{ color: stat.color }}>{stat.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Monthly Performance */}
        <div className="mb-16">
          <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-4">MONTHLY RETURNS</p>
          <div className="terminal overflow-hidden">
            <div className="terminal-header">
              <div className="terminal-dot bg-[#ff5f57]"></div>
              <div className="terminal-dot bg-[#febc2e]"></div>
              <div className="terminal-dot bg-[#28c840]"></div>
              <span className="text-[10px] text-white/55 mono ml-2">monthly breakdown — {data.monthly.length} months</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] mono">
                <thead>
                  <tr className="text-[9px] text-white/55 tracking-[0.1em] border-b border-white/[0.03]">
                    <th className="text-left px-4 py-2.5">MONTH</th>
                    <th className="text-left px-4 py-2.5">TRADES</th>
                    <th className="text-left px-4 py-2.5">W</th>
                    <th className="text-left px-4 py-2.5">L</th>
                    <th className="text-right px-4 py-2.5">P&L</th>
                    <th className="text-right px-4 py-2.5">RETURN</th>
                    <th className="text-right px-4 py-2.5">BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((m: any, i: number) => (
                    <tr key={i} className={'border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors ' + (i % 2 === 0 ? 'bg-white/[0.005]' : '')}>
                      <td className="px-4 py-2.5 text-white/60">{m.month}</td>
                      <td className="px-4 py-2.5 text-white/55">{m.trades}</td>
                      <td className="px-4 py-2.5 text-[#00e5a0]/60">{m.wins}</td>
                      <td className="px-4 py-2.5 text-[#ff4d4d]/60">{m.losses}</td>
                      <td className={'px-4 py-2.5 text-right font-medium ' + (m.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {m.pnl >= 0 ? '+' : ''}${m.pnl.toLocaleString()}
                      </td>
                      <td className={'px-4 py-2.5 text-right ' + (m.pnlPct >= 0 ? 'text-[#00e5a0]/60' : 'text-[#ff4d4d]/60')}>
                        {m.pnlPct >= 0 ? '+' : ''}{m.pnlPct.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 text-right text-white/70">${m.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>


        {/* Pairs */}
        <div className="mb-16">
          <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-4">PERFORMANCE BY PAIR</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.pairs.map((p: any, i: number) => (
              <div key={i} className="terminal p-4">
                <div className="text-[14px] font-bold text-white/60 mono mb-2">{p.pair.replace('/USDT', '')}</div>
                <div className="text-[16px] font-bold text-[#00e5a0] mono mb-3">+${p.pnl.toLocaleString()}</div>
                <div className="space-y-1 text-[9px] mono">
                  <div className="flex justify-between"><span className="text-white/55">TRADES</span><span className="text-white/55">{p.trades}</span></div>
                  <div className="flex justify-between"><span className="text-white/55">WIN RATE</span><span className="text-white/55">{p.winRate}%</span></div>
                  <div className="flex justify-between"><span className="text-white/55">AVG P&L</span><span className="text-white/55">${p.avgPnl}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Trade Settings */}
        <div className="mb-16">
          <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-4">TRADE PARAMETERS</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="terminal p-6">
              <div className="text-[12px] text-white/60 font-semibold mb-4">Settings</div>
              <div className="space-y-2.5">
                {[
                  ['Starting Capital', '$10,000'],
                  ['Risk Per Trade', '10% ($1,000 fixed)'],
                  ['Leverage', '20x'],
                  ['Position Sizing', 'Risk ÷ Stop Distance'],
                  ['Compounding', 'None'],
                  ['Fees', '0.1% maker/taker'],
                  ['Exchange', 'Bitget USDT-M Futures'],
                  ['Strategy', 'Market Structure (BOS + OB)'],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/[0.02] last:border-b-0">
                    <span className="text-[11px] text-white/60">{label}</span>
                    <span className="text-[11px] text-white/70 mono font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="terminal p-6">
              <div className="text-[12px] text-white/60 font-semibold mb-4">Position Sizing Formula</div>
              <div className="bg-white/[0.02] rounded-lg p-4 mono text-[11px] space-y-1.5 mb-4">
                <div className="text-[#00e5a0]/60">risk_amount = account × 10%</div>
                <div className="text-white/55">stop_distance = |entry − stop_loss| ÷ entry</div>
                <div className="text-white/55">position_size = risk_amount ÷ stop_distance</div>
                <div className="text-white/55">margin = position_size ÷ leverage</div>
              </div>
              <p className="text-[11px] text-white/55 leading-relaxed">Tighter stop → larger position. Wider stop → smaller position. Risk stays constant at $1,000 regardless of setup.</p>
            </div>
          </div>
        </div>


        {/* Trade Log */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[11px] text-[#00e5a0]/50 mono tracking-wide mb-3">TRADE LOG</p>
              <h2 className="text-2xl font-bold tracking-tight">Complete Trade History</h2>
            </div>
            <div className="text-[10px] text-white/55 mono tracking-wide hidden md:block">
              {filtered.length} TRADES · 7-DAY DELAY
            </div>
          </div>

          {/* Filters */}
          <div className="terminal p-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[9px] text-white/55 mono tracking-wider mr-1">FILTER</span>

              <select value={filterPair} onChange={e => { setFilterPair(e.target.value); setPage(1) }}
                className="text-[11px] mono bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-1.5 text-white/70 focus:outline-none focus:border-[#00e5a0]/30">
                <option value="">All Pairs</option>
                {uniquePairs.map((p: string) => <option key={p} value={p}>{p}</option>)}
              </select>

              <select value={filterDirection} onChange={e => { setFilterDirection(e.target.value); setPage(1) }}
                className="text-[11px] mono bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-1.5 text-white/70 focus:outline-none focus:border-[#00e5a0]/30">
                <option value="">All Sides</option>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>

              <select value={filterResult} onChange={e => { setFilterResult(e.target.value); setPage(1) }}
                className="text-[11px] mono bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-1.5 text-white/70 focus:outline-none focus:border-[#00e5a0]/30">
                <option value="">All Results</option>
                <option value="WIN">Winners</option>
                <option value="LOSS">Losers</option>
              </select>

              {(filterPair || filterDirection || filterResult) && (
                <button onClick={() => { setFilterPair(''); setFilterDirection(''); setFilterResult(''); setPage(1) }}
                  className="text-[10px] mono text-white/60 hover:text-white/60 transition-colors px-2">
                  CLEAR
                </button>
              )}

              <div className="ml-auto text-[10px] text-white/70 mono md:hidden">
                {filtered.length} trades · 7-day delay
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="terminal overflow-hidden">
            <div className="terminal-header">
              <div className="terminal-dot bg-[#ff5f57]"></div>
              <div className="terminal-dot bg-[#febc2e]"></div>
              <div className="terminal-dot bg-[#28c840]"></div>
              <span className="text-[10px] text-white/55 mono ml-2">trade log · page {page}/{totalPages || 1}</span>
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] pulse-dot"></span>
                <span className="text-[9px] text-[#00e5a0]/40 mono">7-DAY DELAY</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] mono">
                <thead>
                  <tr className="text-[8px] text-white/55 tracking-[0.12em] border-b border-white/[0.03]">
                    {[
                      { key: 'entry_time', label: 'DATE' },
                      { key: 'pair', label: 'PAIR' },
                      { key: 'action', label: 'SIDE' },
                      { key: 'entry_price', label: 'ENTRY' },
                      { key: 'exit_price', label: 'EXIT' },
                      { key: 'notional', label: 'POSITION' },
                      { key: 'risk_amount', label: 'RISK' },
                      { key: 'fees', label: 'FEES' },
                      { key: 'pnl', label: 'P&L' },
                      { key: 'exit_reason', label: 'RESULT' },
                      { key: 'balance_after', label: 'BALANCE' },
                    ].map(col => (
                      <th key={col.key} onClick={() => sort(col.key)}
                        className={'text-left px-4 py-2.5 cursor-pointer hover:text-white/70 transition-colors select-none ' + (col.key === 'pnl' || col.key === 'balance_after' ? 'text-right' : '')}>
                        {col.label}
                        {sortField === col.key && <span className="text-[#00e5a0]/40 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t: Trade, i: number) => (
                    <tr key={i} className={'border-b border-white/[0.015] hover:bg-white/[0.015] transition-colors ' + (i % 2 === 0 ? 'bg-white/[0.003]' : '')}>
                      <td className="px-4 py-2.5 text-white/60">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                      <td className="px-4 py-2.5 text-white/70 font-medium">{t.pair.replace('/USDT', '')}</td>
                      <td className="px-4 py-2.5">
                        <span className={t.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{t.action}</span>
                      </td>
                      <td className="px-4 py-2.5 text-white/60">${t.entry_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-white/60">${t.exit_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-white/55">${Math.round(t.notional).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-[#c9a227]/50">${t.risk_amount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-white/70">${Math.round(t.fees)}</td>
                      <td className={'px-4 py-2.5 text-right font-medium ' + (t.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {t.pnl >= 0 ? '+' : ''}${Math.round(t.pnl).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={'text-[9px] tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/40' : 'text-[#ff4d4d]/40')}>
                          {t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-white/55">${Math.round(t.balance_after).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.03]">
                <span className="text-[10px] text-white/70 mono">Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1}
                    className="px-2.5 py-1 text-[10px] mono text-white/60 hover:text-white/60 disabled:text-white/5 transition-colors">FIRST</button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-2.5 py-1 text-[10px] mono text-white/60 hover:text-white/60 disabled:text-white/5 transition-colors">PREV</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-2.5 py-1 text-[10px] mono text-white/60 hover:text-white/60 disabled:text-white/5 transition-colors">NEXT</button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                    className="px-2.5 py-1 text-[10px] mono text-white/60 hover:text-white/60 disabled:text-white/5 transition-colors">LAST</button>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* CTA */}
        <div className="terminal p-8 text-center mb-8">
          <h3 className="text-xl font-bold mb-2">Get real-time signals.</h3>
          <p className="text-[13px] text-white/70 mb-6">Public trades are delayed 7 days. Subscribers get signals the moment they fire.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Link href="/auth/signup" className="flex-1 py-3 bg-[#00e5a0] text-black text-[12px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors text-center">
              Get Access — $97/mo
            </Link>
            <Link href="/" className="flex-1 py-3 border border-white/[0.07] text-white/55 text-[12px] font-semibold rounded-lg hover:border-white/[0.12] hover:text-white/70 transition-all text-center">
              Learn More
            </Link>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="border-t border-white/[0.03] py-6 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[10px] text-white/70">© 2026 PulseWave Labs · Past performance does not guarantee future results.</span>
          <div className="flex gap-5 text-[10px] text-white/70">
            <Link href="/disclaimer" className="hover:text-white/70 transition-colors">Disclaimer</Link>
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
