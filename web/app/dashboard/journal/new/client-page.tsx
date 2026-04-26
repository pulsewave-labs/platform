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
const COMMON_PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT', 'SUI/USDT', 'LINK/USDT', 'AVAX/USDT', 'ADA/USDT', 'BNB/USDT']

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

function parsePositiveNumber(value: string, label: string, required = false): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    if (required) throw new Error(`${label} is required`)
    return null
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive number`)
  }
  return parsed
}

function formatLivePrice(price: number): string {
  if (price >= 1000) return price.toFixed(2)
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.01) return price.toFixed(6)
  return price.toPrecision(8).replace(/0+$/, '').replace(/\.$/, '')
}

export default function NewTradeClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [error, setError] = useState('')
  const [priceStatus, setPriceStatus] = useState('')

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

  async function fetchLivePrice() {
    setError('')
    setPriceStatus('')
    setFetchingPrice(true)

    try {
      const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(form.pair)}`)
      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.price) {
        throw new Error(data?.message || 'Could not fetch a live price for that ticker')
      }

      const entry = formatLivePrice(Number(data.price))
      setForm(prev => ({ ...prev, pair: data.pair || prev.pair, entry_price: entry }))
      setPriceStatus(`Live ${data.pair || form.pair}: $${entry} · ${data.meta?.source || 'market'}`)
    } catch (e: any) {
      setError(e.message || 'Could not fetch live price')
    } finally {
      setFetchingPrice(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const entryPrice = parsePositiveNumber(form.entry_price, 'Entry price', true)
      const stopLoss = parsePositiveNumber(form.stop_loss, 'Stop loss')
      const takeProfit = parsePositiveNumber(form.take_profit, 'Take profit')
      const positionSize = parsePositiveNumber(form.position_size, 'Size')
      const riskAmount = parsePositiveNumber(form.risk_amount, 'Risk amount')

      if (stopLoss && stopLoss === entryPrice) {
        throw new Error('Stop loss cannot equal entry price')
      }

      const body: any = {
        pair: form.pair.trim().toUpperCase(),
        direction: form.direction,
        entry_price: entryPrice,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        position_size: positionSize,
        risk_amount: riskAmount,
        setup_type: form.setup_type || null,
        timeframe: form.timeframe || null,
        confluence: form.confluence,
        emotional_state: form.emotional_state || null,
        pre_thesis: form.pre_thesis.trim() || null,
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

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to create trade')
      }

      if (!data?.trade?.id) {
        throw new Error('Trade saved, but the app did not receive a trade ID')
      }

      router.push(`/dashboard/journal/${data.trade.id}`)
    } catch (e: any) {
      setError(e.message || 'Failed to create trade')
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
          <p className="text-xs text-[#666] mt-1">Select a ticker, pull live entry, add your plan, then log.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-[#ff4976]/20 bg-[#ff4976]/[0.05] text-[#ff4976] text-xs">
          {error}
        </div>
      )}

      {priceStatus && (
        <div className="p-3 rounded-lg border border-[#00e5a0]/20 bg-[#00e5a0]/[0.05] text-[#00e5a0] text-xs font-mono">
          {priceStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className={labelClass}>TICKER / PAIR</label>
              <input list="pair-options" value={form.pair} onChange={e => update('pair', e.target.value.toUpperCase())}
                className={inputClass} placeholder="BTC, BTCUSDT, or BTC/USDT" required />
              <datalist id="pair-options">
                {COMMON_PAIRS.map(pair => <option key={pair} value={pair} />)}
              </datalist>
            </div>
            <button type="button" onClick={fetchLivePrice} disabled={fetchingPrice || !form.pair.trim()}
              className="min-h-[48px] px-4 rounded-lg bg-[#00e5a0]/10 border border-[#00e5a0]/25 text-[#00e5a0] text-xs font-bold hover:bg-[#00e5a0]/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {fetchingPrice ? 'Pulling...' : 'Use Live Price'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className={labelClass}>ENTRY PRICE</label>
              <input type="number" step="any" value={form.entry_price} onChange={e => update('entry_price', e.target.value)}
                className={inputClass} placeholder="Pull live or type" required />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>STOP LOSS</label>
              <input type="number" step="any" value={form.stop_loss} onChange={e => update('stop_loss', e.target.value)}
                className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className={labelClass}>TAKE PROFIT</label>
              <input type="number" step="any" value={form.take_profit} onChange={e => update('take_profit', e.target.value)}
                className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className={labelClass}>SIZE</label>
              <input type="number" step="any" value={form.position_size} onChange={e => update('position_size', e.target.value)}
                className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className={labelClass}>RISK ($)</label>
              <input type="number" step="any" value={form.risk_amount} onChange={e => update('risk_amount', e.target.value)}
                className={inputClass} placeholder="Optional" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-4">
          <p className="text-[10px] text-[#555] font-mono tracking-wider">SETUP DETAILS</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>SETUP TYPE</label>
              <select value={form.setup_type} onChange={e => update('setup_type', e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {SETUP_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>TIMEFRAME</label>
              <select value={form.timeframe} onChange={e => update('timeframe', e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>SESSION</label>
              <select value={form.session} onChange={e => update('session', e.target.value)} className={inputClass}>
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

        <div className="p-4 rounded-lg border border-white/[0.04] bg-[#0a0a0c] space-y-3">
          <p className="text-[10px] text-[#555] font-mono tracking-wider">PRE-TRADE THESIS</p>
          <textarea value={form.pre_thesis} onChange={e => update('pre_thesis', e.target.value)}
            className={`${inputClass} min-h-[100px] resize-none`}
            placeholder="Why are you taking this trade? What's your thesis?" />
        </div>

        <button type="submit" disabled={saving || !form.entry_price.trim() || fetchingPrice}
          className="w-full py-3 text-sm font-bold text-black bg-[#00e5a0] rounded-lg hover:bg-[#00cc8e] disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px]">
          {saving ? 'Saving...' : 'Log Trade'}
        </button>
      </form>
    </div>
  )
}
