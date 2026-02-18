'use client'

import { useState, useEffect } from 'react'

function timeAgo(dateStr) {
  var ms = Date.now() - new Date(dateStr).getTime()
  var mins = Math.floor(ms / 60000)
  if (mins < 60) return mins + 'm ago'
  var hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}

export default function SignalsClientPage() {
  var [signals, setSignals] = useState([])
  var [performance, setPerformance] = useState(null)
  var [loading, setLoading] = useState(true)

  function fetchData() {
    return Promise.all([
      fetch('/api/signals').then(function(r) { return r.json() }).catch(function() { return { signals: [] } }),
      fetch('/api/performance').then(function(r) { return r.json() }).catch(function() { return null }),
    ]).then(function(results) {
      setSignals(results[0].signals || [])
      setPerformance(results[1])
      setLoading(false)
    })
  }

  useEffect(function init() {
    fetchData()
    var iv = setInterval(fetchData, 60000)
    return function() { clearInterval(iv) }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-48 h-px bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
          <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent scan-line"></div>
        </div>
        <div className="text-[#666] text-[13px] mono tracking-widest">LOADING SIGNALS</div>
      </div>
    )
  }

  var allTrades = performance ? performance.trades || [] : []
  var activeSignals = signals.filter(function(s) { return s.status === 'active' })
  var closedSignals = signals.filter(function(s) { return s.status !== 'active' }).slice(0, 20)

  // Pair performance from trades
  var pairPerf = {}
  allTrades.forEach(function(t) {
    var p = t.pair || ''
    if (!pairPerf[p]) pairPerf[p] = { pnl: 0, trades: 0, wins: 0 }
    pairPerf[p].pnl += t.pnl
    pairPerf[p].trades++
    if (t.pnl > 0) pairPerf[p].wins++
  })
  var pairList = Object.entries(pairPerf).map(function(e) { return { pair: e[0], pnl: e[1].pnl, trades: e[1].trades, wins: e[1].wins } }).sort(function(a, b) { return b.pnl - a.pnl })

  return (
    <div className="space-y-4">

      {/* Active Signals */}
      <section>
        <div className="flex items-center gap-2.5 mb-3">
          <h2 className="text-[14px] mono text-[#888] tracking-[.15em] font-medium">ACTIVE SIGNALS</h2>
          <span className="text-[13px] mono px-2 py-0.5 rounded-md bg-white/[0.03] text-[#777]">{activeSignals.length}</span>
        </div>

        {activeSignals.length === 0 ? (
          <div className="border border-white/[0.04] rounded-lg bg-[#0c0c0c] overflow-hidden">
            <div className="py-10 flex flex-col items-center">
              <div className="w-40 h-px bg-white/[0.04] rounded-full overflow-hidden mb-5">
                <div className="w-12 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/30 to-transparent scan-line"></div>
              </div>
              <div className="text-[#888] mono text-[14px] font-medium mb-1">Scanning for setups...</div>
              <div className="text-[#444] text-[12px] mono">Signals fire instantly via Telegram when detected</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeSignals.map(function(sig) {
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
              var barWidth = Math.min(rrNum / 4 * 100, 100)

              return (
                <div key={sig.id} className="border border-[#161616] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0c]">
                    <div className="flex items-center gap-3">
                      <span className={'px-2 py-0.5 rounded text-[12px] mono font-bold tracking-wider ' + (isLong ? 'bg-[#00e5a0]/8 text-[#00e5a0] border border-[#00e5a0]/15' : 'bg-[#ff4d4d]/8 text-[#ff4d4d] border border-[#ff4d4d]/15')}>
                        {sig.direction}
                      </span>
                      <span className="mono font-semibold text-white text-[14px]">{sig.pair}</span>
                      <span className="text-[12px] mono text-[#666]">{timeAgo(sig.created_at)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] mono text-[#777]">R:R</div>
                      <div className="text-[16px] mono font-bold text-[#00e5a0]">{rr}:1</div>
                    </div>
                  </div>

                  <div className="h-1 bg-[#161616] flex">
                    <div className="h-full bg-[#ff4d4d]/30" style={{ width: '25%' }}></div>
                    <div className="h-full bg-[#00e5a0]/40" style={{ width: barWidth * 0.75 + '%' }}></div>
                  </div>

                  <div className="grid grid-cols-3 gap-px bg-[#131313]">
                    <div className="bg-[#0a0a0a] px-4 py-3">
                      <div className="text-[12px] text-[#777] mono tracking-wider mb-1">ENTRY</div>
                      <div className="mono text-[16px] text-white font-medium">${entry.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-3">
                      <div className="text-[12px] text-[#777] mono tracking-wider mb-1">STOP LOSS</div>
                      <div className="mono text-[16px] text-[#ff4d4d] font-medium">${sl.toLocaleString()}</div>
                      <div className="text-[12px] mono text-[#ff4d4d]/40">-{slPct}%</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-3">
                      <div className="text-[12px] text-[#777] mono tracking-wider mb-1">TAKE PROFIT</div>
                      <div className="mono text-[16px] text-[#00e5a0] font-medium">${tp.toLocaleString()}</div>
                      <div className="text-[12px] mono text-[#00e5a0]/40">+{tpPct}%</div>
                    </div>
                  </div>

                  {sig.reasoning && (
                    <div className="px-4 py-2 bg-[#0a0a0a] border-t border-[#131313]">
                      <div className="text-[13px] text-[#888] leading-relaxed">{sig.reasoning}</div>
                    </div>
                  )}

                  <div className="px-4 py-3 bg-[#0a0a0a] border-t border-[#131313]">
                    <div className="text-[12px] text-[#666] mono tracking-wider mb-2">POSITION SIZING · 10% RISK · 20x LEV</div>
                    <div className="grid grid-cols-5 gap-x-2 gap-y-1 text-[13px] mono">
                      <div className="text-[#666] pb-0.5">ACCT</div>
                      <div className="text-[#666] pb-0.5">RISK</div>
                      <div className="text-[#666] pb-0.5">SIZE</div>
                      <div className="text-[#666] pb-0.5">MARGIN</div>
                      <div className="text-[#666] pb-0.5 text-right">TP PROFIT</div>
                      {[1000, 5000, 10000, 25000, 50000].map(function(acct) {
                        var riskAmt = acct * 0.10
                        var posSize = risk > 0 ? riskAmt / (risk / entry) : 0
                        var margin = posSize / 20
                        var profit = (posSize / entry) * reward
                        return [
                          <div key={acct + 'a'} className="text-[#666]">${acct >= 1000 ? (acct / 1000) + 'K' : acct}</div>,
                          <div key={acct + 'r'} className="text-[#c9a227]">${riskAmt >= 1000 ? (riskAmt / 1000).toFixed(1) + 'K' : riskAmt}</div>,
                          <div key={acct + 's'} className="text-[#666]">${Math.round(posSize) >= 1000 ? (Math.round(posSize) / 1000).toFixed(0) + 'K' : Math.round(posSize)}</div>,
                          <div key={acct + 'm'} className="text-[#777]">${Math.round(margin) >= 1000 ? (Math.round(margin) / 1000).toFixed(1) + 'K' : Math.round(margin)}</div>,
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

      {/* Signal History */}
      {closedSignals.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <h2 className="text-[14px] mono text-[#888] tracking-[.15em] font-medium">SIGNAL HISTORY</h2>
            <span className="text-[13px] mono px-2 py-0.5 rounded-md bg-white/[0.03] text-[#777]">{closedSignals.length}</span>
          </div>

          <div className="hidden md:block border border-white/[0.04] rounded-lg overflow-hidden">
            <table className="w-full text-[13px] mono">
              <thead>
                <tr className="bg-[#0c0c0c] text-[#555]">
                  <th className="text-left px-4 py-3 font-medium tracking-[.1em] text-[11px]">DATE</th>
                  <th className="text-left px-4 py-3 font-medium tracking-[.1em] text-[11px]">PAIR</th>
                  <th className="text-left px-4 py-3 font-medium tracking-[.1em] text-[11px]">DIRECTION</th>
                  <th className="text-right px-4 py-3 font-medium tracking-[.1em] text-[11px]">ENTRY</th>
                  <th className="text-right px-4 py-3 font-medium tracking-[.1em] text-[11px]">SL</th>
                  <th className="text-right px-4 py-3 font-medium tracking-[.1em] text-[11px]">TP</th>
                  <th className="text-center px-4 py-3 font-medium tracking-[.1em] text-[11px]">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {closedSignals.map(function(sig, i) {
                  var isTP = sig.status === 'hit_tp' || sig.status === 'tp'
                  var isSL = sig.status === 'hit_sl' || sig.status === 'sl'
                  var statusLabel = isTP ? 'HIT TP' : isSL ? 'HIT SL' : sig.status.toUpperCase()
                  var statusColor = isTP ? 'text-[#00e5a0]/60' : isSL ? 'text-[#ff4d4d]/60' : 'text-[#777]'
                  return (
                    <tr key={sig.id || i} className={'border-t border-white/[0.02] ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                      <td className="px-4 py-3 text-[#777]">{new Date(sig.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 py-3 text-[#aaa] font-medium">{sig.pair}</td>
                      <td className="px-4 py-3">
                        <span className={'px-1.5 py-0.5 rounded text-[11px] font-bold ' + (sig.direction === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{sig.direction}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-[#777]">${Number(sig.entry).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[#ff4d4d]/40">${Number(sig.stop_loss).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[#00e5a0]/40">${Number(sig.take_profit).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={'text-[11px] font-medium tracking-wider ' + statusColor}>{statusLabel}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden border border-white/[0.04] rounded-lg overflow-hidden divide-y divide-white/[0.02]">
            {closedSignals.map(function(sig, i) {
              var isTP = sig.status === 'hit_tp' || sig.status === 'tp'
              var isSL = sig.status === 'hit_sl' || sig.status === 'sl'
              var statusLabel = isTP ? 'HIT TP' : isSL ? 'HIT SL' : sig.status.toUpperCase()
              var statusColor = isTP ? 'text-[#00e5a0]/50' : isSL ? 'text-[#ff4d4d]/50' : 'text-[#777]'
              return (
                <div key={sig.id || i} className={'px-4 py-3 ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={'text-[12px] mono font-bold px-1.5 py-0.5 rounded ' + (sig.direction === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{sig.direction}</span>
                      <span className="text-[14px] text-[#aaa] mono font-medium">{sig.pair}</span>
                    </div>
                    <span className={'text-[12px] mono font-medium tracking-wider ' + statusColor}>{statusLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] mono text-[#555]">
                    <span>{new Date(sig.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>E: ${Number(sig.entry).toLocaleString()} / SL: ${Number(sig.stop_loss).toLocaleString()} / TP: ${Number(sig.take_profit).toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Pair Performance */}
      {pairList.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <h2 className="text-[14px] mono text-[#888] tracking-[.15em] font-medium">PAIR PERFORMANCE</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {pairList.map(function(p) {
              var wr = p.trades > 0 ? (p.wins / p.trades * 100).toFixed(0) : '0'
              var avgPnl = p.trades > 0 ? Math.round(p.pnl / p.trades) : 0
              var best = pairList[0].pnl
              var barW = best > 0 ? Math.max(5, (p.pnl / best) * 100) : 0
              return (
                <div key={p.pair} className="bg-[#0c0c0c] border border-white/[0.04] rounded-lg px-4 py-3 hover:border-white/[0.06] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] mono font-medium text-[#aaa]">{p.pair.replace('/USDT', '')}</span>
                    <span className="text-[13px] mono text-[#555]">{p.trades} trades</span>
                  </div>
                  <div className={'text-[24px] mono font-bold mb-1.5 ' + (p.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                    {p.pnl >= 0 ? '+' : ''}${Math.round(p.pnl).toLocaleString()}
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.02] overflow-hidden mb-1.5">
                    <div className="h-full rounded-full bg-[#00e5a0]/20" style={{ width: barW + '%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[13px] mono">
                    <span className="text-[#666]">{wr}% WR</span>
                    <span className="text-[#555]">avg ${avgPnl >= 0 ? '+' : ''}{avgPnl}</span>
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
