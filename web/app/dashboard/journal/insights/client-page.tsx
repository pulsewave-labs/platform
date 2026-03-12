'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface Trade {
  id: string; pair: string; direction: string; pnl: number | null; r_multiple: number | null
  status: string; setup_type: string | null; emotional_state: string | null; session: string | null
  closed_at: string | null; created_at: string
}

interface Rule {
  id: string; rule_text: string; active: boolean
}

const EMOTIONAL_EMOJIS: Record<string, string> = { confident: '😎', neutral: '😐', fomo: '😤', revenge: '👿', uncertain: '🤔' }
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const INSIGHT_ICONS: Record<string, string> = {
  setup: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  emotion: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  session: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  day: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  r: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  streak: 'M13 10V3L4 14h7v7l9-11h-7z',
}

export default function InsightsClient() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [newRule, setNewRule] = useState('')
  const [savingRule, setSavingRule] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/journal?limit=1000').then(r => r.json()),
      fetch('/api/journal/rules').then(r => r.json()).catch(() => ({ rules: [] })),
    ]).then(([tradesData, rulesData]) => {
      setTrades(tradesData.trades || [])
      setRules(rulesData.rules || [])
    }).finally(() => setLoading(false))
  }, [])

  const closed = useMemo(() => trades.filter(t => t.status === 'closed' && t.pnl != null), [trades])
  const wins = useMemo(() => closed.filter(t => (t.pnl || 0) > 0), [closed])

  const insights = useMemo(() => {
    if (closed.length < 3) return []
    const results: { icon: string; title: string; detail: string; color: string }[] = []

    // Best setup
    const setupMap: Record<string, { wins: number; total: number }> = {}
    closed.forEach(t => {
      const s = t.setup_type || 'unknown'
      if (!setupMap[s]) setupMap[s] = { wins: 0, total: 0 }
      setupMap[s].total++
      if ((t.pnl || 0) > 0) setupMap[s].wins++
    })
    const bestSetup = Object.entries(setupMap)
      .filter(([, d]) => d.total >= 2)
      .sort(([, a], [, b]) => (b.wins / b.total) - (a.wins / a.total))[0]
    if (bestSetup && bestSetup[0] !== 'unknown') {
      const wr = Math.round(bestSetup[1].wins / bestSetup[1].total * 100)
      results.push({ icon: 'setup', title: `Your best setup: ${bestSetup[0].replace('_', ' ')}`, detail: `${wr}% win rate across ${bestSetup[1].total} trades`, color: 'text-[#00e5a0]' })
    }

    // Emotional comparison
    const emotionMap: Record<string, { wins: number; total: number }> = {}
    closed.forEach(t => {
      const e = t.emotional_state
      if (!e) return
      if (!emotionMap[e]) emotionMap[e] = { wins: 0, total: 0 }
      emotionMap[e].total++
      if ((t.pnl || 0) > 0) emotionMap[e].wins++
    })
    if (emotionMap.fomo && emotionMap.confident) {
      const fomoWr = Math.round(emotionMap.fomo.wins / emotionMap.fomo.total * 100)
      const confWr = Math.round(emotionMap.confident.wins / emotionMap.confident.total * 100)
      results.push({ icon: 'emotion', title: `FOMO trades: ${fomoWr}% win rate vs ${confWr}% when confident`, detail: `${emotionMap.fomo.total} FOMO trades, ${emotionMap.confident.total} confident trades`, color: fomoWr < confWr ? 'text-[#ff4976]' : 'text-yellow-400' })
    }

    // Best session
    const sessionMap: Record<string, { wins: number; total: number }> = {}
    closed.forEach(t => {
      const s = t.session
      if (!s) return
      if (!sessionMap[s]) sessionMap[s] = { wins: 0, total: 0 }
      sessionMap[s].total++
      if ((t.pnl || 0) > 0) sessionMap[s].wins++
    })
    const bestSession = Object.entries(sessionMap)
      .filter(([, d]) => d.total >= 2)
      .sort(([, a], [, b]) => (b.wins / b.total) - (a.wins / a.total))[0]
    if (bestSession) {
      const wr = Math.round(bestSession[1].wins / bestSession[1].total * 100)
      results.push({ icon: 'session', title: `You trade best during ${bestSession[0]} session`, detail: `${wr}% win rate across ${bestSession[1].total} trades`, color: 'text-[#00e5a0]' })
    }

    // Worst day
    const dayMap: number[] = [0,0,0,0,0,0,0]
    const dayCounts: number[] = [0,0,0,0,0,0,0]
    closed.forEach(t => {
      const day = new Date(t.closed_at || t.created_at).getDay()
      dayMap[day] += t.pnl || 0
      dayCounts[day]++
    })
    const worstDay = dayMap.reduce((mi, v, i, a) => v < a[mi] ? i : mi, 0)
    if (dayCounts[worstDay] >= 2) {
      results.push({ icon: 'day', title: `Your worst day is ${DAYS[worstDay]}`, detail: `$${dayMap[worstDay].toFixed(2)} total P&L across ${dayCounts[worstDay]} trades`, color: 'text-[#ff4976]' })
    }

    // Avg winner vs loser R
    const winRs = wins.filter(t => t.r_multiple != null).map(t => t.r_multiple || 0)
    const lossRs = closed.filter(t => (t.pnl || 0) < 0 && t.r_multiple != null).map(t => t.r_multiple || 0)
    if (winRs.length > 0 && lossRs.length > 0) {
      const avgWinR = (winRs.reduce((s, r) => s + r, 0) / winRs.length).toFixed(1)
      const avgLossR = (Math.abs(lossRs.reduce((s, r) => s + r, 0) / lossRs.length)).toFixed(1)
      results.push({ icon: 'r', title: `Average winner: ${avgWinR}R, average loser: ${avgLossR}R`, detail: `Risk/reward across ${winRs.length} wins and ${lossRs.length} losses`, color: 'text-white' })
    }

    return results
  }, [closed, wins])

  async function addRule() {
    if (!newRule.trim()) return
    setSavingRule(true)
    try {
      const res = await fetch('/api/journal/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_text: newRule.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setRules(prev => [...prev, data.rule])
        setNewRule('')
      }
    } catch {}
    setSavingRule(false)
  }

  async function deleteRule(id: string) {
    try {
      await fetch('/api/journal/rules', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setRules(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#00e5a0] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/journal" className="text-[10px] text-[#555] hover:text-[#999] font-mono tracking-wider">← JOURNAL</Link>
          <h1 className="text-xl font-bold text-white mt-2">Insights</h1>
        </div>
      </div>

      {/* Pattern Insights */}
      {insights.length === 0 ? (
        <div className="text-center py-16 text-[#555] text-sm">
          Need at least 3 closed trades to generate insights.
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={insight.color}>
                  <path d={INSIGHT_ICONS[insight.icon]} />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${insight.color}`}>{insight.title}</p>
                <p className="text-xs text-[#555] mt-0.5">{insight.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trading Rules */}
      <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
        <p className="text-[10px] text-[#555] font-mono tracking-wider">TRADING RULES</p>

        {rules.length > 0 && (
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                <span className={`text-sm ${rule.active ? 'text-[#ccc]' : 'text-[#555] line-through'}`}>{rule.rule_text}</span>
                <button onClick={() => deleteRule(rule.id)}
                  className="text-[10px] text-[#555] hover:text-[#ff4976] transition-colors ml-3 flex-shrink-0">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input value={newRule} onChange={e => setNewRule(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addRule()}
            className="flex-1 px-3 py-2.5 text-sm bg-[#08080a] border border-white/[0.06] rounded-lg text-white placeholder:text-[#444] focus:outline-none focus:border-[#00e5a0]/30 min-h-[48px]"
            placeholder="Add a trading rule..." />
          <button onClick={addRule} disabled={savingRule || !newRule.trim()}
            className="px-4 py-2.5 text-xs font-bold text-black bg-[#00e5a0] rounded-lg hover:bg-[#00cc8e] disabled:opacity-50 min-h-[48px]">
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
