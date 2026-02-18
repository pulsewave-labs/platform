'use client'

import { useState, useEffect } from 'react'

function timeAgo(dateStr: string) {
  var ms = Date.now() - new Date(dateStr).getTime()
  var mins = Math.floor(ms / 60000)
  if (mins < 60) return mins + 'm ago'
  var hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}

function MiniSparkline({ data, width, height }: { data: number[], width: number, height: number }) {
  if (!data || data.length < 2) return null
  var min = Math.min.apply(null, data)
  var max = Math.max.apply(null, data)
  var range = max - min || 1
  var points = data.map(function(v, i) {
    return (i / (data.length - 1)) * width + ',' + (height - ((v - min) / range) * height)
  }).join(' ')
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

export default function DashboardClientPage() {
  const [signals, setSignals] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function init() {
    Promise.all([
      fetch('/api/signals').then(function(r) { return r.json() }).catch(function() { return { signals: [] } }),
      fetch('/api/performance').then(function(r) { return r.json() }).catch(function() { return null }),
    ]).then(function(results) {
      setSignals(results[0].signals || [])
      setPerformance(results[1])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-48 h-px bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
          <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent scan-line"></div>
        </div>
        <div className="text-[#333] text-[10px] mono tracking-widest">LOADING TERMINAL</div>
      </div>
    )
  }

  var stats = performance ? (performance as any).stats : null
  var monthly = performance ? (performance as any).monthly || [] : []
  var recentTrades = performance ? (performance as any).trades.slice(0, 20) : []
  var activeSignals = signals.filter(function(s: any) { return s.status === 'active' })
  var equityCurve = monthly.map(function(m: any) { return m.balance })

  // Streak calc
  var currentStreak = 0
  var streakType = ''
  for (var i = 0; i < recentTrades.length; i++) {
    if (i === 0) {
      streakType = recentTrades[i].pnl >= 0 ? 'W' : 'L'
      currentStreak = 1
    } else if ((recentTrades[i].pnl >= 0 ? 'W' : 'L') === streakType) {
      currentStreak++
    } else break
  }

  return (
    <div className="space-y-4">

      {/* Equity + Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          {/* Main stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-[#161616] rounded-lg overflow-hidden">
            {[
              { label: 'P&L', value: '+$' + (stats.finalBalance - stats.startingCapital).toLocaleString(), color: '#00e5a0' },
              { label: 'RETURN', value: '+' + stats.totalReturn.toFixed(1) + '%', color: '#00e5a0' },
              { label: 'WIN RATE', value: stats.winRate + '%', color: '#e0e0e0' },
              { label: 'PF', value: stats.profitFactor.toFixed(2), color: '#e0e0e0' },
              { label: 'TRADES', value: String(stats.totalTrades), color: '#e0e0e0' },
              { label: 'MAX DD', value: '-' + stats.maxDrawdown + '%', color: '#ff4d4d' },
            ].map(function(s, i) {
              return (
                <div key={i} className="bg-[#0c0c0c] px-3 py-2.5">
                  <div className="text-[9px] text-[#444] mono tracking-widest leading-none mb-1.5">{s.label}</div>
                  <div className="text-base mono font-semibold leading-none" style={{ color: s.color }}>{s.value}</div>
                </div>
              )
            })}
          </div>

          {/* Mini equity curve */}
          {equityCurve.length > 2 && (
            <div className="bg-[#0c0c0c] border border-[#161616] rounded-lg px-4 py-2.5 flex flex-col items-center justify-center">
              <div className="text-[9px] text-[#444] mono tracking-widest mb-1">EQUITY</div>
              <MiniSparkline data={equityCurve} width={120} height={32} />
              <div className="text-[9px] mono text-[#555] mt-1">${stats.startingCapital.toLocaleString()} → ${stats.finalBalance.toLocaleString()}</div>
            </div>
          )}
        </div>
      )}

      {/* Active Signals */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-[10px] mono text-[#555] tracking-widest font-medium">ACTIVE SIGNALS</h2>
          <span className="text-[10px] mono px-1.5 py-0.5 rounded bg-[#161616] text-[#444]">{activeSignals.length}</span>
        </div>

        {activeSignals.length === 0 ? (
          <div className="border border-[#161616] rounded-lg py-10 flex flex-col items-center">
            <div className="w-32 h-px bg-[#161616] rounded-full overflow-hidden mb-4">
              <div className="w-10 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/30 to-transparent scan-line"></div>
            </div>
            <div className="text-[#444] mono text-xs mb-0.5">SCANNING FOR SETUPS</div>
            <div className="text-[#282828] text-[10px] mono">Signals fire instantly via Telegram when detected</div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeSignals.map(function(sig: any) {
              var isLong = sig.direction === 'LONG'
              var entry = Number(sig.entry)
              var sl = Number(sig.stop_loss)
              var tp = Number(sig.take_profit)
              var risk = Math.abs(entry - sl)
              var reward = Math.abs(tp - entry)
              var rr = risk > 0 ? (reward / risk).toFixed(1) : '0'
              var slPct = ((risk / entry) * 100).toFixed(2)
              var tpPct = ((reward / entry) * 100).toFixed(2)
              var rrNum = risk > 0 ? reward / risk : 0
              var barWidth = Math.min(rrNum / 4 * 100, 100) // cap at 4:1

              return (
                <div key={sig.id} className="border border-[#161616] rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#0c0c0c]">
                    <div className="flex items-center gap-3">
                      <span className={'px-2 py-0.5 rounded text-[10px] mono font-bold tracking-wider ' + (isLong ? 'bg-[#00e5a0]/8 text-[#00e5a0] border border-[#00e5a0]/15' : 'bg-[#ff4d4d]/8 text-[#ff4d4d] border border-[#ff4d4d]/15')}>
                        {sig.direction}
                      </span>
                      <span className="mono font-semibold text-white text-sm">{sig.pair}</span>
                      <span className="text-[10px] mono text-[#333]">{timeAgo(sig.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[9px] mono text-[#444]">R:R</div>
                        <div className="text-sm mono font-bold text-[#00e5a0]">{rr}:1</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk/Reward visual bar */}
                  <div className="h-1 bg-[#161616] flex">
                    <div className="h-full bg-[#ff4d4d]/30" style={{ width: '25%' }}></div>
                    <div className="h-full bg-[#00e5a0]/40" style={{ width: barWidth * 0.75 + '%' }}></div>
                  </div>

                  {/* Levels */}
                  <div className="grid grid-cols-3 gap-px bg-[#131313]">
                    <div className="bg-[#0a0a0a] px-4 py-2.5">
                      <div className="text-[9px] text-[#444] mono tracking-wider mb-1">ENTRY</div>
                      <div className="mono text-sm text-white font-medium">${entry.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-2.5">
                      <div className="text-[9px] text-[#444] mono tracking-wider mb-1">STOP LOSS</div>
                      <div className="mono text-sm text-[#ff4d4d] font-medium">${sl.toLocaleString()}</div>
                      <div className="text-[9px] mono text-[#ff4d4d]/40">-{slPct}%</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-2.5">
                      <div className="text-[9px] text-[#444] mono tracking-wider mb-1">TAKE PROFIT</div>
                      <div className="mono text-sm text-[#00e5a0] font-medium">${tp.toLocaleString()}</div>
                      <div className="text-[9px] mono text-[#00e5a0]/40">+{tpPct}%</div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  {sig.reasoning && (
                    <div className="px-4 py-2 bg-[#0a0a0a] border-t border-[#131313]">
                      <div className="text-[10px] text-[#555] leading-relaxed">{sig.reasoning}</div>
                    </div>
                  )}

                  {/* Position sizing */}
                  <div className="px-4 py-2.5 bg-[#0a0a0a] border-t border-[#131313]">
                    <div className="text-[9px] text-[#333] mono tracking-wider mb-2">POSITION SIZING · 10% RISK · 20× LEV</div>
                    <div className="grid grid-cols-5 gap-x-2 gap-y-0.5 text-[10px] mono">
                      <div className="text-[#333] pb-0.5">ACCT</div>
                      <div className="text-[#333] pb-0.5">RISK</div>
                      <div className="text-[#333] pb-0.5">SIZE</div>
                      <div className="text-[#333] pb-0.5">MARGIN</div>
                      <div className="text-[#333] pb-0.5 text-right">TP PROFIT</div>
                      {[1000, 5000, 10000, 25000, 50000].map(function(acct) {
                        var riskAmt = acct * 0.10
                        var posSize = risk > 0 ? riskAmt / (risk / entry) : 0
                        var margin = posSize / 20
                        var profit = (posSize / entry) * reward
                        return [
                          <div key={acct + 'a'} className="text-[#666]">${acct >= 1000 ? (acct / 1000) + 'K' : acct}</div>,
                          <div key={acct + 'r'} className="text-[#c9a227]">${riskAmt >= 1000 ? (riskAmt / 1000).toFixed(1) + 'K' : riskAmt}</div>,
                          <div key={acct + 's'} className="text-[#666]">${Math.round(posSize) >= 1000 ? (Math.round(posSize) / 1000).toFixed(0) + 'K' : Math.round(posSize)}</div>,
                          <div key={acct + 'm'} className="text-[#444]">${Math.round(margin) >= 1000 ? (Math.round(margin) / 1000).toFixed(1) + 'K' : Math.round(margin)}</div>,
                          <div key={acct + 'p'} className="text-[#00e5a0] text-right">+${Math.round(profit) >= 1000 ? (Math.round(profit) / 1000).toFixed(1) + 'K' : Math.round(profit)}</div>,
                        ]
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent Trades */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] mono text-[#555] tracking-widest font-medium">RECENT TRADES</h2>
            {currentStreak > 1 && (
              <span className={'text-[9px] mono px-1.5 py-0.5 rounded ' + (streakType === 'W' ? 'bg-[#00e5a0]/8 text-[#00e5a0]' : 'bg-[#ff4d4d]/8 text-[#ff4d4d]')}>
                {currentStreak}{streakType} STREAK
              </span>
            )}
          </div>
          <a href="/dashboard/history" className="text-[10px] mono text-[#333] hover:text-[#555] transition-colors">ALL TRADES →</a>
        </div>

        <div className="border border-[#161616] rounded-lg overflow-hidden">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-[11px] mono">
              <thead>
                <tr className="bg-[#0c0c0c] text-[#333]">
                  <th className="text-left px-3 py-2 font-medium tracking-wider">DATE</th>
                  <th className="text-left px-3 py-2 font-medium tracking-wider">PAIR</th>
                  <th className="text-left px-3 py-2 font-medium tracking-wider">SIDE</th>
                  <th className="text-right px-3 py-2 font-medium tracking-wider">ENTRY</th>
                  <th className="text-right px-3 py-2 font-medium tracking-wider">EXIT</th>
                  <th className="text-right px-3 py-2 font-medium tracking-wider">P&L</th>
                  <th className="text-center px-3 py-2 font-medium tracking-wider">EXIT</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(function(t: any, i: number) {
                  var isWin = t.pnl >= 0
                  return (
                    <tr key={i} className={'border-t border-[#111] transition-colors hover:bg-[#0e0e0e] ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                      <td className="px-3 py-2 text-[#444]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td className="px-3 py-2 text-[#999] font-medium">{t.pair}</td>
                      <td className="px-3 py-2">
                        <span className={t.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{t.action}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-[#666]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="px-3 py-2 text-right text-[#666]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className={'px-3 py-2 text-right font-medium ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={t.exit_reason === 'TP' ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50'}>{t.exit_reason}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Monthly Performance Mini Grid */}
      {monthly.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-[10px] mono text-[#555] tracking-widest font-medium">MONTHLY P&L</h2>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-12 lg:grid-cols-25 gap-1">
            {monthly.map(function(m: any, i: number) {
              var isPositive = m.pnl >= 0
              var maxPnl = Math.max.apply(null, monthly.map(function(x: any) { return Math.abs(x.pnl) }))
              var intensity = Math.abs(m.pnl) / maxPnl
              var bg = isPositive
                ? 'rgba(0, 229, 160, ' + (0.05 + intensity * 0.35) + ')'
                : 'rgba(255, 77, 77, ' + (0.05 + intensity * 0.35) + ')'
              return (
                <div key={i} className="rounded aspect-square flex flex-col items-center justify-center group relative cursor-default" style={{ backgroundColor: bg }}>
                  <div className="text-[8px] mono text-[#555] leading-none">{m.month.split('-')[1]}</div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1a1a1a] border border-[#222] rounded px-2 py-1 text-[9px] mono whitespace-nowrap z-10">
                    <span className={isPositive ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>
                      {m.month}: {isPositive ? '+' : ''}${m.pnl.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
