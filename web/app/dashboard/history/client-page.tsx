'use client'

import { useState, useEffect } from 'react'

export default function HistoryClientPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filterPair, setFilterPair] = useState('')
  const [filterDir, setFilterDir] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const perPage = 30

  useEffect(function load() {
    fetch('/api/performance')
      .then(function(res) { return res.json() })
      .then(function(result) { setData(result) })
      .catch(function() {})
      .finally(function() { setLoading(false) })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="text-[#333] text-sm font-mono">Loading...</div></div>
  }
  if (!data) {
    return <div className="text-center py-20 text-red-400 font-mono text-sm">Failed to load data</div>
  }

  var stats = (data as any).stats
  var allTrades = (data as any).trades || []
  var pairs = Array.from(new Set(allTrades.map(function(t: any) { return t.pair }))).sort() as string[]

  var filtered = allTrades.filter(function(t: any) {
    if (filterPair && t.pair !== filterPair) return false
    if (filterDir && t.action !== filterDir) return false
    if (filterResult === 'WIN' && t.pnl <= 0) return false
    if (filterResult === 'LOSS' && t.pnl > 0) return false
    if (filterResult === 'TP' && t.exit_reason !== 'TP') return false
    if (filterResult === 'SL' && t.exit_reason !== 'SL') return false
    return true
  })

  var totalPages = Math.ceil(filtered.length / perPage)
  var paginated = filtered.slice((page - 1) * perPage, page * perPage)

  var filteredPnl = filtered.reduce(function(s: number, t: any) { return s + t.pnl }, 0)
  var filteredWins = filtered.filter(function(t: any) { return t.pnl > 0 }).length
  var filteredFees = filtered.reduce(function(s: number, t: any) { return s + t.fees }, 0)

  return (
    <div className="space-y-4 pb-20 md:pb-0">

      {/* Summary strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-[#1a1a1a] rounded-lg overflow-hidden">
        {[
          { label: 'TOTAL P&L', value: '+$' + Math.round(stats.finalBalance - stats.startingCapital).toLocaleString(), color: 'text-green-400' },
          { label: 'WIN RATE', value: stats.winRate + '%', color: 'text-white' },
          { label: 'PROFIT FACTOR', value: stats.profitFactor.toFixed(2), color: 'text-white' },
          { label: 'TRADES', value: String(stats.totalTrades), color: 'text-white' },
          { label: 'AVG/MONTH', value: '$' + stats.avgMonthlyPnl.toLocaleString(), color: 'text-green-400' },
          { label: 'MAX DD', value: stats.maxDrawdown + '%', color: 'text-red-400' },
        ].map(function(s, i) {
          return (
            <div key={i} className="bg-[#0d0d0d] px-3 py-3">
              <div className="text-[9px] text-[#444] font-mono tracking-wider mb-0.5">{s.label}</div>
              <div className={'text-sm font-mono font-semibold ' + s.color}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={filterPair} onChange={function(e) { setFilterPair(e.target.value); setPage(1) }}
          className="px-2 py-1.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded text-xs font-mono text-[#888] focus:outline-none focus:border-[#333]">
          <option value="">ALL PAIRS</option>
          {pairs.map(function(p: any) { return <option key={p} value={p}>{p}</option> })}
        </select>
        <select value={filterDir} onChange={function(e) { setFilterDir(e.target.value); setPage(1) }}
          className="px-2 py-1.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded text-xs font-mono text-[#888] focus:outline-none focus:border-[#333]">
          <option value="">ALL SIDES</option>
          <option value="LONG">LONG</option>
          <option value="SHORT">SHORT</option>
        </select>
        <select value={filterResult} onChange={function(e) { setFilterResult(e.target.value); setPage(1) }}
          className="px-2 py-1.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded text-xs font-mono text-[#888] focus:outline-none focus:border-[#333]">
          <option value="">ALL RESULTS</option>
          <option value="WIN">WINNERS</option>
          <option value="LOSS">LOSERS</option>
          <option value="TP">TP ONLY</option>
          <option value="SL">SL ONLY</option>
        </select>
        {(filterPair || filterDir || filterResult) && (
          <button onClick={function() { setFilterPair(''); setFilterDir(''); setFilterResult(''); setPage(1) }}
            className="px-2 py-1.5 text-[10px] font-mono text-[#555] hover:text-[#888] transition-colors">
            CLEAR
          </button>
        )}
        <div className="flex-1"></div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#444]">
          <span>{filtered.length} trades</span>
          <span className={filteredPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
            {filteredPnl >= 0 ? '+' : ''}${Math.round(filteredPnl).toLocaleString()}
          </span>
          <span>WR {filtered.length > 0 ? (filteredWins / filtered.length * 100).toFixed(1) : 0}%</span>
          <span>Fees ${Math.round(filteredFees).toLocaleString()}</span>
        </div>
      </div>

      {/* Trade table */}
      <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="bg-[#0d0d0d] text-[#444]">
                <th className="text-left px-3 py-2.5 font-medium">DATE</th>
                <th className="text-left px-3 py-2.5 font-medium">PAIR</th>
                <th className="text-left px-3 py-2.5 font-medium">SIDE</th>
                <th className="text-right px-3 py-2.5 font-medium">ENTRY</th>
                <th className="text-right px-3 py-2.5 font-medium">SL</th>
                <th className="text-right px-3 py-2.5 font-medium">TP</th>
                <th className="text-right px-3 py-2.5 font-medium">EXIT</th>
                <th className="text-right px-3 py-2.5 font-medium">SIZE</th>
                <th className="text-right px-3 py-2.5 font-medium">RISK</th>
                <th className="text-right px-3 py-2.5 font-medium">FEES</th>
                <th className="text-right px-3 py-2.5 font-medium">P&L</th>
                <th className="text-center px-3 py-2.5 font-medium">EXIT</th>
                <th className="text-right px-3 py-2.5 font-medium">BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(function(t: any, i: number) {
                var isWin = t.pnl >= 0
                return (
                  <tr key={i} className="border-t border-[#141414] hover:bg-[#0d0d0d] transition-colors">
                    <td className="px-3 py-2 text-[#555]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                    <td className="px-3 py-2 text-[#ccc] font-medium">{t.pair}</td>
                    <td className="px-3 py-2"><span className={t.action === 'LONG' ? 'text-green-400' : 'text-red-400'}>{t.action}</span></td>
                    <td className="px-3 py-2 text-right text-[#888]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-2 text-right text-red-400/50">${Number(t.stop_loss).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-2 text-right text-green-400/50">${Number(t.take_profit).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-2 text-right text-[#888]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-2 text-right text-[#555]">${Math.round(Number(t.notional)).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-yellow-400/70">${Number(t.risk_amount).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-[#444]">${Number(t.fees).toFixed(0)}</td>
                    <td className={'px-3 py-2 text-right font-medium ' + (isWin ? 'text-green-400' : 'text-red-400')}>
                      {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </td>
                    <td className="px-3 py-2 text-center"><span className={t.exit_reason === 'TP' ? 'text-green-400/60' : 'text-red-400/60'}>{t.exit_reason}</span></td>
                    <td className="px-3 py-2 text-right text-[#666]">${Math.round(Number(t.balance_after)).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[10px] font-mono text-[#444]">
          <span>{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={function() { setPage(Math.max(1, page - 1)) }} disabled={page === 1}
              className="px-2 py-1 border border-[#1a1a1a] rounded hover:border-[#333] disabled:opacity-30 transition-colors">
              PREV
            </button>
            <span className="px-2">{page}/{totalPages}</span>
            <button onClick={function() { setPage(Math.min(totalPages, page + 1)) }} disabled={page === totalPages}
              className="px-2 py-1 border border-[#1a1a1a] rounded hover:border-[#333] disabled:opacity-30 transition-colors">
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* Trade settings footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1a1a] rounded-lg overflow-hidden text-[10px] font-mono">
        {[
          { label: 'RISK/TRADE', value: '10% ($1,000 fixed)' },
          { label: 'LEVERAGE', value: '20×' },
          { label: 'SIZING', value: 'Risk ÷ Stop Distance' },
          { label: 'EXCHANGE', value: 'Bitget USDT-M Futures' },
        ].map(function(s, i) {
          return (
            <div key={i} className="bg-[#0d0d0d] px-3 py-2.5">
              <div className="text-[#333] mb-0.5">{s.label}</div>
              <div className="text-[#666]">{s.value}</div>
            </div>
          )
        })}
      </div>

      <div className="text-[10px] font-mono text-[#222] text-center">
        Past performance does not guarantee future results. Position sizes: Risk ÷ (Entry − SL) × Entry.
      </div>
    </div>
  )
}
