'use client'

import { useState, useEffect } from 'react'
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
  direction: string
  entry_price: number
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  pnl: number | null
  pnl_percent: number | null
  r_multiple: number | null
  status: string
  setup_type: string | null
  grade: string | null
  emotional_state: string | null
  session: string | null
  opened_at: string
  closed_at: string | null
  entry_date?: string
  created_at: string
}

export default function JournalClient() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'open'>('all')
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
    } catch (e) {
      console.error('Failed to fetch trades:', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = trades.filter(t => {
    if (filter === 'wins') return t.status === 'closed' && (t.pnl || 0) > 0
    if (filter === 'losses') return t.status === 'closed' && (t.pnl || 0) < 0
    if (filter === 'open') return t.status === 'open'
    return true
  }).filter(t => {
    if (setupFilter && t.setup_type !== setupFilter) return false
    const d = t.opened_at || t.entry_date || t.created_at
    if (dateFrom && d < dateFrom) return false
    if (dateTo && d > dateTo + 'T23:59:59') return false
    return true
  })

  const winCount = trades.filter(t => t.status === 'closed' && (t.pnl || 0) > 0).length
  const lossCount = trades.filter(t => t.status === 'closed' && (t.pnl || 0) < 0).length
  const openCount = trades.filter(t => t.status === 'open').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Trade Journal</h1>
          <p className="text-xs text-[#555] mt-1 font-mono tracking-wider">TRACK · REVIEW · IMPROVE</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/journal/stats"
            className="px-3 py-2 text-xs font-medium text-[#999] hover:text-white border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-all bg-white/[0.02]">
            Stats
          </Link>
          <Link href="/dashboard/journal/insights"
            className="px-3 py-2 text-xs font-medium text-[#999] hover:text-white border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-all bg-white/[0.02]">
            Insights
          </Link>
          <Link href="/dashboard/journal/new"
            className="px-4 py-2 text-xs font-bold text-black bg-[#00e5a0] rounded-lg hover:bg-[#00cc8e] transition-all">
            + New Trade
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: trades.length, color: 'text-white' },
          { label: 'Wins', value: winCount, color: 'text-[#00e5a0]' },
          { label: 'Losses', value: lossCount, color: 'text-[#ff4976]' },
          { label: 'Open', value: openCount, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
            <p className="text-[10px] text-[#555] font-mono tracking-wider">{s.label.toUpperCase()}</p>
            <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'wins', 'losses', 'open'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${filter === f ? 'bg-white/[0.08] text-white' : 'text-[#555] hover:text-[#999]'}`}>
            {f.toUpperCase()}
          </button>
        ))}
        <select value={setupFilter} onChange={e => setSetupFilter(e.target.value)}
          className="px-2 py-1.5 text-[11px] bg-[#0a0a0c] border border-white/[0.06] rounded-md text-[#999] min-h-[32px]">
          <option value="">All Setups</option>
          {SETUP_TYPES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="px-2 py-1.5 text-[11px] bg-[#0a0a0c] border border-white/[0.06] rounded-md text-[#999] min-h-[32px]" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="px-2 py-1.5 text-[11px] bg-[#0a0a0c] border border-white/[0.06] rounded-md text-[#999] min-h-[32px]" />
      </div>

      {/* Trade List */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-14 rounded-lg bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#555] text-sm">No trades found</p>
          <Link href="/dashboard/journal/new" className="text-[#00e5a0] text-xs mt-2 inline-block hover:underline">
            Log your first trade
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] text-[#555] font-mono tracking-wider border-b border-white/[0.04]">
                  <th className="text-left py-2 px-3">DATE</th>
                  <th className="text-left py-2 px-3">PAIR</th>
                  <th className="text-left py-2 px-3">DIR</th>
                  <th className="text-right py-2 px-3">ENTRY</th>
                  <th className="text-right py-2 px-3">EXIT</th>
                  <th className="text-right py-2 px-3">PNL</th>
                  <th className="text-right py-2 px-3">PNL %</th>
                  <th className="text-right py-2 px-3">R</th>
                  <th className="text-left py-2 px-3">SETUP</th>
                  <th className="text-center py-2 px-3">GRADE</th>
                  <th className="text-center py-2 px-3">MOOD</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const isWin = t.status === 'closed' && (t.pnl || 0) > 0
                  const isLoss = t.status === 'closed' && (t.pnl || 0) < 0
                  const rowBg = isWin ? 'bg-[#00e5a0]/[0.02] hover:bg-[#00e5a0]/[0.05]' : isLoss ? 'bg-[#ff4976]/[0.02] hover:bg-[#ff4976]/[0.05]' : 'hover:bg-white/[0.02]'
                  const dateStr = t.opened_at || t.entry_date || t.created_at
                  return (
                    <tr key={t.id} onClick={() => router.push(`/dashboard/journal/${t.id}`)}
                      className={`border-b border-white/[0.03] cursor-pointer transition-colors ${rowBg}`}>
                      <td className="py-2.5 px-3 text-[#999] font-mono">{new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td className="py-2.5 px-3 text-white font-medium">{t.pair}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.direction === 'LONG' ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'}`}>
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#ccc]">{Number(t.entry_price).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#ccc]">{t.exit_price ? Number(t.exit_price).toLocaleString() : '—'}</td>
                      <td className={`py-2.5 px-3 text-right font-mono font-medium ${isWin ? 'text-[#00e5a0]' : isLoss ? 'text-[#ff4976]' : 'text-[#555]'}`}>
                        {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${Number(t.pnl).toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono ${isWin ? 'text-[#00e5a0]' : isLoss ? 'text-[#ff4976]' : 'text-[#555]'}`}>
                        {t.pnl_percent != null ? `${t.pnl_percent >= 0 ? '+' : ''}${Number(t.pnl_percent).toFixed(2)}%` : '—'}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono ${isWin ? 'text-[#00e5a0]' : isLoss ? 'text-[#ff4976]' : 'text-[#555]'}`}>
                        {t.r_multiple != null ? `${t.r_multiple >= 0 ? '+' : ''}${Number(t.r_multiple).toFixed(1)}R` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#999] capitalize">{t.setup_type?.replace('_', ' ') || '—'}</td>
                      <td className={`py-2.5 px-3 text-center font-bold ${GRADE_COLORS[t.grade || ''] || 'text-[#555]'}`}>{t.grade || '—'}</td>
                      <td className="py-2.5 px-3 text-center">{t.emotional_state ? EMOTIONAL_EMOJIS[t.emotional_state] || '' : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map(t => {
              const isWin = t.status === 'closed' && (t.pnl || 0) > 0
              const isLoss = t.status === 'closed' && (t.pnl || 0) < 0
              const dateStr = t.opened_at || t.entry_date || t.created_at
              return (
                <Link key={t.id} href={`/dashboard/journal/${t.id}`}
                  className={`block p-3 rounded-lg border transition-colors ${isWin ? 'border-[#00e5a0]/10 bg-[#00e5a0]/[0.02]' : isLoss ? 'border-[#ff4976]/10 bg-[#ff4976]/[0.02]' : 'border-white/[0.04] bg-[#0a0a0c]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.direction === 'LONG' ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'}`}>
                        {t.direction}
                      </span>
                      <span className="text-white font-medium text-sm">{t.pair}</span>
                      {t.emotional_state && <span>{EMOTIONAL_EMOJIS[t.emotional_state]}</span>}
                    </div>
                    <span className={`font-mono font-bold text-sm ${isWin ? 'text-[#00e5a0]' : isLoss ? 'text-[#ff4976]' : 'text-[#555]'}`}>
                      {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${Number(t.pnl).toFixed(2)}` : t.status === 'open' ? 'OPEN' : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#555] font-mono">
                    <span>{new Date(dateStr).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      {t.r_multiple != null && <span>{t.r_multiple >= 0 ? '+' : ''}{Number(t.r_multiple).toFixed(1)}R</span>}
                      {t.setup_type && <span className="capitalize">{t.setup_type.replace('_', ' ')}</span>}
                      {t.grade && <span className={GRADE_COLORS[t.grade]}>{t.grade}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
