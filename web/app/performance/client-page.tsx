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
        <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent scan-line"></div>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
      <div className="text-[13px] text-white/50 mono">Failed to load. <button onClick={() => window.location.reload()} className="text-[#00e5a0] underline">Retry</button></div>
    </div>
  )

  const s = data.stats

  return (
    <div className="min-h-screen bg-[#08080a] text-white antialiased">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.webp" alt="PulseWave" className="h-7" />
            </Link>
            <span className="text-white/15">|</span>
            <span className="text-[12px] text-white/40 mono tracking-wide">PERFORMANCE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-[13px] text-white/50 hover:text-white/70 transition-colors">Log In</Link>
            <Link href="/auth/signup" className="text-[13px] px-5 py-2 bg-[#00e5a0] text-black rounded-lg font-bold hover:bg-[#00cc8e] transition-colors">Get Signals</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">

        {/* Hero */}
        <div className="mb-14">
          <p className="text-[11px] text-[#00e5a0]/40 mono tracking-[.15em] mb-3">VERIFIED TRACK RECORD</p>
          <h1 className="text-3xl md:text-[40px] font-bold tracking-tight mb-3">
            $10,000 → <span className="text-[#00e5a0]">${s.finalBalance.toLocaleString()}</span>
          </h1>
          <p className="text-[14px] text-white/50 mb-8">{s.totalTrades} trades · $1,000 fixed risk · 20x leverage · Market Structure</p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/[0.02] rounded-lg overflow-hidden">
            {[
              { label: 'RETURN', val: '+' + s.totalReturn + '%', color: '#00e5a0' },
              { label: 'WIN RATE', val: s.winRate + '%', color: '#e0e0e0' },
              { label: 'PROFIT FACTOR', val: s.profitFactor.toFixed(2), color: '#e0e0e0' },
              { label: 'MAX DRAWDOWN', val: '-' + s.maxDrawdown + '%', color: '#ff4d4d' },
              { label: 'MONTHLY AVG', val: '+$' + s.avgMonthlyPnl.toLocaleString(), color: '#00e5a0' },
              { label: 'GREEN MONTHS', val: s.profitableMonths + '/' + s.totalMonths, color: '#e0e0e0' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0c0c0c] px-5 py-4">
                <div className="text-[10px] text-[#555] mono tracking-[.12em] mb-2">{stat.label}</div>
                <div className="text-[20px] font-bold mono leading-none" style={{ color: stat.color }}>{stat.val}</div>
              </div>
            ))}
          </div>
        </div>


        {/* Monthly Performance */}
        <div className="mb-14">
          <h2 className="text-[13px] mono text-[#888] tracking-[.15em] font-medium mb-4">MONTHLY RETURNS</h2>
          <div className="border border-white/[0.04] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] mono">
                <thead>
                  <tr className="bg-[#0c0c0c] text-[#555] text-[11px]">
                    <th className="text-left px-4 py-3 font-medium tracking-[.1em]">MONTH</th>
                    <th className="text-left px-4 py-3 font-medium tracking-[.1em]">TRADES</th>
                    <th className="text-left px-4 py-3 font-medium tracking-[.1em]">W</th>
                    <th className="text-left px-4 py-3 font-medium tracking-[.1em]">L</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">P&L</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">RETURN</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((m: any, i: number) => (
                    <tr key={i} className={'border-t border-white/[0.02] hover:bg-white/[0.01] transition-colors ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                      <td className="px-4 py-2.5 text-[#aaa] font-medium">{m.month}</td>
                      <td className="px-4 py-2.5 text-[#777]">{m.trades}</td>
                      <td className="px-4 py-2.5 text-[#00e5a0]/60">{m.wins}</td>
                      <td className="px-4 py-2.5 text-[#ff4d4d]/60">{m.losses}</td>
                      <td className={'px-4 py-2.5 text-right font-bold ' + (m.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {m.pnl >= 0 ? '+' : ''}${m.pnl.toLocaleString()}
                      </td>
                      <td className={'px-4 py-2.5 text-right ' + (m.pnlPct >= 0 ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50')}>
                        {m.pnlPct >= 0 ? '+' : ''}{m.pnlPct.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#888]">${m.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>


        {/* Pairs */}
        <div className="mb-14">
          <h2 className="text-[13px] mono text-[#888] tracking-[.15em] font-medium mb-4">PERFORMANCE BY PAIR</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.pairs.map((p: any, i: number) => (
              <div key={i} className="bg-[#0c0c0c] border border-white/[0.04] rounded-lg px-5 py-4 hover:border-white/[0.06] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] mono font-medium text-[#aaa]">{p.pair.replace('/USDT', '')}</span>
                  <span className="text-[11px] mono text-[#555]">{p.trades} trades</span>
                </div>
                <div className={'text-[20px] mono font-bold mb-3 ' + (p.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                  +${p.pnl.toLocaleString()}
                </div>
                <div className="space-y-1 text-[11px] mono">
                  <div className="flex justify-between"><span className="text-[#555]">Win Rate</span><span className="text-[#777]">{p.winRate}%</span></div>
                  <div className="flex justify-between"><span className="text-[#555]">Avg P&L</span><span className="text-[#777]">${p.avgPnl}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Trade Settings */}
        <div className="mb-14">
          <h2 className="text-[13px] mono text-[#888] tracking-[.15em] font-medium mb-4">TRADE PARAMETERS</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#0c0c0c] border border-white/[0.04] rounded-lg p-6">
              <div className="text-[13px] text-white/70 font-semibold mb-4">Settings</div>
              <div className="space-y-0">
                {[
                  ['Starting Capital', '$10,000'],
                  ['Risk Per Trade', '10% ($1,000 fixed)'],
                  ['Leverage', '20x'],
                  ['Position Sizing', 'Risk ÷ Stop Distance'],
                  ['Compounding', 'None — fixed dollar risk'],
                  ['Fees', '0.1% maker/taker'],
                  ['Exchange', 'Bitget USDT-M Futures'],
                  ['Strategy', 'Market Structure (BOS + OB)'],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/[0.02] last:border-b-0">
                    <span className="text-[12px] text-[#777]">{label}</span>
                    <span className="text-[12px] text-[#aaa] mono font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0c0c0c] border border-white/[0.04] rounded-lg p-6">
              <div className="text-[13px] text-white/70 font-semibold mb-4">Position Sizing Formula</div>
              <div className="bg-white/[0.02] rounded-lg p-4 mono text-[12px] space-y-2 mb-4">
                <div className="text-[#00e5a0]/70">risk_amount = account × 10%</div>
                <div className="text-[#888]">stop_distance = |entry − stop_loss| ÷ entry</div>
                <div className="text-[#888]">position_size = risk_amount ÷ stop_distance</div>
                <div className="text-[#888]">margin = position_size ÷ leverage</div>
              </div>
              <p className="text-[12px] text-[#666] leading-relaxed">Tighter stop = larger position. Wider stop = smaller position. Risk stays constant at $1,000 regardless of setup.</p>
            </div>
          </div>
        </div>


        {/* Trade Log */}
        <div className="mb-14">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-[13px] mono text-[#888] tracking-[.15em] font-medium mb-2">COMPLETE TRADE LOG</h2>
              <p className="text-[12px] text-[#555] mono">{filtered.length} trades · Public trades delayed 48 hours</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <select value={filterPair} onChange={e => { setFilterPair(e.target.value); setPage(1) }}
              className="text-[12px] mono bg-[#0c0c0c] border border-white/[0.04] rounded-lg px-3 py-2 text-[#aaa] focus:outline-none focus:border-[#00e5a0]/30">
              <option value="">All Pairs</option>
              {uniquePairs.map((p: string) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select value={filterDirection} onChange={e => { setFilterDirection(e.target.value); setPage(1) }}
              className="text-[12px] mono bg-[#0c0c0c] border border-white/[0.04] rounded-lg px-3 py-2 text-[#aaa] focus:outline-none focus:border-[#00e5a0]/30">
              <option value="">All Sides</option>
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>

            <select value={filterResult} onChange={e => { setFilterResult(e.target.value); setPage(1) }}
              className="text-[12px] mono bg-[#0c0c0c] border border-white/[0.04] rounded-lg px-3 py-2 text-[#aaa] focus:outline-none focus:border-[#00e5a0]/30">
              <option value="">All Results</option>
              <option value="WIN">Winners</option>
              <option value="LOSS">Losers</option>
            </select>

            {(filterPair || filterDirection || filterResult) && (
              <button onClick={() => { setFilterPair(''); setFilterDirection(''); setFilterResult(''); setPage(1) }}
                className="text-[11px] mono text-[#555] hover:text-[#888] transition-colors px-2">
                Clear
              </button>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block border border-white/[0.04] rounded-lg overflow-hidden">
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
                      <td className="px-4 py-2.5 text-[#777]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                      <td className="px-4 py-2.5 text-[#aaa] font-medium">{t.pair.replace('/USDT', '')}</td>
                      <td className="px-4 py-2.5">
                        <span className={'px-1.5 py-0.5 rounded text-[11px] font-bold ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#777]">${t.entry_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-right text-[#777]">${t.exit_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-right text-[#c9a227]/50">${t.risk_amount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-[#555]">${Math.round(t.fees)}</td>
                      <td className={'px-4 py-2.5 text-right font-bold ' + (t.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {t.pnl >= 0 ? '+' : ''}${Math.round(t.pnl).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={'text-[11px] font-medium tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#888]">${Math.round(t.balance_after).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden border border-white/[0.04] rounded-lg overflow-hidden divide-y divide-white/[0.02]">
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
              <span className="text-[12px] text-[#555] mono">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                {[
                  { label: 'First', action: () => setPage(1), disabled: page === 1 },
                  { label: 'Prev', action: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
                  { label: 'Next', action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                  { label: 'Last', action: () => setPage(totalPages), disabled: page === totalPages },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} disabled={btn.disabled}
                    className="px-3 py-1.5 text-[12px] mono bg-[#0c0c0c] border border-white/[0.04] rounded-lg text-[#777] hover:text-[#aaa] hover:border-white/[0.06] disabled:text-[#333] disabled:hover:border-white/[0.04] transition-colors">
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* CTA */}
        <div className="bg-[#0c0c0c] border border-white/[0.04] rounded-lg p-10 text-center mb-10">
          <h3 className="text-xl font-bold mb-2">Get real-time signals.</h3>
          <p className="text-[14px] text-white/50 mb-6 max-w-md mx-auto">Public trades are delayed 48 hours. Subscribers get signals the moment they fire — straight to Telegram.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Link href="/auth/signup" className="flex-1 py-3 bg-[#00e5a0] text-black text-[13px] font-bold rounded-lg hover:bg-[#00cc8e] transition-colors text-center">
              Get Signals — $149/mo
            </Link>
            <Link href="/" className="flex-1 py-3 border border-white/[0.06] text-white/50 text-[13px] font-semibold rounded-lg hover:border-white/[0.12] hover:text-white/70 transition-all text-center">
              Learn More
            </Link>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-6 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[11px] text-white/30">© 2026 PulseWave Labs · Past performance does not guarantee future results.</span>
          <div className="flex gap-5 text-[11px] text-white/30">
            <Link href="/disclaimer" className="hover:text-white/50 transition-colors">Disclaimer</Link>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
