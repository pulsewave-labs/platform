'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

function timeAgo(dateStr: string) {
  var ms = Date.now() - new Date(dateStr).getTime()
  var mins = Math.floor(ms / 60000)
  if (mins < 60) return mins + 'm ago'
  var hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}

var TIME_FILTERS = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 0 },
]

function EquityChart({ trades }: { trades: any[] }) {
  var containerRef = useRef(null as HTMLDivElement | null)
  var [hover, setHover] = useState(null as null | { x: number, y: number, trade: any, idx: number })
  var [dims, setDims] = useState({ w: 800, h: 300 })
  var [timeFilter, setTimeFilter] = useState('ALL')

  useEffect(function() {
    function measure() {
      if (containerRef.current) {
        var rect = containerRef.current.getBoundingClientRect()
        setDims({ w: rect.width, h: Math.min(340, Math.max(200, rect.width * 0.3)) })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return function() { window.removeEventListener('resize', measure) }
  }, [])

  if (!trades || trades.length < 2) return null

  // Build equity curve from trades (sorted oldest first)
  var allSorted = trades.slice().sort(function(a: any, b: any) {
    return new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
  })

  // Apply time filter
  var filterDef = TIME_FILTERS.find(function(f) { return f.label === timeFilter })
  var sorted = allSorted
  if (filterDef && filterDef.days > 0) {
    var cutoff = Date.now() - filterDef.days * 86400000
    sorted = allSorted.filter(function(t: any) { return new Date(t.exit_time || t.entry_time).getTime() >= cutoff })
  }

  if (sorted.length < 2) sorted = allSorted // fallback if filter too tight

  // Calculate starting balance for filtered view
  var startingBalance = 10000
  if (filterDef && filterDef.days > 0 && sorted.length < allSorted.length) {
    // Find the balance right before the filtered window
    var firstFilteredIdx = allSorted.indexOf(sorted[0])
    if (firstFilteredIdx > 0) {
      startingBalance = allSorted[firstFilteredIdx - 1].balance_after
    }
  }

  var points = [{ balance: startingBalance, date: sorted[0].entry_time, pnl: 0, pair: '', action: '', idx: 0 }]
  for (var i = 0; i < sorted.length; i++) {
    points.push({
      balance: sorted[i].balance_after,
      date: sorted[i].exit_time || sorted[i].entry_time,
      pnl: sorted[i].pnl,
      pair: sorted[i].pair,
      action: sorted[i].action,
      idx: i + 1
    })
  }

  // Period stats
  var periodPnl = sorted.reduce(function(s: number, t: any) { return s + t.pnl }, 0)
  var periodWins = sorted.filter(function(t: any) { return t.pnl > 0 }).length
  var periodWR = sorted.length > 0 ? (periodWins / sorted.length * 100).toFixed(1) : '0'

  var pad = { top: 20, right: 16, bottom: 28, left: 56 }
  var cw = dims.w - pad.left - pad.right
  var ch = dims.h - pad.top - pad.bottom

  var balances = points.map(function(p) { return p.balance })
  var minBal = Math.min.apply(null, balances)
  var maxBal = Math.max.apply(null, balances)
  var range = maxBal - minBal || 1

  // Add some padding to range
  minBal = minBal - range * 0.05
  maxBal = maxBal + range * 0.05
  range = maxBal - minBal

  function xPos(idx: number) { return pad.left + (idx / (points.length - 1)) * cw }
  function yPos(bal: number) { return pad.top + (1 - (bal - minBal) / range) * ch }

  // Build SVG path
  var pathD = points.map(function(p, i) {
    var x = xPos(i)
    var y = yPos(p.balance)
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)
  }).join(' ')

  // Fill area
  var areaD = pathD + ' L' + xPos(points.length - 1).toFixed(1) + ',' + (pad.top + ch).toFixed(1) + ' L' + pad.left.toFixed(1) + ',' + (pad.top + ch).toFixed(1) + ' Z'

  // Y-axis labels
  var yTicks = 5
  var yLabels = []
  for (var t = 0; t <= yTicks; t++) {
    var val = minBal + (t / yTicks) * range
    yLabels.push({ val: val, y: yPos(val) })
  }

  // X-axis labels (month markers)
  var xLabels: { label: string, x: number }[] = []
  var lastMonth = ''
  for (var j = 0; j < points.length; j++) {
    var d = new Date(points[j].date)
    var monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    if (monthKey !== lastMonth) {
      lastMonth = monthKey
      xLabels.push({ label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), x: xPos(j) })
    }
  }
  // Only show every Nth label to avoid overlap
  var step = Math.ceil(xLabels.length / 10)
  xLabels = xLabels.filter(function(_, i) { return i % step === 0 })

  // Drawdown shading
  var drawdownRegions: string[] = []
  var peak = points[0].balance
  var ddStart = -1
  for (var k = 0; k < points.length; k++) {
    if (points[k].balance > peak) peak = points[k].balance
    var dd = (peak - points[k].balance) / peak
    if (dd > 0.05 && ddStart === -1) ddStart = k
    if ((dd <= 0.05 || k === points.length - 1) && ddStart !== -1) {
      // Build a region path
      var regionPath = ''
      for (var r = ddStart; r <= k; r++) {
        regionPath += (r === ddStart ? 'M' : 'L') + xPos(r).toFixed(1) + ',' + yPos(points[r].balance).toFixed(1)
      }
      // Close to the peak line
      for (var r2 = k; r2 >= ddStart; r2--) {
        var peakAtR = points[0].balance
        for (var p2 = 0; p2 <= r2; p2++) { if (points[p2].balance > peakAtR) peakAtR = points[p2].balance }
        regionPath += ' L' + xPos(r2).toFixed(1) + ',' + yPos(peakAtR).toFixed(1)
      }
      regionPath += ' Z'
      drawdownRegions.push(regionPath)
      ddStart = -1
    }
  }

  var handleMouseMove = useCallback(function(e: React.MouseEvent) {
    if (!containerRef.current) return
    var rect = containerRef.current.getBoundingClientRect()
    var mx = e.clientX - rect.left
    var idx = Math.round(((mx - pad.left) / cw) * (points.length - 1))
    idx = Math.max(0, Math.min(points.length - 1, idx))
    var pt = points[idx]
    setHover({ x: xPos(idx), y: yPos(pt.balance), trade: pt, idx: idx })
  }, [points, cw])

  return (
    <div ref={containerRef} className="border border-[#161616] rounded-lg bg-[#0c0c0c] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#141414]">
        <div className="flex items-center gap-4">
          <div className="text-[10px] mono text-[#888] tracking-widest font-medium">EQUITY CURVE</div>
          <div className="flex items-center gap-0.5">
            {TIME_FILTERS.map(function(f) {
              var active = timeFilter === f.label
              return (
                <button key={f.label}
                  onClick={function() { setTimeFilter(f.label); setHover(null) }}
                  className={'px-2 py-0.5 text-[9px] mono font-medium rounded transition-all ' + (active ? 'text-[#00e5a0] bg-[#00e5a0]/8' : 'text-[#666] hover:text-[#888]')}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[9px] mono">
          <span className="text-[#777]">{sorted.length} TRADES</span>
          <span className={periodPnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{periodPnl >= 0 ? '+' : ''}${Math.round(periodPnl).toLocaleString()}</span>
          <span className="text-[#888]">{periodWR}% WR</span>
        </div>
      </div>
      <svg
        width={dims.w}
        height={dims.h}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={function() { setHover(null) }}
      >
        {/* Grid lines */}
        {yLabels.map(function(yl, i) {
          return <line key={i} x1={pad.left} x2={dims.w - pad.right} y1={yl.y} y2={yl.y} stroke="#141414" strokeWidth="1" />
        })}

        {/* Drawdown shading */}
        {drawdownRegions.map(function(d, i) {
          return <path key={i} d={d} fill="#ff4d4d" opacity="0.04" />
        })}

        {/* Area fill */}
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#eqGrad)" />

        {/* Main line */}
        <path d={pathD} fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Starting point */}
        <circle cx={xPos(0)} cy={yPos(startingBalance)} r="2.5" fill="#0c0c0c" stroke="#00e5a0" strokeWidth="1" />

        {/* End point */}
        <circle cx={xPos(points.length - 1)} cy={yPos(points[points.length - 1].balance)} r="2.5" fill="#00e5a0" />

        {/* Y-axis labels */}
        {yLabels.map(function(yl, i) {
          var label = yl.val >= 1000 ? '$' + Math.round(yl.val / 1000) + 'K' : '$' + Math.round(yl.val)
          return <text key={i} x={pad.left - 6} y={yl.y + 3} textAnchor="end" fill="#333" fontSize="9" fontFamily="JetBrains Mono, monospace">{label}</text>
        })}

        {/* X-axis labels */}
        {xLabels.map(function(xl, i) {
          return <text key={i} x={xl.x} y={dims.h - 6} textAnchor="middle" fill="#333" fontSize="9" fontFamily="JetBrains Mono, monospace">{xl.label}</text>
        })}

        {/* Hover crosshair */}
        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={pad.top} y2={pad.top + ch} stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
            <line x1={pad.left} x2={dims.w - pad.right} y1={hover.y} y2={hover.y} stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx={hover.x} cy={hover.y} r="3" fill="#00e5a0" />
            <circle cx={hover.x} cy={hover.y} r="6" fill="#00e5a0" opacity="0.15" />
          </>
        )}
      </svg>

      {/* Hover tooltip */}
      {hover && hover.trade && (
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#141414] text-[10px] mono">
          <div className="flex items-center gap-4">
            <span className="text-[#888]">{new Date(hover.trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
            {hover.trade.pair && <span className="text-[#888]">{hover.trade.pair}</span>}
            {hover.trade.action && <span className={hover.trade.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{hover.trade.action}</span>}
            {hover.trade.pnl !== 0 && <span className={hover.trade.pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{hover.trade.pnl > 0 ? '+' : ''}${Math.round(hover.trade.pnl).toLocaleString()}</span>}
          </div>
          <div className="text-[#888]">
            Balance: <span className="text-white font-medium">${Math.round(hover.trade.balance).toLocaleString()}</span>
            <span className="text-[#777] ml-2">Trade #{hover.idx}/{sorted.length}</span>
          </div>
        </div>
      )}
    </div>
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
        <div className="text-[#666] text-[10px] mono tracking-widest">LOADING TERMINAL</div>
      </div>
    )
  }

  var stats = performance ? (performance as any).stats : null
  var monthly = performance ? (performance as any).monthly || [] : []
  var allTrades = performance ? (performance as any).trades || [] : []
  var recentTrades = allTrades.slice(0, 20)
  var activeSignals = signals.filter(function(s: any) { return s.status === 'active' })

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

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-white/[0.02] rounded-lg overflow-hidden">
          {[
            { label: 'TOTAL P&L', value: '+$' + (stats.finalBalance - stats.startingCapital).toLocaleString(), color: '#00e5a0' },
            { label: 'RETURN', value: '+' + stats.totalReturn.toFixed(1) + '%', color: '#00e5a0' },
            { label: 'WIN RATE', value: stats.winRate + '%', color: '#e0e0e0' },
            { label: 'PROFIT FACTOR', value: stats.profitFactor.toFixed(2), color: '#e0e0e0' },
            { label: 'TRADES', value: String(stats.totalTrades), color: '#e0e0e0' },
            { label: 'MAX DD', value: '-' + stats.maxDrawdown + '%', color: '#ff4d4d' },
          ].map(function(s, i) {
            return (
              <div key={i} className="bg-[#0c0c0c] px-4 py-3">
                <div className="text-[8px] text-[#666] mono tracking-[.15em] leading-none mb-2">{s.label}</div>
                <div className="text-[17px] mono font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Equity Chart */}
      {allTrades.length > 0 && <EquityChart trades={allTrades} />}

      {/* Active Signals */}
      <section>
        <div className="flex items-center gap-2.5 mb-3">
          <h2 className="text-[11px] mono text-[#888] tracking-[.15em] font-medium">ACTIVE SIGNALS</h2>
          <span className="text-[10px] mono px-2 py-0.5 rounded-md bg-white/[0.03] text-[#777]">{activeSignals.length}</span>
        </div>

        {activeSignals.length === 0 ? (
          <div className="border border-white/[0.04] rounded-lg py-12 flex flex-col items-center bg-[#0c0c0c]">
            <div className="w-40 h-px bg-white/[0.04] rounded-full overflow-hidden mb-5">
              <div className="w-12 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/30 to-transparent scan-line"></div>
            </div>
            <div className="text-[#888] mono text-[12px] font-medium mb-1">Scanning for setups</div>
            <div className="text-[#444] text-[11px] mono">Signals fire instantly via Telegram when detected</div>
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
              var barWidth = Math.min(rrNum / 4 * 100, 100)

              return (
                <div key={sig.id} className="border border-[#161616] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#0c0c0c]">
                    <div className="flex items-center gap-3">
                      <span className={'px-2 py-0.5 rounded text-[10px] mono font-bold tracking-wider ' + (isLong ? 'bg-[#00e5a0]/8 text-[#00e5a0] border border-[#00e5a0]/15' : 'bg-[#ff4d4d]/8 text-[#ff4d4d] border border-[#ff4d4d]/15')}>
                        {sig.direction}
                      </span>
                      <span className="mono font-semibold text-white text-sm">{sig.pair}</span>
                      <span className="text-[10px] mono text-[#666]">{timeAgo(sig.created_at)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] mono text-[#777]">R:R</div>
                      <div className="text-sm mono font-bold text-[#00e5a0]">{rr}:1</div>
                    </div>
                  </div>

                  <div className="h-1 bg-[#161616] flex">
                    <div className="h-full bg-[#ff4d4d]/30" style={{ width: '25%' }}></div>
                    <div className="h-full bg-[#00e5a0]/40" style={{ width: barWidth * 0.75 + '%' }}></div>
                  </div>

                  <div className="grid grid-cols-3 gap-px bg-[#131313]">
                    <div className="bg-[#0a0a0a] px-4 py-2.5">
                      <div className="text-[9px] text-[#777] mono tracking-wider mb-1">ENTRY</div>
                      <div className="mono text-sm text-white font-medium">${entry.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-2.5">
                      <div className="text-[9px] text-[#777] mono tracking-wider mb-1">STOP LOSS</div>
                      <div className="mono text-sm text-[#ff4d4d] font-medium">${sl.toLocaleString()}</div>
                      <div className="text-[9px] mono text-[#ff4d4d]/40">-{slPct}%</div>
                    </div>
                    <div className="bg-[#0a0a0a] px-4 py-2.5">
                      <div className="text-[9px] text-[#777] mono tracking-wider mb-1">TAKE PROFIT</div>
                      <div className="mono text-sm text-[#00e5a0] font-medium">${tp.toLocaleString()}</div>
                      <div className="text-[9px] mono text-[#00e5a0]/40">+{tpPct}%</div>
                    </div>
                  </div>

                  {sig.reasoning && (
                    <div className="px-4 py-2 bg-[#0a0a0a] border-t border-[#131313]">
                      <div className="text-[10px] text-[#888] leading-relaxed">{sig.reasoning}</div>
                    </div>
                  )}

                  <div className="px-4 py-2.5 bg-[#0a0a0a] border-t border-[#131313]">
                    <div className="text-[9px] text-[#666] mono tracking-wider mb-2">POSITION SIZING · 10% RISK · 20× LEV</div>
                    <div className="grid grid-cols-5 gap-x-2 gap-y-0.5 text-[10px] mono">
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

      {/* Recent Trades */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[11px] mono text-[#888] tracking-[.15em] font-medium">RECENT TRADES</h2>
            {currentStreak > 1 && (
              <span className={'text-[9px] mono px-2 py-0.5 rounded-md ' + (streakType === 'W' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>
                {currentStreak}{streakType} STREAK
              </span>
            )}
          </div>
          <a href="/dashboard/history" className="text-[10px] mono text-[#555] hover:text-[#888] transition-colors tracking-wider">ALL TRADES →</a>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block border border-white/[0.04] rounded-lg overflow-hidden">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-[11px] mono">
              <thead>
                <tr className="bg-[#0c0c0c] text-[#555]">
                  <th className="text-left px-4 py-2.5 font-medium tracking-[.1em]">DATE</th>
                  <th className="text-left px-4 py-2.5 font-medium tracking-[.1em]">PAIR</th>
                  <th className="text-left px-4 py-2.5 font-medium tracking-[.1em]">SIDE</th>
                  <th className="text-right px-4 py-2.5 font-medium tracking-[.1em]">ENTRY</th>
                  <th className="text-right px-4 py-2.5 font-medium tracking-[.1em]">EXIT</th>
                  <th className="text-right px-4 py-2.5 font-medium tracking-[.1em]">P&L</th>
                  <th className="text-center px-4 py-2.5 font-medium tracking-[.1em]">RESULT</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(function(t: any, i: number) {
                  var isWin = t.pnl >= 0
                  return (
                    <tr key={i} className={'border-t border-white/[0.02] transition-colors hover:bg-white/[0.01] ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                      <td className="px-4 py-2.5 text-[#777]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 py-2.5 text-[#aaa] font-medium">{t.pair}</td>
                      <td className="px-4 py-2.5">
                        <span className={'px-1.5 py-0.5 rounded text-[9px] font-bold ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#777]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="px-4 py-2.5 text-right text-[#777]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className={'px-4 py-2.5 text-right font-bold ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={'text-[9px] font-medium tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden border border-white/[0.04] rounded-lg overflow-hidden divide-y divide-white/[0.02]">
          {recentTrades.map(function(t: any, i: number) {
            var isWin = t.pnl >= 0
            return (
              <div key={i} className={'px-4 py-3 ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={'text-[9px] mono font-bold px-1.5 py-0.5 rounded ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                    <span className="text-[13px] text-[#aaa] mono font-medium">{t.pair}</span>
                  </div>
                  <span className={'text-[14px] mono font-bold ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] mono text-[#555]">
                  <span>{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})} → ${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  <span className={'font-medium ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/40' : 'text-[#ff4d4d]/40')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
