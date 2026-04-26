'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SETUP_TYPES = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'rejection', label: 'Rejection' },
  { value: 'squeeze', label: 'Squeeze' },
  { value: 'kijun_bounce', label: 'Kijun Bounce' },
  { value: 'range_play', label: 'Range Play' },
  { value: 'trend_follow', label: 'Trend Follow' },
  { value: 'scalp', label: 'Scalp' },
  { value: 'other', label: 'Other' },
]

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']

const EMOTIONS = [
  { value: 'confident', emoji: '😎', label: 'Confident' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'fomo', emoji: '😤', label: 'FOMO' },
  { value: 'revenge', emoji: '👿', label: 'Revenge' },
  { value: 'uncertain', emoji: '🤔', label: 'Uncertain' },
]

function detectSession(): string {
  const utcHour = new Date().getUTCHours()
  if (utcHour >= 0 && utcHour < 8) return 'asian'
  if (utcHour >= 8 && utcHour < 13) return 'london'
  return 'ny'
}

export default function NewTradeClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    pair: 'BTC/USDT',
    direction: 'LONG' as 'LONG' | 'SHORT',
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
    session: detectSession(),
  })

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const body: any = {
        pair: form.pair,
        direction: form.direction,
        entry_price: parseFloat(form.entry_price),
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
        take_profit: form.take_profit ? parseFloat(form.take_profit) : null,
        position_size: form.position_size ? parseFloat(form.position_size) : null,
        risk_amount: form.risk_amount ? parseFloat(form.risk_amount) : null,
        setup_type: form.setup_type || null,
        timeframe: form.timeframe || null,
        confluence: form.confluence,
        emotional_state: form.emotional_state || null,
        pre_thesis: form.pre_thesis || null,
        signal_id: null,
        session: form.session,
        status: 'open',
        source: 'manual',
        entry_date: new Date().toISOString(),
      }

      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to create trade')
      }

      const data = await res.json()
      router.push(`/dashboard/journal/${data.trade.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 text-sm bg-[#0a0a0c] border border-white/[0.06] rounded-lg text-white placeholder:text-[#444] focus:outline-none focus:border-[#00e5a0]/30 transition-colors min-h-[48px] font-mono"
  const labelClass = "block text-[11px] text-[#666] font-medium tracking-wider mb-1.5"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/journal" className="text-[10px] text-[#555] hover:text-[#999] font-mono tracking-wider transition-colors">
            ← BACK TO JOURNAL
          </Link>
          <h1 className="text-xl font-bold text-white mt-2">New Trade</h1>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-[#ff4976]/20 bg-[#ff4976]/[0.05] text-[#ff4976] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pair + Direction */}
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>PAIR</label>
              <input value={form.pair} onChange={e => update('pair', e.target.value.toUpperCase())}
                className={inputClass} placeholder="BTC/USDT" required />
            </div>
            <div>
              <label className={labelClass}>DIRECTION</label>
              <div className="flex gap-2">
                {(['LONG', 'SHORT'] as const).map(d => (
                  <button key={d} type="button" onClick={() => update('direction', d)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[48px] ${
                      form.direction === d
                        ? d === 'LONG' ? 'bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30' : 'bg-[#ff4976]/15 text-[#ff4976] border border-[#ff4976]/30'
                        : 'bg-white/[0.02] text-[#555] border border-white/[0.06] hover:text-[#999]'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>ENTRY PRICE</label>
              <input type="number" step="any" value={form.entry_price} onChange={e => update('entry_price', e.target.value)}
                className={inputClass} placeholder="0.00" required />
            </div>
            <div>
              <label className={labelClass}>STOP LOSS</label>
              <input type="number" step="any" value={form.stop_loss} onChange={e => update('stop_loss', e.target.value)}
                className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>TAKE PROFIT</label>
              <input type="number" step="any" value={form.take_profit} onChange={e => update('take_profit', e.target.value)}
                className={inputClass} placeholder="0.00" />
            </div>
            <div>
              <label className={labelClass}>SIZE</label>
              <input type="number" step="any" value={form.position_size} onChange={e => update('position_size', e.target.value)}
                className={inputClass} placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className={labelClass}>RISK AMOUNT ($)</label>
            <input type="number" step="any" value={form.risk_amount} onChange={e => update('risk_amount', e.target.value)}
              className={inputClass} placeholder="100.00" />
          </div>
        </div>

        {/* Setup Details */}
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
          <p className="text-[10px] text-[#555] font-mono tracking-wider">SETUP DETAILS</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>SETUP TYPE</label>
              <select value={form.setup_type} onChange={e => update('setup_type', e.target.value)}
                className={inputClass}>
                <option value="">Select...</option>
                {SETUP_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>TIMEFRAME</label>
              <select value={form.timeframe} onChange={e => update('timeframe', e.target.value)}
                className={inputClass}>
                <option value="">Select...</option>
                {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>SESSION</label>
              <select value={form.session} onChange={e => update('session', e.target.value)}
                className={inputClass}>
                <option value="asian">Asian</option>
                <option value="london">London</option>
                <option value="ny">New York</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>CONFLUENCE (1-5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => update('confluence', n)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                    form.confluence >= n ? 'bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/20' : 'bg-white/[0.02] text-[#555] border border-white/[0.06]'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emotional State */}
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
          <p className="text-[10px] text-[#555] font-mono tracking-wider">MENTAL STATE</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map(e => (
              <button key={e.value} type="button" onClick={() => update('emotional_state', form.emotional_state === e.value ? '' : e.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all min-h-[48px] ${
                  form.emotional_state === e.value
                    ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                    : 'bg-white/[0.02] text-[#666] border border-white/[0.04] hover:text-[#999]'
                }`}>
                <span className="text-base">{e.emoji}</span>
                <span>{e.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pre-trade Thesis */}
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-3">
          <p className="text-[10px] text-[#555] font-mono tracking-wider">PRE-TRADE THESIS</p>
          <textarea value={form.pre_thesis} onChange={e => update('pre_thesis', e.target.value)}
            className={`${inputClass} min-h-[100px] resize-none`}
            placeholder="Why are you taking this trade? What's your thesis?" />
        </div>

        {/* Submit */}
        <button type="submit" disabled={saving || !form.entry_price}
          className="w-full py-3 text-sm font-bold text-black bg-[#00e5a0] rounded-lg hover:bg-[#00cc8e] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px]">
          {saving ? 'Saving...' : 'Log Trade'}
        </button>
      </form>
    </div>
  )
}
