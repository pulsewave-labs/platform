'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SETUP_TYPES = ['breakout', 'rejection', 'squeeze', 'kijun_bounce', 'range_play', 'trend_follow', 'scalp', 'other']
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']
const EMOTIONS = [
  { value: 'confident', emoji: '😎', label: 'Confident' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'fomo', emoji: '😤', label: 'FOMO' },
  { value: 'revenge', emoji: '👿', label: 'Revenge' },
  { value: 'uncertain', emoji: '🤔', label: 'Uncertain' },
]
const GRADES = ['A', 'B', 'C', 'D', 'F']
const GRADE_COLORS: Record<string, string> = { A: 'border-[#00e5a0]/30 bg-[#00e5a0]/10 text-[#00e5a0]', B: 'border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]', C: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400', D: 'border-orange-400/30 bg-orange-400/10 text-orange-400', F: 'border-[#ff4976]/30 bg-[#ff4976]/10 text-[#ff4976]' }

interface Trade {
  id: string; pair: string; direction: string; entry_price: number; exit_price: number | null
  stop_loss: number | null; take_profit: number | null; position_size: number | null
  pnl: number | null; pnl_percent: number | null; r_multiple: number | null; fees: number
  status: string; source: string; notes: string | null; tags: string[]
  setup_type: string | null; timeframe: string | null; emotional_state: string | null
  pre_thesis: string | null; post_right: string | null; post_wrong: string | null
  lesson: string | null; grade: string | null; confluence: number | null
  screenshot_entry: string | null; screenshot_exit: string | null; session: string | null
  risk_amount: number | null; auto_imported: boolean; signal_id: string | null
  opened_at: string; closed_at: string | null; entry_date?: string; created_at: string
  quantity?: number | null
}

export default function TradeDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState('')

  // Close trade form
  const [exitPrice, setExitPrice] = useState('')
  const [fees, setFees] = useState('')

  // Review fields
  const [postRight, setPostRight] = useState('')
  const [postWrong, setPostWrong] = useState('')
  const [lesson, setLesson] = useState('')
  const [grade, setGrade] = useState('')
  const [emotionalState, setEmotionalState] = useState('')

  // Edit fields
  const [editForm, setEditForm] = useState<Partial<Trade>>({})

  useEffect(() => { fetchTrade() }, [id])

  async function fetchTrade() {
    try {
      const res = await fetch(`/api/journal/${id}`)
      if (!res.ok) throw new Error('Trade not found')
      const data = await res.json()
      const t = data.trade
      setTrade(t)
      setPostRight(t.post_right || '')
      setPostWrong(t.post_wrong || '')
      setLesson(t.lesson || '')
      setGrade(t.grade || '')
      setEmotionalState(t.emotional_state || '')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault()
    if (!exitPrice) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exit_price: parseFloat(exitPrice),
          fees: fees ? parseFloat(fees) : 0,
          status: 'closed',
          closed_at: new Date().toISOString(),
          exit_date: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Failed to close trade')
      setClosing(false)
      fetchTrade()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleSaveReview() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_right: postRight || null,
          post_wrong: postWrong || null,
          lesson: lesson || null,
          grade: grade || null,
          emotional_state: emotionalState || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to save review')
      fetchTrade()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleSaveEdit() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Failed to update')
      setEditing(false)
      fetchTrade()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this trade?')) return
    try {
      await fetch(`/api/journal/${id}`, { method: 'DELETE' })
      router.push('/dashboard/journal')
    } catch {}
  }

  const inputClass = "w-full px-3 py-2.5 text-sm bg-[#0a0a0c] border border-white/[0.06] rounded-lg text-white placeholder:text-[#444] focus:outline-none focus:border-[#00e5a0]/30 transition-colors min-h-[48px] font-mono"
  const labelClass = "block text-[10px] text-[#555] font-mono tracking-wider mb-1"

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#00e5a0] border-t-transparent rounded-full animate-spin" /></div>
  if (!trade) return <div className="text-center py-20 text-[#555]">{error || 'Trade not found'}</div>

  const isOpen = trade.status === 'open'
  const isWin = trade.status === 'closed' && (trade.pnl || 0) > 0
  const isLoss = trade.status === 'closed' && (trade.pnl || 0) < 0
  const dateStr = trade.opened_at || trade.entry_date || trade.created_at

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/journal" className="text-[10px] text-[#555] hover:text-[#999] font-mono tracking-wider transition-colors">
          ← BACK TO JOURNAL
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditing(!editing); setEditForm(trade) }}
            className="px-3 py-1.5 text-[10px] text-[#666] hover:text-white border border-white/[0.06] rounded-md transition-colors">
            {editing ? 'CANCEL' : 'EDIT'}
          </button>
          <button onClick={handleDelete}
            className="px-3 py-1.5 text-[10px] text-[#ff4976]/60 hover:text-[#ff4976] border border-[#ff4976]/10 rounded-md transition-colors">
            DELETE
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg border border-[#ff4976]/20 bg-[#ff4976]/[0.05] text-[#ff4976] text-xs">{error}</div>}

      {/* Trade Header */}
      <div className={`p-5 rounded-lg border ${isWin ? 'border-[#00e5a0]/15 bg-[#00e5a0]/[0.03]' : isLoss ? 'border-[#ff4976]/15 bg-[#ff4976]/[0.03]' : 'border-white/[0.04] bg-[#0a0a0c]'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-[11px] font-bold ${trade.direction === 'LONG' ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'}`}>
              {trade.direction}
            </span>
            <span className="text-lg font-bold text-white">{trade.pair}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${isOpen ? 'bg-yellow-400/10 text-yellow-400' : isWin ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'}`}>
              {trade.status.toUpperCase()}
            </span>
          </div>
          {trade.emotional_state && (
            <span className="text-xl" title={trade.emotional_state}>
              {EMOTIONS.find(e => e.value === trade.emotional_state)?.emoji}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'ENTRY', value: Number(trade.entry_price).toLocaleString() },
            { label: 'EXIT', value: trade.exit_price ? Number(trade.exit_price).toLocaleString() : '—' },
            { label: 'STOP LOSS', value: trade.stop_loss ? Number(trade.stop_loss).toLocaleString() : '—' },
            { label: 'TAKE PROFIT', value: trade.take_profit ? Number(trade.take_profit).toLocaleString() : '—' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] text-[#555] font-mono tracking-wider">{item.label}</p>
              <p className="text-white font-mono mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {trade.status === 'closed' && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.04]">
            <div>
              <p className="text-[10px] text-[#555] font-mono">PNL</p>
              <p className={`text-lg font-bold font-mono ${isWin ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>
                {trade.pnl != null ? `${trade.pnl >= 0 ? '+' : ''}$${Number(trade.pnl).toFixed(2)}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#555] font-mono">PNL %</p>
              <p className={`text-lg font-bold font-mono ${isWin ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>
                {trade.pnl_percent != null ? `${trade.pnl_percent >= 0 ? '+' : ''}${Number(trade.pnl_percent).toFixed(2)}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#555] font-mono">R-MULTIPLE</p>
              <p className={`text-lg font-bold font-mono ${isWin ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>
                {trade.r_multiple != null ? `${trade.r_multiple >= 0 ? '+' : ''}${Number(trade.r_multiple).toFixed(1)}R` : '—'}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/[0.04] text-[11px] text-[#666]">
          {trade.setup_type && <span className="capitalize">Setup: {trade.setup_type.replace('_', ' ')}</span>}
          {trade.timeframe && <span>TF: {trade.timeframe}</span>}
          {trade.session && <span className="capitalize">Session: {trade.session}</span>}
          {trade.confluence && <span>Confluence: {trade.confluence}/5</span>}
          {trade.risk_amount && <span>Risk: ${Number(trade.risk_amount).toFixed(2)}</span>}
          <span>{new Date(dateStr).toLocaleString()}</span>
        </div>
      </div>

      {/* Pre-trade Thesis */}
      {trade.pre_thesis && (
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
          <p className="text-[10px] text-[#555] font-mono tracking-wider mb-2">PRE-TRADE THESIS</p>
          <p className="text-sm text-[#ccc] whitespace-pre-wrap">{trade.pre_thesis}</p>
        </div>
      )}

      {/* Close Trade Form */}
      {isOpen && (
        <div className="p-4 rounded-lg border border-yellow-400/10 bg-yellow-400/[0.02]">
          {closing ? (
            <form onSubmit={handleClose} className="space-y-3">
              <p className="text-[10px] text-[#555] font-mono tracking-wider">CLOSE TRADE</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>EXIT PRICE</label>
                  <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)}
                    className={inputClass} placeholder="0.00" required autoFocus />
                </div>
                <div>
                  <label className={labelClass}>FEES</label>
                  <input type="number" step="any" value={fees} onChange={e => setFees(e.target.value)}
                    className={inputClass} placeholder="0.00" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-xs font-bold text-black bg-[#00e5a0] rounded-lg hover:bg-[#00cc8e] disabled:opacity-50 min-h-[48px]">
                  {saving ? 'Closing...' : 'Confirm Close'}
                </button>
                <button type="button" onClick={() => setClosing(false)}
                  className="px-4 py-2.5 text-xs text-[#666] border border-white/[0.06] rounded-lg hover:text-white min-h-[48px]">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setClosing(true)}
              className="w-full py-2.5 text-xs font-bold text-black bg-yellow-400 rounded-lg hover:bg-yellow-300 min-h-[48px]">
              Close Trade
            </button>
          )}
        </div>
      )}

      {/* Post-Trade Review */}
      <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
        <p className="text-[10px] text-[#555] font-mono tracking-wider">POST-TRADE REVIEW</p>

        <div>
          <label className={labelClass}>GRADE</label>
          <div className="flex gap-2">
            {GRADES.map(g => (
              <button key={g} type="button" onClick={() => setGrade(grade === g ? '' : g)}
                className={`w-10 h-10 rounded-lg text-xs font-bold border transition-all ${
                  grade === g ? GRADE_COLORS[g] : 'border-white/[0.06] bg-white/[0.02] text-[#555]'
                }`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>EMOTIONAL STATE</label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map(e => (
              <button key={e.value} type="button" onClick={() => setEmotionalState(emotionalState === e.value ? '' : e.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
                  emotionalState === e.value ? 'bg-white/[0.08] text-white border border-white/[0.12]' : 'bg-white/[0.02] text-[#666] border border-white/[0.04]'
                }`}>
                <span>{e.emoji}</span><span>{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>WHAT WENT RIGHT</label>
          <textarea value={postRight} onChange={e => setPostRight(e.target.value)}
            className={`${inputClass} min-h-[80px] resize-none`} placeholder="What worked well in this trade?" />
        </div>
        <div>
          <label className={labelClass}>WHAT WENT WRONG</label>
          <textarea value={postWrong} onChange={e => setPostWrong(e.target.value)}
            className={`${inputClass} min-h-[80px] resize-none`} placeholder="What could you improve?" />
        </div>
        <div>
          <label className={labelClass}>LESSON LEARNED</label>
          <textarea value={lesson} onChange={e => setLesson(e.target.value)}
            className={`${inputClass} min-h-[80px] resize-none`} placeholder="Key takeaway from this trade" />
        </div>

        <button onClick={handleSaveReview} disabled={saving}
          className="w-full py-2.5 text-xs font-bold text-black bg-[#00e5a0] rounded-lg hover:bg-[#00cc8e] disabled:opacity-50 min-h-[48px]">
          {saving ? 'Saving...' : 'Save Review'}
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
          <p className="text-[10px] text-[#555] font-mono tracking-wider">EDIT TRADE</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>PAIR</label>
              <input value={editForm.pair || ''} onChange={e => setEditForm(p => ({...p, pair: e.target.value}))}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SETUP TYPE</label>
              <select value={editForm.setup_type || ''} onChange={e => setEditForm(p => ({...p, setup_type: e.target.value}))}
                className={inputClass}>
                <option value="">Select...</option>
                {SETUP_TYPES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>TIMEFRAME</label>
              <select value={editForm.timeframe || ''} onChange={e => setEditForm(p => ({...p, timeframe: e.target.value}))}
                className={inputClass}>
                <option value="">Select...</option>
                {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>SESSION</label>
              <select value={editForm.session || ''} onChange={e => setEditForm(p => ({...p, session: e.target.value}))}
                className={inputClass}>
                <option value="">Select...</option>
                <option value="asian">Asian</option>
                <option value="london">London</option>
                <option value="ny">New York</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>ENTRY PRICE</label>
              <input type="number" step="any" value={editForm.entry_price || ''} onChange={e => setEditForm(p => ({...p, entry_price: parseFloat(e.target.value)}))}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>STOP LOSS</label>
              <input type="number" step="any" value={editForm.stop_loss || ''} onChange={e => setEditForm(p => ({...p, stop_loss: parseFloat(e.target.value)}))}
                className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>NOTES</label>
            <textarea value={editForm.notes || ''} onChange={e => setEditForm(p => ({...p, notes: e.target.value}))}
              className={`${inputClass} min-h-[80px] resize-none`} />
          </div>
          <button onClick={handleSaveEdit} disabled={saving}
            className="w-full py-2.5 text-xs font-bold text-black bg-[#00e5a0] rounded-lg hover:bg-[#00cc8e] disabled:opacity-50 min-h-[48px]">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Notes */}
      {trade.notes && !editing && (
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c]">
          <p className="text-[10px] text-[#555] font-mono tracking-wider mb-2">NOTES</p>
          <p className="text-sm text-[#ccc] whitespace-pre-wrap">{trade.notes}</p>
        </div>
      )}

      {/* Existing Review */}
      {(trade.post_right || trade.post_wrong || trade.lesson) && (
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-3">
          <p className="text-[10px] text-[#555] font-mono tracking-wider">SAVED REVIEW</p>
          {trade.grade && <p className="text-sm"><span className="text-[#555]">Grade:</span> <span className={`font-bold ${GRADE_COLORS[trade.grade]?.split(' ').pop()}`}>{trade.grade}</span></p>}
          {trade.post_right && <div><p className="text-[10px] text-[#555]">Right:</p><p className="text-sm text-[#ccc]">{trade.post_right}</p></div>}
          {trade.post_wrong && <div><p className="text-[10px] text-[#555]">Wrong:</p><p className="text-sm text-[#ccc]">{trade.post_wrong}</p></div>}
          {trade.lesson && <div><p className="text-[10px] text-[#555]">Lesson:</p><p className="text-sm text-[#ccc]">{trade.lesson}</p></div>}
        </div>
      )}
    </div>
  )
}
