'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SETUP_TYPES = ['breakout', 'rejection', 'squeeze', 'kijun_bounce', 'range_play', 'trend_follow', 'scalp', 'other']
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']
const SESSIONS = ['asian', 'london', 'ny']
const EMOTIONS = [
  { value: 'confident', emoji: '😎', label: 'Confident' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'uncertain', emoji: '🤔', label: 'Uncertain' },
  { value: 'fomo', emoji: '😤', label: 'FOMO' },
  { value: 'revenge', emoji: '👿', label: 'Revenge' },
]
const GRADES = ['A', 'B', 'C', 'D', 'F']
const GRADE_COLORS: Record<string, string> = {
  A: 'border-[#00e5a0]/35 bg-[#00e5a0]/10 text-[#00e5a0]',
  B: 'border-[#4ade80]/35 bg-[#4ade80]/10 text-[#4ade80]',
  C: 'border-[#facc15]/35 bg-[#facc15]/10 text-[#facc15]',
  D: 'border-[#fb923c]/35 bg-[#fb923c]/10 text-[#fb923c]',
  F: 'border-[#ff4976]/35 bg-[#ff4976]/10 text-[#ff4976]',
}

interface Trade {
  id: string
  pair: string
  direction: string
  entry_price: number
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  position_size: number | null
  pnl: number | null
  pnl_percent: number | null
  r_multiple: number | null
  fees: number | null
  status: string
  source: string
  notes: string | null
  tags: string[] | null
  setup_type: string | null
  timeframe: string | null
  emotional_state: string | null
  pre_thesis: string | null
  post_right: string | null
  post_wrong: string | null
  lesson: string | null
  grade: string | null
  confluence: number | null
  screenshot_entry: string | null
  screenshot_exit: string | null
  session: string | null
  risk_amount: number | null
  auto_imported: boolean
  signal_id: string | null
  opened_at: string | null
  closed_at: string | null
  entry_date?: string | null
  exit_date?: string | null
  created_at: string
  quantity?: number | null
}

type ReviewState = {
  postRight: string
  postWrong: string
  lesson: string
  grade: string
  emotionalState: string
  screenshotExit: string
}

type EditState = {
  pair: string
  setup_type: string
  timeframe: string
  session: string
  entry_price: string
  stop_loss: string
  take_profit: string
  risk_amount: string
  position_size: string
  pre_thesis: string
  notes: string
  screenshot_entry: string
}

function parseStrictNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: digits })
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  const sign = Number(value) > 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value))}`
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)}%`
}

function formatR(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)}R`
}

function label(value: string | null | undefined) {
  if (!value) return 'Not logged'
  return value.replace(/_/g, ' ')
}

function isSafeOptionalUrl(value: string | null | undefined) {
  const trimmed = (value || '').trim()
  if (!trimmed) return true
  try {
    const url = new URL(trimmed)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function getTradeDate(trade: Trade) {
  return trade.opened_at || trade.entry_date || trade.created_at
}

function calculatePlan(trade: Trade) {
  const entry = Number(trade.entry_price)
  const stop = trade.stop_loss === null ? null : Number(trade.stop_loss)
  const target = trade.take_profit === null ? null : Number(trade.take_profit)
  const exit = trade.exit_price === null ? null : Number(trade.exit_price)
  const size = trade.position_size === null ? null : Number(trade.position_size)
  const direction = trade.direction.toUpperCase()
  const riskPerUnit = stop !== null ? Math.abs(entry - stop) : null
  const targetRewardPerUnit = target !== null ? (direction === 'LONG' ? target - entry : entry - target) : null
  const exitRewardPerUnit = exit !== null ? (direction === 'LONG' ? exit - entry : entry - exit) : null
  const plannedR = riskPerUnit && targetRewardPerUnit !== null ? targetRewardPerUnit / riskPerUnit : null
  const actualR = trade.r_multiple !== null ? Number(trade.r_multiple) : riskPerUnit && exitRewardPerUnit !== null ? exitRewardPerUnit / riskPerUnit : null
  const plannedRisk = riskPerUnit !== null && size !== null ? riskPerUnit * size : trade.risk_amount
  const plannedReward = targetRewardPerUnit !== null && size !== null ? targetRewardPerUnit * size : null
  const slippageToTarget = target !== null && exit !== null ? exit - target : null

  return { entry, stop, target, exit, size, riskPerUnit, targetRewardPerUnit, exitRewardPerUnit, plannedR, actualR, plannedRisk, plannedReward, slippageToTarget }
}

function getExecutionGrade(trade: Trade, actualR: number | null) {
  if (trade.grade) return trade.grade
  if (trade.status !== 'closed') return '—'
  if (actualR === null) return 'C'
  if (actualR >= 2) return 'A'
  if (actualR >= 1) return 'B'
  if (actualR >= 0) return 'C'
  if (actualR > -1) return 'D'
  return 'F'
}

function getCoachNotes(trade: Trade, plannedR: number | null, actualR: number | null) {
  const notes: { title: string; body: string; tone: 'good' | 'warn' | 'bad' | 'neutral' }[] = []

  if (!trade.pre_thesis) {
    notes.push({ title: 'No thesis logged', body: 'The trade cannot teach you much unless the original reason is captured before hindsight kicks in.', tone: 'bad' })
  } else if (trade.pre_thesis.length >= 80) {
    notes.push({ title: 'Strong pre-trade context', body: 'This trade has enough thesis detail to compare plan versus outcome honestly.', tone: 'good' })
  }

  if (!trade.stop_loss) notes.push({ title: 'Missing invalidation', body: 'A trade without a logged stop is hard to grade because the risk line is undefined.', tone: 'warn' })
  if (!trade.take_profit) notes.push({ title: 'Missing target', body: 'Log the target so expectancy can separate good entries from good exits.', tone: 'warn' })
  if (['fomo', 'revenge'].includes(trade.emotional_state || '')) {
    notes.push({ title: 'Emotion risk logged', body: 'This is worth tagging. Track whether these states reduce follow-through or inflate losses.', tone: 'bad' })
  }
  if (plannedR !== null && plannedR < 1) {
    notes.push({ title: 'Weak planned reward/risk', body: 'The planned R was below 1.0, which means the idea needed very high win rate to justify capital.', tone: 'warn' })
  }
  if (actualR !== null && plannedR !== null && trade.status === 'closed') {
    if (actualR >= plannedR * 0.8) {
      notes.push({ title: 'Plan captured well', body: 'The actual result stayed close to the planned reward profile. Review execution, not just outcome.', tone: 'good' })
    } else if (actualR < 0 && plannedR > 1) {
      notes.push({ title: 'Good idea, failed execution or read', body: 'The plan had reward potential, but outcome was negative. Focus the debrief on trigger quality and invalidation.', tone: 'warn' })
    }
  }
  if (!trade.post_right && !trade.post_wrong && trade.status === 'closed') {
    notes.push({ title: 'Debrief still empty', body: 'Close the feedback loop: write what was right, what failed, and the rule you will use next time.', tone: 'warn' })
  }

  return notes.length > 0 ? notes.slice(0, 4) : [{ title: 'Clean journal entry', body: 'The core fields are logged. Add screenshots and a debrief to make this trade useful during weekly review.', tone: 'neutral' }]
}

function makeEditState(trade: Trade): EditState {
  return {
    pair: trade.pair || '',
    setup_type: trade.setup_type || '',
    timeframe: trade.timeframe || '',
    session: trade.session || '',
    entry_price: trade.entry_price === null || trade.entry_price === undefined ? '' : String(trade.entry_price),
    stop_loss: trade.stop_loss === null || trade.stop_loss === undefined ? '' : String(trade.stop_loss),
    take_profit: trade.take_profit === null || trade.take_profit === undefined ? '' : String(trade.take_profit),
    risk_amount: trade.risk_amount === null || trade.risk_amount === undefined ? '' : String(trade.risk_amount),
    position_size: trade.position_size === null || trade.position_size === undefined ? '' : String(trade.position_size),
    pre_thesis: trade.pre_thesis || '',
    notes: trade.notes || '',
    screenshot_entry: trade.screenshot_entry || '',
  }
}

export default function TradeDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [fees, setFees] = useState('')
  const [review, setReview] = useState<ReviewState>({ postRight: '', postWrong: '', lesson: '', grade: '', emotionalState: '', screenshotExit: '' })
  const [editForm, setEditForm] = useState<EditState | null>(null)

  useEffect(() => {
    fetchTrade()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchTrade() {
    try {
      const response = await fetch(`/api/journal/${id}`)
      if (!response.ok) throw new Error('Trade not found')
      const data = await response.json()
      const nextTrade = data.trade as Trade
      setTrade(nextTrade)
      setReview({
        postRight: nextTrade.post_right || '',
        postWrong: nextTrade.post_wrong || '',
        lesson: nextTrade.lesson || '',
        grade: nextTrade.grade || '',
        emotionalState: nextTrade.emotional_state || '',
        screenshotExit: nextTrade.screenshot_exit || '',
      })
      setEditForm(makeEditState(nextTrade))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load trade')
    } finally {
      setLoading(false)
    }
  }

  const plan = useMemo(() => trade ? calculatePlan(trade) : null, [trade])
  const coachNotes = useMemo(() => trade && plan ? getCoachNotes(trade, plan.plannedR, plan.actualR) : [], [trade, plan])

  function updateReview<K extends keyof ReviewState>(field: K, value: ReviewState[K]) {
    setReview((previous) => ({ ...previous, [field]: value }))
  }

  function updateEdit<K extends keyof EditState>(field: K, value: EditState[K]) {
    setEditForm((previous) => previous ? { ...previous, [field]: value } : previous)
  }

  async function handleClose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const parsedExit = parseStrictNumber(exitPrice)
    const parsedFees = fees.trim() ? parseStrictNumber(fees) : 0

    if (parsedExit === null || parsedExit <= 0) {
      setError('Exit price must be a valid positive number.')
      return
    }
    if (parsedFees === null || parsedFees < 0) {
      setError('Fees must be zero or a valid positive number.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exit_price: parsedExit,
          fees: parsedFees,
          status: 'closed',
          closed_at: new Date().toISOString(),
          exit_date: new Date().toISOString(),
        }),
      })
      if (!response.ok) throw new Error('Failed to close trade')
      setClosing(false)
      setExitPrice('')
      setFees('')
      await fetchTrade()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to close trade')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveReview() {
    setError('')
    if (!isSafeOptionalUrl(review.screenshotExit)) {
      setError('Exit screenshot URL must start with http:// or https://.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_right: review.postRight || null,
          post_wrong: review.postWrong || null,
          lesson: review.lesson || null,
          grade: review.grade || null,
          emotional_state: review.emotionalState || null,
          screenshot_exit: review.screenshotExit || null,
        }),
      })
      if (!response.ok) throw new Error('Failed to save review')
      await fetchTrade()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    if (!editForm) return
    setError('')

    const entry = parseStrictNumber(editForm.entry_price)
    const stop = editForm.stop_loss ? parseStrictNumber(editForm.stop_loss) : null
    const target = editForm.take_profit ? parseStrictNumber(editForm.take_profit) : null
    const risk = editForm.risk_amount ? parseStrictNumber(editForm.risk_amount) : null
    const size = editForm.position_size ? parseStrictNumber(editForm.position_size) : null

    if (!editForm.pair.trim()) {
      setError('Pair is required.')
      return
    }
    if (entry === null || entry <= 0) {
      setError('Entry must be a valid positive number.')
      return
    }
    if ((editForm.stop_loss && (stop === null || stop <= 0)) || (editForm.take_profit && (target === null || target <= 0))) {
      setError('Stop and target must be valid positive numbers when present.')
      return
    }
    if (stop !== null && stop === entry) {
      setError('Stop cannot equal entry.')
      return
    }
    if (trade.direction.toUpperCase() === 'LONG' && stop !== null && stop >= entry) {
      setError('Long stop should be below entry.')
      return
    }
    if (trade.direction.toUpperCase() === 'LONG' && target !== null && target <= entry) {
      setError('Long target should be above entry.')
      return
    }
    if (trade.direction.toUpperCase() === 'SHORT' && stop !== null && stop <= entry) {
      setError('Short stop should be above entry.')
      return
    }
    if (trade.direction.toUpperCase() === 'SHORT' && target !== null && target >= entry) {
      setError('Short target should be below entry.')
      return
    }
    if ((editForm.risk_amount && (risk === null || risk <= 0)) || (editForm.position_size && (size === null || size <= 0))) {
      setError('Risk and size must be valid positive numbers when present.')
      return
    }
    if (!isSafeOptionalUrl(editForm.screenshot_entry)) {
      setError('Entry screenshot URL must start with http:// or https://.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: editForm.pair.toUpperCase(),
          setup_type: editForm.setup_type || null,
          timeframe: editForm.timeframe || null,
          session: editForm.session || null,
          entry_price: entry,
          stop_loss: stop,
          take_profit: target,
          risk_amount: risk,
          position_size: size,
          pre_thesis: editForm.pre_thesis || null,
          notes: editForm.notes || null,
          screenshot_entry: editForm.screenshot_entry || null,
        }),
      })
      if (!response.ok) throw new Error('Failed to update trade')
      setEditing(false)
      await fetchTrade()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to update trade')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this trade? This cannot be undone.')) return
    try {
      const response = await fetch(`/api/journal/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete trade')
      router.push('/dashboard/journal')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to delete trade')
    }
  }

  const inputClass = 'w-full min-h-[48px] rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/22 outline-none transition-colors focus:border-[#00e5a0]/45 focus:bg-[#06110d]'
  const labelClass = 'mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38'

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#00e5a0] border-t-transparent" /></div>
  }

  if (!trade || !plan) {
    return <div className="py-24 text-center text-sm text-white/45">{error || 'Trade not found'}</div>
  }

  const isOpen = trade.status === 'open'
  const isClosed = trade.status === 'closed'
  const pnl = trade.pnl === null ? null : Number(trade.pnl)
  const pnlTone = pnl === null || pnl === 0 ? 'text-white' : pnl > 0 ? 'text-[#00e5a0]' : 'text-[#ff4976]'
  const statusTone = isOpen ? 'border-[#facc15]/25 bg-[#facc15]/10 text-[#facc15]' : pnl !== null && pnl > 0 ? 'border-[#00e5a0]/25 bg-[#00e5a0]/10 text-[#00e5a0]' : 'border-[#ff4976]/25 bg-[#ff4976]/10 text-[#ff4976]'
  const executionGrade = getExecutionGrade(trade, plan.actualR)
  const dateStr = getTradeDate(trade)
  const entryShotSafe = isSafeOptionalUrl(trade.screenshot_entry)
  const exitShotSafe = isSafeOptionalUrl(trade.screenshot_exit)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard/journal" className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 transition-colors hover:text-[#00e5a0]">
          ← Back to journal command center
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditing(!editing); setEditForm(makeEditState(trade)) }}
            className="rounded-xl border border-white/[0.08] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-white"
          >
            {editing ? 'Cancel Edit' : 'Edit Trade'}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-xl border border-[#ff4976]/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff4976]/70 transition-colors hover:text-[#ff4976]"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#ff4976]/25 bg-[#ff4976]/[0.07] p-4 text-sm text-[#ff8ca8]">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(0,229,160,0.15),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${trade.direction === 'LONG' ? 'border-[#00e5a0]/25 bg-[#00e5a0]/10 text-[#00e5a0]' : 'border-[#ff4976]/25 bg-[#ff4976]/10 text-[#ff4976]'}`}>
                {trade.direction}
              </span>
              <span className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${statusTone}`}>
                {trade.status}
              </span>
              {trade.source && <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{trade.source}</span>}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">{trade.pair}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
              Trade debrief: compare the original plan against the actual outcome, log execution quality, and turn this trade into a rule for the next one.
            </p>
          </div>

          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">P&L</p>
              <p className={`mt-2 font-mono text-2xl font-semibold ${pnlTone}`}>{formatCurrency(trade.pnl)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Grade</p>
              <p className={`mt-2 inline-flex rounded-xl border px-3 py-1 font-mono text-xl font-semibold ${executionGrade !== '—' ? GRADE_COLORS[executionGrade] : 'border-white/[0.08] bg-white/[0.025] text-white/45'}`}>{executionGrade}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Plan vs outcome</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">Did the trade follow the original plan?</h2>
              </div>
              <p className="font-mono text-xs text-white/35">{new Date(dateStr).toLocaleString()}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Entry', formatNumber(trade.entry_price, 6)],
                ['Stop', formatNumber(trade.stop_loss, 6)],
                ['Target', formatNumber(trade.take_profit, 6)],
                ['Exit', formatNumber(trade.exit_price, 6)],
              ].map(([name, value]) => (
                <div key={name} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{name}</p>
                  <p className="mt-2 font-mono text-lg text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Planned R', formatR(plan.plannedR)],
                ['Actual R', formatR(plan.actualR)],
                ['Planned risk', formatCurrency(plan.plannedRisk)],
                ['Planned reward', formatCurrency(plan.plannedReward)],
              ].map(([name, value]) => (
                <div key={name} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{name}</p>
                  <p className="mt-2 font-mono text-lg text-white">{value}</p>
                </div>
              ))}
            </div>

            {isClosed && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">P&L %</p>
                  <p className={`mt-2 font-mono text-lg ${pnlTone}`}>{formatPercent(trade.pnl_percent)}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Fees</p>
                  <p className="mt-2 font-mono text-lg text-white">{formatCurrency(trade.fees)}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Position size</p>
                  <p className="mt-2 font-mono text-lg text-white">{formatNumber(trade.position_size, 6)}</p>
                </div>
              </div>
            )}
          </section>

          {isOpen && (
            <section className="rounded-[1.5rem] border border-[#facc15]/20 bg-[#facc15]/[0.04] p-5 sm:p-6">
              {closing ? (
                <form onSubmit={handleClose} className="space-y-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#facc15]">Close trade</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Log the outcome</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Exit price</label>
                      <input type="number" step="any" value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} className={inputClass} placeholder="0.00" required autoFocus />
                    </div>
                    <div>
                      <label className={labelClass}>Fees</label>
                      <input type="number" step="any" value={fees} onChange={(event) => setFees(event.target.value)} className={inputClass} placeholder="0.00" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#00e5a0] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00cc8e] disabled:opacity-50">
                      {saving ? 'Closing...' : 'Confirm Close'}
                    </button>
                    <button type="button" onClick={() => setClosing(false)} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm text-white/50 transition-colors hover:text-white">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#facc15]">Trade is open</p>
                    <p className="mt-2 text-sm text-white/58">Close it here when the outcome is known. PulseWave will recalculate R and P&L from the exit.</p>
                  </div>
                  <button onClick={() => setClosing(true)} className="rounded-xl bg-[#facc15] px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-[#fde047]">
                    Close Trade
                  </button>
                </div>
              )}
            </section>
          )}

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Pre-trade thesis</p>
            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              {trade.pre_thesis ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">{trade.pre_thesis}</p>
              ) : (
                <p className="text-sm text-white/35">No thesis was logged before entry. Edit this trade to add the missing context.</p>
              )}
            </div>
            {trade.notes && (
              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Execution notes</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/66">{trade.notes}</p>
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Post-trade debrief</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">Turn this result into a rule</h2>
              </div>
              <div className="flex gap-2">
                {GRADES.map((gradeOption) => (
                  <button
                    key={gradeOption}
                    type="button"
                    onClick={() => updateReview('grade', review.grade === gradeOption ? '' : gradeOption)}
                    className={`h-10 w-10 rounded-xl border text-xs font-bold transition-all ${review.grade === gradeOption ? GRADE_COLORS[gradeOption] : 'border-white/[0.08] bg-white/[0.025] text-white/35 hover:text-white/70'}`}
                  >
                    {gradeOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className={labelClass}>Emotional state after review</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    onClick={() => updateReview('emotionalState', review.emotionalState === emotion.value ? '' : emotion.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${review.emotionalState === emotion.value ? 'border-white/20 bg-white/[0.08] text-white' : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:text-white/75'}`}
                  >
                    <span>{emotion.emoji}</span><span>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div>
                <label className={labelClass}>What went right?</label>
                <textarea value={review.postRight} onChange={(event) => updateReview('postRight', event.target.value)} className={`${inputClass} min-h-[150px] resize-none leading-6`} placeholder="What did you execute well? What should be repeated?" />
              </div>
              <div>
                <label className={labelClass}>What went wrong?</label>
                <textarea value={review.postWrong} onChange={(event) => updateReview('postWrong', event.target.value)} className={`${inputClass} min-h-[150px] resize-none leading-6`} placeholder="Where did the plan break? Entry, patience, sizing, target, stop, emotion?" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <label className={labelClass}>Lesson / next rule</label>
                <textarea value={review.lesson} onChange={(event) => updateReview('lesson', event.target.value)} className={`${inputClass} min-h-[120px] resize-none leading-6`} placeholder="Example: I only take this setup after the 15m close confirms reclaim; no wick-chasing." />
              </div>
              <div>
                <label className={labelClass}>Exit screenshot URL</label>
                <input value={review.screenshotExit} onChange={(event) => updateReview('screenshotExit', event.target.value)} className={inputClass} placeholder="https://..." />
                <button onClick={handleSaveReview} disabled={saving} className="mt-4 w-full rounded-xl bg-[#00e5a0] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00cc8e] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Debrief'}
                </button>
              </div>
            </div>
          </section>

          {editing && editForm && (
            <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Edit trade plan</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className={labelClass}>Pair</label>
                  <input value={editForm.pair} onChange={(event) => updateEdit('pair', event.target.value.toUpperCase())} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Setup</label>
                  <select value={editForm.setup_type} onChange={(event) => updateEdit('setup_type', event.target.value)} className={inputClass}>
                    <option value="">Select...</option>
                    {SETUP_TYPES.map((setup) => <option key={setup} value={setup}>{label(setup)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Timeframe</label>
                  <select value={editForm.timeframe} onChange={(event) => updateEdit('timeframe', event.target.value)} className={inputClass}>
                    <option value="">Select...</option>
                    {TIMEFRAMES.map((timeframe) => <option key={timeframe} value={timeframe}>{timeframe}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Session</label>
                  <select value={editForm.session} onChange={(event) => updateEdit('session', event.target.value)} className={inputClass}>
                    <option value="">Select...</option>
                    {SESSIONS.map((session) => <option key={session} value={session}>{label(session)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Entry</label>
                  <input type="number" step="any" value={editForm.entry_price} onChange={(event) => updateEdit('entry_price', event.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Stop</label>
                  <input type="number" step="any" value={editForm.stop_loss} onChange={(event) => updateEdit('stop_loss', event.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Target</label>
                  <input type="number" step="any" value={editForm.take_profit} onChange={(event) => updateEdit('take_profit', event.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Risk amount</label>
                  <input type="number" step="any" value={editForm.risk_amount} onChange={(event) => updateEdit('risk_amount', event.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Position size</label>
                  <input type="number" step="any" value={editForm.position_size} onChange={(event) => updateEdit('position_size', event.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <label className={labelClass}>Pre-trade thesis</label>
                  <textarea value={editForm.pre_thesis} onChange={(event) => updateEdit('pre_thesis', event.target.value)} className={`${inputClass} min-h-[130px] resize-none leading-6`} />
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea value={editForm.notes} onChange={(event) => updateEdit('notes', event.target.value)} className={`${inputClass} min-h-[130px] resize-none leading-6`} />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Entry screenshot URL</label>
                <input value={editForm.screenshot_entry} onChange={(event) => updateEdit('screenshot_entry', event.target.value)} className={inputClass} placeholder="https://..." />
              </div>
              <button onClick={handleSaveEdit} disabled={saving} className="mt-5 w-full rounded-xl bg-[#00e5a0] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00cc8e] disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Trade Plan'}
              </button>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Journal Coach</p>
            <div className="mt-5 space-y-3">
              {coachNotes.map((note, index) => (
                <div key={`${index}-${note.title}`} className={`rounded-2xl border p-4 ${note.tone === 'good' ? 'border-[#00e5a0]/18 bg-[#00e5a0]/[0.05]' : note.tone === 'bad' ? 'border-[#ff4976]/18 bg-[#ff4976]/[0.05]' : note.tone === 'warn' ? 'border-[#facc15]/18 bg-[#facc15]/[0.05]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
                  <p className="text-sm font-semibold text-white">{note.title}</p>
                  <p className="mt-2 text-xs leading-5 text-white/48">{note.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Context tags</p>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ['Setup', label(trade.setup_type)],
                ['Timeframe', trade.timeframe || 'Not logged'],
                ['Session', label(trade.session)],
                ['Emotion', `${EMOTIONS.find((emotion) => emotion.value === trade.emotional_state)?.emoji || ''} ${label(trade.emotional_state)}`.trim()],
                ['Confluence', trade.confluence ? `${trade.confluence}/5` : 'Not logged'],
                ['Risk amount', formatCurrency(trade.risk_amount)],
              ].map(([name, value]) => (
                <div key={name} className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-3 last:border-b-0 last:pb-0">
                  <span className="text-white/35">{name}</span>
                  <span className="text-right capitalize text-white/70">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Screenshots</p>
            <div className="mt-5 space-y-3">
              {trade.screenshot_entry && entryShotSafe ? (
                <a href={trade.screenshot_entry} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm text-white/70 transition-colors hover:border-[#00e5a0]/25 hover:text-[#00e5a0]">
                  Open entry screenshot →
                </a>
              ) : trade.screenshot_entry ? (
                <div className="rounded-2xl border border-[#facc15]/18 bg-[#facc15]/[0.05] p-4 text-sm text-[#ffcf7a]">Entry screenshot URL is invalid</div>
              ) : (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm text-white/35">No entry screenshot</div>
              )}
              {trade.screenshot_exit && exitShotSafe ? (
                <a href={trade.screenshot_exit} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm text-white/70 transition-colors hover:border-[#00e5a0]/25 hover:text-[#00e5a0]">
                  Open exit screenshot →
                </a>
              ) : trade.screenshot_exit ? (
                <div className="rounded-2xl border border-[#facc15]/18 bg-[#facc15]/[0.05] p-4 text-sm text-[#ffcf7a]">Exit screenshot URL is invalid</div>
              ) : (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm text-white/35">No exit screenshot</div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
