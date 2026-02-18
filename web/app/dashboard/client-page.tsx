'use client'

import { useState, useEffect } from 'react'

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
      <div className="flex items-center justify-center py-20">
        <div className="text-[#333] text-sm font-mono">Loading...</div>
      </div>
    )
  }

  var stats = performance ? (performance as any).stats : null
  var recentTrades = performance ? (performance as any).trades.slice(0, 15) : []
  var activeSignals = signals.filter(function(s: any) { return s.status === 'active' })

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-[#1a1a1a] rounded-lg overflow-hidden">
          {[
            { label: 'TOTAL P&L', value: '+$' + (stats.finalBalance - stats.startingCapital).toLocaleString(), color: 'text-green-400' },
            { label: 'RETURN', value: '+' + stats.totalReturn.toFixed(1) + '%', color: 'text-green-400' },
            { label: 'WIN RATE', value: stats.winRate + '%', color: 'text-white' },
            { label: 'PROFIT FACTOR', value: stats.profitFactor.toFixed(2), color: 'text-white' },
            { label: 'TRADES', value: stats.totalTrades.toString(), color: 'text-white' },
            { label: 'MAX DD', value: stats.maxDrawdown + '%', color: 'text-red-400' },
          ].map(function(s, i) {
            return (
              <div key={i} className="bg-[#0d0d0d] p-4">
                <div className="text-[10px] text-[#555] font-mono tracking-wider mb-1">{s.label}</div>
                <div className={'text-lg font-mono font-semibold ' + s.color}>{s.value}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Active signals */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xs font-mono text-[#555] tracking-wider">ACTIVE SIGNALS</h2>
          <span className="text-[10px] font-mono text-[#333]">{activeSignals.length}</span>
        </div>

        {activeSignals.length === 0 ? (
          <div className="border border-[#1a1a1a] rounded-lg p-8 text-center">
            <div className="text-[#333] font-mono text-sm mb-1">NO ACTIVE SIGNALS</div>
            <div className="text-[#222] text-xs">Bot is scanning for setups. Signals fire instantly via Telegram.</div>
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

              return (
                <div key={sig.id} className="border border-[#1a1a1a] rounded-lg overflow-hidden">
                  {/* Signal header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d]">
                    <div className="flex items-center gap-3">
                      <span className={'px-2 py-0.5 rounded text-[10px] font-mono font-bold ' + (isLong ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
                        {sig.direction}
                      </span>
                      <span className="font-mono font-semibold text-white">{sig.pair}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-[#555]">R:R</span>
                      <span className="text-green-400 font-semibold">{rr}:1</span>
                    </div>
                  </div>

                  {/* Levels */}
                  <div className="grid grid-cols-3 gap-px bg-[#1a1a1a]">
                    <div className="bg-[#0a0a0a] px-4 py-3">
                      <div className="text-[10px] text-[#444] font-mono mb-1">ENTRY</div>
                      <div className="font-mono text-sm text-white">${entry.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-3">
                      <div className="text-[10px] text-[#444] font-mono mb-1">STOP LOSS</div>
                      <div className="font-mono text-sm text-red-400">${sl.toLocaleString()}</div>
                      <div className="text-[10px] font-mono text-red-400/50">-{slPct}%</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-3">
                      <div className="text-[10px] text-[#444] font-mono mb-1">TAKE PROFIT</div>
                      <div className="font-mono text-sm text-green-400">${tp.toLocaleString()}</div>
                      <div className="text-[10px] font-mono text-green-400/50">+{tpPct}%</div>
                    </div>
                  </div>

                  {/* Position sizing */}
                  <div className="px-4 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a]">
                    <div className="text-[10px] text-[#444] font-mono mb-2">POSITION SIZING · 10% RISK · 20× LEVERAGE</div>
                    <div className="grid grid-cols-5 gap-2 text-[10px] font-mono">
                      <div className="text-[#444]">ACCOUNT</div>
                      <div className="text-[#444]">RISK</div>
                      <div className="text-[#444]">SIZE</div>
                      <div className="text-[#444]">MARGIN</div>
                      <div className="text-[#444] text-right">IF TP ↑</div>
                      {[1000, 5000, 10000, 25000, 50000].map(function(acct) {
                        var riskAmt = acct * 0.10
                        var posSize = risk > 0 ? riskAmt / (risk / entry) : 0
                        var margin = posSize / 20
                        var profit = (posSize / entry) * reward
                        return [
                          <div key={acct + 'a'} className="text-[#888]">${acct.toLocaleString()}</div>,
                          <div key={acct + 'r'} className="text-yellow-400/80">${riskAmt.toLocaleString()}</div>,
                          <div key={acct + 's'} className="text-[#888]">${Math.round(posSize).toLocaleString()}</div>,
                          <div key={acct + 'm'} className="text-[#555]">${Math.round(margin).toLocaleString()}</div>,
                          <div key={acct + 'p'} className="text-green-400 text-right">+${Math.round(profit).toLocaleString()}</div>,
                        ]
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent trades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono text-[#555] tracking-wider">RECENT TRADES</h2>
          <a href="/dashboard/history" className="text-[10px] font-mono text-[#444] hover:text-[#666] transition-colors">VIEW ALL →</a>
        </div>

        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-[#0d0d0d] text-[#444]">
                <th className="text-left px-3 py-2.5 font-medium">DATE</th>
                <th className="text-left px-3 py-2.5 font-medium">PAIR</th>
                <th className="text-left px-3 py-2.5 font-medium">SIDE</th>
                <th className="text-right px-3 py-2.5 font-medium">ENTRY</th>
                <th className="text-right px-3 py-2.5 font-medium">EXIT</th>
                <th className="text-right px-3 py-2.5 font-medium">P&L</th>
                <th className="text-center px-3 py-2.5 font-medium">EXIT</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map(function(t: any, i: number) {
                var isWin = t.pnl >= 0
                return (
                  <tr key={i} className="border-t border-[#141414] hover:bg-[#0d0d0d] transition-colors">
                    <td className="px-3 py-2.5 text-[#555]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-3 py-2.5 text-[#ccc] font-medium">{t.pair}</td>
                    <td className="px-3 py-2.5">
                      <span className={t.action === 'LONG' ? 'text-green-400' : 'text-red-400'}>{t.action}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-[#888]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-2.5 text-right text-[#888]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className={'px-3 py-2.5 text-right font-medium ' + (isWin ? 'text-green-400' : 'text-red-400')}>
                      {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={t.exit_reason === 'TP' ? 'text-green-400/60' : 'text-red-400/60'}>{t.exit_reason}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
