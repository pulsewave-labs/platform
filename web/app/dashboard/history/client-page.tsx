'use client'

import { useState, useEffect } from 'react'

export default function HistoryClientPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedMonth, setExpandedMonth] = useState(null as string | null)
  const [filterPair, setFilterPair] = useState('')
  const [filterDir, setFilterDir] = useState('')

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
        <div className="text-[#666] text-[10px] mono tracking-widest">LOADING HISTORY</div>
      </div>
    )
  }
  if (!data) return <div className="text-center py-20 text-[#ff4d4d] mono text-sm">FAILED TO LOAD</div>

  var stats = (data as any).stats
  var allTrades = (data as any).trades || []
  var monthly = (data as any).monthly || []

  // Group trades by month
  var tradesByMonth: Record<string, any[]> = {}
  allTrades.forEach(function(t: any) {
    var d = new Date(t.entry_time)
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    if (!tradesByMonth[key]) tradesByMonth[key] = []
    tradesByMonth[key].push(t)
  })

  // Get unique pairs for filter
  var pairs = Array.from(new Set(allTrades.map(function(t: any) { return t.pair }))).sort() as string[]

  return (
    <div className="space-y-4 pb-20 md:pb-0">

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
              <div className="text-[9px] text-[#777] mono tracking-widest leading-none mb-1.5">{s.label}</div>
              <div className="text-sm mono font-semibold leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {monthly.slice().reverse().map(function(m: any) {
          var isPos = m.pnl >= 0
          var isExpanded = expandedMonth === m.month
          var monthDate = new Date(m.month + '-01')
          var monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          var monthShort = monthDate.toLocaleDateString('en-US', { month: 'short' })
          var year = monthDate.getFullYear()
          var wr = m.trades > 0 ? (m.wins / m.trades * 100).toFixed(0) : '0'
          var maxPnl = Math.max.apply(null, monthly.map(function(x: any) { return Math.abs(x.pnl) }))
          var intensity = Math.min(Math.abs(m.pnl) / maxPnl, 1)

          var borderColor = isPos
            ? 'rgba(0, 229, 160, ' + (0.06 + intensity * 0.2) + ')'
            : 'rgba(255, 77, 77, ' + (0.06 + intensity * 0.2) + ')'

          return (
            <div key={m.month}>
              <button
                onClick={function() { setExpandedMonth(isExpanded ? null : m.month); setFilterPair(''); setFilterDir('') }}
                className="w-full text-left border rounded-lg overflow-hidden transition-all hover:border-[#333]"
                style={{ borderColor: isExpanded ? (isPos ? '#00e5a0' : '#ff4d4d') : borderColor, backgroundColor: '#0c0c0c' }}
              >
                {/* Top bar — thin color accent */}
                <div className="h-0.5" style={{ backgroundColor: isPos ? 'rgba(0, 229, 160, ' + (0.2 + intensity * 0.6) + ')' : 'rgba(255, 77, 77, ' + (0.2 + intensity * 0.6) + ')' }}></div>

                <div className="px-3 py-2.5">
                  {/* Month + Year */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-[#ccc]">{monthShort}</span>
                      <span className="text-[10px] text-[#777] ml-1.5 mono">{year}</span>
                    </div>
                    <div className={'text-sm mono font-bold ' + (isPos ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                      {isPos ? '+' : ''}${m.pnl.toLocaleString()}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-[9px] mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[#888]">{m.trades} trades</span>
                      <span className="text-[#666]">·</span>
                      <span className="text-[#888]">{wr}% WR</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#00e5a0]/60">{m.wins}W</span>
                      <span className="text-[#ff4d4d]/60">{m.losses}L</span>
                    </div>
                  </div>

                  {/* Mini win/loss dots */}
                  <div className="flex gap-px mt-2">
                    {(tradesByMonth[m.month] || []).slice().sort(function(a: any, b: any) {
                      return new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
                    }).map(function(t: any, ti: number) {
                      return (
                        <div key={ti}
                          className="h-1 rounded-full flex-1"
                          style={{
                            backgroundColor: t.pnl >= 0 ? 'rgba(0, 229, 160, 0.5)' : 'rgba(255, 77, 77, 0.4)',
                            maxWidth: '8px'
                          }}
                        ></div>
                      )
                    })}
                  </div>
                </div>
              </button>

              {/* Expanded trade list */}
              {isExpanded && (
                <div className="mt-1 border border-[#1a1a1a] rounded-lg bg-[#0a0a0a] overflow-hidden">
                  {/* Month header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#141414] bg-[#0c0c0c]">
                    <div className="text-[10px] mono text-[#888] tracking-widest">{monthName.toUpperCase()}</div>
                    <div className="flex items-center gap-2">
                      <select value={filterPair} onChange={function(e) { setFilterPair(e.target.value) }}
                        className="px-1.5 py-0.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded text-[9px] mono text-[#666] focus:outline-none">
                        <option value="">ALL</option>
                        {pairs.map(function(p) { return <option key={p} value={p}>{p}</option> })}
                      </select>
                      <select value={filterDir} onChange={function(e) { setFilterDir(e.target.value) }}
                        className="px-1.5 py-0.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded text-[9px] mono text-[#666] focus:outline-none">
                        <option value="">ALL</option>
                        <option value="LONG">LONG</option>
                        <option value="SHORT">SHORT</option>
                      </select>
                    </div>
                  </div>

                  {/* Trades table */}
                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-[10px] mono">
                      <thead>
                        <tr className="text-[#666] bg-[#0c0c0c]">
                          <th className="text-left px-3 py-1.5 font-medium">DATE</th>
                          <th className="text-left px-3 py-1.5 font-medium">PAIR</th>
                          <th className="text-left px-3 py-1.5 font-medium">SIDE</th>
                          <th className="text-right px-3 py-1.5 font-medium">ENTRY</th>
                          <th className="text-right px-3 py-1.5 font-medium">EXIT</th>
                          <th className="text-right px-3 py-1.5 font-medium">SIZE</th>
                          <th className="text-right px-3 py-1.5 font-medium">RISK</th>
                          <th className="text-right px-3 py-1.5 font-medium">FEES</th>
                          <th className="text-right px-3 py-1.5 font-medium">P&L</th>
                          <th className="text-center px-3 py-1.5 font-medium">EXIT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tradesByMonth[m.month] || []).slice().sort(function(a: any, b: any) {
                          return new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
                        }).filter(function(t: any) {
                          if (filterPair && t.pair !== filterPair) return false
                          if (filterDir && t.action !== filterDir) return false
                          return true
                        }).map(function(t: any, ti: number) {
                          var isWin = t.pnl >= 0
                          return (
                            <tr key={ti} className={'border-t border-[#111] hover:bg-[#0e0e0e] ' + (ti % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                              <td className="px-3 py-1.5 text-[#777]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                              <td className="px-3 py-1.5 text-[#999] font-medium">{t.pair}</td>
                              <td className="px-3 py-1.5"><span className={t.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{t.action}</span></td>
                              <td className="px-3 py-1.5 text-right text-[#666]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                              <td className="px-3 py-1.5 text-right text-[#666]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                              <td className="px-3 py-1.5 text-right text-[#777]">${Math.round(Number(t.notional)).toLocaleString()}</td>
                              <td className="px-3 py-1.5 text-right text-[#c9a227]/70">${Number(t.risk_amount).toLocaleString()}</td>
                              <td className="px-3 py-1.5 text-right text-[#666]">${Number(t.fees).toFixed(0)}</td>
                              <td className={'px-3 py-1.5 text-right font-medium ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                                {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                              </td>
                              <td className="px-3 py-1.5 text-center"><span className={t.exit_reason === 'TP' ? 'text-[#00e5a0]/40' : 'text-[#ff4d4d]/40'}>{t.exit_reason}</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Month summary footer */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#141414] bg-[#0c0c0c] text-[9px] mono text-[#777]">
                    <span>Balance after: <span className="text-[#888]">${m.balance.toLocaleString()}</span></span>
                    <span>Fees: <span className="text-[#888]">${Math.round((tradesByMonth[m.month] || []).reduce(function(s: number, t: any) { return s + t.fees }, 0)).toLocaleString()}</span></span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

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
              <div className="text-[#777]">{s.value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
