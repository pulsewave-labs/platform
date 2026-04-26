'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  buildDayBreakdown,
  buildJournalOverview,
  cleanLabel,
  countClosedTradesMissingPnl,
  formatMoney,
  formatR,
  formatRoundedPercent,
  getClosedTrades,
  getOpenTrades,
  hasMeaningfulThesis,
  hasReview,
  segmentMetric,
  segmentScore,
  segmentTrades,
  type JournalTrade,
  type Segment,
} from '@/lib/journal-analytics'

type Trade = JournalTrade & {
  id: string
  pair: string
  direction: string
  pnl: number | null
  pnl_percent?: number | null
  r_multiple: number | null
  status: string
  setup_type: string | null
  emotional_state: string | null
  session: string | null
  timeframe?: string | null
  grade?: string | null
  pre_thesis?: string | null
  post_right?: string | null
  post_wrong?: string | null
  lesson?: string | null
  confluence?: number | null
  risk_amount?: number | null
  closed_at: string | null
  created_at: string
}

type Rule = {
  id: string
  rule_text: string
  active: boolean
}

type Leak = {
  id: string
  title: string
  severity: 'critical' | 'warning' | 'watch' | 'edge'
  metric: string
  detail: string
  rule: string
  sampleIds: string[]
}

const SEVERITY_STYLES: Record<Leak['severity'], { label: string; text: string; ring: string; bg: string }> = {
  critical: { label: 'CRITICAL LEAK', text: 'text-[#ff4976]', ring: 'border-[#ff4976]/30', bg: 'bg-[#ff4976]/10' },
  warning: { label: 'RULE CANDIDATE', text: 'text-amber-300', ring: 'border-amber-300/25', bg: 'bg-amber-300/10' },
  watch: { label: 'WATCHLIST', text: 'text-sky-300', ring: 'border-sky-300/25', bg: 'bg-sky-300/10' },
  edge: { label: 'PROTECT EDGE', text: 'text-[#00e5a0]', ring: 'border-[#00e5a0]/25', bg: 'bg-[#00e5a0]/10' },
}

const EMOTION_LABELS: Record<string, string> = {
  confident: 'Confident',
  neutral: 'Neutral',
  uncertain: 'Uncertain',
  fomo: 'FOMO',
  revenge: 'Revenge',
}

const SETUP_LABELS: Record<string, string> = {
  breakout: 'Breakout',
  rejection: 'Rejection',
  pullback: 'Pullback',
  reversal: 'Reversal',
  liquidity_sweep: 'Liquidity sweep',
  continuation: 'Continuation',
}

function makeRuleFromLeak(leak: Leak) {
  return leak.rule.replace(/\s+/g, ' ').trim()
}

export default function InsightsClient() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newRule, setNewRule] = useState('')
  const [savingRule, setSavingRule] = useState(false)
  const [ruleBusyId, setRuleBusyId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [tradesRes, rulesRes] = await Promise.all([
          fetch('/api/journal?limit=1000'),
          fetch('/api/journal/rules'),
        ])

        if (!tradesRes.ok) throw new Error('Could not load journal trades.')
        const tradesData = await tradesRes.json()
        const rulesData = rulesRes.ok ? await rulesRes.json() : { rules: [] }

        if (!active) return
        setTrades(tradesData.trades || [])
        setRules(rulesData.rules || [])
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not load insights.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  const closed = useMemo(() => getClosedTrades(trades), [trades])
  const openTrades = useMemo(() => getOpenTrades(trades).length, [trades])
  const closedMissingPnl = useMemo(() => countClosedTradesMissingPnl(trades), [trades])

  const stats = useMemo(() => {
    const overview = buildJournalOverview(trades)
    return {
      pnl: overview.totalPnl,
      wins: overview.winningTrades.length,
      avgR: overview.avgR ?? 0,
      expectancyR: overview.expectancyR,
      avgPnl: overview.avgPnl,
      winRate: overview.winRate,
      missingThesis: overview.missingThesis,
      graded: trades.filter(t => t.grade).length,
      reviewed: overview.reviewedClosed,
    }
  }, [trades])

  const setupSegments = useMemo(() => segmentTrades(closed, t => t.setup_type, SETUP_LABELS), [closed])
  const emotionSegments = useMemo(() => segmentTrades(closed, t => t.emotional_state, EMOTION_LABELS), [closed])
  const sessionSegments = useMemo(() => segmentTrades(closed, t => t.session), [closed])
  const timeframeSegments = useMemo(() => segmentTrades(closed, t => t.timeframe), [closed])

  const leaks = useMemo<Leak[]>(() => {
    const results: Leak[] = []
    const minSample = closed.length >= 12 ? 3 : 2

    const missingThesisTrades = trades.filter(t => !hasMeaningfulThesis(t))
    if (trades.length >= 3 && missingThesisTrades.length / trades.length >= 0.35) {
      results.push({
        id: 'missing-thesis',
        title: 'Trades are being logged without a real thesis',
        severity: missingThesisTrades.length / trades.length >= 0.6 ? 'critical' : 'warning',
        metric: `${formatRoundedPercent(missingThesisTrades.length / trades.length)} missing thesis`,
        detail: `${missingThesisTrades.length} of ${trades.length} trades do not explain the pre-trade idea clearly enough to review later.`,
        rule: 'No entry without a written thesis: setup, invalidation, target, and why this trade belongs in the playbook.',
        sampleIds: missingThesisTrades.slice(0, 3).map(t => t.id),
      })
    }

    const fomo = emotionSegments.find(s => s.key === 'fomo')
    const revenge = emotionSegments.find(s => s.key === 'revenge')
    ;[fomo, revenge].filter(Boolean).forEach(segment => {
      if (!segment || segment.total < minSample) return
      const score = segmentScore(segment)
      if (score < -0.15 || segment.pnl < 0) {
        results.push({
          id: `emotion-${segment.key}`,
          title: `${segment.label} trades are draining the account`,
          severity: score < -0.5 || segment.pnl < -500 ? 'critical' : 'warning',
          metric: `${segmentMetric(segment)} across ${segment.total}`,
          detail: `${segment.label} entries produced ${formatMoney(segment.pnl)} total P&L with a ${formatRoundedPercent(segment.winRate)} win rate.`,
          rule: `If emotional state is ${segment.label.toLowerCase()}, reduce size or skip until a checklist-confirmed setup appears.`,
          sampleIds: closed.filter(t => t.emotional_state === segment.key).slice(0, 3).map(t => t.id),
        })
      }
    })

    const weakSetup = setupSegments
      .filter(s => s.key !== 'unclassified' && s.total >= minSample && (segmentScore(s) < -0.1 || s.pnl < 0))
      .sort((a, b) => segmentScore(a) - segmentScore(b))[0]
    if (weakSetup) {
      const score = segmentScore(weakSetup)
      results.push({
        id: `setup-${weakSetup.key}`,
        title: `${weakSetup.label} needs tighter rules`,
        severity: score < -0.5 || weakSetup.pnl < -500 ? 'critical' : 'warning',
        metric: segmentMetric(weakSetup),
        detail: `${weakSetup.total} trades, ${formatRoundedPercent(weakSetup.winRate)} win rate, ${formatMoney(weakSetup.pnl)} total P&L.`,
        rule: `Do not take ${weakSetup.label.toLowerCase()} setups unless confluence is 3+ and invalidation is defined before entry.`,
        sampleIds: closed.filter(t => t.setup_type === weakSetup.key).slice(0, 3).map(t => t.id),
      })
    }

    const bestSetup = setupSegments
      .filter(s => s.key !== 'unclassified' && s.total >= minSample && segmentScore(s) > 0.2)
      .sort((a, b) => segmentScore(b) - segmentScore(a))[0]
    if (bestSetup) {
      results.push({
        id: `edge-${bestSetup.key}`,
        title: `${bestSetup.label} is your current edge`,
        severity: 'edge',
        metric: segmentMetric(bestSetup),
        detail: `${bestSetup.total} trades generated ${formatMoney(bestSetup.pnl)} with ${formatRoundedPercent(bestSetup.winRate)} wins. Protect this pattern before adding new ones.`,
        rule: `Prioritize ${bestSetup.label.toLowerCase()} setups and require every non-${bestSetup.label.toLowerCase()} trade to justify why it deserves risk.`,
        sampleIds: closed.filter(t => t.setup_type === bestSetup.key).slice(0, 3).map(t => t.id),
      })
    }

    const unreviewedClosed = closed.filter(t => !(t.post_right && t.post_right.trim()) && !(t.post_wrong && t.post_wrong.trim()) && !(t.lesson && t.lesson.trim()))
    if (closed.length >= 3 && unreviewedClosed.length / closed.length >= 0.4) {
      results.push({
        id: 'missing-review',
        title: 'Closed trades are not being converted into lessons',
        severity: 'watch',
        metric: `${formatRoundedPercent(unreviewedClosed.length / closed.length)} unreviewed`,
        detail: `${unreviewedClosed.length} closed trades have no post-trade lesson, right/wrong note, or rule update.`,
        rule: 'Every closed trade gets a 3-line debrief: what worked, what failed, and the next rule to follow.',
        sampleIds: unreviewedClosed.slice(0, 3).map(t => t.id),
      })
    }

    const sessionLeak = sessionSegments
      .filter(s => s.key !== 'unclassified' && s.total >= minSample && segmentScore(s) < -0.1)
      .sort((a, b) => segmentScore(a) - segmentScore(b))[0]
    if (sessionLeak) {
      results.push({
        id: `session-${sessionLeak.key}`,
        title: `${sessionLeak.label} session is underperforming`,
        severity: 'watch',
        metric: segmentMetric(sessionLeak),
        detail: `${sessionLeak.total} ${sessionLeak.label} trades generated ${formatMoney(sessionLeak.pnl)} total P&L.`,
        rule: `Trade ${sessionLeak.label.toLowerCase()} only with reduced size until expectancy turns positive over the next 10 closed trades.`,
        sampleIds: closed.filter(t => t.session === sessionLeak.key).slice(0, 3).map(t => t.id),
      })
    }

    if (!results.length && closed.length >= 3) {
      results.push({
        id: 'baseline',
        title: 'No dominant leak yet — keep collecting clean samples',
        severity: (stats.expectancyR ?? stats.avgPnl) >= 0 ? 'edge' : 'watch',
        metric: stats.expectancyR !== null ? `${formatR(stats.expectancyR)} expectancy` : `${formatMoney(stats.avgPnl)}/trade`,
        detail: `The journal has ${closed.length} closed trades. The next unlock is more consistent thesis, setup, and debrief data.`,
        rule: 'For the next 10 trades, capture the same fields every time: setup, emotion, thesis, invalidation, and lesson.',
        sampleIds: closed.slice(0, 3).map(t => t.id),
      })
    }

    return results.slice(0, 6)
  }, [closed, emotionSegments, sessionSegments, setupSegments, stats.avgPnl, stats.expectancyR, trades])

  const dayBreakdown = useMemo(() => buildDayBreakdown(closed), [closed])

  const coachNotes = useMemo(() => {
    if (closed.length < 3) return ['Close at least three trades to unlock meaningful leak detection.']
    const notes: string[] = []
    const expectancyValue = stats.expectancyR ?? stats.avgPnl
    const expectancyLabel = stats.expectancyR !== null ? formatR(stats.expectancyR) : `${formatMoney(stats.avgPnl)}/trade`
    if (expectancyValue > 0) notes.push(`Expectancy is positive at ${expectancyLabel}. The job now is to protect the setups creating it.`)
    else notes.push(`Expectancy is negative at ${expectancyLabel}. Reduce new risk until the largest leak has a written rule.`)
    const critical = leaks.filter(leak => leak.severity === 'critical')
    if (critical.length) notes.push(`${critical.length} critical leak${critical.length === 1 ? '' : 's'} detected. Convert the top one into a rule before the next session.`)
    if (stats.reviewed < closed.length) notes.push(`${closed.length - stats.reviewed} closed trade${closed.length - stats.reviewed === 1 ? '' : 's'} still need a debrief.`)
    if (closedMissingPnl) notes.push(`${closedMissingPnl} closed trade${closedMissingPnl === 1 ? '' : 's'} missing P&L are excluded from expectancy.`)
    if (openTrades) notes.push(`${openTrades} open trade${openTrades === 1 ? '' : 's'} should be closed or reviewed before analyzing final expectancy.`)
    return notes.slice(0, 4)
  }, [closed.length, closedMissingPnl, leaks, openTrades, stats.avgPnl, stats.expectancyR, stats.reviewed])

  async function addRule(ruleText = newRule) {
    const text = ruleText.trim()
    if (!text) return
    setSavingRule(true)
    setError('')
    try {
      const res = await fetch('/api/journal/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_text: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save rule.')
      setRules(prev => [...prev, data.rule])
      if (text === newRule.trim()) setNewRule('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save rule.')
    } finally {
      setSavingRule(false)
    }
  }

  async function toggleRule(rule: Rule) {
    setRuleBusyId(rule.id)
    setError('')
    try {
      const res = await fetch('/api/journal/rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, active: !rule.active }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not update rule.')
      setRules(prev => prev.map(item => item.id === rule.id ? data.rule : item))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update rule.')
    } finally {
      setRuleBusyId(null)
    }
  }

  async function deleteRule(id: string) {
    setRuleBusyId(id)
    setError('')
    try {
      const res = await fetch('/api/journal/rules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not delete rule.')
      setRules(prev => prev.filter(rule => rule.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete rule.')
    } finally {
      setRuleBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/[0.06] bg-[#08080a]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#00e5a0] border-t-transparent" />
      </div>
    )
  }

  const activeRules = rules.filter(rule => rule.active).length

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#050507] p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,229,160,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,73,118,0.08),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/dashboard/journal" className="font-mono text-[10px] tracking-[0.3em] text-white/35 transition-colors hover:text-[#00e5a0]">← JOURNAL</Link>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.34em] text-[#00e5a0]">Leak detection engine</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.03em] text-white md:text-5xl">Turn repeated mistakes into rules.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
              PulseWave scans your closed trades for setup, emotion, session, and review-quality patterns. The output is not vanity stats — it is a rule queue for the next trading session.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <Metric label="Closed" value={String(closed.length)} tone="neutral" />
            <Metric label="Win rate" value={formatRoundedPercent(stats.winRate)} tone={stats.winRate >= 0.5 ? 'good' : stats.winRate === 0 ? 'neutral' : 'bad'} />
            <Metric label="Expectancy" value={stats.expectancyR !== null ? formatR(stats.expectancyR) : `${formatMoney(stats.avgPnl)}/trade`} tone={(stats.expectancyR ?? stats.avgPnl) > 0 ? 'good' : (stats.expectancyR ?? stats.avgPnl) < 0 ? 'bad' : 'neutral'} />
            <Metric label="Rules active" value={String(activeRules)} tone={activeRules ? 'good' : 'neutral'} />
          </div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-[#ff4976]/25 bg-[#ff4976]/10 px-4 py-3 text-sm text-[#ff8aa4]">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Priority leaks</p>
                <h2 className="mt-2 text-xl font-bold text-white">What to fix first</h2>
              </div>
              <Link href="/dashboard/journal/new" className="rounded-full border border-[#00e5a0]/25 bg-[#00e5a0]/10 px-4 py-2 text-xs font-bold text-[#00e5a0] transition-colors hover:bg-[#00e5a0]/15">Log next sample</Link>
            </div>

            {closed.length < 3 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-8 text-center">
                <p className="text-lg font-semibold text-white">Need a few more closed trades.</p>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">Three closed trades unlock the first layer of pattern detection. Ten to twenty creates a much cleaner read on setups, sessions, and emotional leaks.</p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {leaks.map(leak => (
                  <LeakCard key={leak.id} leak={leak} savingRule={savingRule} onMakeRule={() => addRule(makeRuleFromLeak(leak))} />
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Breakdown title="Setup expectancy" subtitle="Which playbooks deserve risk" segments={setupSegments} />
            <Breakdown title="Emotion expectancy" subtitle="When your state changes your edge" segments={emotionSegments} />
            <Breakdown title="Session expectancy" subtitle="Where your timing helps or hurts" segments={sessionSegments} />
            <Breakdown title="Timeframe expectancy" subtitle="The charts producing cleaner outcomes" segments={timeframeSegments} />
          </section>

          <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Weekly rhythm</p>
                <h2 className="mt-2 text-xl font-bold text-white">Day-of-week P&L</h2>
              </div>
              <span className="rounded-full border border-white/[0.07] px-3 py-1 font-mono text-[10px] text-white/35">CLOSED TRADES</span>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-7">
              {dayBreakdown.map(day => (
                <div key={day.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="font-mono text-[10px] text-white/35">{day.label}</p>
                  <p className={`mt-2 text-sm font-bold ${day.pnl > 0 ? 'text-[#00e5a0]' : day.pnl < 0 ? 'text-[#ff4976]' : 'text-white/45'}`}>{formatMoney(day.pnl)}</p>
                  <p className="mt-1 text-[11px] text-white/35">{day.total} trade{day.total === 1 ? '' : 's'}</p>
                  <p className="mt-1 text-[11px] text-white/35">{day.rCount ? formatR(day.avgR) : 'No R data'}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#00e5a0]/15 bg-[#00e5a0]/[0.05] p-5 md:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00e5a0]">Journal Coach</p>
            <h2 className="mt-2 text-xl font-bold text-white">Current read</h2>
            <div className="mt-5 space-y-3">
              {coachNotes.map((note, index) => (
                <div key={`${index}-${note}`} className="rounded-2xl border border-white/[0.06] bg-black/20 p-3 text-sm leading-6 text-white/60">
                  {note}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Trading rules</p>
                <h2 className="mt-2 text-xl font-bold text-white">Rule book</h2>
              </div>
              <span className="text-xs text-white/35">{rules.length} total</span>
            </div>

            <div className="mt-5 space-y-2">
              {rules.length ? rules.map(rule => (
                <div key={rule.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-start gap-3">
                    <button type="button" disabled={ruleBusyId === rule.id} onClick={() => toggleRule(rule)} className={`mt-0.5 h-5 w-5 rounded border text-[10px] ${rule.active ? 'border-[#00e5a0]/50 bg-[#00e5a0]/15 text-[#00e5a0]' : 'border-white/[0.12] text-white/25'}`}>
                      {rule.active ? '✓' : ''}
                    </button>
                    <p className={`flex-1 text-sm leading-6 ${rule.active ? 'text-white/70' : 'text-white/30 line-through'}`}>{rule.rule_text}</p>
                    <button type="button" disabled={ruleBusyId === rule.id} onClick={() => deleteRule(rule.id)} className="text-xs text-white/25 transition-colors hover:text-[#ff4976]">×</button>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5 text-center text-sm text-white/40">No rules yet. Promote a detected leak into a rule.</div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={newRule}
                onChange={event => setNewRule(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && addRule()}
                className="min-h-[48px] flex-1 rounded-2xl border border-white/[0.08] bg-black/25 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#00e5a0]/35"
                placeholder="Add a rule for your next session..."
              />
              <button type="button" onClick={() => addRule()} disabled={savingRule || !newRule.trim()} className="min-h-[48px] rounded-2xl bg-[#00e5a0] px-5 text-xs font-black text-black transition-colors hover:bg-[#00cc8e] disabled:cursor-not-allowed disabled:opacity-50">Add</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'good' | 'bad' | 'neutral' }) {
  const color = tone === 'good' ? 'text-[#00e5a0]' : tone === 'bad' ? 'text-[#ff4976]' : 'text-white'
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-4 backdrop-blur">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">{label}</p>
      <p className={`mt-2 text-xl font-black ${color}`}>{value}</p>
    </div>
  )
}

function LeakCard({ leak, savingRule, onMakeRule }: { leak: Leak; savingRule: boolean; onMakeRule: () => void }) {
  const style = SEVERITY_STYLES[leak.severity]
  return (
    <div className={`rounded-3xl border ${style.ring} ${style.bg} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`font-mono text-[10px] uppercase tracking-[0.24em] ${style.text}`}>{style.label}</p>
          <h3 className="mt-2 text-lg font-bold text-white">{leak.title}</h3>
        </div>
        <span className={`rounded-full border ${style.ring} px-3 py-1 text-xs font-bold ${style.text}`}>{leak.metric}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/55">{leak.detail}</p>
      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/20 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">Suggested rule</p>
        <p className="mt-2 text-sm leading-6 text-white/70">{leak.rule}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {leak.sampleIds.map((id, index) => (
            <Link key={`${id}-${index}`} href={`/dashboard/journal/${id}`} className="rounded-full border border-white/[0.07] px-3 py-1 text-[11px] text-white/40 transition-colors hover:border-[#00e5a0]/30 hover:text-[#00e5a0]">Sample {index + 1}</Link>
          ))}
        </div>
        <button type="button" disabled={savingRule} onClick={onMakeRule} className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition-opacity hover:opacity-90 disabled:opacity-50">Make rule</button>
      </div>
    </div>
  )
}

function Breakdown({ title, subtitle, segments }: { title: string; subtitle: string; segments: Segment[] }) {
  const visible = segments.filter(segment => segment.total > 0).slice(0, 5)
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-[#08080a] p-5 md:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">{subtitle}</p>
      <h2 className="mt-2 text-xl font-bold text-white">{title}</h2>
      <div className="mt-5 space-y-3">
        {visible.length ? visible.map(segment => (
          <div key={segment.key} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{segment.label}</p>
                <p className="mt-1 text-xs text-white/35">{segment.total} trade{segment.total === 1 ? '' : 's'} · {formatRoundedPercent(segment.winRate)} WR</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${segmentScore(segment) > 0 ? 'text-[#00e5a0]' : segmentScore(segment) < 0 ? 'text-[#ff4976]' : 'text-white/45'}`}>{segmentMetric(segment)}</p>
                <p className={`mt-1 text-xs ${segment.pnl > 0 ? 'text-[#00e5a0]' : segment.pnl < 0 ? 'text-[#ff4976]' : 'text-white/35'}`}>{formatMoney(segment.pnl)}</p>
              </div>
            </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full ${segmentScore(segment) >= 0 ? 'bg-[#00e5a0]' : 'bg-[#ff4976]'}`} style={{ width: `${Math.max(8, Math.min(100, Math.abs(segmentScore(segment)) * (segment.rCount ? 45 : 0.18) + 12))}%` }} />
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5 text-center text-sm text-white/40">No closed trades in this category yet.</div>
        )}
      </div>
    </section>
  )
}
