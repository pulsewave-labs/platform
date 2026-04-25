'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SETUP_TYPES = [
  { value: 'breakout', label: 'Breakout', hint: 'Expansion through a major level' },
  { value: 'rejection', label: 'Rejection', hint: 'Failed auction / wick rejection' },
  { value: 'squeeze', label: 'Squeeze', hint: 'Compression before expansion' },
  { value: 'kijun_bounce', label: 'Kijun Bounce', hint: 'Trend continuation from mean' },
  { value: 'range_play', label: 'Range Play', hint: 'Support/resistance rotation' },
  { value: 'trend_follow', label: 'Trend Follow', hint: 'Continuation with structure' },
  { value: 'scalp', label: 'Scalp', hint: 'Fast execution / tactical trade' },
  { value: 'other', label: 'Other', hint: 'Custom discretionary setup' },
]

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']

const EMOTIONS = [
  { value: 'confident', emoji: '😎', label: 'Confident', tone: 'Clean conviction' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', tone: 'Process-first' },
  { value: 'uncertain', emoji: '🤔', label: 'Uncertain', tone: 'Needs smaller risk' },
  { value: 'fomo', emoji: '😤', label: 'FOMO', tone: 'Chasing risk' },
  { value: 'revenge', emoji: '👿', label: 'Revenge', tone: 'Red flag' },
]

const SESSION_OPTIONS = [
  { value: 'asian', label: 'Asian', detail: '00:00–08:00 UTC' },
  { value: 'london', label: 'London', detail: '08:00–13:00 UTC' },
  { value: 'ny', label: 'New York', detail: '13:00–00:00 UTC' },
]

const CHECKLIST_ITEMS = [
  'HTF level or structure is clear',
  'Invalidation is obvious before entry',
  'Reward justifies the risk',
  'Entry is not emotional or late',
  'Trade matches one of my repeatable setups',
]

type Direction = 'LONG' | 'SHORT'

type FormState = {
  pair: string
  direction: Direction
  entry_price: string
  stop_loss: string
  take_profit: string
  position_size: string
  risk_amount: string
  setup_type: string
  timeframe: string
  confluence: number
  emotional_state: string
  pre_thesis: string
  notes: string
  screenshot_entry: string
  signal_id: string
  session: string
}

interface Signal {
  id: string
  pair: string
  direction: string
  entry_price: number
  status: string
  created_at: string
}

function detectSession(): string {
  const utcHour = new Date().getUTCHours()
  if (utcHour >= 0 && utcHour < 8) return 'asian'
  if (utcHour >= 8 && utcHour < 13) return 'london'
  return 'ny'
}

function parseStrictNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function toNumber(value: string) {
  return parseStrictNumber(value)
}

function isSafeOptionalUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true

  try {
    const url = new URL(trimmed)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function formatCurrency(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

function formatRatio(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(2)}R`
}

function calculatePlan(form: FormState) {
  const entry = toNumber(form.entry_price)
  const stop = toNumber(form.stop_loss)
  const target = toNumber(form.take_profit)
  const size = toNumber(form.position_size)
  const manualRisk = toNumber(form.risk_amount)

  const riskPerUnit = entry !== null && stop !== null ? Math.abs(entry - stop) : null
  const rewardPerUnit = entry !== null && target !== null
    ? form.direction === 'LONG'
      ? target - entry
      : entry - target
    : null
  const estimatedRisk = riskPerUnit !== null && size !== null ? riskPerUnit * size : manualRisk
  const estimatedReward = rewardPerUnit !== null && size !== null ? rewardPerUnit * size : null
  const plannedR = riskPerUnit !== null && riskPerUnit > 0 && rewardPerUnit !== null ? rewardPerUnit / riskPerUnit : null

  return { entry, stop, target, size, manualRisk, riskPerUnit, rewardPerUnit, estimatedRisk, estimatedReward, plannedR }
}

function getReadiness(form: FormState, checkedCount: number) {
  let score = 0
  const notes: string[] = []

  if (form.pair.trim()) score += 1
  if (form.entry_price) score += 1
  if (form.stop_loss) score += 1
  if (form.take_profit) score += 1
  if (form.setup_type) score += 1
  if (form.timeframe) score += 1
  if (form.emotional_state) score += 1
  if (form.pre_thesis.trim().length >= 40) score += 2
  else if (form.pre_thesis.trim().length > 0) score += 1
  if (checkedCount >= 4) score += 2
  else if (checkedCount >= 2) score += 1
  if (form.confluence >= 4) score += 1

  if (!form.stop_loss) notes.push('No stop logged')
  if (!form.take_profit) notes.push('No target logged')
  if (!form.pre_thesis.trim()) notes.push('No thesis')
  if (['fomo', 'revenge'].includes(form.emotional_state)) notes.push('Emotion risk')

  const percentage = Math.min(100, Math.round((score / 12) * 100))
  const label = percentage >= 80 ? 'Trade is coach-ready' : percentage >= 55 ? 'Good draft, tighten details' : 'Incomplete plan'
  return { percentage, label, notes }
}

function getPlanWarnings(form: FormState, plan: ReturnType<typeof calculatePlan>) {
  const warnings: string[] = []

  if (form.entry_price && plan.entry === null) warnings.push('Entry must be a valid number')
  if (form.stop_loss && plan.stop === null) warnings.push('Stop must be a valid number')
  if (form.take_profit && plan.target === null) warnings.push('Target must be a valid number')
  if (form.position_size && plan.size === null) warnings.push('Position size must be a valid number')
  if (form.risk_amount && plan.manualRisk === null) warnings.push('Risk amount must be a valid number')
  if (plan.entry !== null && plan.entry <= 0) warnings.push('Entry must be above zero')
  if (plan.stop !== null && plan.stop <= 0) warnings.push('Stop must be above zero')
  if (plan.target !== null && plan.target <= 0) warnings.push('Target must be above zero')
  if (plan.size !== null && plan.size <= 0) warnings.push('Position size must be above zero')
  if (plan.manualRisk !== null && plan.manualRisk <= 0) warnings.push('Risk amount must be above zero')
  if (plan.entry !== null && plan.stop !== null && plan.entry === plan.stop) warnings.push('Stop cannot equal entry')
  if (form.direction === 'LONG' && plan.entry !== null && plan.target !== null && plan.target <= plan.entry) warnings.push('Long target should be above entry')
  if (form.direction === 'SHORT' && plan.entry !== null && plan.target !== null && plan.target >= plan.entry) warnings.push('Short target should be below entry')
  if (form.direction === 'LONG' && plan.entry !== null && plan.stop !== null && plan.stop >= plan.entry) warnings.push('Long stop should be below entry')
  if (form.direction === 'SHORT' && plan.entry !== null && plan.stop !== null && plan.stop <= plan.entry) warnings.push('Short stop should be above entry')
  if (!isSafeOptionalUrl(form.screenshot_entry)) warnings.push('Screenshot URL must start with http:// or https://')

  return warnings
}

export default function NewTradeClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [signals, setSignals] = useState<Signal[]>([])
  const [error, setError] = useState('')
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const [form, setForm] = useState<FormState>({
    pair: 'BTC/USDT',
    direction: 'LONG',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    position_size: '',
    risk_amount: '',
    setup_type: '',
    timeframe: '',
    confluence: 3,
    emotional_state: '',
    pre_thesis: '',
    notes: '',
    screenshot_entry: '',
    signal_id: '',
    session: detectSession(),
  })

  useEffect(() => {
    fetch('/api/signals')
      .then((response) => response.json())
      .then((data) => {
        const active = (data.signals || data || []).filter((signal: Signal) => signal.status === 'active')
        setSignals(active)
      })
      .catch(() => {})
  }, [])

  const plan = useMemo(() => calculatePlan(form), [form])
  const readiness = useMemo(() => getReadiness(form, checkedItems.length), [form, checkedItems.length])
  const planWarnings = useMemo(() => getPlanWarnings(form, plan), [form, plan])
  const selectedSetup = SETUP_TYPES.find((setup) => setup.value === form.setup_type)
  const selectedEmotion = EMOTIONS.find((emotion) => emotion.value === form.emotional_state)

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function toggleChecklist(item: string) {
    setCheckedItems((previous) => previous.includes(item)
      ? previous.filter((entry) => entry !== item)
      : [...previous, item]
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!form.entry_price.trim()) {
      setError('Entry price is required before PulseWave can log the trade.')
      return
    }

    if (form.pre_thesis.trim().length < 20) {
      setError('Add a real pre-trade thesis first. Future you needs more than a ticker and a price.')
      return
    }

    if (planWarnings.length > 0) {
      setError(`Fix the trade plan first: ${planWarnings[0]}.`)
      return
    }

    setSaving(true)

    try {
      const body = {
        pair: form.pair,
        direction: form.direction,
        entry_price: Number(form.entry_price),
        stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
        take_profit: form.take_profit ? Number(form.take_profit) : null,
        position_size: form.position_size ? Number(form.position_size) : null,
        risk_amount: form.risk_amount ? Number(form.risk_amount) : null,
        setup_type: form.setup_type || null,
        timeframe: form.timeframe || null,
        confluence: form.confluence,
        emotional_state: form.emotional_state || null,
        pre_thesis: form.pre_thesis || null,
        notes: form.notes || null,
        screenshot_entry: form.screenshot_entry || null,
        signal_id: form.signal_id || null,
        session: form.session,
        status: 'open',
        source: form.signal_id ? 'signal' : 'manual',
        entry_date: new Date().toISOString(),
      }

      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create trade')
      }

      const data = await response.json()
      router.push(`/dashboard/journal/${data.trade.id}`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to create trade')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full min-h-[48px] rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/22 outline-none transition-colors focus:border-[#00e5a0]/45 focus:bg-[#06110d]'
  const labelClass = 'mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38'

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(0,229,160,0.16),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Link href="/dashboard/journal" className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 transition-colors hover:text-[#00e5a0]">
              ← Back to journal command center
            </Link>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#00e5a0]">New trade intake</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
              Log the trade before the lesson disappears.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
              Capture thesis, invalidation, emotion, and execution context up front so the Journal Coach has clean data to find leaks later.
            </p>
          </div>

          <div className="min-w-[240px] rounded-2xl border border-[#00e5a0]/20 bg-[#00e5a0]/[0.06] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00e5a0]/70">Readiness</p>
                <p className="mt-2 text-2xl font-semibold text-white">{readiness.percentage}%</p>
              </div>
              <div className="h-16 w-16 rounded-full border border-[#00e5a0]/30 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-black/45 font-mono text-xs text-[#00e5a0]">
                  {checkedItems.length}/{CHECKLIST_ITEMS.length}
                </div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-[#00e5a0] transition-all" style={{ width: `${readiness.percentage}%` }} />
            </div>
            <p className="mt-3 text-xs font-medium text-white/70">{readiness.label}</p>
            {readiness.notes.length > 0 && (
              <p className="mt-2 text-[11px] text-white/38">Flags: {readiness.notes.join(' · ')}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#ff4976]/25 bg-[#ff4976]/[0.07] p-4 text-sm text-[#ff8ca8]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">01 / Market + risk</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">Define the trade</h2>
              </div>
              <div className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${form.direction === 'LONG' ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'}`}>
                {form.direction}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Pair</label>
                <input value={form.pair} onChange={(event) => update('pair', event.target.value.toUpperCase())} className={inputClass} placeholder="BTC/USDT" required />
              </div>
              <div>
                <label className={labelClass}>Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['LONG', 'SHORT'] as const).map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => update('direction', direction)}
                      className={`min-h-[48px] rounded-xl border text-xs font-bold transition-all ${
                        form.direction === direction
                          ? direction === 'LONG'
                            ? 'border-[#00e5a0]/35 bg-[#00e5a0]/15 text-[#00e5a0]'
                            : 'border-[#ff4976]/35 bg-[#ff4976]/15 text-[#ff4976]'
                          : 'border-white/[0.08] bg-white/[0.025] text-white/42 hover:text-white/70'
                      }`}
                    >
                      {direction}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className={labelClass}>Entry price</label>
                <input type="number" step="any" value={form.entry_price} onChange={(event) => update('entry_price', event.target.value)} className={inputClass} placeholder="0.00" required />
              </div>
              <div>
                <label className={labelClass}>Stop loss</label>
                <input type="number" step="any" value={form.stop_loss} onChange={(event) => update('stop_loss', event.target.value)} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>Take profit</label>
                <input type="number" step="any" value={form.take_profit} onChange={(event) => update('take_profit', event.target.value)} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>Position size</label>
                <input type="number" step="any" value={form.position_size} onChange={(event) => update('position_size', event.target.value)} className={inputClass} placeholder="0.00" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Risk amount</label>
                <input type="number" step="any" value={form.risk_amount} onChange={(event) => update('risk_amount', event.target.value)} className={inputClass} placeholder="100.00" />
              </div>
              <div>
                <label className={labelClass}>Entry screenshot URL</label>
                <input value={form.screenshot_entry} onChange={(event) => update('screenshot_entry', event.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">02 / Setup context</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">Tell the coach what pattern this is</h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {SETUP_TYPES.map((setup) => (
                <button
                  key={setup.value}
                  type="button"
                  onClick={() => update('setup_type', setup.value)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    form.setup_type === setup.value
                      ? 'border-[#00e5a0]/35 bg-[#00e5a0]/[0.08] text-white'
                      : 'border-white/[0.07] bg-white/[0.02] text-white/55 hover:border-white/[0.14] hover:text-white/80'
                  }`}
                >
                  <p className="text-sm font-semibold">{setup.label}</p>
                  <p className="mt-2 text-xs leading-5 text-white/38">{setup.hint}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Timeframe</label>
                <select value={form.timeframe} onChange={(event) => update('timeframe', event.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {TIMEFRAMES.map((timeframe) => <option key={timeframe} value={timeframe}>{timeframe}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Session</label>
                <select value={form.session} onChange={(event) => update('session', event.target.value)} className={inputClass}>
                  {SESSION_OPTIONS.map((session) => <option key={session.value} value={session.value}>{session.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Confluence</label>
                <div className="flex min-h-[48px] items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update('confluence', value)}
                      className={`h-10 flex-1 rounded-xl border text-xs font-bold transition-all ${
                        form.confluence >= value
                          ? 'border-[#00e5a0]/25 bg-[#00e5a0]/15 text-[#00e5a0]'
                          : 'border-white/[0.07] bg-white/[0.025] text-white/35'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">03 / Mindset + thesis</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">Log why this trade deserves capital</h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-5">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.value}
                  type="button"
                  onClick={() => update('emotional_state', form.emotional_state === emotion.value ? '' : emotion.value)}
                  className={`rounded-2xl border p-3 text-left transition-all ${
                    form.emotional_state === emotion.value
                      ? 'border-white/20 bg-white/[0.08] text-white'
                      : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:text-white/75'
                  }`}
                >
                  <span className="text-xl">{emotion.emoji}</span>
                  <p className="mt-2 text-xs font-semibold">{emotion.label}</p>
                  <p className="mt-1 text-[11px] text-white/35">{emotion.tone}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div>
                <label className={labelClass}>Pre-trade thesis</label>
                <textarea
                  value={form.pre_thesis}
                  onChange={(event) => update('pre_thesis', event.target.value)}
                  className={`${inputClass} min-h-[190px] resize-none leading-6`}
                  placeholder="Example: BTC is reclaiming prior 4H support with volume. Invalidation is below the wick low. If acceptance fails, I exit instead of averaging down."
                />
              </div>
              <div>
                <label className={labelClass}>Execution notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => update('notes', event.target.value)}
                  className={`${inputClass} min-h-[190px] resize-none leading-6`}
                  placeholder="Optional: entry trigger, news context, liquidity sweep, exact rule being tested, or what would make you skip."
                />
              </div>
            </div>
          </section>

          {signals.length > 0 && (
            <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Optional signal link</p>
              <select value={form.signal_id} onChange={(event) => update('signal_id', event.target.value)} className={`${inputClass} mt-4`}>
                <option value="">Manual trade / no signal</option>
                {signals.map((signal) => (
                  <option key={signal.id} value={signal.id}>
                    {signal.pair} {signal.direction} @ {signal.entry_price} — {new Date(signal.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Plan preview</p>
            <div className="mt-5 space-y-3">
              {[
                ['Risk / unit', plan.riskPerUnit === null ? '—' : plan.riskPerUnit.toLocaleString()],
                ['Reward / unit', plan.rewardPerUnit === null ? '—' : plan.rewardPerUnit.toLocaleString()],
                ['Planned R', formatRatio(plan.plannedR)],
                ['Est. risk', formatCurrency(plan.estimatedRisk)],
                ['Est. reward', formatCurrency(plan.estimatedReward)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
                  <span className="text-xs text-white/42">{label}</span>
                  <span className="font-mono text-sm text-white">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-white/38">
              Planned R is estimated from entry, stop, and target. It becomes useful once you close the trade and compare plan vs. execution.
            </p>
            {planWarnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-[#ffb020]/20 bg-[#ffb020]/[0.06] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ffcf7a]">Plan warnings</p>
                <ul className="mt-2 space-y-1 text-xs text-[#ffcf7a]/85">
                  {planWarnings.slice(0, 3).map((warning, index) => (
                    <li key={`${index}-${warning}`}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Pre-flight checklist</p>
            <div className="mt-5 space-y-2">
              {CHECKLIST_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleChecklist(item)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs transition-all ${
                    checkedItems.includes(item)
                      ? 'border-[#00e5a0]/25 bg-[#00e5a0]/[0.08] text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/48 hover:text-white/75'
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${checkedItems.includes(item) ? 'border-[#00e5a0] text-[#00e5a0]' : 'border-white/15 text-transparent'}`}>✓</span>
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/[0.08] bg-[#08090b] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Coach context</p>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-white/35">Setup</p>
                <p className="mt-1 text-white">{selectedSetup?.label || 'Not selected'}</p>
              </div>
              <div>
                <p className="text-white/35">Emotion</p>
                <p className="mt-1 text-white">{selectedEmotion ? `${selectedEmotion.emoji} ${selectedEmotion.label}` : 'Not logged'}</p>
              </div>
              <div>
                <p className="text-white/35">Session</p>
                <p className="mt-1 text-white">{SESSION_OPTIONS.find((session) => session.value === form.session)?.label || 'Unknown'}</p>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving || !form.entry_price}
            className="w-full rounded-2xl bg-[#00e5a0] px-5 py-4 text-sm font-bold text-black shadow-lg shadow-[#00e5a0]/10 transition-all hover:bg-[#00cc8e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving trade...' : 'Log Trade'}
          </button>
        </aside>
      </form>
    </div>
  )
}
