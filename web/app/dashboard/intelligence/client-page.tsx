'use client'

import { useEffect, useState, useCallback } from 'react'

type Signal = { score: number; confidence: number; reason: string }
type Patterns = {
  matches: number; message?: string
  outcomes?: {
    h4: OutcomeSet; h24: OutcomeSet; h72: OutcomeSet
  }
  topMatches?: Array<{
    ts: string; price: number; composite: number; bias: string
    fearGreed: number | null; lsRatio: number | null
    change4h: number | null; change24h: number | null; change72h: number | null
    similarity: number
  }>
}
type OutcomeSet = {
  count: number; avgChange: number | null; medianChange: number | null
  bullRate: number | null; best: string | null; worst: string | null
  distribution?: { strongRally: number; rally: number; chop: number; dip: number; crash: number }
}
type Snapshot = {
  timestamp: number; price: number; sourcesOk: number; sourcesTotal: number
  composite: number; bias: string; confidence: number
  signals: Record<string, Signal>
  data: any
}

// ── Helpers ──────────────────────────────────────────
const bull = '#00e5a0', bear = '#ff4976', neutral = '#5c6370', warn = '#e5c07b', purple = '#c678dd', cyan = '#56b6c2'
function sc(val: number) { return val > 0 ? bull : val < 0 ? bear : neutral }
function fmt(n: number | null | undefined) { return n != null ? n.toLocaleString('en-US') : '—' }
function fmtK(n: number) { return n >= 1e12 ? (n/1e12).toFixed(1)+'T' : n >= 1e9 ? (n/1e9).toFixed(1)+'B' : n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : fmt(n) }
function ts(t: number) { return new Date(t).toLocaleTimeString('en-US', { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' }) }
function ago(t: number) { const s = Math.floor((Date.now() - t)/1000); return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s/60)}m ago` : `${Math.floor(s/3600)}h ago` }

export default function IntelligenceDashboard() {
  const [data, setData] = useState<Snapshot | null>(null)
  const [patterns, setPatterns] = useState<Patterns | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPatterns = useCallback(async (snap: Snapshot) => {
    try {
      const params = new URLSearchParams({
        composite: String(snap.composite),
        bias: snap.bias,
        ...(snap.data.fearGreed ? { fearGreed: String(snap.data.fearGreed.value) } : {}),
        ...(snap.data.lsRatio ? { lsRatio: String(snap.data.lsRatio.ratio) } : {}),
      })
      const res = await fetch(`/api/intelligence/patterns?${params}`)
      if (res.ok) setPatterns(await res.json())
    } catch {}
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/intelligence')
      if (!res.ok) throw new Error('Failed to fetch')
      const snap = await res.json()
      setData(snap)
      setError('')
      loadPatterns(snap)
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }, [loadPatterns])

  useEffect(() => { load(); const i = setInterval(load, 15 * 60 * 1000); return () => clearInterval(i) }, [load])

  if (!data && loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00e5a0]/30 border-t-[#00e5a0] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[11px] mono text-white/30 tracking-widest">AGGREGATING 29 DATA SOURCES</p>
      </div>
    </div>
  )
  if (error && !data) return <div className="text-center text-red-400 py-20 mono text-sm">{error}</div>

  const d = data!
  const biasColor = d.composite >= 20 ? bull : d.composite >= 5 ? '#4ade80' : d.composite <= -20 ? bear : d.composite <= -5 ? '#f87171' : warn

  return (
    <div className="mono space-y-4">

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="flex items-end gap-6">
          <div>
            <span className="text-[10px] text-white/20 tracking-[0.2em] block mb-0.5">BTC / USDT PERP</span>
            <span className="text-3xl font-bold tracking-tight" style={{ color: d.composite >= 0 ? bull : bear }}>
              ${d.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-1 pb-1">
            <span className="text-xl font-bold" style={{ color: biasColor }}>{d.bias}</span>
            <span className="text-[10px] text-white/20 ml-1">{d.confidence}% conf</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pb-1">
          <span className="text-[10px] text-white/15">{d.sourcesOk}/{d.sourcesTotal} sources · {ago(d.timestamp)}</span>
          <button onClick={load} disabled={loading}
            className="text-[10px] px-3 py-1.5 border border-white/[0.06] rounded text-white/30 hover:text-white/60 hover:border-white/[0.12] transition-all disabled:opacity-20">
            {loading ? '···' : '↻ REFRESH'}
          </button>
        </div>
      </div>

      {/* ═══ COMPOSITE GAUGE ═══ */}
      <div className="relative h-8 rounded bg-white/[0.02] overflow-hidden border border-white/[0.04]">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(to right, #ff4976, #ff4976 20%, #e5c07b 40%, #5c6370 50%, #e5c07b 60%, #00e5a0 80%, #00e5a0)' }} />
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
        {/* Score marker */}
        <div className="absolute top-0 bottom-0 flex items-center transition-all duration-700" style={{ left: `${(d.composite + 100) / 2}%` }}>
          <div className="w-1 h-full rounded" style={{ background: biasColor, boxShadow: `0 0 12px ${biasColor}` }} />
        </div>
        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-[8px] text-white/20">STRONG BEAR</span>
          <span className="text-sm font-bold" style={{ color: biasColor }}>{d.composite > 0 ? '+' : ''}{d.composite}</span>
          <span className="text-[8px] text-white/20">STRONG BULL</span>
        </div>
      </div>

      {/* ═══ QUICK STATS ROW ═══ */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        <QuickStat label="FUNDING" value={d.data.funding ? `${(d.data.funding.rate * 100).toFixed(4)}%` : '—'} color={sc(-(d.data.funding?.rate || 0))} sub={d.data.fundingDiff ? `Δ ${(d.data.fundingDiff.diff * 100).toFixed(4)}%` : undefined} />
        <QuickStat label="OI (24H)" value={d.data.oi ? `${d.data.oi.delta24h > 0 ? '+' : ''}${d.data.oi.delta24h}%` : '—'} color={sc(d.data.oi?.delta24h || 0)} sub={d.data.oi ? fmtK(d.data.oi.current) + ' BTC' : undefined} />
        <QuickStat label="L/S RATIO" value={d.data.lsRatio?.ratio?.toFixed(2) || '—'} color={d.data.lsRatio?.ratio > 1.5 ? bear : d.data.lsRatio?.ratio < 0.7 ? bull : warn} sub={d.data.lsRatio ? `${d.data.lsRatio.longPct}L / ${d.data.lsRatio.shortPct}S` : undefined} />
        <QuickStat label="TAKER B/S" value={d.data.taker?.ratio?.toFixed(2) || '—'} color={sc((d.data.taker?.ratio || 1) - 1)} sub={d.data.taker?.ratio > 1 ? 'buyers aggressive' : 'sellers aggressive'} />
        <QuickStat label="CVD" value={d.data.cvd?.cvd?.toFixed(0) || '—'} color={sc(d.data.cvd?.cvd || 0)} sub={d.data.cvd?.trend?.replace('_', ' ')} alert={d.data.cvd?.divergence} />
        <QuickStat label="F&G INDEX" value={d.data.fearGreed ? `${d.data.fearGreed.value}` : '—'} color={d.data.fearGreed?.value <= 25 ? bear : d.data.fearGreed?.value >= 75 ? bull : warn} sub={d.data.fearGreed?.label} />
        <QuickStat label="P/C RATIO" value={d.data.options?.pcRatio?.toFixed(2) || '—'} color={d.data.options?.pcRatio > 0.7 ? bear : bull} sub={d.data.options ? `Pain: $${fmtK(d.data.options.maxPain)}` : undefined} />
        <QuickStat label="CME BASIS" value={d.data.cme ? `${d.data.cme.basis > 0 ? '+' : ''}${d.data.cme.basis}%` : '—'} color={sc(d.data.cme?.basis || 0)} sub={d.data.cme?.basisLabel?.split(' ')[0]} />
        <QuickStat label="STABLES" value={d.data.stablecoins ? `${d.data.stablecoins.totalChange > 0 ? '+' : ''}${d.data.stablecoins.totalChange}%` : '—'} color={sc(d.data.stablecoins?.totalChange || 0)} sub={d.data.stablecoins?.signal?.split(' ')[0]} />
      </div>

      {/* ═══ SIGNAL GRID ═══ */}
      <Section title="SIGNAL BREAKDOWN">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
          {Object.entries(d.signals).map(([k, s]) => (
            <SignalBar key={k} name={k} score={s.score} confidence={s.confidence} reason={s.reason} />
          ))}
        </div>
      </Section>

      {/* ═══ MAIN GRID — 3 columns ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Column 1: Order Flow */}
        <div className="space-y-3">
          <Card title="ORDER BOOK" sub="Binance Futures · Top 5">
            {d.data.orderbook && <>
              <div className="space-y-px">
                {[...d.data.orderbook.asks].reverse().map((a: any, i: number) => (
                  <OBRow key={'a'+i} price={a.price} qty={a.qty} total={a.value} side="ask"
                    maxVal={Math.max(...[...d.data.orderbook.asks, ...d.data.orderbook.bids].map((l: any) => l.value))} />
                ))}
              </div>
              <div className="text-center text-[10px] py-1.5 my-1 border-y border-white/[0.04]">
                <span className="text-white/20">SPREAD </span>
                <span style={{ color: cyan }}>${d.data.orderbook.spread.toFixed(1)}</span>
                <span className="text-white/20 ml-3">IMBALANCE </span>
                <span style={{ color: sc(d.data.orderbook.imbalance) }}>{d.data.orderbook.imbalance > 0 ? '+' : ''}{d.data.orderbook.imbalance.toFixed(1)}%</span>
              </div>
              <div className="space-y-px">
                {d.data.orderbook.bids.map((b: any, i: number) => (
                  <OBRow key={'b'+i} price={b.price} qty={b.qty} total={b.value} side="bid"
                    maxVal={Math.max(...[...d.data.orderbook.asks, ...d.data.orderbook.bids].map((l: any) => l.value))} />
                ))}
              </div>
            </>}
          </Card>

          <Card title="CVD" sub="4H Cumulative Volume Delta">
            {d.data.cvd && <>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl font-bold" style={{ color: sc(d.data.cvd.cvd) }}>{d.data.cvd.cvd > 0 ? '+' : ''}{d.data.cvd.cvd.toFixed(1)}</span>
                <Pill text={d.data.cvd.trend.replace('_', ' ')} bull={d.data.cvd.cvd > 0} />
                {d.data.cvd.divergence && <Pill text={`⚠ ${d.data.cvd.divergenceType.replace('_', ' ')}`} color={warn} />}
              </div>
              <div className="flex items-end gap-[1px] h-[48px]">
                {(d.data.cvd.series || []).map((s: any, i: number) => {
                  const maxAbs = Math.max(...d.data.cvd.series.map((x: any) => Math.abs(x.delta)), 0.01)
                  return <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                    height: `${Math.max(Math.abs(s.delta) / maxAbs * 44, 1)}px`,
                    background: s.delta >= 0 ? bull : bear, opacity: 0.5 + (i / d.data.cvd.series.length * 0.5)
                  }} />
                })}
              </div>
            </>}
          </Card>

          <Card title="LARGE TRADES" sub="≥1 BTC · Binance Futures">
            {d.data.largeTrades && <>
              <div className="flex gap-4 mb-3">
                <MiniStat label="NET DELTA" value={`${d.data.largeTrades.netDelta > 0 ? '+' : ''}${d.data.largeTrades.netDelta.toFixed(1)} BTC`} color={sc(d.data.largeTrades.netDelta)} />
                <MiniStat label="LARGE" value={d.data.largeTrades.count} />
                <MiniStat label="WHALE (≥5)" value={d.data.largeTrades.whaleCount} color={purple} />
                <MiniStat label="% OF VOL" value={`${d.data.largeTrades.pctOfTotal}%`} />
              </div>
              <div className="max-h-[180px] overflow-y-auto scrollbar-none space-y-px">
                {(d.data.largeTrades.recent || []).slice(0, 8).map((t: any, i: number) => (
                  <div key={i} className={`flex items-center gap-2 py-1 px-1.5 text-[10px] rounded ${t.whale ? 'bg-[#c678dd]/[0.06]' : ''}`}>
                    <span className="text-white/15 w-[44px]">{ts(t.time)}</span>
                    <span className="w-[28px] font-bold" style={{ color: t.side === 'BUY' ? bull : bear }}>{t.side}</span>
                    <span className="text-white/40 flex-1">${t.price.toLocaleString()}</span>
                    <span className="font-semibold text-white/70">{t.qty.toFixed(3)}</span>
                    <span className="text-white/20 w-[52px] text-right">${fmtK(t.value)}</span>
                  </div>
                ))}
              </div>
            </>}
          </Card>
        </div>

        {/* Column 2: Positioning & Structure */}
        <div className="space-y-3">
          <Card title="VOLUME PROFILE" sub="$100 Buckets · 4H">
            {d.data.volumeProfile && <>
              <div className="flex gap-3 mb-3 text-[10px]">
                <span className="text-white/20">POC: <b className="text-[#e5c07b]">${fmt(d.data.volumeProfile.poc.price)}</b></span>
                <span className="text-white/20">VA: <b className="text-white/40">${fmt(d.data.volumeProfile.valueAreaLow)} – ${fmt(d.data.volumeProfile.valueAreaHigh)}</b></span>
                <Pill text={d.data.volumeProfile.priceVsVA.replace('_', ' ')} bull={d.data.volumeProfile.priceVsVA === 'above_VA'} />
              </div>
              <div className="space-y-[2px]">
                {[...d.data.volumeProfile.topBuckets].sort((a: any, b: any) => b.price - a.price).map((b: any) => {
                  const maxVol = Math.max(...d.data.volumeProfile.topBuckets.map((x: any) => x.vol))
                  const isPOC = b.price === d.data.volumeProfile.poc.price
                  const pct = b.vol / maxVol
                  return (
                    <div key={b.price} className={`flex items-center gap-2 ${isPOC ? 'bg-[#e5c07b]/[0.04] rounded px-1 -mx-1' : ''}`}>
                      <span className={`w-[58px] text-[10px] text-right ${isPOC ? 'text-[#e5c07b] font-bold' : 'text-white/30'}`}>
                        ${b.price.toLocaleString()}
                      </span>
                      <div className="flex-1 h-[14px] bg-white/[0.02] rounded-sm overflow-hidden flex">
                        <div style={{ width: `${pct * (b.delta > 0 ? 60 : 40)}%`, background: `${bull}40` }} />
                        <div style={{ width: `${pct * (b.delta > 0 ? 40 : 60)}%`, background: `${bear}40` }} />
                      </div>
                      <span className="w-[32px] text-[9px] text-white/20 text-right">{b.vol.toFixed(0)}</span>
                    </div>
                  )
                })}
              </div>
            </>}
          </Card>

          <Card title="LIQUIDATION MAP" sub="Estimated Cascade Levels">
            {d.data.liquidations && <>
              <div className="text-[9px] text-white/15 tracking-wider mb-1">SHORT LIQUIDATIONS ↑</div>
              <div className="space-y-px mb-2">
                {[...d.data.liquidations.shortLiqs].reverse().map((l: any) => (
                  <LiqRow key={'s'+l.leverage} leverage={l.leverage} price={l.price} distance={l.distance} side="short" />
                ))}
              </div>
              <div className="text-center py-1.5 border-y border-white/[0.04] mb-2">
                <span className="text-[10px] font-bold" style={{ color: cyan }}>${d.price.toLocaleString()}</span>
                <span className="text-[9px] text-white/15 ml-2">CURRENT</span>
              </div>
              <div className="text-[9px] text-white/15 tracking-wider mb-1">LONG LIQUIDATIONS ↓</div>
              <div className="space-y-px">
                {d.data.liquidations.longLiqs.map((l: any) => (
                  <LiqRow key={'l'+l.leverage} leverage={l.leverage} price={l.price} distance={l.distance} side="long" />
                ))}
              </div>
            </>}
          </Card>

          <Card title="TECHNICALS" sub="Multi-Timeframe · RSI + MACD + S/R">
            {d.data.technicals && Object.entries(d.data.technicals as Record<string, any>).map(([tf, t]) => {
              const label = tf === 'h1' ? '1H' : tf === 'h4' ? '4H' : '1D'
              const trendCol = t.trend?.includes('bull') ? bull : t.trend?.includes('bear') ? bear : warn
              return (
                <div key={tf} className="py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: trendCol }}>{label}</span>
                    <span className="text-[10px] text-white/25">{t.trend}</span>
                    <span className="ml-auto text-[10px]">
                      RSI <b style={{ color: t.rsi < 30 ? bull : t.rsi > 70 ? bear : '#c8ccd4' }}>{t.rsi}</b>
                    </span>
                    <span className="text-[10px]">
                      MACD <b style={{ color: t.macd?.rising ? bull : bear }}>{t.macd?.rising ? '▲' : '▼'}</b>
                    </span>
                  </div>
                  {(t.supports?.length > 0 || t.resistances?.length > 0) && (
                    <div className="flex gap-4 text-[9px]">
                      <span className="text-white/15">S: <span style={{ color: bull }}>{t.supports?.slice(0, 2).map((p: number) => '$' + fmt(p)).join(' · ') || '—'}</span></span>
                      <span className="text-white/15">R: <span style={{ color: bear }}>{t.resistances?.slice(0, 2).map((p: number) => '$' + fmt(p)).join(' · ') || '—'}</span></span>
                    </div>
                  )}
                </div>
              )
            })}
          </Card>
        </div>

        {/* Column 3: Derivatives + Macro */}
        <div className="space-y-3">
          <Card title="OPTIONS" sub="Deribit · P/C + Max Pain + Flow">
            {d.data.options && <>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <MiniStat label="P/C RATIO" value={d.data.options.pcRatio} color={d.data.options.pcRatio > 0.7 ? bear : bull} />
                <MiniStat label="MAX PAIN" value={`$${fmtK(d.data.options.maxPain)}`} />
                <MiniStat label="CALL OI" value={fmtK(d.data.options.callOI)} color={bull} />
                <MiniStat label="PUT OI" value={fmtK(d.data.options.putOI)} color={bear} />
              </div>
              <div className="text-[9px] text-white/15 tracking-wider mb-1">TOP STRIKES BY OI</div>
              {(d.data.options.topStrikes || []).slice(0, 5).map((s: any) => {
                const total = s.callOI + s.putOI
                const callPct = total > 0 ? s.callOI / total * 100 : 50
                return (
                  <div key={s.strike} className="flex items-center gap-2 py-1 border-b border-white/[0.02]">
                    <span className="w-[60px] text-[10px] text-white/40">${fmt(s.strike)}</span>
                    <div className="flex-1 h-[10px] rounded-sm overflow-hidden flex bg-white/[0.02]">
                      <div style={{ width: `${callPct}%`, background: `${bull}50` }} />
                      <div style={{ width: `${100 - callPct}%`, background: `${bear}50` }} />
                    </div>
                    <span className="text-[9px] text-white/20 w-[40px] text-right">{fmtK(total)}</span>
                  </div>
                )
              })}
            </>}
            {d.data.optionsFlow && d.data.optionsFlow.totalLarge > 0 && <>
              <div className="text-[9px] text-white/15 tracking-wider mt-3 mb-1">LARGE PRINTS (&gt;$50K)</div>
              <div className="flex gap-3 mb-2">
                <MiniStat label="BULLISH" value={d.data.optionsFlow.bullish} color={bull} />
                <MiniStat label="BEARISH" value={d.data.optionsFlow.bearish} color={bear} />
                <MiniStat label="NET" value={`${d.data.optionsFlow.netFlow > 0 ? '+' : ''}${d.data.optionsFlow.netFlow}`} color={sc(d.data.optionsFlow.netFlow)} />
              </div>
            </>}
          </Card>

          <Card title="FUNDING" sub="Cross-Exchange Comparison">
            {d.data.funding && <>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 text-center py-2 rounded bg-white/[0.02]">
                  <div className="text-[8px] text-white/20 tracking-wider mb-0.5">BINANCE</div>
                  <div className="text-sm font-bold" style={{ color: sc(-d.data.funding.rate) }}>
                    {(d.data.funding.rate * 100).toFixed(4)}%
                  </div>
                </div>
                {d.data.fundingDiff && <div className="flex-1 text-center py-2 rounded bg-white/[0.02]">
                  <div className="text-[8px] text-white/20 tracking-wider mb-0.5">BYBIT</div>
                  <div className="text-sm font-bold" style={{ color: sc(-d.data.fundingDiff.bybit) }}>
                    {(d.data.fundingDiff.bybit * 100).toFixed(4)}%
                  </div>
                </div>}
              </div>
              {d.data.fundingDiff && d.data.fundingDiff.absDiff > 0.0001 && (
                <div className="text-[10px] text-center rounded py-1 bg-white/[0.02]">
                  <span className="text-white/20">Differential: </span>
                  <span className="font-semibold" style={{ color: warn }}>{(d.data.fundingDiff.diff * 100).toFixed(4)}%</span>
                  <span className="text-white/20 ml-2">{d.data.fundingDiff.signal.replace('_', ' ')}</span>
                </div>
              )}
            </>}
          </Card>

          <Card title="CME FUTURES" sub="Institutional Positioning">
            {d.data.cme ? <>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <MiniStat label="CME PRICE" value={`$${fmt(d.data.cme.price)}`} />
                <MiniStat label="BASIS" value={`${d.data.cme.basis > 0 ? '+' : ''}${d.data.cme.basis}%`} color={sc(d.data.cme.basis)} />
                {d.data.cme.gap && <MiniStat label="GAP" value={`$${fmt(Math.abs(d.data.cme.gap))}`} color={d.data.cme.gapFilled ? neutral : warn} />}
              </div>
              <div className="text-[10px] text-white/30">{d.data.cme.basisLabel}</div>
              {d.data.cme.gap && !d.data.cme.gapFilled && (
                <div className="text-[10px] mt-1" style={{ color: warn }}>⚠ Open gap — CME gaps fill ~90% of the time</div>
              )}
            </> : <div className="text-[10px] text-white/20">Market closed</div>}
          </Card>

          <Card title="CORRELATIONS" sub="7D Rolling · Hourly Returns">
            {d.data.correlations ? <div className="space-y-2">
              {([
                ['ETH', d.data.correlations.ethBtc, 'Normal: 0.85+', d.data.correlations.ethBtc !== null && d.data.correlations.ethBtc < 0.7],
                ['DXY', d.data.correlations.dxyBtc, 'Normal: negative', d.data.correlations.dxyBtc !== null && d.data.correlations.dxyBtc > 0.3],
                ['SPX', d.data.correlations.spxBtc, 'Risk-on proxy', false],
                ['Gold', d.data.correlations.goldBtc, 'Safe haven', false],
              ] as [string, number | null, string, boolean][]).map(([label, val, note, alert]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-[36px] text-[10px] font-semibold ${alert ? 'text-[#e5c07b]' : 'text-white/40'}`}>{label}</span>
                  <CorrBar value={val} />
                  <span className="w-[40px] text-right text-[10px] font-bold" style={{ color: val !== null ? sc(val) : neutral }}>
                    {val !== null ? (val > 0 ? '+' : '') + val.toFixed(2) : '—'}
                  </span>
                  {alert && <span className="text-[8px] text-[#e5c07b]">⚠</span>}
                </div>
              ))}
            </div> : null}
          </Card>

          <Card title="STABLECOINS" sub="USDT + USDC Supply · 24H Change">
            {d.data.stablecoins ? <>
              <div className="flex gap-3 mb-2">
                {d.data.stablecoins.usdtMcap && <div className="flex-1 text-center py-2 rounded bg-white/[0.02]">
                  <div className="text-[8px] text-white/20 tracking-wider">USDT</div>
                  <div className="text-xs font-semibold text-white/60">${fmtK(d.data.stablecoins.usdtMcap)}</div>
                  <div className="text-[10px] font-bold" style={{ color: sc(d.data.stablecoins.usdtChange24h || 0) }}>
                    {d.data.stablecoins.usdtChange24h > 0 ? '+' : ''}{d.data.stablecoins.usdtChange24h}%
                  </div>
                </div>}
                {d.data.stablecoins.usdcMcap && <div className="flex-1 text-center py-2 rounded bg-white/[0.02]">
                  <div className="text-[8px] text-white/20 tracking-wider">USDC</div>
                  <div className="text-xs font-semibold text-white/60">${fmtK(d.data.stablecoins.usdcMcap)}</div>
                  <div className="text-[10px] font-bold" style={{ color: sc(d.data.stablecoins.usdcChange24h || 0) }}>
                    {d.data.stablecoins.usdcChange24h > 0 ? '+' : ''}{d.data.stablecoins.usdcChange24h}%
                  </div>
                </div>}
              </div>
              <div className="text-[10px] text-center" style={{ color: sc(d.data.stablecoins.totalChange) }}>
                {d.data.stablecoins.signal}
              </div>
            </> : null}
          </Card>

          {d.data.onchain && d.data.onchain.count > 0 && (
            <Card title="ON-CHAIN" sub="Large BTC Transfers · >100 BTC">
              <div className="text-[10px] text-white/30 mb-2">{d.data.onchain.count} txs · {d.data.onchain.totalBTC} BTC total</div>
              {(d.data.onchain.recent || []).map((tx: any, i: number) => (
                <div key={i} className="flex justify-between py-1 text-[10px] border-b border-white/[0.02]">
                  <span className="text-white/20 font-mono">{tx.hash}…</span>
                  <span className="font-bold" style={{ color: purple }}>{tx.btc} BTC</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* ═══ PATTERN ENGINE ═══ */}
      <div className="p-4 rounded-lg border border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[9px] text-white/20 tracking-[0.15em] font-semibold">HISTORICAL PATTERN ENGINE</span>
          <span className="text-[8px] text-white/10">Similar conditions → What happened next</span>
        </div>
        {patterns && patterns.matches > 0 && patterns.outcomes ? (
          <>
            <div className="text-[10px] text-white/30 mb-3">
              Found <b className="text-white/50">{patterns.matches}</b> similar historical moments
            </div>

            {/* Outcome horizons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {([
                ['4H', patterns.outcomes.h4],
                ['24H', patterns.outcomes.h24],
                ['72H', patterns.outcomes.h72],
              ] as [string, OutcomeSet][]).map(([label, o]) => (
                <div key={label} className="p-3 rounded bg-white/[0.02] border border-white/[0.03]">
                  <div className="text-[8px] text-white/15 tracking-[0.15em] mb-2">AFTER {label}</div>
                  {o.count > 0 ? <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg font-bold" style={{ color: (o.avgChange || 0) >= 0 ? bull : bear }}>
                        {(o.avgChange || 0) > 0 ? '+' : ''}{o.avgChange}%
                      </span>
                      <span className="text-[10px] text-white/20">avg</span>
                      <span className="text-xs text-white/30">
                        ({(o.medianChange || 0) > 0 ? '+' : ''}{o.medianChange}% med)
                      </span>
                    </div>
                    <div className="flex gap-3 text-[10px] mb-2">
                      <span style={{ color: (o.bullRate || 0) > 55 ? bull : (o.bullRate || 0) < 45 ? bear : warn }}>
                        {o.bullRate}% bullish
                      </span>
                      <span className="text-white/15">n={o.count}</span>
                    </div>
                    <div className="flex gap-2 text-[9px]">
                      <span className="text-white/15">Best: <b style={{ color: bull }}>{o.best}%</b></span>
                      <span className="text-white/15">Worst: <b style={{ color: bear }}>{o.worst}%</b></span>
                    </div>
                    {o.distribution && (
                      <div className="flex h-[6px] rounded-full overflow-hidden mt-2 gap-px">
                        {[
                          [o.distribution.crash, bear, 'Crash'],
                          [o.distribution.dip, '#f87171', 'Dip'],
                          [o.distribution.chop, neutral, 'Chop'],
                          [o.distribution.rally, '#4ade80', 'Rally'],
                          [o.distribution.strongRally, bull, 'Moon'],
                        ].map(([pct, color, label]) => pct as number > 0 ? (
                          <div key={label as string} title={`${label}: ${pct}%`} className="h-full rounded-sm" style={{ width: `${pct}%`, background: color as string, minWidth: pct as number > 0 ? 3 : 0 }} />
                        ) : null)}
                      </div>
                    )}
                  </> : <div className="text-[10px] text-white/15">Insufficient data</div>}
                </div>
              ))}
            </div>

            {/* Top matches */}
            {patterns.topMatches && patterns.topMatches.length > 0 && <>
              <div className="text-[9px] text-white/15 tracking-wider mb-1.5">CLOSEST MATCHES</div>
              <div className="space-y-px">
                {patterns.topMatches.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 px-2 text-[10px] border-b border-white/[0.02] rounded hover:bg-white/[0.01]">
                    <span className="text-white/15 w-[70px]">{new Date(m.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="text-white/30 w-[70px]">${m.price.toLocaleString()}</span>
                    <span className="font-semibold w-[32px]" style={{ color: sc(m.composite) }}>{m.composite > 0 ? '+' : ''}{m.composite}</span>
                    <span className="text-white/20 w-[60px]">{m.bias}</span>
                    <span className="flex-1" />
                    {m.change4h !== null && <span className="w-[45px] text-right" style={{ color: sc(m.change4h) }}>{m.change4h > 0 ? '+' : ''}{m.change4h}%</span>}
                    {m.change24h !== null && <span className="w-[52px] text-right font-semibold" style={{ color: sc(m.change24h) }}>{m.change24h > 0 ? '+' : ''}{m.change24h}%</span>}
                    {m.change72h !== null && <span className="w-[52px] text-right" style={{ color: sc(m.change72h) }}>{m.change72h > 0 ? '+' : ''}{m.change72h}%</span>}
                  </div>
                ))}
                <div className="flex gap-3 py-1 px-2 text-[8px] text-white/10">
                  <span className="w-[70px]">Date</span><span className="w-[70px]">Price</span><span className="w-[32px]">Score</span><span className="w-[60px]">Bias</span>
                  <span className="flex-1" /><span className="w-[45px] text-right">4h</span><span className="w-[52px] text-right">24h</span><span className="w-[52px] text-right">72h</span>
                </div>
              </div>
            </>}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-[11px] text-white/20 mb-1">📊 Collecting data...</div>
            <div className="text-[10px] text-white/10">Pattern matching will activate after ~48 hours of snapshots with outcome tracking.</div>
          </div>
        )}
      </div>

      {/* ═══ FEAR & GREED FOOTER ═══ */}
      {d.data.fearGreed && (
        <div className="flex items-center gap-4 p-3 rounded-lg border border-white/[0.04] bg-white/[0.01]">
          <span className="text-[9px] text-white/15 tracking-widest w-[80px]">FEAR & GREED</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #ff4976 0%, #e5c07b 40%, #00e5a0 100%)' }}>
            <div className="relative h-full">
              <div className="absolute w-2 h-4 bg-white rounded-full -top-1 shadow-lg shadow-white/20 transition-all duration-500" style={{ left: `${d.data.fearGreed.value}%`, transform: 'translateX(-50%)' }} />
            </div>
          </div>
          <div className="text-right min-w-[80px]">
            <span className="text-lg font-bold" style={{ color: d.data.fearGreed.value <= 25 ? bear : d.data.fearGreed.value >= 75 ? bull : warn }}>{d.data.fearGreed.value}</span>
            <span className="text-[10px] text-white/30 ml-1.5">{d.data.fearGreed.label}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Components ───────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.01]">
      <div className="text-[9px] text-white/15 tracking-[0.2em] font-semibold mb-3">{title}</div>
      {children}
    </div>
  )
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.01]">
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-[9px] text-white/20 tracking-[0.15em] font-semibold">{title}</span>
        {sub && <span className="text-[8px] text-white/10">{sub}</span>}
      </div>
      {children}
    </div>
  )
}

function QuickStat({ label, value, color, sub, alert }: { label: string; value: string | number; color?: string; sub?: string; alert?: boolean }) {
  return (
    <div className={`text-center p-2 rounded-lg border border-white/[0.04] bg-white/[0.01] ${alert ? 'ring-1 ring-[#e5c07b]/30' : ''}`}>
      <div className="text-[7px] text-white/15 tracking-[0.15em] mb-1">{label}</div>
      <div className="text-sm font-bold" style={{ color: color || '#c8ccd4' }}>{value}</div>
      {sub && <div className="text-[8px] text-white/20 mt-0.5 truncate">{sub}</div>}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <div className="text-[7px] text-white/15 tracking-wider">{label}</div>
      <div className="text-xs font-bold" style={{ color: color || '#c8ccd4' }}>{value}</div>
    </div>
  )
}

function Pill({ text, bull, color }: { text: string; bull?: boolean; color?: string }) {
  const bg = color ? `${color}15` : bull ? 'rgba(0,229,160,0.1)' : 'rgba(255,73,118,0.1)'
  const fg = color || (bull ? '#00e5a0' : '#ff4976')
  return <span className="text-[9px] px-2 py-0.5 rounded font-semibold tracking-wider" style={{ background: bg, color: fg }}>{text}</span>
}

function SignalBar({ name, score, confidence, reason }: { name: string; score: number; confidence: number; reason: string }) {
  const pct = Math.abs(score) / 2
  const color = sc(score)
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/[0.015] group">
      <span className="w-[90px] text-[10px] text-white/25 truncate capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
      <div className="flex-1 h-[6px] bg-white/[0.02] rounded-full relative overflow-hidden">
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.06] left-1/2" />
        <div className="absolute h-full rounded-full transition-all duration-500" style={{
          width: `${pct}%`, background: color,
          ...(score >= 0 ? { left: '50%' } : { right: '50%' }),
          boxShadow: `0 0 6px ${color}40`,
        }} />
      </div>
      <span className="w-[32px] text-right text-[10px] font-bold tabular-nums" style={{ color }}>
        {score > 0 ? '+' : ''}{score}
      </span>
    </div>
  )
}

function OBRow({ price, qty, total, side, maxVal }: { price: number; qty: number; total: number; side: 'bid' | 'ask'; maxVal: number }) {
  const pct = maxVal > 0 ? total / maxVal * 100 : 0
  const color = side === 'bid' ? bull : bear
  return (
    <div className="flex items-center gap-1 h-[22px] relative">
      <div className="absolute inset-0 rounded-sm" style={{ background: color, opacity: 0.06, width: `${pct}%`, ...(side === 'bid' ? { left: 0 } : { right: 0, marginLeft: 'auto' }) }} />
      <span className="w-[80px] text-right text-[10px] relative z-10" style={{ color }}>{price.toFixed(1)}</span>
      <span className="w-[55px] text-right text-[10px] text-white/25 relative z-10">{qty.toFixed(3)}</span>
      <span className="w-[55px] text-right text-[9px] text-white/15 relative z-10">${fmtK(total)}</span>
    </div>
  )
}

function LiqRow({ leverage, price, distance, side }: { leverage: number; price: number; distance: string; side: 'long' | 'short' }) {
  const color = side === 'short' ? bear : bull
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-[28px] text-[10px] text-white/20 text-right">{leverage}×</span>
      <span className="text-[10px] font-semibold flex-1" style={{ color }}>${price.toLocaleString()}</span>
      <span className="text-[9px] text-white/15">{distance}</span>
    </div>
  )
}

function CorrBar({ value }: { value: number | null }) {
  if (value === null) return <div className="flex-1 h-[6px] bg-white/[0.02] rounded-full" />
  const pct = Math.abs(value) * 50
  return (
    <div className="flex-1 h-[6px] bg-white/[0.02] rounded-full relative overflow-hidden">
      <div className="absolute top-0 bottom-0 w-px bg-white/[0.06] left-1/2" />
      <div className="absolute h-full rounded-full" style={{
        width: `${pct}%`,
        background: sc(value),
        ...(value >= 0 ? { left: '50%' } : { right: '50%' }),
      }} />
    </div>
  )
}
