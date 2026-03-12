'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Trade {
  id: string; pair: string; direction: string; entry_price: number; exit_price: number | null
  pnl: number | null; pnl_percent: number | null; r_multiple: number | null; status: string
  setup_type: string | null; emotional_state: string | null; session: string | null
  opened_at: string; closed_at: string | null; entry_date?: string; created_at: string
}

const EMOTIONAL_EMOJIS: Record<string, string> = { confident: '😎', neutral: '😐', fomo: '😤', revenge: '👿', uncertain: '🤔' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StatsClient() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/journal?limit=1000')
      .then(r => r.json())
      .then(d => setTrades(d.trades || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const closed = useMemo(() => trades.filter(t => t.status === 'closed' && t.pnl != null), [trades])
  const wins = useMemo(() => closed.filter(t => (t.pnl || 0) > 0), [closed])
  const losses = useMemo(() => closed.filter(t => (t.pnl || 0) < 0), [closed])

  const totalPnl = closed.reduce((s, t) => s + (t.pnl || 0), 0)
  const winRate = closed.length > 0 ? (wins.length / closed.length * 100) : 0
  const avgR = closed.filter(t => t.r_multiple != null).reduce((s, t, _, a) => s + (t.r_multiple || 0) / a.length, 0)
  const grossProfit = wins.reduce((s, t) => s + (t.pnl || 0), 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0
  const expectancy = closed.length > 0 ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss : 0

  // Streak
  const streak = useMemo(() => {
    let s = 0
    for (const t of closed) {
      if (s === 0) s = (t.pnl || 0) > 0 ? 1 : -1
      else if ((t.pnl || 0) > 0 && s > 0) s++
      else if ((t.pnl || 0) < 0 && s < 0) s--
      else break
    }
    return s
  }, [closed])

  // Max drawdown
  const maxDrawdown = useMemo(() => {
    let peak = 0, dd = 0, cum = 0
    const sorted = [...closed].sort((a, b) => (a.closed_at || a.created_at).localeCompare(b.closed_at || b.created_at))
    for (const t of sorted) {
      cum += t.pnl || 0
      if (cum > peak) peak = cum
      const currentDd = peak - cum
      if (currentDd > dd) dd = currentDd
    }
    return dd
  }, [closed])

  // Equity curve
  const equityCurve = useMemo(() => {
    const sorted = [...closed].sort((a, b) => (a.closed_at || a.created_at).localeCompare(b.closed_at || b.created_at))
    let cum = 0
    return sorted.map((t, i) => {
      cum += t.pnl || 0
      return { index: i + 1, pnl: Math.round(cum * 100) / 100, date: new Date(t.closed_at || t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    })
  }, [closed])

  // Monthly heatmap
  const monthlyHeatmap = useMemo(() => {
    const map: Record<string, number> = {}
    closed.forEach(t => {
      const d = new Date(t.closed_at || t.created_at).toISOString().slice(0, 10)
      map[d] = (map[d] || 0) + (t.pnl || 0)
    })
    return Object.entries(map).map(([date, pnl]) => ({ date, pnl: Math.round(pnl * 100) / 100 })).sort((a, b) => a.date.localeCompare(b.date))
  }, [closed])

  // Setup breakdown
  const setupBreakdown = useMemo(() => {
    const map: Record<string, { wins: number; total: number; totalR: number }> = {}
    closed.forEach(t => {
      const s = t.setup_type || 'unknown'
      if (!map[s]) map[s] = { wins: 0, total: 0, totalR: 0 }
      map[s].total++
      if ((t.pnl || 0) > 0) map[s].wins++
      map[s].totalR += t.r_multiple || 0
    })
    return Object.entries(map).map(([setup, d]) => ({
      setup: setup.replace('_', ' '),
      winRate: Math.round(d.wins / d.total * 100),
      avgR: Math.round(d.totalR / d.total * 100) / 100,
      total: d.total,
    })).sort((a, b) => b.winRate - a.winRate)
  }, [closed])

  // Emotional correlation
  const emotionalCorrelation = useMemo(() => {
    const map: Record<string, { wins: number; total: number }> = {}
    closed.forEach(t => {
      const e = t.emotional_state || 'unknown'
      if (!map[e]) map[e] = { wins: 0, total: 0 }
      map[e].total++
      if ((t.pnl || 0) > 0) map[e].wins++
    })
    return Object.entries(map).map(([state, d]) => ({
      state,
      emoji: EMOTIONAL_EMOJIS[state] || '',
      winRate: Math.round(d.wins / d.total * 100),
      total: d.total,
    })).sort((a, b) => b.winRate - a.winRate)
  }, [closed])

  // Session performance
  const sessionPerf = useMemo(() => {
    const map: Record<string, { wins: number; total: number; pnl: number }> = {}
    closed.forEach(t => {
      const s = t.session || 'unknown'
      if (!map[s]) map[s] = { wins: 0, total: 0, pnl: 0 }
      map[s].total++
      map[s].pnl += t.pnl || 0
      if ((t.pnl || 0) > 0) map[s].wins++
    })
    return Object.entries(map).map(([session, d]) => ({
      session,
      winRate: Math.round(d.wins / d.total * 100),
      pnl: Math.round(d.pnl * 100) / 100,
      total: d.total,
    }))
  }, [closed])

  // Day of week
  const dayPerf = useMemo(() => {
    const map: number[] = [0,0,0,0,0,0,0]
    const counts: number[] = [0,0,0,0,0,0,0]
    closed.forEach(t => {
      const day = new Date(t.closed_at || t.created_at).getDay()
      map[day] += t.pnl || 0
      counts[day]++
    })
    return DAYS.map((name, i) => ({ day: name, pnl: Math.round(map[i] * 100) / 100, count: counts[i] }))
  }, [closed])

  // Best/worst trade
  const bestTrade = useMemo(() => closed.reduce((best, t) => (!best || (t.pnl || 0) > (best.pnl || 0)) ? t : best, null as Trade | null), [closed])
  const worstTrade = useMemo(() => closed.reduce((worst, t) => (!worst || (t.pnl || 0) < (worst.pnl || 0)) ? t : worst, null as Trade | null), [closed])

  const metricCard = (label: string, value: string, sub?: string, color?: string) => (
    <div className="p-3 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
      <p className="text-[10px] text-[#555] font-mono tracking-wider">{label}</p>
      <p className={`text-lg font-bold font-mono ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-[#555]">{sub}</p>}
    </div>
  )

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#00e5a0] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/journal" className="text-[10px] text-[#555] hover:text-[#999] font-mono tracking-wider">← JOURNAL</Link>
          <h1 className="text-xl font-bold text-white mt-2">Analytics</h1>
        </div>
      </div>

      {closed.length === 0 ? (
        <div className="text-center py-16 text-[#555] text-sm">No closed trades yet. Close some trades to see analytics.</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metricCard('TOTAL TRADES', String(closed.length))}
            {metricCard('WIN RATE', `${winRate.toFixed(1)}%`, `${wins.length}W / ${losses.length}L`, winRate >= 50 ? 'text-[#00e5a0]' : 'text-[#ff4976]')}
            {metricCard('AVG R', avgR.toFixed(2) + 'R', undefined, avgR >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4976]')}
            {metricCard('PROFIT FACTOR', profitFactor === Infinity ? '∞' : profitFactor.toFixed(2), undefined, profitFactor >= 1 ? 'text-[#00e5a0]' : 'text-[#ff4976]')}
            {metricCard('EXPECTANCY', `$${expectancy.toFixed(2)}`, undefined, expectancy >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4976]')}
            {metricCard('MAX DRAWDOWN', `$${maxDrawdown.toFixed(2)}`, undefined, 'text-[#ff4976]')}
            {metricCard('STREAK', `${streak > 0 ? '+' : ''}${streak}`, streak > 0 ? 'winning' : streak < 0 ? 'losing' : '', streak > 0 ? 'text-[#00e5a0]' : streak < 0 ? 'text-[#ff4976]' : 'text-white')}
            {metricCard('TOTAL PNL', `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, undefined, totalPnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4976]')}
          </div>

          {/* Equity Curve */}
          <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
            <p className="text-[10px] text-[#555] font-mono tracking-wider mb-4">EQUITY CURVE</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={equityCurve}>
                <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#999' }} />
                <Line type="monotone" dataKey="pnl" stroke="#00e5a0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Heatmap */}
          {monthlyHeatmap.length > 0 && (
            <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
              <p className="text-[10px] text-[#555] font-mono tracking-wider mb-4">DAILY P&L</p>
              <div className="flex flex-wrap gap-1">
                {monthlyHeatmap.map(d => {
                  const maxPnl = Math.max(...monthlyHeatmap.map(x => Math.abs(x.pnl)), 1)
                  const intensity = Math.min(Math.abs(d.pnl) / maxPnl, 1)
                  const bg = d.pnl >= 0 ? `rgba(0, 229, 160, ${0.1 + intensity * 0.5})` : `rgba(255, 73, 118, ${0.1 + intensity * 0.5})`
                  return (
                    <div key={d.date} title={`${d.date}: $${d.pnl}`} style={{ background: bg }}
                      className="w-8 h-8 rounded text-[8px] flex items-center justify-center text-white/60 font-mono">
                      {new Date(d.date + 'T12:00:00').getDate()}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Setup Breakdown */}
          {setupBreakdown.length > 0 && (
            <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
              <p className="text-[10px] text-[#555] font-mono tracking-wider mb-4">SETUP TYPE BREAKDOWN</p>
              <div className="space-y-3">
                {setupBreakdown.map(s => (
                  <div key={s.setup} className="flex items-center gap-3">
                    <span className="text-xs text-[#999] w-24 capitalize truncate">{s.setup}</span>
                    <div className="flex-1 h-6 bg-white/[0.02] rounded-full overflow-hidden relative">
                      <div className="h-full rounded-full bg-[#00e5a0]/20" style={{ width: `${s.winRate}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/80">{s.winRate}% · {s.avgR}R · {s.total} trades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Correlation */}
          {emotionalCorrelation.length > 0 && (
            <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
              <p className="text-[10px] text-[#555] font-mono tracking-wider mb-4">WIN RATE BY EMOTIONAL STATE</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {emotionalCorrelation.map(e => (
                  <div key={e.state} className="text-center p-3 rounded-lg border border-white/[0.04]">
                    <span className="text-2xl">{e.emoji || '❓'}</span>
                    <p className="text-xs text-[#999] capitalize mt-1">{e.state}</p>
                    <p className={`text-lg font-bold font-mono ${e.winRate >= 50 ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>{e.winRate}%</p>
                    <p className="text-[10px] text-[#555]">{e.total} trades</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Performance */}
          {sessionPerf.length > 0 && (
            <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
              <p className="text-[10px] text-[#555] font-mono tracking-wider mb-4">SESSION PERFORMANCE</p>
              <div className="grid grid-cols-3 gap-3">
                {sessionPerf.map(s => (
                  <div key={s.session} className="text-center p-3 rounded-lg border border-white/[0.04]">
                    <p className="text-xs text-[#999] capitalize">{s.session}</p>
                    <p className={`text-lg font-bold font-mono ${s.winRate >= 50 ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>{s.winRate}%</p>
                    <p className={`text-xs font-mono ${s.pnl >= 0 ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>${s.pnl.toFixed(2)}</p>
                    <p className="text-[10px] text-[#555]">{s.total} trades</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day of Week */}
          <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
            <p className="text-[10px] text-[#555] font-mono tracking-wider mb-4">DAY OF WEEK</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dayPerf}>
                <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {dayPerf.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#00e5a0' : '#ff4976'} opacity={0.6} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Best/Worst Trade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bestTrade && (
              <Link href={`/dashboard/journal/${bestTrade.id}`} className="p-4 rounded-lg border border-[#00e5a0]/10 bg-[#00e5a0]/[0.02] hover:bg-[#00e5a0]/[0.05] transition-colors">
                <p className="text-[10px] text-[#555] font-mono tracking-wider">BEST TRADE</p>
                <p className="text-lg font-bold font-mono text-[#00e5a0]">+${Number(bestTrade.pnl).toFixed(2)}</p>
                <p className="text-xs text-[#999]">{bestTrade.pair} {bestTrade.direction}</p>
              </Link>
            )}
            {worstTrade && (
              <Link href={`/dashboard/journal/${worstTrade.id}`} className="p-4 rounded-lg border border-[#ff4976]/10 bg-[#ff4976]/[0.02] hover:bg-[#ff4976]/[0.05] transition-colors">
                <p className="text-[10px] text-[#555] font-mono tracking-wider">WORST TRADE</p>
                <p className="text-lg font-bold font-mono text-[#ff4976]">${Number(worstTrade.pnl).toFixed(2)}</p>
                <p className="text-xs text-[#999]">{worstTrade.pair} {worstTrade.direction}</p>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}
