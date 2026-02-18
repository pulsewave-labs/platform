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
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-48 h-px bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
          <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent scan-line"></div>
        </div>
        <div className="text-[#333] text-[10px] mono tracking-widest">LOADING HISTORY</div>
      </div>
    )
  }
  if (!data) return <div className="text-center py-20 text-[#ff4d4d] mono text-sm">FAILED TO LOAD</div>

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
    <div className="space-y-3">

      {/* Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-[#161616] rounded-lg overflow-hidden">
        {[
          { label: 'P&L', value: '+$' + Math.round(stats.finalBalance - stats.startingCapital).toLocaleString(), color: '#00e5a0' },
          { label: 'WIN RATE', value: stats.winRate + '%', color: '#e0e0e0' },
          { label: 'PF', value: stats.profitFactor.toFixed(2), color: '#e0e0e0' },
          { label: 'TRADES', value: String(stats.totalTrades), color: '#e0e0e0' },
          { label: 'AVG/MO', value: '$' + stats.avgMonthlyPnl.toLocaleString(), color: '#00e5a0' },
          { label: 'MAX DD', value: '-' + stats.maxDrawdown + '%', color: '#ff4d4d' },
        ].map(function(s, i) {
          return (
            <div key={i} className="bg-[#0c0c0c] px-3 py-2.5">
              <div className="text-[9px] text-[#444] mono tracking-widest leading-none mb-1.5">{s.label}</div>
              <div className="text-sm mono font-semibold leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: filterPair, setter: setFilterPair, options: ['ALL PAIRS'].concat(pairs), key: 'pair' },
          { value: filterDir, setter: setFilterDir, options: ['ALL SIDES', 'LONG', 'SHORT'], key: 'dir' },
          { value: filterResult, setter: setFilterResult, options: ['ALL RESULTS', 'WIN', 'LOSS', 'TP', 'SL'], key: 'result' },
        ].map(function(f) {
          return (
            <select key={f.key}
              value={f.value}
              onChange={function(e) { var v = e.target.value; if (v.startsWith('ALL')) v = ''; f.setter(v); setPage(1) }}
              className="px-2 py-1 bg-[#0c0c0c] border border-[#1a1a1a] rounded text-[10px] mono text-[#666] focus:outline-none focus:border-[#333] appearance-none cursor-pointer hover:border-[#222] transition-colors"
            >
              {f.options.map(function(opt) { return <option key={opt} value={opt.startsWith('ALL') ? '' : opt}>{opt}</option> })}
            </select>
          )
        })}
        {(filterPair || filterDir || filterResult) && (
          <button onClick={function() { setFilterPair(''); setFilterDir(''); setFilterResult(''); setPage(1) }}
            className="text-[10px] mono text-[#444] hover:text-[#666] transition-colors px-1">
            ✕ CLEAR
          </button>
        )}
        <div className="flex-1"></div>
        <div className="flex items-center gap-3 text-[9px] mono text-[#444]">
          <span>{filtered.length} trades</span>
          <span className={filteredPnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>
            {filteredPnl >= 0 ? '+' : ''}${Math.round(filteredPnl).toLocaleString()}
          </span>
          <span>{filtered.length > 0 ? (filteredWins / filtered.length * 100).toFixed(1) : 0}% WR</span>
          <span className="text-[#333]">${Math.round(filteredFees).toLocaleString()} fees</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#161616] rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-[10px] mono">
            <thead>
              <tr className="bg-[#0c0c0c] text-[#333]">
                <th className="text-left px-3 py-2 font-medium tracking-wider">DATE</th>
                <th className="text-left px-3 py-2 font-medium tracking-wider">PAIR</th>
                <th className="text-left px-3 py-2 font-medium tracking-wider">SIDE</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">ENTRY</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">SL</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">TP</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">EXIT</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">SIZE</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">RISK</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">FEES</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">P&L</th>
                <th className="text-center px-3 py-2 font-medium tracking-wider">EXIT</th>
                <th className="text-right px-3 py-2 font-medium tracking-wider">BAL</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(function(t: any, i: number) {
                var isWin = t.pnl >= 0
                return (
                  <tr key={i} className={'border-t border-[#111] transition-colors hover:bg-[#0e0e0e] ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                    <td className="px-3 py-1.5 text-[#444]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                    <td className="px-3 py-1.5 text-[#999] font-medium">{t.pair}</td>
                    <td className="px-3 py-1.5"><span className={t.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{t.action}</span></td>
                    <td className="px-3 py-1.5 text-right text-[#666]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-1.5 text-right text-[#ff4d4d]/30">${Number(t.stop_loss).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-1.5 text-right text-[#00e5a0]/30">${Number(t.take_profit).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-1.5 text-right text-[#666]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-1.5 text-right text-[#444]">${Math.round(Number(t.notional)).toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-[#c9a227]/70">${Number(t.risk_amount).toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-[#333]">${Number(t.fees).toFixed(0)}</td>
                    <td className={'px-3 py-1.5 text-right font-medium ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                      {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </td>
                    <td className="px-3 py-1.5 text-center"><span className={t.exit_reason === 'TP' ? 'text-[#00e5a0]/40' : 'text-[#ff4d4d]/40'}>{t.exit_reason}</span></td>
                    <td className="px-3 py-1.5 text-right text-[#555]">${Math.round(Number(t.balance_after)).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[10px] mono text-[#333]">
          <span>{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={function() { setPage(Math.max(1, page - 1)) }} disabled={page === 1}
              className="px-2 py-1 border border-[#161616] rounded hover:border-[#222] disabled:opacity-20 transition-colors">
              ←
            </button>
            <span className="px-2 text-[#444]">{page}/{totalPages}</span>
            <button onClick={function() { setPage(Math.min(totalPages, page + 1)) }} disabled={page === totalPages}
              className="px-2 py-1 border border-[#161616] rounded hover:border-[#222] disabled:opacity-20 transition-colors">
              →
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#131313] rounded-lg overflow-hidden text-[9px] mono">
        {[
          { label: 'RISK', value: '10% FIXED ($1,000)' },
          { label: 'LEVERAGE', value: '20×' },
          { label: 'SIZING', value: 'RISK ÷ STOP DISTANCE' },
          { label: 'EXCHANGE', value: 'BITGET USDT-M' },
        ].map(function(s, i) {
          return (
            <div key={i} className="bg-[#0a0a0a] px-3 py-2">
              <div className="text-[#222] tracking-wider mb-0.5">{s.label}</div>
              <div className="text-[#444]">{s.value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
