'use client'

import { useState, useEffect } from 'react'

export default function HistoryClientPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(null as any)
  const [filterPair, setFilterPair] = useState('')
  const [filterDir, setFilterDir] = useState('')
  const [selectedTrade, setSelectedTrade] = useState(null as any)

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
        <div className="w-48 h-px bg-white/[0.04] rounded-full overflow-hidden mb-3">
          <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent scan-line"></div>
        </div>
        <div className="text-[#666] text-[13px] mono tracking-widest">LOADING HISTORY</div>
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

  var pairSet = new Set(allTrades.map(function(t: any) { return t.pair }))
  var pairs: string[] = Array.from(pairSet).sort()

  // Get trades for selected month
  var modalTrades = selectedMonth ? (tradesByMonth[selectedMonth.month] || []).slice().sort(function(a: any, b: any) {
    return new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
  }).filter(function(t: any) {
    if (filterPair && t.pair !== filterPair) return false
    if (filterDir && t.action !== filterDir) return false
    return true
  }) : []

  var monthDate = selectedMonth ? new Date(selectedMonth.month + '-01') : null
  var monthName = monthDate ? monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''

  return (
    <div className="space-y-4 pb-20 md:pb-0">

      {/* Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/[0.02] rounded-lg overflow-hidden">
        {[
          { label: 'TOTAL P&L', value: '+$' + Math.round(stats.finalBalance - stats.startingCapital).toLocaleString(), color: '#00e5a0' },
          { label: 'WIN RATE', value: stats.winRate + '%', color: '#e0e0e0' },
          { label: 'PROFIT FACTOR', value: stats.profitFactor.toFixed(2), color: '#e0e0e0' },
          { label: 'TRADES', value: String(stats.totalTrades), color: '#e0e0e0' },
          { label: 'AVG/MONTH', value: '$' + stats.avgMonthlyPnl.toLocaleString(), color: '#00e5a0' },
          { label: 'MAX DD', value: '-' + stats.maxDrawdown + '%', color: '#ff4d4d' },
        ].map(function(s, i) {
          return (
            <div key={i} className="bg-[#0c0c0c] px-4 py-3">
              <div className="text-[11px] text-[#666] mono tracking-[.15em] leading-none mb-2">{s.label}</div>
              <div className="text-[14px] mono font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Monthly Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[12px] mono text-[#888] tracking-[.15em] font-medium">MONTHLY BREAKDOWN</h2>
          <span className="text-[12px] mono text-[#555]">{monthly.length months</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {monthly.slice().reverse().map(function(m: any) {
            var isPos = m.pnl >= 0
            var monthD = new Date(m.month + '-01')
            var monthShort = monthD.toLocaleDateString('en-US', { month: 'short' })
            var year = monthD.getFullYear()
            var wr = m.trades > 0 ? (m.wins / m.trades * 100).toFixed(0) : '0'
            var maxPnl = Math.max.apply(null, monthly.map(function(x: any) { return Math.abs(x.pnl) }))
            var intensity = Math.min(Math.abs(m.pnl) / maxPnl, 1)

            return (
              <button
                key={m.month}
                onClick={function() { setSelectedMonth(m); setFilterPair(''); setFilterDir(''); setSelectedTrade(null) }}
                className="w-full text-left border border-white/[0.04] rounded-lg overflow-hidden transition-all hover:border-white/[0.08] bg-[#0c0c0c] group"
              >
                {/* Color accent bar */}
                <div className="h-0.5" style={{ backgroundColor: isPos ? 'rgba(0, 229, 160, ' + (0.15 + intensity * 0.6) + ')' : 'rgba(255, 77, 77, ' + (0.15 + intensity * 0.6) + ')' }}></div>

                <div className="px-3.5 py-3">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[14px] font-semibold text-[#ccc] group-hover:text-white transition-colors">{monthShort}</span>
                      <span className="text-[12px] text-[#666] ml-1.5 mono">{year}</span>
                    </div>
                    <div className={'text-[16px] mono font-bold ' + (isPos ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                      {isPos ? '+' : ''}${m.pnl.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[12px] mono mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#888]">{m.trades} trades</span>
                      <span className="text-[#333]">·</span>
                      <span className="text-[#888]">{wr}% WR</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#00e5a0]/60">{m.wins}W</span>
                      <span className="text-[#ff4d4d]/60">{m.losses}L</span>
                    </div>
                  </div>

                  {/* Win/loss dots */}
                  <div className="flex gap-px">
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
            )
          })}
        </div>
      </div>

      {/* Trade settings footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.02] rounded-lg overflow-hidden text-[12px] mono">
        {[
          { label: 'RISK', value: '10% FIXED ($1,000)' },
          { label: 'LEVERAGE', value: '20x' },
          { label: 'SIZING', value: 'RISK / STOP DISTANCE' },
          { label: 'EXCHANGE', value: 'BITGET USDT-M' },
        ].map(function(s, i) {
          return (
            <div key={i} className="bg-[#0c0c0c] px-4 py-3">
              <div className="text-[#444] tracking-[.1em] mb-0.5">{s.label}</div>
              <div className="text-[#888]">{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* ═══ MONTH DETAIL MODAL ═══ */}
      {selectedMonth && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center" onClick={function(e) { if (e.target === e.currentTarget) { setSelectedMonth(null); setSelectedTrade(null) } }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

          {/* Modal */}
          <div className="relative w-full max-w-4xl mx-4 mt-[5vh] md:mt-[8vh] max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] shrink-0">
              <div className="flex items-center gap-4">
                <h3 className="text-[14px] font-semibold text-white">{monthName}</h3>
                <span className={'text-[16px] mono font-bold ' + (selectedMonth.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                  {selectedMonth.pnl >= 0 ? '+' : ''}${selectedMonth.pnl.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Filters */}
                <select value={filterPair} onChange={function(e) { setFilterPair(e.target.value) }}
                  className="px-2 py-1 bg-[#0a0a0a] border border-white/[0.06] rounded-md text-[12px] mono text-[#888] focus:outline-none focus:border-white/[0.1]">
                  <option value="">ALL PAIRS</option>
                  {pairs.map(function(p) { return <option key={p} value={p}>{p}</option> })}
                </select>
                <select value={filterDir} onChange={function(e) { setFilterDir(e.target.value) }}
                  className="px-2 py-1 bg-[#0a0a0a] border border-white/[0.06] rounded-md text-[12px] mono text-[#888] focus:outline-none focus:border-white/[0.1]">
                  <option value="">ALL</option>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
                <button onClick={function() { setSelectedMonth(null); setSelectedTrade(null) }} className="text-[#555] hover:text-white transition-colors p-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Month stats */}
            <div className="grid grid-cols-4 gap-px bg-white/[0.02] shrink-0">
              {[
                { l: 'TRADES', v: String(selectedMonth.trades) },
                { l: 'WIN RATE', v: (selectedMonth.trades > 0 ? (selectedMonth.wins / selectedMonth.trades * 100).toFixed(0) : '0') + '%' },
                { l: 'WINS / LOSSES', v: selectedMonth.wins + 'W / ' + selectedMonth.losses + 'L' },
                { l: 'BALANCE', v: '$' + selectedMonth.balance.toLocaleString() },
              ].map(function(s, i) {
                return (
                  <div key={i} className="bg-[#0a0a0a] px-4 py-3">
                    <div className="text-[11px] text-[#555] mono tracking-[.12em] mb-1">{s.l}</div>
                    <div className="text-[13px] mono font-semibold text-[#ccc]">{s.v}</div>
                  </div>
                )
              })}
            </div>

            {/* Trades list */}
            <div className="flex-1 overflow-y-auto">
              {/* Desktop table */}
              <table className="w-full text-[13px] mono hidden md:table">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#0c0c0c] text-[#555] border-b border-white/[0.03]">
                    <th className="text-left px-4 py-3 font-medium tracking-[.1em]">DATE</th>
                    <th className="text-left px-4 py-3 font-medium tracking-[.1em]">PAIR</th>
                    <th className="text-left px-4 py-3 font-medium tracking-[.1em]">SIDE</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">ENTRY</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">EXIT</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">SIZE</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">FEES</th>
                    <th className="text-right px-4 py-3 font-medium tracking-[.1em]">P&L</th>
                    <th className="text-center px-4 py-3 font-medium tracking-[.1em]">RESULT</th>
                  </tr>
                </thead>
                <tbody>
                  {modalTrades.map(function(t: any, ti: number) {
                    var isWin = t.pnl >= 0
                    return (
                      <tr key={ti}
                        onClick={function() { setSelectedTrade(selectedTrade === t ? null : t) }}
                        className={'border-t border-white/[0.02] transition-colors cursor-pointer ' + (selectedTrade === t ? 'bg-white/[0.03]' : ti % 2 === 0 ? 'bg-[#0a0a0a] hover:bg-white/[0.01]' : 'bg-[#0b0b0b] hover:bg-white/[0.01]')}
                      >
                        <td className="px-4 py-3 text-[#777]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td className="px-4 py-3 text-[#aaa] font-medium">{t.pair}</td>
                        <td className="px-4 py-3"><span className={'px-1.5 py-0.5 rounded text-[11px] font-bold ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span></td>
                        <td className="px-4 py-3 text-right text-[#777]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-right text-[#777]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-right text-[#666]">${Math.round(Number(t.notional)).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-[#555]">${Number(t.fees).toFixed(0)}</td>
                        <td className={'px-4 py-3 text-right font-bold ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                          {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={'text-[11px] font-medium tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-white/[0.02]">
                {modalTrades.map(function(t: any, ti: number) {
                  var isWin = t.pnl >= 0
                  return (
                    <button key={ti} onClick={function() { setSelectedTrade(selectedTrade === t ? null : t) }} className={'w-full text-left px-4 py-3 transition-colors ' + (selectedTrade === t ? 'bg-white/[0.03]' : 'hover:bg-white/[0.01]')}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={'text-[14px] mono font-bold px-1.5 py-0.5 rounded ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                          <span className="text-[13px] text-[#aaa] mono font-medium">{t.pair}</span>
                        </div>
                        <span className={'text-[16px] mono font-bold ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px] mono text-[#555]">
                        <span>{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})} → ${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                        <span className={'font-medium ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/40' : 'text-[#ff4d4d]/40')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-[#0b0b0b] shrink-0">
              <span className="text-[12px] mono text-[#555]">{modalTrades.length} trades shown</span>
              <span className="text-[12px] mono text-[#555]">Fees: ${Math.round((tradesByMonth[selectedMonth.month] || []).reduce(function(s: number, t: any) { return s + t.fees }, 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRADE DETAIL MODAL ═══ */}
      {selectedTrade && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center" onClick={function(e) { if (e.target === e.currentTarget) setSelectedTrade(null) }}>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative w-full max-w-md mx-4 bg-[#0c0c0c] border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden">
            {/* Trade header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className={'text-[12px] font-bold mono px-2 py-0.5 rounded ' + (selectedTrade.action === 'LONG' ? 'bg-[#00e5a0]/[0.08] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.08] text-[#ff4d4d]')}>{selectedTrade.action}</span>
                <span className="text-[14px] font-bold mono text-white">{selectedTrade.pair}</span>
              </div>
              <button onClick={function() { setSelectedTrade(null) }} className="text-[#555] hover:text-white transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* P&L hero */}
            <div className="px-5 py-5 text-center border-b border-white/[0.03]">
              <div className={'text-[28px] font-bold mono ' + (selectedTrade.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                {selectedTrade.pnl >= 0 ? '+' : ''}${Number(selectedTrade.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
              </div>
              <div className="text-[12px] mono text-[#555] mt-1">
                {selectedTrade.exit_reason === 'TP' ? 'Take Profit Hit' : 'Stop Loss Hit'}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-px bg-white/[0.02]">
              {[
                { l: 'ENTRY', v: '$' + Number(selectedTrade.entry_price).toLocaleString(undefined, {maximumFractionDigits: 4}) },
                { l: 'EXIT', v: '$' + Number(selectedTrade.exit_price).toLocaleString(undefined, {maximumFractionDigits: 4}) },
                { l: 'STOP LOSS', v: selectedTrade.stop_loss ? '$' + Number(selectedTrade.stop_loss).toLocaleString(undefined, {maximumFractionDigits: 4}) : '—' },
                { l: 'TAKE PROFIT', v: selectedTrade.take_profit ? '$' + Number(selectedTrade.take_profit).toLocaleString(undefined, {maximumFractionDigits: 4}) : '—' },
                { l: 'POSITION SIZE', v: '$' + Math.round(Number(selectedTrade.notional || 0)).toLocaleString() },
                { l: 'RISK AMOUNT', v: '$' + Number(selectedTrade.risk_amount || 0).toLocaleString() },
                { l: 'FEES', v: '$' + Number(selectedTrade.fees || 0).toFixed(2) },
                { l: 'BALANCE AFTER', v: '$' + Math.round(Number(selectedTrade.balance_after || 0)).toLocaleString() },
              ].map(function(d, i) {
                return (
                  <div key={i} className="bg-[#0a0a0a] px-4 py-3">
                    <div className="text-[11px] text-[#555] mono tracking-[.12em] mb-1">{d.l}</div>
                    <div className="text-[13px] mono font-medium text-[#ccc]">{d.v}</div>
                  </div>
                )
              })}
            </div>

            {/* Timing */}
            <div className="px-5 py-3 border-t border-white/[0.03] flex items-center justify-between text-[12px] mono text-[#555]">
              <span>Entry: {new Date(selectedTrade.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(selectedTrade.entry_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>Exit: {selectedTrade.exit_time ? new Date(selectedTrade.exit_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(selectedTrade.exit_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
