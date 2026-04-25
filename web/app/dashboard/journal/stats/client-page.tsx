'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Trade = {
  id: string
  pair: string
  direction: string
  entry_price?: number | null
  exit_price?: number | null
  pnl: number | null
  pnl_percent: number | null
  r_multiple: number | null
  status: string
  setup_type: string | null
  emotional_state: string | null
  session: string | null
  timeframe?: string | null
  risk_amount?: number | null
  opened_at?: string | null
  closed_at: string | null
  entry_date?: string | null
  exit_date?: string | null
  created_at: string
}

type EquityPoint = {
  index: number
  date: string
  pnl: number
  r: number | null
  drawdown: number
}

type Segment = {
  key: string
  label: string
  total: number
  wins: number
  pnl: number
  rSum: number
  rCount: number
  avgR: number | null
  winRate: number
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SETUP_LABELS: Record<string, string> = {
  breakout: 'Breakout',
  rejection: 'Rejection',
  pullback: 'Pullback',
  reversal: 'Reversal',
  liquidity_sweep: 'Liquidity sweep',
  continuation: 'Continuation',
}

const EMOTION_LABELS: Record<string, string> = {
  confident: 'Confident',
  neutral: 'Neutral',
  uncertain: 'Uncertain',
  fomo: 'FOMO',
  revenge: 'Revenge',
}

function money(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function pct(value: number) {
  return `${value.toFixed(1)}%`
}

function r(value: number | null) {
  if (value === null) return 'No R data'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}R`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function label(value: string | null | undefined, map?: Record<string, string>) {
  if (!value) return 'Unclassified'
  return map?.[value] || value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function sortByClosed(a: Trade, b: Trade) {
  return (a.closed_at || a.exit_date || a.created_at).localeCompare(b.closed_at || b.exit_date || b.created_at)
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function segmentBy(trades: Trade[], getKey: (trade: Trade) => string | null | undefined, labels?: Record<string, string>) {
  const map = new Map<string, Segment>()
  trades.forEach(trade => {
    const key = getKey(trade) || 'unclassified'
    const current = map.get(key) || {
      key,
      label: key === 'unclassified' ? 'Unclassified' : label(key, labels),
      total: 0,
      wins: 0,
      pnl: 0,
      rSum: 0,
      rCount: 0,
      avgR: null,
      winRate: 0,
    }
    current.total += 1
    current.pnl += trade.pnl || 0
    current.wins += (trade.pnl || 0) > 0 ? 1 : 0
    if (trade.r_multiple !== null && trade.r_multiple !== undefined) {
      current.rSum += trade.r_multiple
      current.rCount += 1
    }
    map.set(key, current)
  })

  return Array.from(map.values())
    .map(segment => ({
      ...segment,
      avgR: segment.rCount ? segment.rSum / segment.rCount : null,
      winRate: segment.total ? segment.wins / segment.total : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

function getDayUtc(trade: Trade) {
  return new Date(trade.closed_at || trade.exit_date || trade.created_at).getUTCDay()
}

export default function StatsClient() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/journal?limit=1000')
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Could not load journal statistics.')
        if (active) setTrades(data.trades || [])
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load journal statistics.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  const closed = useMemo(() => trades.filter(t => t.status === 'closed' && t.pnl !== null && t.pnl !== undefined).sort(sortByClosed), [trades])
  const wins = useMemo(() => closed.filter(t => (t.pnl || 0) > 0), [closed])
  const losses = useMemo(() => closed.filter(t => (t.pnl || 0) < 0), [closed])
  const breakEven = closed.length - wins.length - losses.length

  const stats = useMemo(() => {
    const totalPnl = closed.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    const winRate = closed.length ? wins.length / closed.length : 0
    const grossProfit = wins.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
    const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + (trade.pnl || 0), 0))
    const avgWin = wins.length ? grossProfit / wins.length : 0
    const avgLoss = losses.length ? grossLoss / losses.length : 0
    const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
    const avgPnl = closed.length ? totalPnl / closed.length : 0
    const rValues = closed.map(t => t.r_multiple).filter((value): value is number => value !== null && value !== undefined)
    const avgR = rValues.length ? average(rValues) : null
    const expectancyR = avgR
    const bestTrade = closed.reduce((best, trade) => !best || (trade.pnl || 0) > (best.pnl || 0) ? trade : best, null as Trade | null)
    const worstTrade = closed.reduce((worst, trade) => !worst || (trade.pnl || 0) < (worst.pnl || 0) ? trade : worst, null as Trade | null)

    let peak = 0
    let cumulative = 0
    let maxDrawdown = 0
    let currentStreak = 0
    let runningStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0

    closed.forEach(trade => {
      cumulative += trade.pnl || 0
      peak = Math.max(peak, cumulative)
      maxDrawdown = Math.max(maxDrawdown, peak - cumulative)

      const result = (trade.pnl || 0) > 0 ? 1 : (trade.pnl || 0) < 0 ? -1 : 0
      if (result === 0) {
        runningStreak = 0
      } else if (Math.sign(runningStreak) === result) {
        runningStreak += result
      } else {
        runningStreak = result
      }
      currentStreak = runningStreak
      if (runningStreak > 0) maxWinStreak = Math.max(maxWinStreak, runningStreak)
      if (runningStreak < 0) maxLossStreak = Math.max(maxLossStreak, Math.abs(runningStreak))
    })

    return { totalPnl, winRate, grossProfit, grossLoss, avgWin, avgLoss, profitFactor, avgPnl, avgR, expectancyR, bestTrade, worstTrade, maxDrawdown, currentStreak, maxWinStreak, maxLossStreak }
  }, [closed, losses, wins])

  const equity = useMemo<EquityPoint[]>(() => {
    let cumulative = 0
    let cumulativeR = 0
    let peak = 0
    return closed.map((trade, index) => {
      cumulative += trade.pnl || 0
      if (trade.r_multiple !== null && trade.r_multiple !== undefined) cumulativeR += trade.r_multiple
      peak = Math.max(peak, cumulative)
      return {
        index: index + 1,
        date: formatDate(trade.closed_at || trade.exit_date || trade.created_at),
        pnl: Math.round(cumulative * 100) / 100,
        r: trade.r_multiple !== null && trade.r_multiple !== undefined ? Math.round(cumulativeR * 100) / 100 : null,
        drawdown: Math.round((peak - cumulative) * 100) / 100,
      }
    })
  }, [closed])

  const setupSegments = useMemo(() => segmentBy(closed, t => t.setup_type, SETUP_LABELS), [closed])
  const sessionSegments = useMemo(() => segmentBy(closed, t => t.session), [closed])
  const emotionSegments = useMemo(() => segmentBy(closed, t => t.emotional_state, EMOTION_LABELS), [closed])

  const dayPerf = useMemo(() => {
    const rows = DAYS.map((day, index) => ({ day, index, total: 0, wins: 0, pnl: 0, rSum: 0, rCount: 0 }))
    closed.forEach(trade => {
      const row = rows[getDayUtc(trade)]
      row.total += 1
      row.pnl += trade.pnl || 0
      row.wins += (trade.pnl || 0) > 0 ? 1 : 0
      if (trade.r_multiple !== null && trade.r_multiple !== undefined) {
        row.rSum += trade.r_multiple
        row.rCount += 1
      }
    })
    return rows.map(row => ({ ...row, winRate: row.total ? row.wins / row.total : 0, avgR: row.rCount ? row.rSum / row.rCount : null }))
  }, [closed])

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; pnl: number; trades: number; wins: number }>()
    closed.forEach(trade => {
      const key = new Date(trade.closed_at || trade.exit_date || trade.created_at).toISOString().slice(0, 7)
      const current = map.get(key) || { month: key, pnl: 0, trades: 0, wins: 0 }
      current.pnl += trade.pnl || 0
      current.trades += 1
      current.wins += (trade.pnl || 0) > 0 ? 1 : 0
      map.set(key, current)
    })
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [closed])

  const coachNotes = useMemo(() => {
    if (closed.length < 3) return ['Close at least three trades to unlock performance analytics.']
    const notes: string[] = []
    if (stats.avgR !== null) notes.push(`Average R is ${r(stats.avgR)} across ${closed.length} closed trades.`)
    else notes.push(`Average P&L per trade is ${money(stats.avgPnl)}. Add stops/risk to unlock R-based analytics.`)
    if (stats.profitFactor > 1.25) notes.push(`Profit factor is ${stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}. Protect the playbook creating that spread.`)
    if (stats.profitFactor > 0 && stats.profitFactor < 1) notes.push(`Profit factor is below 1.00. Losses are outweighing wins; review weak setup/session buckets.`)
    if (stats.maxDrawdown > Math.max(stats.grossProfit * 0.35, 0)) notes.push(`Max drawdown is ${money(stats.maxDrawdown)}. Size reduction or stricter invalidation may be needed.`)
    if (breakEven > 0) notes.push(`${breakEven} breakeven trade${breakEven === 1 ? '' : 's'} are included but do not count as wins.`)
    return notes.slice(0, 4)
  }, [breakEven, closed.length, stats])

  const latestEquity = equity[equity.length - 1]
  const minPnl = Math.min(0, ...equity.map(point => point.pnl))
  const maxPnl = Math.max(0, ...equity.map(point => point.pnl))
  const visualMaxPnl = Math.max(maxPnl, minPnl + 1)
  const pnlRange = Math.max(1, visualMaxPnl - minPnl)
  const maxMonthlyAbs = Math.max(1, ...monthly.map(month => Math.abs(month.pnl)))
  const maxDayAbs = Math.max(1, ...dayPerf.map(day => Math.abs(day.pnl)))

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/[0.06] bg-[#08080a]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#00e5a0] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#050507] p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,229,160,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,73,118,0.08),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link href="/dashboard/journal" className="font-mono text-[10px] tracking-[0.3em] text-white/35 transition-colors hover:text-[#00e5a0]">← JOURNAL</Link>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.34em] text-[#00e5a0]">Performance analytics</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.03em] text-white md:text-5xl">Know if the system is improving.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
              Clean performance analytics for P&L, R-multiple quality, drawdown, streaks, and segment-level expectancy — rebuilt without the heavy chart bundle.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[560px]">
            <Metric label="Closed" value={String(closed.length)} tone="neutral" />
            <Metric label="Total P&L" value={money(stats.totalPnl)} tone={stats.totalPnl > 0 ? 'good' : stats.totalPnl < 0 ? 'bad' : 'neutral'} />
            <Metric label="Win rate" value={pct(stats.winRate * 100)} tone={stats.winRate >= 0.5 ? 'good' : stats.winRate === 0 ? 'neutral' : 'bad'} />
            <Metric label="Avg R" value={r(stats.avgR)} tone={(stats.avgR ?? 0) > 0 ? 'good' : (stats.avgR ?? 0) < 0 ? 'bad' : 'neutral'} />
          </div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-[#ff4976]/25 bg-[#ff4976]/10 px-4 py-3 text-sm text-[#ff8aa4]">{error}</div>}

      {closed.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/[0.08] bg-[#08080a] p-10 text-center">
          <p className="text-xl font-bold text-white">No closed trades yet.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">Close a few trades and PulseWave will build your performance profile: equity curve, drawdown, profit factor, R distribution, and segment analytics.</p>
          <Link href="/dashboard/journal/new" className="mt-6 inline-flex rounded-full bg-[#00e5a0] px-5 py-3 text-xs font-black text-black transition-colors hover:bg-[#00cc8e]">Log a trade</Link>
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Profit factor" value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} tone={stats.profitFactor >= 1 ? 'good' : stats.profitFactor === 0 ? 'neutral' : 'bad'} sub={`${money(stats.grossProfit)} gross / ${money(-stats.grossLoss)} loss`} />
            <Metric label="Avg trade" value={money(stats.avgPnl)} tone={stats.avgPnl > 0 ? 'good' : stats.avgPnl < 0 ? 'bad' : 'neutral'} sub={`${wins.length}W / ${losses.length}L / ${breakEven}BE`} />
            <Metric label="Max drawdown" value={money(-stats.maxDrawdown)} tone={stats.maxDrawdown > 0 ? 'bad' : 'neutral'} sub="peak-to-trough" />
            <Metric label="Current streak" value={`${stats.currentStreak > 0 ? '+' : ''}${stats.currentStreak}`} tone={stats.currentStreak > 0 ? 'good' : stats.currentStreak < 0 ? 'bad' : 'neutral'} sub={`${stats.maxWinStreak} max win / ${stats.maxLossStreak} max loss`} />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Equity curve</p>
                    <h2 className="mt-2 text-xl font-bold text-white">Cumulative P&L</h2>
                  </div>
                  <span className="rounded-full border border-white/[0.07] px-3 py-1 font-mono text-[10px] text-white/35">{latestEquity ? latestEquity.date : '—'}</span>
                </div>
                <div className="mt-6 h-64 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="relative h-full w-full overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/[0.08]" />
                    {equity.map((point, index) => {
                      const left = equity.length === 1 ? 50 : (index / (equity.length - 1)) * 100
                      const top = 100 - ((point.pnl - minPnl) / pnlRange) * 100
                      return <div key={`${point.index}-${point.date}`} title={`${point.date}: ${money(point.pnl)}`} className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${point.pnl >= 0 ? 'bg-[#00e5a0]' : 'bg-[#ff4976]'}`} style={{ left: `${left}%`, top: `${Math.min(96, Math.max(4, top))}%` }} />
                    })}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/35">
                  <span>Low {money(minPnl)}</span>
                  <span>High {money(maxPnl)}</span>
                  <span>Latest {latestEquity ? money(latestEquity.pnl) : '—'}</span>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <SegmentTable title="Setup performance" subtitle="Playbooks by sample size" segments={setupSegments} />
                <SegmentTable title="Session performance" subtitle="Timing by expectancy" segments={sessionSegments} />
                <SegmentTable title="Emotion performance" subtitle="Mindset vs results" segments={emotionSegments} />
                <DayGrid days={dayPerf} maxAbs={maxDayAbs} />
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-[#00e5a0]/15 bg-[#00e5a0]/[0.05] p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00e5a0]">Performance Coach</p>
                <h2 className="mt-2 text-xl font-bold text-white">Current read</h2>
                <div className="mt-5 space-y-3">
                  {coachNotes.map((note, index) => (
                    <div key={`${index}-${note}`} className="rounded-2xl border border-white/[0.06] bg-black/20 p-3 text-sm leading-6 text-white/60">{note}</div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Monthly P&L</p>
                <h2 className="mt-2 text-xl font-bold text-white">Last six months</h2>
                <div className="mt-5 space-y-3">
                  {monthly.length ? monthly.map(month => {
                    const width = Math.max(8, Math.min(100, Math.abs(month.pnl) / maxMonthlyAbs * 100))
                    return (
                      <div key={month.month}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-white/40">{month.month}</span>
                          <span className={month.pnl > 0 ? 'text-[#00e5a0]' : month.pnl < 0 ? 'text-[#ff4976]' : 'text-white/40'}>{money(month.pnl)} · {month.trades} trade{month.trades === 1 ? '' : 's'}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className={`h-full rounded-full ${month.pnl >= 0 ? 'bg-[#00e5a0]' : 'bg-[#ff4976]'}`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    )
                  }) : <p className="text-sm text-white/40">No monthly data yet.</p>}
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {stats.bestTrade && <TradeExtreme title="Best trade" trade={stats.bestTrade} tone="good" />}
                {stats.worstTrade && <TradeExtreme title="Worst trade" trade={stats.worstTrade} tone="bad" />}
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function Metric({ label, value, tone, sub }: { label: string; value: string; tone: 'good' | 'bad' | 'neutral'; sub?: string }) {
  const color = tone === 'good' ? 'text-[#00e5a0]' : tone === 'bad' ? 'text-[#ff4976]' : 'text-white'
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#08080a] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">{label}</p>
      <p className={`mt-2 text-xl font-black ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-[11px] leading-4 text-white/35">{sub}</p>}
    </div>
  )
}

function SegmentTable({ title, subtitle, segments }: { title: string; subtitle: string; segments: Segment[] }) {
  const visible = segments.filter(segment => segment.total > 0).slice(0, 5)
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">{subtitle}</p>
      <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
      <div className="mt-5 space-y-3">
        {visible.length ? visible.map(segment => {
          const score = segment.avgR ?? (segment.total ? segment.pnl / segment.total : 0)
          return (
            <div key={segment.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{segment.label}</p>
                  <p className="mt-1 text-xs text-white/35">{segment.total} trade{segment.total === 1 ? '' : 's'} · {pct(segment.winRate * 100)} WR</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${score > 0 ? 'text-[#00e5a0]' : score < 0 ? 'text-[#ff4976]' : 'text-white/45'}`}>{segment.avgR !== null ? r(segment.avgR) : `${money(segment.pnl / Math.max(1, segment.total))}/trade`}</p>
                  <p className={`mt-1 text-xs ${segment.pnl > 0 ? 'text-[#00e5a0]' : segment.pnl < 0 ? 'text-[#ff4976]' : 'text-white/35'}`}>{money(segment.pnl)}</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full ${score >= 0 ? 'bg-[#00e5a0]' : 'bg-[#ff4976]'}`} style={{ width: `${Math.max(8, Math.min(100, Math.abs(score) * (segment.avgR !== null ? 45 : 0.18) + 12))}%` }} />
              </div>
            </div>
          )
        }) : <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5 text-center text-sm text-white/40">No data yet.</div>}
      </div>
    </section>
  )
}

function DayGrid({ days, maxAbs }: { days: Array<{ day: string; total: number; pnl: number; winRate: number; avgR: number | null }>; maxAbs: number }) {
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">UTC day buckets</p>
      <h2 className="mt-2 text-xl font-bold text-white">Day performance</h2>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {days.map(day => {
          const opacity = 0.08 + Math.min(0.34, Math.abs(day.pnl) / maxAbs * 0.34)
          return (
            <div key={day.day} className="rounded-2xl border border-white/[0.06] p-3" style={{ background: day.pnl >= 0 ? `rgba(0,229,160,${opacity})` : `rgba(255,73,118,${opacity})` }}>
              <p className="font-mono text-[10px] text-white/40">{day.day}</p>
              <p className={`mt-2 text-sm font-bold ${day.pnl > 0 ? 'text-[#00e5a0]' : day.pnl < 0 ? 'text-[#ff4976]' : 'text-white/45'}`}>{money(day.pnl)}</p>
              <p className="mt-1 text-[11px] text-white/35">{day.total} trade{day.total === 1 ? '' : 's'} · {pct(day.winRate * 100)}</p>
              <p className="mt-1 text-[11px] text-white/35">{r(day.avgR)}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TradeExtreme({ title, trade, tone }: { title: string; trade: Trade; tone: 'good' | 'bad' }) {
  return (
    <Link href={`/dashboard/journal/${encodeURIComponent(trade.id)}`} className={`rounded-3xl border p-5 transition-colors ${tone === 'good' ? 'border-[#00e5a0]/15 bg-[#00e5a0]/[0.05] hover:bg-[#00e5a0]/[0.08]' : 'border-[#ff4976]/15 bg-[#ff4976]/[0.05] hover:bg-[#ff4976]/[0.08]'}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">{title}</p>
      <p className={`mt-2 text-2xl font-black ${tone === 'good' ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>{money(trade.pnl || 0)}</p>
      <p className="mt-1 text-sm text-white/55">{trade.pair} · {trade.direction}</p>
      <p className="mt-1 text-xs text-white/35">{formatDate(trade.closed_at || trade.exit_date || trade.created_at)}</p>
    </Link>
  )
}
