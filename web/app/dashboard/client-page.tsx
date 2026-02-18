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
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    )
  }

  var stats = performance ? (performance as any).stats : null
  var recentTrades = performance ? (performance as any).trades.slice(0, 10) : []
  var monthly = performance ? (performance as any).monthly : []
  var activeSignals = signals.filter(function(s: any) { return s.status === 'active' })
  var lastMonth = monthly.length > 0 ? monthly[monthly.length - 1] : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Signal Dashboard</h1>
        <p className="text-zinc-400">Real-time trading signals from the PulseWave bot</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400">+{stats.totalReturn.toFixed(1)}%</div>
            <div className="text-sm text-zinc-400">Total Return</div>
            <div className="text-xs text-zinc-500">${stats.startingCapital.toLocaleString()} → ${stats.finalBalance.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-400">{stats.winRate}%</div>
            <div className="text-sm text-zinc-400">Win Rate</div>
            <div className="text-xs text-zinc-500">{stats.wins}W / {stats.losses}L</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold text-purple-400">{stats.profitFactor}</div>
            <div className="text-sm text-zinc-400">Profit Factor</div>
            <div className="text-xs text-zinc-500">{stats.profitableMonths}/{stats.totalMonths} profitable months</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="text-2xl font-bold text-teal-400">${stats.avgMonthlyPnl.toLocaleString()}</div>
            <div className="text-sm text-zinc-400">Avg Monthly P&L</div>
            <div className="text-xs text-zinc-500">{lastMonth ? lastMonth.month + ': $' + lastMonth.pnl.toLocaleString() : ''}</div>
          </div>
        </div>
      )}

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Active Signals</h2>
        {activeSignals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📡</div>
            <p className="text-zinc-400 mb-1">No active signals right now</p>
            <p className="text-zinc-500 text-sm">The bot scans 6 pairs across 4h, 6h, and 12h timeframes. New signals are sent instantly via Telegram.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSignals.map(function(sig: any) {
              var isLong = sig.direction === 'LONG'
              return (
                <div key={sig.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={isLong ? 'px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400' : 'px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400'}>
                        {sig.direction}
                      </span>
                      <span className="font-bold text-lg">{sig.pair}</span>
                      <span className="text-zinc-500 text-sm">{sig.timeframe}</span>
                    </div>
                    <span className="text-zinc-400 text-sm">{sig.confidence}% confidence</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">Entry</span>
                      <div className="font-mono">${Number(sig.entry).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Stop Loss</span>
                      <div className="font-mono text-red-400">${Number(sig.stop_loss).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Take Profit</span>
                      <div className="font-mono text-green-400">${Number(sig.take_profit).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Trades</h2>
          <a href="/dashboard/history" className="text-green-400 text-sm hover:underline">View all →</a>
        </div>
        {recentTrades.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No trades yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-400 border-b border-zinc-800">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Pair</th>
                  <th className="pb-3 pr-4">Direction</th>
                  <th className="pb-3 pr-4">P&L</th>
                  <th className="pb-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(function(t: any, i: number) {
                  return (
                    <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                      <td className="py-3 pr-4 font-mono text-zinc-400">{new Date(t.entry_time).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 font-semibold">{t.pair}</td>
                      <td className="py-3 pr-4">
                        <span className={t.action === 'LONG' ? 'text-green-400' : 'text-red-400'}>{t.action}</span>
                      </td>
                      <td className={t.pnl >= 0 ? 'py-3 pr-4 font-mono font-bold text-green-400' : 'py-3 pr-4 font-mono font-bold text-red-400'}>
                        {t.pnl >= 0 ? '+' : ''}${Number(t.pnl).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={t.exit_reason === 'TP' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                          {t.exit_reason}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {monthly.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Monthly Performance</h2>
          <div className="space-y-2">
            {monthly.map(function(m: any) {
              var maxPnl = Math.max(...monthly.map(function(x: any) { return Math.abs(x.pnl) }))
              var width = maxPnl > 0 ? Math.abs(m.pnl) / maxPnl * 100 : 0
              return (
                <div key={m.month} className="flex items-center gap-4">
                  <span className="text-zinc-400 text-sm w-20 font-mono">{m.month}</span>
                  <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                    <div
                      className={m.pnl >= 0 ? 'h-full bg-green-500/40 rounded' : 'h-full bg-red-500/40 rounded'}
                      style={{ width: width + '%' }}
                    ></div>
                  </div>
                  <span className={m.pnl >= 0 ? 'text-green-400 font-mono text-sm w-24 text-right' : 'text-red-400 font-mono text-sm w-24 text-right'}>
                    {m.pnl >= 0 ? '+' : ''}${m.pnl.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
