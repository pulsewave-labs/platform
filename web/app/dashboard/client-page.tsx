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
  var [dims, setDims] = useState({ w: 800, h: 380 })
  var [timeFilter, setTimeFilter] = useState('ALL')

  useEffect(function() {
    function measure() {
      if (containerRef.current) {
        var rect = containerRef.current.getBoundingClientRect()
        setDims({ w: rect.width, h: Math.min(420, Math.max(260, rect.width * 0.38)) })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return function() { window.removeEventListener('resize', measure) }
  }, [])

  if (!trades || trades.length < 2) return null

  var allSorted = trades.slice().sort(function(a: any, b: any) {
    return new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
  })

  var filterDef = TIME_FILTERS.find(function(f) { return f.label === timeFilter })
  var sorted = allSorted
  if (filterDef && filterDef.days > 0) {
    var cutoff = Date.now() - filterDef.days * 86400000
    sorted = allSorted.filter(function(t: any) { return new Date(t.exit_time || t.entry_time).getTime() >= cutoff })
  }
  if (sorted.length < 2) sorted = allSorted

  var startingBalance = 10000
  if (filterDef && filterDef.days > 0 && sorted.length < allSorted.length) {
    var firstFilteredIdx = allSorted.indexOf(sorted[0])
    if (firstFilteredIdx > 0) startingBalance = allSorted[firstFilteredIdx - 1].balance_after
  }

  var points = [{ balance: startingBalance, date: sorted[0].entry_time, pnl: 0, pair: '', action: '', idx: 0 }]
  for (var i = 0; i < sorted.length; i++) {
    points.push({ balance: sorted[i].balance_after, date: sorted[i].exit_time || sorted[i].entry_time, pnl: sorted[i].pnl, pair: sorted[i].pair, action: sorted[i].action, idx: i + 1 })
  }

  var periodPnl = sorted.reduce(function(s: number, t: any) { return s + t.pnl }, 0)
  var periodWins = sorted.filter(function(t: any) { return t.pnl > 0 }).length
  var periodLosses = sorted.length - periodWins
  var periodWR = sorted.length > 0 ? (periodWins / sorted.length * 100).toFixed(1) : '0'
  var lastBal = points[points.length - 1].balance
  var periodReturn = startingBalance > 0 ? ((lastBal - startingBalance) / startingBalance * 100).toFixed(1) : '0'

  // Find peak balance and current drawdown
  var peakBal = startingBalance
  var peakIdx = 0
  for (var pi = 0; pi < points.length; pi++) {
    if (points[pi].balance > peakBal) { peakBal = points[pi].balance; peakIdx = pi }
  }
  var currentDD = peakBal > 0 ? ((peakBal - lastBal) / peakBal * 100) : 0

  var pad = { top: 24, right: 20, bottom: 32, left: 60 }
  var cw = dims.w - pad.left - pad.right
  var ch = dims.h - pad.top - pad.bottom

  var balances = points.map(function(p) { return p.balance })
  var minBal = Math.min.apply(null, balances)
  var maxBal = Math.max.apply(null, balances)
  var range = maxBal - minBal || 1
  minBal = minBal - range * 0.06
  maxBal = maxBal + range * 0.06
  range = maxBal - minBal

  function xPos(idx: number) { return pad.left + (idx / (points.length - 1)) * cw }
  function yPos(bal: number) { return pad.top + (1 - (bal - minBal) / range) * ch }

  // Smooth curve using monotone cubic interpolation
  function buildSmoothPath(pts: { x: number, y: number }[]) {
    if (pts.length < 2) return ''
    if (pts.length === 2) return 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1) + 'L' + pts[1].x.toFixed(1) + ',' + pts[1].y.toFixed(1)

    var d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1)
    for (var si = 1; si < pts.length; si++) {
      var p0 = pts[Math.max(0, si - 2)]
      var p1 = pts[si - 1]
      var p2 = pts[si]
      var p3 = pts[Math.min(pts.length - 1, si + 1)]
      var cp1x = p1.x + (p2.x - p0.x) / 6
      var cp1y = p1.y + (p2.y - p0.y) / 6
      var cp2x = p2.x - (p3.x - p1.x) / 6
      var cp2y = p2.y - (p3.y - p1.y) / 6
      d += ' C' + cp1x.toFixed(1) + ',' + cp1y.toFixed(1) + ' ' + cp2x.toFixed(1) + ',' + cp2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1)
    }
    return d
  }

  // Downsample points for smooth rendering if too many
  var displayPoints = points
  if (points.length > 200) {
    var sampleRate = Math.ceil(points.length / 200)
    displayPoints = points.filter(function(_, idx) { return idx === 0 || idx === points.length - 1 || idx % sampleRate === 0 })
  }

  var xyPoints = displayPoints.map(function(p, idx) {
    var origIdx = points.indexOf(p)
    return { x: xPos(origIdx), y: yPos(p.balance) }
  })

  var smoothPath = buildSmoothPath(xyPoints)
  var lastPt = xyPoints[xyPoints.length - 1]
  var areaPath = smoothPath + ' L' + lastPt.x.toFixed(1) + ',' + (pad.top + ch).toFixed(1) + ' L' + xyPoints[0].x.toFixed(1) + ',' + (pad.top + ch).toFixed(1) + ' Z'

  // Y-axis labels (nicer ticks)
  var yTicks = 5
  var yLabels = []
  for (var t = 0; t <= yTicks; t++) {
    var val = minBal + (t / yTicks) * range
    yLabels.push({ val: val, y: yPos(val) })
  }

  // X-axis labels
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
  var step = Math.ceil(xLabels.length / (dims.w > 600 ? 10 : 5))
  xLabels = xLabels.filter(function(_, i) { return i % step === 0 })

  // Drawdown shading
  var drawdownRegions: string[] = []
  var ddPeak = points[0].balance
  var ddStart = -1
  for (var k = 0; k < points.length; k++) {
    if (points[k].balance > ddPeak) ddPeak = points[k].balance
    var dd = (ddPeak - points[k].balance) / ddPeak
    if (dd > 0.03 && ddStart === -1) ddStart = k
    if ((dd <= 0.03 || k === points.length - 1) && ddStart !== -1) {
      var regionPath = ''
      for (var r = ddStart; r <= k; r++) {
        regionPath += (r === ddStart ? 'M' : 'L') + xPos(r).toFixed(1) + ',' + yPos(points[r].balance).toFixed(1)
      }
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

  function handleInteraction(clientX: number) {
    if (!containerRef.current) return
    var rect = containerRef.current.getBoundingClientRect()
    var mx = clientX - rect.left
    var idx = Math.round(((mx - pad.left) / cw) * (points.length - 1))
    idx = Math.max(0, Math.min(points.length - 1, idx))
    var pt = points[idx]
    setHover({ x: xPos(idx), y: yPos(pt.balance), trade: pt, idx: idx })
  }

  var handleMouseMove = useCallback(function(e: React.MouseEvent) { handleInteraction(e.clientX) }, [points, cw])
  var handleTouchMove = useCallback(function(e: React.TouchEvent) { if (e.touches[0]) { e.preventDefault(); handleInteraction(e.touches[0].clientX) } }, [points, cw])

  return (
    <div ref={containerRef} className="border border-white/[0.04] rounded-lg bg-[#0c0c0c] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-3 border-b border-white/[0.03] gap-2">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-[#555] mono tracking-[.12em] mb-0.5">BALANCE</div>
            <div className="text-[22px] mono font-bold text-white leading-none">${Math.round(lastBal).toLocaleString()}</div>
          </div>
          <div className="h-8 w-px bg-white/[0.04]"></div>
          <div>
            <div className="text-[11px] text-[#555] mono tracking-[.12em] mb-0.5">P&L</div>
            <div className={'text-[16px] mono font-bold leading-none ' + (periodPnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
              {periodPnl >= 0 ? '+' : ''}${Math.round(periodPnl).toLocaleString()}
              <span className="text-[13px] ml-1 opacity-50">({periodReturn}%)</span>
            </div>
          </div>
          {currentDD > 1 && (
            <>
              <div className="h-8 w-px bg-white/[0.04]"></div>
              <div>
                <div className="text-[11px] text-[#555] mono tracking-[.12em] mb-0.5">DRAWDOWN</div>
                <div className="text-[16px] mono font-bold text-[#ff4d4d] leading-none">-{currentDD.toFixed(1)}%</div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[12px] mono mr-2 hidden md:flex">
            <span className="text-[#666]">{sorted.length} trades</span>
            <span className="text-[#00e5a0]/60">{periodWins}W</span>
            <span className="text-[#ff4d4d]/60">{periodLosses}L</span>
            <span className="text-[#777]">{periodWR}% WR</span>
          </div>
          <div className="flex items-center gap-0.5 bg-white/[0.02] rounded-md p-0.5">
            {TIME_FILTERS.map(function(f) {
              var active = timeFilter === f.label
              return (
                <button key={f.label}
                  onClick={function() { setTimeFilter(f.label); setHover(null) }}
                  className={'px-3 py-1.5 text-[12px] mono font-medium rounded transition-all ' + (active ? 'text-[#00e5a0] bg-[#00e5a0]/[0.08]' : 'text-[#555] hover:text-[#888]')}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <svg
        width={dims.w}
        height={dims.h}
        className="cursor-crosshair touch-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={function() { setHover(null) }}
        onTouchMove={handleTouchMove}
        onTouchEnd={function() { setHover(null) }}
      >
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#00e5a0" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#00e5a0" stopOpacity="1" />
            <stop offset="100%" stopColor="#00e5a0" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map(function(yl, i) {
          return <line key={i} x1={pad.left} x2={dims.w - pad.right} y1={yl.y} y2={yl.y} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        })}

        {/* Drawdown shading */}
        {drawdownRegions.map(function(d, i) {
          return <path key={i} d={d} fill="#ff4d4d" opacity="0.035" />
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#eqGrad)" />

        {/* Main line — smooth curve */}
        <path d={smoothPath} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Peak marker */}
        <circle cx={xPos(peakIdx)} cy={yPos(peakBal)} r="3" fill="none" stroke="#00e5a0" strokeWidth="1" opacity="0.3" />
        <text x={xPos(peakIdx)} y={yPos(peakBal) - 8} textAnchor="middle" fill="#00e5a0" opacity="0.3" fontSize="8" fontFamily="JetBrains Mono, monospace">ATH ${Math.round(peakBal / 1000)}K</text>

        {/* End point with glow */}
        <circle cx={xPos(points.length - 1)} cy={yPos(lastBal)} r="8" fill="#00e5a0" opacity="0.06" />
        <circle cx={xPos(points.length - 1)} cy={yPos(lastBal)} r="4" fill="#00e5a0" opacity="0.15" />
        <circle cx={xPos(points.length - 1)} cy={yPos(lastBal)} r="2.5" fill="#00e5a0" />

        {/* Y-axis labels */}
        {yLabels.map(function(yl, i) {
          var label = yl.val >= 1000 ? '$' + Math.round(yl.val / 1000) + 'K' : '$' + Math.round(yl.val)
          return <text key={i} x={pad.left - 8} y={yl.y + 3} textAnchor="end" fill="#444" fontSize="9" fontFamily="JetBrains Mono, monospace">{label}</text>
        })}

        {/* X-axis labels */}
        {xLabels.map(function(xl, i) {
          return <text key={i} x={xl.x} y={dims.h - 8} textAnchor="middle" fill="#444" fontSize="9" fontFamily="JetBrains Mono, monospace">{xl.label}</text>
        })}

        {/* Hover crosshair */}
        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={pad.top} y2={pad.top + ch} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1={pad.left} x2={dims.w - pad.right} y1={hover.y} y2={hover.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={hover.x} cy={hover.y} r="4" fill="#00e5a0" />
            <circle cx={hover.x} cy={hover.y} r="8" fill="#00e5a0" opacity="0.1" />
            {/* Hover balance label */}
            <rect x={dims.w - pad.right + 2} y={hover.y - 8} width="52" height="16" rx="3" fill="#0c0c0c" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={dims.w - pad.right + 6} y={hover.y + 3} fill="#ccc" fontSize="9" fontFamily="JetBrains Mono, monospace">${Math.round(hover.trade.balance / 1000)}K</text>
          </>
        )}
      </svg>

      {/* Tooltip bar */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-white/[0.03] text-[13px] mono min-h-[36px]">
        {hover && hover.trade ? (
          <>
            <div className="flex items-center gap-4">
              <span className="text-[#777]">{new Date(hover.trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              {hover.trade.pair && (
                <>
                  <span className="text-[#aaa] font-medium">{hover.trade.pair}</span>
                  <span className={hover.trade.action === 'LONG' ? 'text-[#00e5a0]' : 'text-[#ff4d4d]'}>{hover.trade.action}</span>
                </>
              )}
              {hover.trade.pnl !== 0 && <span className={'font-bold ' + (hover.trade.pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{hover.trade.pnl > 0 ? '+' : ''}${Math.round(hover.trade.pnl).toLocaleString()}</span>}
            </div>
            <div className="flex items-center gap-3 text-[#666]">
              <span>Balance: <span className="text-white font-medium">${Math.round(hover.trade.balance).toLocaleString()}</span></span>
              <span>#{hover.idx}/{sorted.length}</span>
            </div>
          </>
        ) : (
          <span className="text-[#444]">Hover chart to inspect trades</span>
        )}
      </div>
    </div>
  )
}

export default function DashboardClientPage() {
  const [signals, setSignals] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)

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
    // Auto-refresh every 60s for live data
    var iv = setInterval(fetchData, 60000)
    return function() { clearInterval(iv) }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-48 h-px bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
          <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#00e5a0]/40 to-transparent scan-line"></div>
        </div>
        <div className="text-[#666] text-[13px] mono tracking-widest">LOADING TERMINAL</div>
      </div>
    )
  }

  var stats = performance ? (performance as any).stats : null
  var monthly = performance ? (performance as any).monthly || [] : []
  var allTrades = performance ? (performance as any).trades || [] : []
  var recentTrades = allTrades.slice(0, 15)
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

  // This month P&L
  var now = new Date()
  var thisMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  var thisMonthData = monthly.find(function(m: any) { return m.month === thisMonthKey })

  // Last month
  var lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  var lastMonthKey = lastMonth.getFullYear() + '-' + String(lastMonth.getMonth() + 1).padStart(2, '0')
  var lastMonthData = monthly.find(function(m: any) { return m.month === lastMonthKey })

  // This week P&L (last 7 days)
  var weekAgo = Date.now() - 7 * 86400000
  var weekTrades = allTrades.filter(function(t: any) { return new Date(t.exit_time || t.entry_time).getTime() >= weekAgo })
  var weekPnl = weekTrades.reduce(function(s: number, t: any) { return s + t.pnl }, 0)

  // Last signal time
  var lastSignalTime = allTrades.length > 0 ? allTrades[0].entry_time : null

  // Pair performance
  var pairPerf: Record<string, { pnl: number, trades: number, wins: number }> = {}
  allTrades.forEach(function(t: any) {
    var p = t.pair || ''
    if (!pairPerf[p]) pairPerf[p] = { pnl: 0, trades: 0, wins: 0 }
    pairPerf[p].pnl += t.pnl
    pairPerf[p].trades++
    if (t.pnl > 0) pairPerf[p].wins++
  })
  var pairList = Object.entries(pairPerf).map(function(e) { return { pair: e[0], ...e[1] } }).sort(function(a, b) { return b.pnl - a.pnl })

  return (
    <div className="space-y-4">

      {/* Stats Grid 3x3 */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.02] rounded-lg overflow-hidden">
        {[
          { label: 'THIS MONTH', value: thisMonthData ? (thisMonthData.pnl >= 0 ? '+' : '') + '$' + thisMonthData.pnl.toLocaleString() : '—', color: thisMonthData && thisMonthData.pnl >= 0 ? '#00e5a0' : thisMonthData ? '#ff4d4d' : '#333', sub: thisMonthData ? thisMonthData.trades + ' trades' : '' },
          { label: 'LAST 7 DAYS', value: (weekPnl >= 0 ? '+' : '') + '$' + Math.round(weekPnl).toLocaleString(), color: weekPnl >= 0 ? '#00e5a0' : '#ff4d4d', sub: weekTrades.length + ' trades' },
          { label: 'LAST SIGNAL', value: lastSignalTime ? timeAgo(lastSignalTime) : '—', color: '#e0e0e0', sub: allTrades[0] ? allTrades[0].pair + ' · ' + allTrades[0].action : '' },
          { label: 'RETURN', value: stats ? '+' + stats.totalReturn.toFixed(1) + '%' : '—', color: '#00e5a0', sub: 'all time' },
          { label: 'WIN RATE', value: stats ? stats.winRate + '%' : '—', color: '#e0e0e0', sub: stats ? stats.wins + 'W / ' + stats.losses + 'L' : '' },
          { label: 'PROFIT FACTOR', value: stats ? stats.profitFactor.toFixed(2) : '—', color: '#e0e0e0', sub: '' },
          { label: 'MONTHLY AVG', value: stats ? '+$' + stats.avgMonthlyPnl.toLocaleString() : '—', color: '#00e5a0', sub: stats ? stats.profitableMonths + '/' + stats.totalMonths + ' months green' : '' },
          { label: 'BEST MONTH', value: stats && performance ? '+$' + Math.round(Math.max.apply(null, performance.monthly.map(function(m: any) { return m.pnl }))).toLocaleString() : '—', color: '#00e5a0', sub: '' },
          { label: 'TOTAL TRADES', value: stats ? String(stats.totalTrades) : '—', color: '#e0e0e0', sub: '' },
        ].map(function(s, i) {
          return (
            <div key={i} className="bg-[#0c0c0c] px-5 py-4">
              <div className="text-[12px] text-[#555] mono tracking-[.15em] leading-none mb-2.5">{s.label}</div>
              <div className="text-[22px] mono font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
              {s.sub && <div className="text-[13px] mono text-[#555] mt-2">{s.sub}</div>}
            </div>
          )
        })}
      </div>

      {/* Equity Chart */}
      {allTrades.length > 0 && <EquityChart trades={allTrades} />}

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
                    <div className="text-[12px] text-[#666] mono tracking-wider mb-2">POSITION SIZING · 10% RISK · 20× LEV</div>
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

      {/* Recent Trades */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[14px] mono text-[#888] tracking-[.15em] font-medium">RECENT TRADES</h2>
            {currentStreak > 1 && (
              <span className={'text-[13px] mono px-2 py-0.5 rounded-md ' + (streakType === 'W' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>
                {currentStreak}{streakType} STREAK
              </span>
            )}
          </div>
          <a href="/dashboard/history" className="text-[12px] mono text-[#555] hover:text-[#888] transition-colors tracking-wider">ALL TRADES →</a>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block border border-white/[0.04] rounded-lg overflow-hidden">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-[14px] mono">
              <thead>
                <tr className="bg-[#0c0c0c] text-[#555]">
                  <th className="text-left px-4 py-3 font-medium tracking-[.1em] text-[11px]">DATE</th>
                  <th className="text-left px-4 py-3 font-medium tracking-[.1em] text-[11px]">PAIR</th>
                  <th className="text-left px-4 py-3 font-medium tracking-[.1em] text-[11px]">SIDE</th>
                  <th className="text-right px-4 py-3 font-medium tracking-[.1em] text-[11px]">ENTRY</th>
                  <th className="text-right px-4 py-3 font-medium tracking-[.1em] text-[11px]">EXIT</th>
                  <th className="text-right px-4 py-3 font-medium tracking-[.1em] text-[11px]">P&L</th>
                  <th className="text-center px-4 py-3 font-medium tracking-[.1em] text-[11px]">RESULT</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map(function(t: any, i: number) {
                  var isWin = t.pnl >= 0
                  return (
                    <tr key={i} className={'border-t border-white/[0.02] transition-colors hover:bg-white/[0.01] ' + (i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#0b0b0b]')}>
                      <td className="px-4 py-3 text-[#777]">{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 py-3 text-[#aaa] font-medium">{t.pair}</td>
                      <td className="px-4 py-3">
                        <span className={'px-1.5 py-0.5 rounded text-[12px] font-bold ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-[#777]">${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right text-[#777]">${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className={'px-4 py-3 text-right font-bold ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                        {isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={'text-[12px] font-medium tracking-wider ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/50' : 'text-[#ff4d4d]/50')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
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
                    <span className={'text-[12px] mono font-bold px-1.5 py-0.5 rounded ' + (t.action === 'LONG' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>{t.action}</span>
                    <span className="text-[14px] text-[#aaa] mono font-medium">{t.pair}</span>
                  </div>
                  <span className={'text-[16px] mono font-bold ' + (isWin ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>{isWin ? '+' : ''}${Number(t.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] mono text-[#555]">
                  <span>{new Date(t.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>${Number(t.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})} → ${Number(t.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  <span className={'font-medium ' + (t.exit_reason === 'TP' ? 'text-[#00e5a0]/40' : 'text-[#ff4d4d]/40')}>{t.exit_reason === 'TP' ? 'WIN' : 'LOSS'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pair Performance */}
      {pairList.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <h2 className="text-[14px] mono text-[#888] tracking-[.15em] font-medium">PAIR PERFORMANCE</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {pairList.map(function(p) {
              var wr = p.trades > 0 ? (p.wins / p.trades * 100).toFixed(0) : '0'
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
                    <span className="text-[#555]">{p.wins}W / {p.trades - p.wins}L</span>
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
