'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

function timeAgo(dateStr) {
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

function EquityChart({ trades }) {
  var containerRef = useRef(null)
  var [hover, setHover] = useState(null)
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

  var allSorted = trades.slice().sort(function(a, b) {
    return new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
  })

  var filterDef = TIME_FILTERS.find(function(f) { return f.label === timeFilter })
  var sorted = allSorted
  if (filterDef && filterDef.days > 0) {
    var cutoff = Date.now() - filterDef.days * 86400000
    sorted = allSorted.filter(function(t) { return new Date(t.exit_time || t.entry_time).getTime() >= cutoff })
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

  var periodPnl = sorted.reduce(function(s, t) { return s + t.pnl }, 0)
  var periodWins = sorted.filter(function(t) { return t.pnl > 0 }).length
  var periodLosses = sorted.length - periodWins
  var periodWR = sorted.length > 0 ? (periodWins / sorted.length * 100).toFixed(1) : '0'
  var lastBal = points[points.length - 1].balance
  var periodReturn = startingBalance > 0 ? ((lastBal - startingBalance) / startingBalance * 100).toFixed(1) : '0'

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

  function xPos(idx) { return pad.left + (idx / (points.length - 1)) * cw }
  function yPos(bal) { return pad.top + (1 - (bal - minBal) / range) * ch }

  function buildSmoothPath(pts) {
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

  var displayPoints = points
  if (points.length > 200) {
    var sampleRate = Math.ceil(points.length / 200)
    displayPoints = points.filter(function(_, idx) { return idx === 0 || idx === points.length - 1 || idx % sampleRate === 0 })
  }

  var xyPoints = displayPoints.map(function(p) {
    var origIdx = points.indexOf(p)
    return { x: xPos(origIdx), y: yPos(p.balance) }
  })

  var smoothPath = buildSmoothPath(xyPoints)
  var lastPt = xyPoints[xyPoints.length - 1]
  var areaPath = smoothPath + ' L' + lastPt.x.toFixed(1) + ',' + (pad.top + ch).toFixed(1) + ' L' + xyPoints[0].x.toFixed(1) + ',' + (pad.top + ch).toFixed(1) + ' Z'

  var yTicks = 5
  var yLabels = []
  for (var t = 0; t <= yTicks; t++) {
    var val = minBal + (t / yTicks) * range
    yLabels.push({ val: val, y: yPos(val) })
  }

  var xLabels = []
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

  var drawdownRegions = []
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

  function handleInteraction(clientX) {
    if (!containerRef.current) return
    var rect = containerRef.current.getBoundingClientRect()
    var mx = clientX - rect.left
    var idx = Math.round(((mx - pad.left) / cw) * (points.length - 1))
    idx = Math.max(0, Math.min(points.length - 1, idx))
    var pt = points[idx]
    setHover({ x: xPos(idx), y: yPos(pt.balance), trade: pt, idx: idx })
  }

  var handleMouseMove = useCallback(function(e) { handleInteraction(e.clientX) }, [points, cw])
  var handleTouchMove = useCallback(function(e) { if (e.touches[0]) { e.preventDefault(); handleInteraction(e.touches[0].clientX) } }, [points, cw])

  return (
    <div ref={containerRef} className="border border-white/[0.04] rounded-lg bg-[#0c0c0c] overflow-hidden">
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

        {yLabels.map(function(yl, i) {
          return <line key={i} x1={pad.left} x2={dims.w - pad.right} y1={yl.y} y2={yl.y} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        })}

        {drawdownRegions.map(function(d, i) {
          return <path key={i} d={d} fill="#ff4d4d" opacity="0.035" />
        })}

        <path d={areaPath} fill="url(#eqGrad)" />
        <path d={smoothPath} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        <circle cx={xPos(peakIdx)} cy={yPos(peakBal)} r="3" fill="none" stroke="#00e5a0" strokeWidth="1" opacity="0.3" />
        <text x={xPos(peakIdx)} y={yPos(peakBal) - 8} textAnchor="middle" fill="#00e5a0" opacity="0.3" fontSize="8" fontFamily="JetBrains Mono, monospace">ATH ${Math.round(peakBal / 1000)}K</text>

        <circle cx={xPos(points.length - 1)} cy={yPos(lastBal)} r="8" fill="#00e5a0" opacity="0.06" />
        <circle cx={xPos(points.length - 1)} cy={yPos(lastBal)} r="4" fill="#00e5a0" opacity="0.15" />
        <circle cx={xPos(points.length - 1)} cy={yPos(lastBal)} r="2.5" fill="#00e5a0" />

        {yLabels.map(function(yl, i) {
          var label = yl.val >= 1000 ? '$' + Math.round(yl.val / 1000) + 'K' : '$' + Math.round(yl.val)
          return <text key={i} x={pad.left - 8} y={yl.y + 3} textAnchor="end" fill="#444" fontSize="9" fontFamily="JetBrains Mono, monospace">{label}</text>
        })}

        {xLabels.map(function(xl, i) {
          return <text key={i} x={xl.x} y={dims.h - 8} textAnchor="middle" fill="#444" fontSize="9" fontFamily="JetBrains Mono, monospace">{xl.label}</text>
        })}

        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={pad.top} y2={pad.top + ch} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1={pad.left} x2={dims.w - pad.right} y1={hover.y} y2={hover.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={hover.x} cy={hover.y} r="4" fill="#00e5a0" />
            <circle cx={hover.x} cy={hover.y} r="8" fill="#00e5a0" opacity="0.1" />
            <rect x={dims.w - pad.right + 2} y={hover.y - 8} width="52" height="16" rx="3" fill="#0c0c0c" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={dims.w - pad.right + 6} y={hover.y + 3} fill="#ccc" fontSize="9" fontFamily="JetBrains Mono, monospace">${Math.round(hover.trade.balance / 1000)}K</text>
          </>
        )}
      </svg>

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
  var [performance, setPerformance] = useState(null)
  var [loading, setLoading] = useState(true)
  var [selectedMonth, setSelectedMonth] = useState(null)
  var [filterPair, setFilterPair] = useState('')
  var [filterDir, setFilterDir] = useState('')
  var [selectedTrade, setSelectedTrade] = useState(null)

  function fetchData() {
    return fetch('/api/performance')
      .then(function(r) { return r.json() })
      .then(function(result) {
        setPerformance(result)
        setLoading(false)
      })
      .catch(function() { setLoading(false) })
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
        <div className="text-[#666] text-[13px] mono tracking-widest">LOADING TERMINAL</div>
      </div>
    )
  }

  var stats = performance ? performance.stats : null
  var monthly = performance ? performance.monthly || [] : []
  var allTrades = performance ? performance.trades || [] : []
  var recentTrades = allTrades.slice(0, 15)

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
  var thisMonthData = monthly.find(function(m) { return m.month === thisMonthKey })

  // This week P&L
  var weekAgo = Date.now() - 7 * 86400000
  var weekTrades = allTrades.filter(function(t) { return new Date(t.exit_time || t.entry_time).getTime() >= weekAgo })
  var weekPnl = weekTrades.reduce(function(s, t) { return s + t.pnl }, 0)

  // Last signal time
  var lastSignalTime = allTrades.length > 0 ? allTrades[0].entry_time : null

  // Group trades by month for modal
  var tradesByMonth = {}
  allTrades.forEach(function(t) {
    var d = new Date(t.entry_time)
    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    if (!tradesByMonth[key]) tradesByMonth[key] = []
    tradesByMonth[key].push(t)
  })

  var pairs = Array.from(new Set(allTrades.map(function(t) { return t.pair }))).sort()

  var modalTrades = selectedMonth ? (tradesByMonth[selectedMonth.month] || []).slice().sort(function(a, b) {
    return new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
  }).filter(function(t) {
    if (filterPair && t.pair !== filterPair) return false
    if (filterDir && t.action !== filterDir) return false
    return true
  }) : []

  var monthDate = selectedMonth ? new Date(selectedMonth.month + '-01') : null
  var monthName = monthDate ? monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''

  return (
    <div className="space-y-4">

      {/* Stats Grid 3x3 */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.02] rounded-lg overflow-hidden">
        {[
          { label: 'THIS MONTH', value: thisMonthData ? (thisMonthData.pnl >= 0 ? '+' : '') + '$' + thisMonthData.pnl.toLocaleString() : '--', color: thisMonthData && thisMonthData.pnl >= 0 ? '#00e5a0' : thisMonthData ? '#ff4d4d' : '#333', sub: thisMonthData ? thisMonthData.trades + ' trades' : '' },
          { label: 'LAST 7 DAYS', value: (weekPnl >= 0 ? '+' : '') + '$' + Math.round(weekPnl).toLocaleString(), color: weekPnl >= 0 ? '#00e5a0' : '#ff4d4d', sub: weekTrades.length + ' trades' },
          { label: 'LAST SIGNAL', value: lastSignalTime ? timeAgo(lastSignalTime) : '--', color: '#e0e0e0', sub: allTrades[0] ? allTrades[0].pair + ' / ' + allTrades[0].action : '' },
          { label: 'RETURN', value: stats ? '+' + stats.totalReturn.toFixed(1) + '%' : '--', color: '#00e5a0', sub: 'all time' },
          { label: 'WIN RATE', value: stats ? stats.winRate + '%' : '--', color: '#e0e0e0', sub: stats ? stats.wins + 'W / ' + stats.losses + 'L' : '' },
          { label: 'PROFIT FACTOR', value: stats ? stats.profitFactor.toFixed(2) : '--', color: '#e0e0e0', sub: '' },
          { label: 'MONTHLY AVG', value: stats ? '+$' + stats.avgMonthlyPnl.toLocaleString() : '--', color: '#00e5a0', sub: stats ? stats.profitableMonths + '/' + stats.totalMonths + ' months green' : '' },
          { label: 'BEST MONTH', value: stats && performance ? '+$' + Math.round(Math.max.apply(null, performance.monthly.map(function(m) { return m.pnl }))).toLocaleString() : '--', color: '#00e5a0', sub: '' },
          { label: 'TOTAL TRADES', value: stats ? String(stats.totalTrades) : '--', color: '#e0e0e0', sub: '' },
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

      {/* Monthly Breakdown */}
      {monthly.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] mono text-[#888] tracking-[.15em] font-medium">MONTHLY BREAKDOWN</h2>
            <span className="text-[12px] mono text-[#555]">{monthly.length} months</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {monthly.slice().reverse().map(function(m) {
              var isPos = m.pnl >= 0
              var monthD = new Date(m.month + '-01')
              var monthShort = monthD.toLocaleDateString('en-US', { month: 'short' })
              var year = monthD.getFullYear()
              var wr = m.trades > 0 ? (m.wins / m.trades * 100).toFixed(0) : '0'
              var maxPnl = Math.max.apply(null, monthly.map(function(x) { return Math.abs(x.pnl) }))
              var intensity = Math.min(Math.abs(m.pnl) / maxPnl, 1)

              return (
                <button
                  key={m.month}
                  onClick={function() { setSelectedMonth(m); setFilterPair(''); setFilterDir(''); setSelectedTrade(null) }}
                  className="w-full text-left border border-white/[0.04] rounded-lg overflow-hidden transition-all hover:border-white/[0.08] bg-[#0c0c0c] group"
                >
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

                    <div className="flex gap-px">
                      {(tradesByMonth[m.month] || []).slice().sort(function(a, b) {
                        return new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
                      }).map(function(t, ti) {
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
        </section>
      )}

      {/* Recent Trades */}
      <section>
        <div className="flex items-center gap-2.5 mb-3">
          <h2 className="text-[14px] mono text-[#888] tracking-[.15em] font-medium">RECENT TRADES</h2>
          {currentStreak > 1 && (
            <span className={'text-[13px] mono px-2 py-0.5 rounded-md ' + (streakType === 'W' ? 'bg-[#00e5a0]/[0.06] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.06] text-[#ff4d4d]')}>
              {currentStreak}{streakType} STREAK
            </span>
          )}
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
                {recentTrades.map(function(t, i) {
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
          {recentTrades.map(function(t, i) {
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

      {/* Month Detail Modal */}
      {selectedMonth && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center" onClick={function(e) { if (e.target === e.currentTarget) { setSelectedMonth(null); setSelectedTrade(null) } }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-4xl mx-4 mt-[5vh] md:mt-[8vh] max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] shrink-0">
              <div className="flex items-center gap-4">
                <h3 className="text-[14px] font-semibold text-white">{monthName}</h3>
                <span className={'text-[16px] mono font-bold ' + (selectedMonth.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                  {selectedMonth.pnl >= 0 ? '+' : ''}${selectedMonth.pnl.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
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

            <div className="flex-1 overflow-y-auto">
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
                  {modalTrades.map(function(t, ti) {
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

              <div className="md:hidden divide-y divide-white/[0.02]">
                {modalTrades.map(function(t, ti) {
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

            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-[#0b0b0b] shrink-0">
              <span className="text-[12px] mono text-[#555]">{modalTrades.length} trades shown</span>
              <span className="text-[12px] mono text-[#555]">Fees: ${Math.round((tradesByMonth[selectedMonth.month] || []).reduce(function(s, t) { return s + t.fees }, 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center" onClick={function(e) { if (e.target === e.currentTarget) setSelectedTrade(null) }}>
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative w-full max-w-md mx-4 bg-[#0c0c0c] border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className={'text-[12px] font-bold mono px-2 py-0.5 rounded ' + (selectedTrade.action === 'LONG' ? 'bg-[#00e5a0]/[0.08] text-[#00e5a0]' : 'bg-[#ff4d4d]/[0.08] text-[#ff4d4d]')}>{selectedTrade.action}</span>
                <span className="text-[14px] font-bold mono text-white">{selectedTrade.pair}</span>
              </div>
              <button onClick={function() { setSelectedTrade(null) }} className="text-[#555] hover:text-white transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="px-5 py-5 text-center border-b border-white/[0.03]">
              <div className={'text-[28px] font-bold mono ' + (selectedTrade.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4d4d]')}>
                {selectedTrade.pnl >= 0 ? '+' : ''}${Number(selectedTrade.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
              </div>
              <div className="text-[12px] mono text-[#555] mt-1">
                {selectedTrade.exit_reason === 'TP' ? 'Take Profit Hit' : 'Stop Loss Hit'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/[0.02]">
              {[
                { l: 'ENTRY', v: '$' + Number(selectedTrade.entry_price).toLocaleString(undefined, {maximumFractionDigits: 4}) },
                { l: 'EXIT', v: '$' + Number(selectedTrade.exit_price).toLocaleString(undefined, {maximumFractionDigits: 4}) },
                { l: 'STOP LOSS', v: selectedTrade.stop_loss ? '$' + Number(selectedTrade.stop_loss).toLocaleString(undefined, {maximumFractionDigits: 4}) : '--' },
                { l: 'TAKE PROFIT', v: selectedTrade.take_profit ? '$' + Number(selectedTrade.take_profit).toLocaleString(undefined, {maximumFractionDigits: 4}) : '--' },
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

            <div className="px-5 py-3 border-t border-white/[0.03] flex items-center justify-between text-[12px] mono text-[#555]">
              <span>Entry: {new Date(selectedTrade.entry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(selectedTrade.entry_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>Exit: {selectedTrade.exit_time ? new Date(selectedTrade.exit_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date(selectedTrade.exit_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
