'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SETUP_TYPES = ['breakout', 'rejection', 'squeeze', 'kijun_bounce', 'range_play', 'trend_follow', 'scalp', 'other']
const EMOTIONAL_EMOJIS: Record<string, string> = {
  confident: '😎',
  neutral: '😐',
  fomo: '😤',
  revenge: '👿',
  uncertain: '🤔',
}
const GRADE_COLORS: Record<string, string> = {
  A: 'text-[#00e5a0]',
  B: 'text-[#4ade80]',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-[#ff4976]',
}

interface Trade {
  id: string
  pair: string
  direction: 'LONG' | 'SHORT' | string
  entry_price: number | string
  exit_price: number | string | null
  stop_loss: number | string | null
  take_profit: number | string | null
  pnl: number | string | null
  pnl_percent: number | string | null
  r_multiple: number | string | null
  status: string
  setup_type: string | null
  timeframe?: string | null
  grade: string | null
  emotional_state: string | null
  session: string | null
  pre_thesis?: string | null
  post_right?: string | null
  post_wrong?: string | null
  lesson?: string | null
  notes?: string | null
  opened_at?: string | null
  closed_at?: string | null
  entry_date?: string | null
  exit_date?: string | null
  created_at: string
}

type Filter = 'all' | 'wins' | 'losses' | 'open'

type Leak = {
  title: string
  value: string
  description: string
  tone: 'good' | 'bad' | 'neutral'
}

function num(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function money(value: number | string | null | undefined) {
  const n = num(value)
  if (n === null) return '—'
  return `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function signed(value: number | string | null | undefined, suffix = '') {
  const n = num(value)
  if (n === null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}${suffix}`
}

function price(value: number | string | null | undefined) {
  const n = num(value)
  if (n === null) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 })
}

function label(value: string | null | undefined) {
  if (!value) return 'Unlabeled'
  return value.replace(/_/g, ' ')
}

function tradeDate(trade: Trade) {
  return trade.opened_at || trade.entry_date || trade.created_at
}

function isWin(trade: Trade) {
  return trade.status === 'closed' && (num(trade.pnl) || 0) > 0
}

function isLoss(trade: Trade) {
  return trade.status === 'closed' && (num(trade.pnl) || 0) < 0
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function groupAverage(trades: Trade[], field: 'setup_type' | 'session' | 'emotional_state') {
  const groups = new Map<string, number[]>()
  trades.forEach((trade) => {
    const r = num(trade.r_multiple)
    if (r === null) return
    const key = label(trade[field])
    groups.set(key, [...(groups.get(key) || []), r])
  })

  return Array.from(groups.entries())
    .map(([name, values]) => ({ name, count: values.length, avgR: average(values) }))
    .sort((a, b) => b.avgR - a.avgR)
}

function buildAiDebrief(trades: Trade[], closedTrades: Trade[], leaks: Leak[]) {
  if (trades.length === 0) {
    return {
      grade: '—',
      headline: 'Start with honest data.',
      body: 'Log a few real trades with thesis, setup, emotion, and screenshots. PulseWave will turn them into patterns you can act on.',
      bullets: ['Write the thesis before entry.', 'Grade execution separately from outcome.', 'Tag the emotion that was present when you clicked.'],
    }
  }

  const avgR = average(closedTrades.map((trade) => num(trade.r_multiple)).filter((value): value is number => value !== null))
  const weakGrades = closedTrades.filter((trade) => ['D', 'F'].includes(trade.grade || '')).length
  const missingThesis = trades.filter((trade) => !trade.pre_thesis && !trade.notes).length
  const topLeak = leaks.find((leak) => leak.tone === 'bad')

  if (avgR > 0.4) {
    return {
      grade: 'A-',
      headline: 'You have positive expectancy. Protect the pattern.',
      body: `Closed trades are averaging ${avgR.toFixed(2)}R. The work now is less about finding more trades and more about repeating the conditions that produce your best ones.`,
      bullets: ['Document the best setup before scaling size.', 'Reduce trades that do not match the playbook.', topLeak?.description || 'Keep tracking setup, session, and emotion on every trade.'],
    }
  }

  if (avgR > 0) {
    return {
      grade: 'B',
      headline: 'The edge is there, but it is fragile.',
      body: `Average R is positive at ${avgR.toFixed(2)}R, but one or two behavior leaks can erase the month. Tighten execution rules before adding complexity.`,
      bullets: ['Focus on fewer A/B grade setups.', 'Review losing trades for repeated entry errors.', topLeak?.description || 'Turn the most common mistake into one written rule.'],
    }
  }

  return {
    grade: weakGrades > 0 || missingThesis > 0 ? 'C-' : 'C',
    headline: topLeak ? topLeak.title : 'Your journal is exposing the leak.',
    body: topLeak?.description || 'The current sample is not showing positive expectancy yet. That is useful: the next step is identifying which setup, session, or emotion is causing the drag.',
    bullets: ['Stop treating every setup equally.', 'Require a written thesis before entry.', 'Review the bottom three trades this week and write one prevention rule.'],
  }
}

export default function JournalClient() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [setupFilter, setSetupFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchTrades()
  }, [])

  async function fetchTrades() {
    try {
      const res = await fetch('/api/journal')
      const data = await res.json()
      setTrades(data.trades || [])
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return trades
      .filter((trade) => {
        if (filter === 'wins') return isWin(trade)
        if (filter === 'losses') return isLoss(trade)
        if (filter === 'open') return trade.status === 'open'
        return true
      })
      .filter((trade) => {
        if (setupFilter && trade.setup_type !== setupFilter) return false
        const d = tradeDate(trade)
        if (dateFrom && d < dateFrom) return false
        if (dateTo && d > dateTo + 'T23:59:59') return false
        return true
      })
  }, [dateFrom, dateTo, filter, setupFilter, trades])

  const analytics = useMemo(() => {
    const closedTrades = trades.filter((trade) => trade.status === 'closed' && num(trade.pnl) !== null)
    const winningTrades = closedTrades.filter(isWin)
    const losingTrades = closedTrades.filter(isLoss)
    const openTrades = trades.filter((trade) => trade.status === 'open')
    const rValues = closedTrades.map((trade) => num(trade.r_multiple)).filter((value): value is number => value !== null)
    const pnlValues = closedTrades.map((trade) => num(trade.pnl)).filter((value): value is number => value !== null)
    const avgR = average(rValues)
    const expectancy = average(pnlValues)
    const winRate = closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0
    const setupGroups = groupAverage(closedTrades, 'setup_type')
    const sessionGroups = groupAverage(closedTrades, 'session')
    const emotionGroups = groupAverage(closedTrades, 'emotional_state')
    const missingThesis = trades.filter((trade) => !trade.pre_thesis && !trade.notes).length
    const weakGradeRate = closedTrades.length ? (closedTrades.filter((trade) => ['D', 'F'].includes(trade.grade || '')).length / closedTrades.length) * 100 : 0
    const bestSetup = setupGroups.find((group) => group.name !== 'Unlabeled') || setupGroups[0]
    const worstSetup = [...setupGroups].reverse().find((group) => group.name !== 'Unlabeled') || setupGroups[setupGroups.length - 1]
    const worstEmotion = [...emotionGroups].reverse().find((group) => group.name !== 'Unlabeled')
    const bestSession = sessionGroups.find((group) => group.name !== 'Unlabeled')

    const leaks: Leak[] = []
    if (missingThesis > 0) {
      leaks.push({
        title: 'Missing thesis trades',
        value: `${missingThesis}`,
        description: `${missingThesis} trade${missingThesis === 1 ? '' : 's'} did not capture a thesis or notes. These are impossible to coach later.`,
        tone: 'bad',
      })
    }
    if (worstEmotion && worstEmotion.avgR < 0) {
      leaks.push({
        title: `${worstEmotion.name} emotion`,
        value: `${worstEmotion.avgR.toFixed(2)}R`,
        description: `Trades tagged ${worstEmotion.name} are averaging ${worstEmotion.avgR.toFixed(2)}R. Treat that state as a risk flag before entry.`,
        tone: 'bad',
      })
    }
    if (worstSetup && worstSetup.avgR < 0) {
      leaks.push({
        title: `${worstSetup.name} setup`,
        value: `${worstSetup.avgR.toFixed(2)}R`,
        description: `${worstSetup.name} is currently the weakest setup at ${worstSetup.avgR.toFixed(2)}R across ${worstSetup.count} trade${worstSetup.count === 1 ? '' : 's'}.`,
        tone: 'bad',
      })
    }
    if (bestSetup && bestSetup.avgR > 0) {
      leaks.push({
        title: `${bestSetup.name} edge`,
        value: `+${bestSetup.avgR.toFixed(2)}R`,
        description: `${bestSetup.name} is your strongest setup so far. This is the playbook to document and repeat.`,
        tone: 'good',
      })
    }
    if (bestSession && bestSession.avgR > 0) {
      leaks.push({
        title: `${bestSession.name} session`,
        value: `+${bestSession.avgR.toFixed(2)}R`,
        description: `${bestSession.name} session is producing better results than the rest of the book.`,
        tone: 'good',
      })
    }
    if (weakGradeRate > 25) {
      leaks.push({
        title: 'Low execution grades',
        value: `${weakGradeRate.toFixed(0)}%`,
        description: `${weakGradeRate.toFixed(0)}% of closed trades are graded D/F. Execution quality is a measurable drag.`,
        tone: 'bad',
      })
    }
    if (leaks.length === 0) {
      leaks.push({
        title: 'Need more samples',
        value: `${trades.length}`,
        description: 'Keep logging. Once enough trades have setup, emotion, and R data, PulseWave will surface stronger patterns.',
        tone: 'neutral',
      })
    }

    return {
      closedTrades,
      winningTrades,
      losingTrades,
      openTrades,
      winRate,
      avgR,
      expectancy,
      totalPnl: pnlValues.reduce((sum, value) => sum + value, 0),
      bestSetup,
      worstSetup,
      leaks: leaks.slice(0, 4),
      aiDebrief: buildAiDebrief(trades, closedTrades, leaks),
    }
  }, [trades])

  const statCards = [
    { label: 'Total P&L', value: money(analytics.totalPnl), sub: `${analytics.closedTrades.length} closed trades`, tone: analytics.totalPnl > 0 ? 'good' : analytics.totalPnl < 0 ? 'bad' : 'neutral' },
    { label: 'Win Rate', value: `${analytics.winRate.toFixed(0)}%`, sub: `${analytics.winningTrades.length}W / ${analytics.losingTrades.length}L`, tone: 'neutral' },
    { label: 'Expectancy', value: money(analytics.expectancy), sub: 'average closed trade', tone: analytics.expectancy > 0 ? 'good' : analytics.expectancy < 0 ? 'bad' : 'neutral' },
    { label: 'Avg R', value: `${analytics.avgR >= 0 ? '+' : ''}${analytics.avgR.toFixed(2)}R`, sub: analytics.bestSetup ? `best: ${analytics.bestSetup.name}` : 'needs R data', tone: analytics.avgR > 0 ? 'good' : analytics.avgR < 0 ? 'bad' : 'neutral' },
  ]

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#07080c] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,229,160,0.14),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(59,130,246,0.12),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00e5a0]/15 bg-[#00e5a0]/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#00e5a0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0] shadow-[0_0_12px_rgba(0,229,160,0.8)]" />
              AI Trading Journal
            </div>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl">Journal Command Center</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">
              Log the trade, review the behavior, and let your own data show where the edge — or leak — actually is.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/journal/stats" className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/65 transition hover:border-white/[0.16] hover:text-white">
              Stats
            </Link>
            <Link href="/dashboard/journal/insights" className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/65 transition hover:border-white/[0.16] hover:text-white">
              Insights
            </Link>
            <Link href="/dashboard/journal/new" className="rounded-xl bg-[#00e5a0] px-4 py-2 text-xs font-black text-black shadow-[0_0_28px_rgba(0,229,160,0.18)] transition hover:bg-[#00c98c]">
              + New Trade
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/[0.06] bg-[#08090c] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{card.label}</p>
            <p className={`mt-3 font-mono text-2xl font-black ${card.tone === 'good' ? 'text-[#00e5a0]' : card.tone === 'bad' ? 'text-[#ff4976]' : 'text-white'}`}>{card.value}</p>
            <p className="mt-1 text-xs text-white/38">{card.sub}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl border border-[#00e5a0]/12 bg-[#00e5a0]/[0.035] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Journal Coach</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">{analytics.aiDebrief.headline}</h2>
            </div>
            <div className="rounded-xl border border-[#00e5a0]/20 bg-black/20 px-3 py-2 font-mono text-lg font-black text-[#00e5a0]">{analytics.aiDebrief.grade}</div>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/62">{analytics.aiDebrief.body}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {analytics.aiDebrief.bullets.map((bullet, index) => (
              <div key={`${index}-${bullet}`} className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                <p className="text-sm leading-6 text-white/68">{bullet}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.07] bg-[#08090c] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Leak detector</p>
              <h2 className="mt-1 text-lg font-bold text-white">Patterns worth acting on</h2>
            </div>
            <Link href="/dashboard/journal/insights" className="text-xs font-semibold text-[#00e5a0] hover:underline">View insights</Link>
          </div>
          <div className="space-y-3">
            {analytics.leaks.map((leak, index) => (
              <div key={`${index}-${leak.title}`} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white capitalize">{leak.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">{leak.description}</p>
                  </div>
                  <p className={`font-mono text-sm font-black ${leak.tone === 'good' ? 'text-[#00e5a0]' : leak.tone === 'bad' ? 'text-[#ff4976]' : 'text-white/50'}`}>{leak.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.07] bg-[#07080c] p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Trade log</p>
            <h2 className="mt-1 text-lg font-bold text-white">Recent entries</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'wins', 'losses', 'open'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${filter === f ? 'bg-white/[0.09] text-white' : 'text-white/38 hover:bg-white/[0.04] hover:text-white/70'}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
            <select value={setupFilter} onChange={(event) => setSetupFilter(event.target.value)} className="min-h-[36px] rounded-lg border border-white/[0.06] bg-[#0a0a0c] px-3 py-2 text-[11px] text-white/60">
              <option value="">All Setups</option>
              {SETUP_TYPES.map((setup) => <option key={setup} value={setup}>{setup.replace('_', ' ')}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="min-h-[36px] rounded-lg border border-white/[0.06] bg-[#0a0a0c] px-3 py-2 text-[11px] text-white/60" />
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="min-h-[36px] rounded-lg border border-white/[0.06] bg-[#0a0a0c] px-3 py-2 text-[11px] text-white/60" />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/[0.025]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-14 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">No matching trades</p>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">Your feedback loop starts with one honest entry.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/45">
              Log the setup, thesis, emotion, risk, and result. The AI debrief gets sharper with every real trade you add.
            </p>
            <Link href="/dashboard/journal/new" className="mt-6 inline-flex rounded-xl bg-[#00e5a0] px-5 py-3 text-xs font-black text-black transition hover:bg-[#00c98c]">
              Log your first trade
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-white/[0.05] md:block">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Trade</th>
                    <th className="px-4 py-3 text-right">Entry</th>
                    <th className="px-4 py-3 text-right">Exit</th>
                    <th className="px-4 py-3 text-right">P&L</th>
                    <th className="px-4 py-3 text-right">R</th>
                    <th className="px-4 py-3 text-left">Setup</th>
                    <th className="px-4 py-3 text-center">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((trade) => {
                    const win = isWin(trade)
                    const loss = isLoss(trade)
                    const dateStr = tradeDate(trade)
                    return (
                      <tr
                        key={trade.id}
                        onClick={() => router.push(`/dashboard/journal/${trade.id}`)}
                        className={`cursor-pointer border-b border-white/[0.035] transition last:border-b-0 ${win ? 'bg-[#00e5a0]/[0.018] hover:bg-[#00e5a0]/[0.045]' : loss ? 'bg-[#ff4976]/[0.018] hover:bg-[#ff4976]/[0.045]' : 'hover:bg-white/[0.025]'}`}
                      >
                        <td className="px-4 py-4 font-mono text-white/42">{new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-md px-2 py-1 font-mono text-[10px] font-black ${trade.direction === 'LONG' ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'}`}>{trade.direction}</span>
                            <div>
                              <p className="font-bold text-white">{trade.pair}</p>
                              <p className="mt-0.5 text-[11px] text-white/35">{trade.timeframe || trade.session || trade.status}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-white/62">{price(trade.entry_price)}</td>
                        <td className="px-4 py-4 text-right font-mono text-white/62">{price(trade.exit_price)}</td>
                        <td className={`px-4 py-4 text-right font-mono font-black ${win ? 'text-[#00e5a0]' : loss ? 'text-[#ff4976]' : 'text-white/38'}`}>{trade.status === 'open' ? 'OPEN' : money(trade.pnl)}</td>
                        <td className={`px-4 py-4 text-right font-mono ${win ? 'text-[#00e5a0]' : loss ? 'text-[#ff4976]' : 'text-white/38'}`}>{signed(trade.r_multiple, 'R')}</td>
                        <td className="px-4 py-4 capitalize text-white/55">{label(trade.setup_type)}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/20 px-3 py-1">
                            <span className={`font-mono text-xs font-black ${GRADE_COLORS[trade.grade || ''] || 'text-white/35'}`}>{trade.grade || '—'}</span>
                            <span>{trade.emotional_state ? EMOTIONAL_EMOJIS[trade.emotional_state] || '' : '·'}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filtered.map((trade) => {
                const win = isWin(trade)
                const loss = isLoss(trade)
                const dateStr = tradeDate(trade)
                return (
                  <Link key={trade.id} href={`/dashboard/journal/${trade.id}`} className={`block rounded-2xl border p-4 transition ${win ? 'border-[#00e5a0]/12 bg-[#00e5a0]/[0.025]' : loss ? 'border-[#ff4976]/12 bg-[#ff4976]/[0.025]' : 'border-white/[0.06] bg-[#0a0a0c]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-md px-2 py-1 font-mono text-[10px] font-black ${trade.direction === 'LONG' ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'}`}>{trade.direction}</span>
                          <span className="font-bold text-white">{trade.pair}</span>
                        </div>
                        <p className="mt-2 text-xs capitalize text-white/42">{label(trade.setup_type)} · {new Date(dateStr).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm font-black ${win ? 'text-[#00e5a0]' : loss ? 'text-[#ff4976]' : 'text-white/38'}`}>{trade.status === 'open' ? 'OPEN' : money(trade.pnl)}</p>
                        <p className="mt-1 font-mono text-[11px] text-white/35">{signed(trade.r_multiple, 'R')}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
