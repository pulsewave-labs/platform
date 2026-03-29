'use client'

import { useEffect, useState, useCallback } from 'react'

type Signal = { score: number; confidence: number; reason: string }
type Snapshot = {
  timestamp: number; price: number; sourcesOk: number; sourcesTotal: number
  composite: number; bias: string; confidence: number
  signals: Record<string, Signal>
  data: any
}

function c(val: number) { return val > 0 ? '#00e5a0' : val < 0 ? '#ff4976' : '#5c6370' }
function fmt(n: number | null | undefined) { return n?.toLocaleString('en-US') ?? '—' }
function fmtK(n: number) { return n >= 1e9 ? (n/1e9).toFixed(1)+'B' : n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : fmt(n) }
function ts(t: number) { return new Date(t).toLocaleTimeString('en-US', { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' }) }

export default function IntelligenceDashboard() {
  const [data, setData] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/intelligence')
      if (!res.ok) throw new Error('Failed to fetch')
      setData(await res.json())
      setError('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(); const i = setInterval(load, 15 * 60 * 1000); return () => clearInterval(i) }, [load])

  if (!data && loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00e5a0]/30 border-t-[#00e5a0] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs mono text-white/30">FETCHING 17 DATA SOURCES...</p>
      </div>
    </div>
  )

  if (error && !data) return <div className="text-center text-red-400 py-20 mono text-sm">{error}</div>

  const d = data!
  const biasColor = d.composite >= 5 ? '#00e5a0' : d.composite <= -5 ? '#ff4976' : '#e5c07b'

  return (
    <div className="mono">
      {/* Header stats */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4">
        <div>
          <div className="text-[10px] text-white/30 tracking-wider">BTC / USDT</div>
          <div className="text-2xl font-bold" style={{ color: d.composite >= 0 ? '#00e5a0' : '#ff4976' }}>
            ${fmt(d.price)}
          </div>
        </div>
        {[
          ['CVD', d.data.cvd?.cvd?.toFixed(1), c(d.data.cvd?.cvd || 0)],
          ['FUNDING', d.data.funding ? (d.data.funding.rate * 100).toFixed(4) + '%' : '—', c(-(d.data.funding?.rate || 0))],
          ['OI', d.data.oi ? fmtK(d.data.oi.current) + ' BTC' : '—', '#c8ccd4'],
          ['F&G', d.data.fearGreed ? `${d.data.fearGreed.value} ${d.data.fearGreed.label}` : '—', d.data.fearGreed?.value <= 25 ? '#ff4976' : d.data.fearGreed?.value >= 75 ? '#00e5a0' : '#e5c07b'],
          ['L/S', d.data.lsRatio?.ratio?.toFixed(2) || '—', d.data.lsRatio?.ratio > 1.2 ? '#ff4976' : '#00e5a0'],
        ].map(([label, val, col]) => (
          <div key={label as string}>
            <div className="text-[9px] text-white/20 tracking-widest">{label as string}</div>
            <div className="text-sm font-semibold" style={{ color: col as string }}>{val as string}</div>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <button onClick={load} disabled={loading} className="text-[10px] px-3 py-1 border border-white/[0.06] rounded text-white/40 hover:text-white/70 hover:border-white/10 transition-colors disabled:opacity-30">
            {loading ? 'REFRESHING...' : 'REFRESH'}
          </button>
          <span className="text-[9px] text-white/20">{d.sourcesOk}/{d.sourcesTotal} sources · {ts(d.timestamp)}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {d.data.cvd && <Tag label={`CVD: ${d.data.cvd.trend.replace('_',' ')}`} bull={d.data.cvd.cvd > 0} />}
        {d.data.cvd?.divergence && <Tag label={`⚠ ${d.data.cvd.divergenceType.replace('_',' ')}`} bull={d.data.cvd.divergenceType.includes('bullish')} />}
        {d.data.taker && <Tag label={`Taker B/S: ${d.data.taker.ratio.toFixed(2)}`} bull={d.data.taker.ratio > 1.1} />}
        {d.data.largeTrades && <Tag label={`Whales: ${d.data.largeTrades.netDelta > 0 ? '+' : ''}${d.data.largeTrades.netDelta.toFixed(1)} BTC`} bull={d.data.largeTrades.netDelta > 0} />}
        {d.data.cme && <Tag label={`CME Basis: ${d.data.cme.basis > 0 ? '+' : ''}${d.data.cme.basis}%`} bull={d.data.cme.basis > 0} />}
        {d.data.stablecoins && Math.abs(d.data.stablecoins.totalChange) > 0.05 && <Tag label={`Stables: ${d.data.stablecoins.signal}`} bull={d.data.stablecoins.totalChange > 0} />}
        {d.data.optionsFlow && d.data.optionsFlow.totalLarge > 0 && <Tag label={`Opts Flow: ${d.data.optionsFlow.netFlow > 0 ? '+' : ''}${d.data.optionsFlow.netFlow}`} bull={d.data.optionsFlow.netFlow > 0} />}
      </div>

      {/* Bias gauge */}
      <div className="flex items-center gap-6 p-4 rounded-lg border border-white/[0.04] bg-white/[0.01] mb-4">
        <div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: biasColor }}>{d.bias}</div>
          <div className="text-[10px] text-white/20">{d.confidence}% confidence</div>
        </div>
        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${(d.composite + 100) / 2}%`,
            background: `linear-gradient(to right, #ff4976, #e5c07b 50%, #00e5a0)`
          }} />
        </div>
        <div className="text-lg font-bold min-w-[50px] text-right" style={{ color: c(d.composite) }}>
          {d.composite > 0 ? '+' : ''}{d.composite}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Signals */}
        <Card title="SIGNAL BREAKDOWN">
          {Object.entries(d.signals).map(([k, s]) => (
            <div key={k} className="flex items-center gap-2 py-1 border-b border-white/[0.02] last:border-0">
              <span className="w-[90px] text-[10px] text-white/30 truncate">{k}</span>
              <div className="flex-1 h-1 bg-white/[0.03] rounded relative">
                <div className={`absolute h-full rounded ${s.score >= 0 ? 'bg-[#00e5a0]' : 'bg-[#ff4976]'}`}
                  style={{ width: `${Math.abs(s.score) / 2}%`, [s.score >= 0 ? 'left' : 'right']: '50%' }} />
              </div>
              <span className="w-[35px] text-right text-[10px] font-semibold" style={{ color: c(s.score) }}>
                {s.score > 0 ? '+' : ''}{s.score}
              </span>
            </div>
          ))}
        </Card>

        {/* CVD */}
        <Card title="CUMULATIVE VOLUME DELTA (4H)">
          {d.data.cvd && <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold" style={{ color: c(d.data.cvd.cvd) }}>{d.data.cvd.cvd.toFixed(1)}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                background: d.data.cvd.cvd > 0 ? 'rgba(0,229,160,0.1)' : 'rgba(255,73,118,0.1)',
                color: c(d.data.cvd.cvd)
              }}>{d.data.cvd.trend.replace('_', ' ')}</span>
            </div>
            {d.data.cvd.divergence && (
              <div className="text-[10px] mb-2" style={{ color: '#e5c07b' }}>
                ⚠ {d.data.cvd.divergenceType.replace('_', ' ').toUpperCase()}
              </div>
            )}
            <div className="flex items-end gap-[2px] h-[50px]">
              {(d.data.cvd.series || []).map((s: any, i: number) => {
                const maxAbs = Math.max(...d.data.cvd.series.map((x: any) => Math.abs(x.delta)), 0.01)
                const h = Math.abs(s.delta) / maxAbs * 45
                return <div key={i} className="flex-1 rounded-t-sm" style={{
                  height: `${Math.max(h, 2)}px`,
                  background: s.delta >= 0 ? '#00e5a0' : '#ff4976', opacity: 0.6
                }} />
              })}
            </div>
          </>}
        </Card>

        {/* Orderbook */}
        <Card title="ORDER BOOK — BINANCE FUTURES">
          {d.data.orderbook && <>
            {[...d.data.orderbook.asks].reverse().map((a: any, i: number) => {
              const maxVal = Math.max(...[...d.data.orderbook.asks, ...d.data.orderbook.bids].map((l: any) => l.value))
              return <OBRow key={'a'+i} price={a.price} qty={a.qty} pct={a.value/maxVal*100} side="ask" />
            })}
            <div className="text-center text-[10px] text-[#56b6c2] py-1 border-y border-white/[0.04]">
              SPREAD: ${d.data.orderbook.spread.toFixed(1)}
            </div>
            {d.data.orderbook.bids.map((b: any, i: number) => {
              const maxVal = Math.max(...[...d.data.orderbook.asks, ...d.data.orderbook.bids].map((l: any) => l.value))
              return <OBRow key={'b'+i} price={b.price} qty={b.qty} pct={b.value/maxVal*100} side="bid" />
            })}
          </>}
        </Card>

        {/* Large Trades */}
        <Card title="LARGE TRADES (≥1 BTC)" className="lg:row-span-2">
          {d.data.largeTrades && <>
            <div className="text-[10px] mb-2 text-white/40">
              <span style={{ color: c(d.data.largeTrades.netDelta) }}>
                Net: {d.data.largeTrades.netDelta > 0 ? '+' : ''}{d.data.largeTrades.netDelta.toFixed(1)} BTC
              </span>
              {' · '}{d.data.largeTrades.count} large · {d.data.largeTrades.whaleCount} whale · {d.data.largeTrades.pctOfTotal}% of vol
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-none">
              {(d.data.largeTrades.recent || []).map((t: any, i: number) => (
                <div key={i} className={`flex gap-1.5 py-1 text-[10px] border-b border-white/[0.02] ${t.whale ? 'bg-[#c678dd]/[0.05]' : ''}`}>
                  <span className="text-white/20 w-[50px]">{ts(t.time)}</span>
                  <span className="w-[30px] font-semibold" style={{ color: t.side === 'BUY' ? '#00e5a0' : '#ff4976' }}>{t.side}</span>
                  <span className="w-[75px]">${t.price.toLocaleString()}</span>
                  <span className="w-[50px] text-right">{t.qty.toFixed(3)}</span>
                  <span className="flex-1 text-right text-white/30">${fmtK(t.value)}</span>
                </div>
              ))}
            </div>
          </>}
        </Card>

        {/* Volume Profile */}
        <Card title="VOLUME PROFILE ($100 BUCKETS)">
          {d.data.volumeProfile && <>
            <div className="text-[10px] text-white/30 mb-2">
              POC: ${d.data.volumeProfile.poc.price.toLocaleString()} · VA: ${d.data.volumeProfile.valueAreaLow.toLocaleString()}-${d.data.volumeProfile.valueAreaHigh.toLocaleString()} · {d.data.volumeProfile.priceVsVA.replace('_', ' ')}
            </div>
            {[...d.data.volumeProfile.topBuckets].sort((a: any, b: any) => b.price - a.price).map((b: any) => {
              const maxVol = Math.max(...d.data.volumeProfile.topBuckets.map((x: any) => x.vol))
              const isPOC = b.price === d.data.volumeProfile.poc.price
              return (
                <div key={b.price} className="flex items-center gap-1.5 my-[2px]">
                  <span className={`w-[65px] text-[10px] text-right ${isPOC ? 'text-[#e5c07b] font-semibold' : 'text-white/40'}`}>
                    {isPOC ? '★ ' : ''}${b.price.toLocaleString()}
                  </span>
                  <div className={`flex-1 h-3 bg-white/[0.02] rounded-sm overflow-hidden relative ${isPOC ? 'ring-1 ring-[#e5c07b]/30' : ''}`}>
                    <div className="absolute h-full bg-[#00e5a0]/30" style={{ width: `${b.vol / maxVol * (b.delta > 0 ? 60 : 40)}%` }} />
                    <div className="absolute h-full bg-[#ff4976]/30" style={{ left: `${b.vol / maxVol * (b.delta > 0 ? 60 : 40)}%`, width: `${b.vol / maxVol * (b.delta > 0 ? 40 : 60)}%` }} />
                    <span className="absolute right-1 text-[8px] text-white/20 leading-3">{b.vol.toFixed(0)}</span>
                  </div>
                </div>
              )
            })}
          </>}
        </Card>

        {/* Technicals */}
        <Card title="MULTI-TIMEFRAME TECHNICALS">
          {d.data.technicals && Object.entries(d.data.technicals as Record<string, any>).map(([tf, t]) => {
            const label = tf === 'h1' ? '1H' : tf === 'h4' ? '4H' : '1D'
            const trendCol = t.trend?.includes('bull') ? '#00e5a0' : t.trend?.includes('bear') ? '#ff4976' : '#e5c07b'
            return (
              <div key={tf} className="mb-3 last:mb-0">
                <div className="font-semibold text-[11px] mb-1">
                  <span style={{ color: trendCol }}>{label}</span>
                  <span className="text-white/30"> — {t.trend}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-white/30">
                  <span>RSI: <b style={{ color: t.rsi < 30 ? '#00e5a0' : t.rsi > 70 ? '#ff4976' : '#c8ccd4' }}>{t.rsi}</b></span>
                  <span>MACD: <b style={{ color: t.macd?.rising ? '#00e5a0' : '#ff4976' }}>{t.macd?.rising ? '↑' : '↓'}</b></span>
                </div>
                {t.supports?.length > 0 && (
                  <div className="text-[9px] text-white/20 mt-0.5">
                    S: {t.supports.slice(0, 2).map((p: number) => '$' + fmt(p)).join(', ')} | R: {t.resistances?.slice(0, 2).map((p: number) => '$' + fmt(p)).join(', ') || '—'}
                  </div>
                )}
              </div>
            )
          })}
        </Card>

        {/* Liquidations */}
        <Card title="LIQUIDATION ESTIMATES">
          {d.data.liquidations && <>
            <div className="text-[9px] text-white/20 mb-1">SHORT LIQUIDATIONS (above)</div>
            {[...d.data.liquidations.shortLiqs].reverse().map((l: any) => (
              <div key={'s'+l.leverage} className="flex justify-between text-[10px] py-0.5">
                <span className="text-white/20 w-8">{l.leverage}x</span>
                <span className="text-[#ff4976]">${l.price.toLocaleString()}</span>
                <span className="text-white/20 w-10 text-right">{l.distance}</span>
              </div>
            ))}
            <div className="text-center text-[10px] text-[#56b6c2] font-semibold py-1.5 my-1 border-y border-white/[0.04]">
              ── ${d.price.toLocaleString()} ──
            </div>
            <div className="text-[9px] text-white/20 mb-1">LONG LIQUIDATIONS (below)</div>
            {d.data.liquidations.longLiqs.map((l: any) => (
              <div key={'l'+l.leverage} className="flex justify-between text-[10px] py-0.5">
                <span className="text-white/20 w-8">{l.leverage}x</span>
                <span className="text-[#00e5a0]">${l.price.toLocaleString()}</span>
                <span className="text-white/20 w-10 text-right">{l.distance}</span>
              </div>
            ))}
          </>}
        </Card>

        {/* Options + F&G */}
        <Card title="OPTIONS — DERIBIT">
          {d.data.options && <>
            <div className="flex gap-4 mb-3">
              <div>
                <div className="text-[8px] text-white/20 tracking-wider">P/C RATIO</div>
                <div className="text-base font-bold" style={{ color: d.data.options.pcRatio > 0.7 ? '#ff4976' : '#00e5a0' }}>{d.data.options.pcRatio}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20 tracking-wider">MAX PAIN</div>
                <div className="text-base font-bold">${fmt(d.data.options.maxPain)}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20 tracking-wider">CALL OI</div>
                <div className="text-xs text-[#00e5a0]">{fmtK(d.data.options.callOI)}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20 tracking-wider">PUT OI</div>
                <div className="text-xs text-[#ff4976]">{fmtK(d.data.options.putOI)}</div>
              </div>
            </div>
            {(d.data.options.topStrikes || []).slice(0, 5).map((s: any) => (
              <div key={s.strike} className="flex justify-between text-[10px] py-0.5 border-b border-white/[0.02]">
                <span>${fmt(s.strike)}</span>
                <span className="text-[#00e5a0]">C: {fmtK(s.callOI)}</span>
                <span className="text-[#ff4976]">P: {fmtK(s.putOI)}</span>
              </div>
            ))}
          </>}
          {d.data.fearGreed && <>
            <div className="text-[9px] text-white/20 tracking-widest mt-4 mb-2">FEAR & GREED</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold" style={{
                color: d.data.fearGreed.value <= 25 ? '#ff4976' : d.data.fearGreed.value >= 75 ? '#00e5a0' : '#e5c07b'
              }}>{d.data.fearGreed.value}</span>
              <div className="flex-1">
                <div className="text-[10px]" style={{
                  color: d.data.fearGreed.value <= 25 ? '#ff4976' : d.data.fearGreed.value >= 75 ? '#00e5a0' : '#e5c07b'
                }}>{d.data.fearGreed.label}</div>
                <div className="h-1.5 rounded-full mt-1" style={{ background: 'linear-gradient(to right, #ff4976, #e5c07b, #00e5a0)' }}>
                  <div className="relative">
                    <div className="absolute w-0.5 h-3 bg-white rounded -top-[3px]" style={{ left: `${d.data.fearGreed.value}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </>}
        </Card>

        {/* Options Flow */}
        <Card title="OPTIONS FLOW — LARGE PRINTS">
          {d.data.optionsFlow ? <>
            <div className="flex gap-4 mb-3">
              <div>
                <div className="text-[8px] text-white/20">BULLISH</div>
                <div className="text-base font-bold text-[#00e5a0]">{d.data.optionsFlow.bullish}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20">BEARISH</div>
                <div className="text-base font-bold text-[#ff4976]">{d.data.optionsFlow.bearish}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20">NET</div>
                <div className="text-base font-bold" style={{ color: c(d.data.optionsFlow.netFlow) }}>
                  {d.data.optionsFlow.netFlow > 0 ? '+' : ''}{d.data.optionsFlow.netFlow}
                </div>
              </div>
            </div>
            {(d.data.optionsFlow.recent || []).slice(0, 6).map((t: any, i: number) => (
              <div key={i} className="flex gap-1.5 py-0.5 text-[9px] border-b border-white/[0.02]">
                <span className="w-[130px] truncate text-white/50">{t.instrument}</span>
                <span className="font-semibold" style={{ color: t.direction === 'buy' ? '#00e5a0' : '#ff4976' }}>{t.direction?.toUpperCase()}</span>
                <span className="text-white/30 ml-auto">{t.amount?.toFixed(1)}</span>
              </div>
            ))}
          </> : <div className="text-[10px] text-white/20">No large prints detected</div>}
        </Card>

        {/* Funding Differential */}
        <Card title="CROSS-EXCHANGE FUNDING">
          {d.data.fundingDiff ? <>
            <div className="flex gap-4 mb-2">
              <div>
                <div className="text-[8px] text-white/20">BINANCE</div>
                <div className="text-sm font-semibold" style={{ color: c(-d.data.fundingDiff.binance) }}>
                  {(d.data.fundingDiff.binance * 100).toFixed(4)}%
                </div>
              </div>
              <div>
                <div className="text-[8px] text-white/20">BYBIT</div>
                <div className="text-sm font-semibold" style={{ color: c(-d.data.fundingDiff.bybit) }}>
                  {(d.data.fundingDiff.bybit * 100).toFixed(4)}%
                </div>
              </div>
              <div>
                <div className="text-[8px] text-white/20">DIFF</div>
                <div className="text-sm font-semibold" style={{ color: c(-d.data.fundingDiff.diff) }}>
                  {(d.data.fundingDiff.diff * 100).toFixed(4)}%
                </div>
              </div>
            </div>
            <div className="text-[10px] text-white/30">{d.data.fundingDiff.signal.replace('_', ' ')}</div>
          </> : <div className="text-[10px] text-white/20">Loading...</div>}
        </Card>

        {/* CME Basis */}
        <Card title="CME FUTURES BASIS">
          {d.data.cme ? <>
            <div className="flex gap-4 mb-2">
              <div>
                <div className="text-[8px] text-white/20">CME PRICE</div>
                <div className="text-sm font-semibold">${fmt(d.data.cme.price)}</div>
              </div>
              <div>
                <div className="text-[8px] text-white/20">BASIS</div>
                <div className="text-sm font-semibold" style={{ color: c(d.data.cme.basis) }}>
                  {d.data.cme.basis > 0 ? '+' : ''}{d.data.cme.basis}%
                </div>
              </div>
              {d.data.cme.gap && <div>
                <div className="text-[8px] text-white/20">GAP</div>
                <div className="text-sm font-semibold" style={{ color: d.data.cme.gapFilled ? '#5c6370' : '#e5c07b' }}>
                  ${d.data.cme.gap.toLocaleString()} {d.data.cme.gapFilled ? '(filled)' : '(open)'}
                </div>
              </div>}
            </div>
            <div className="text-[10px] text-white/30">{d.data.cme.basisLabel}</div>
          </> : <div className="text-[10px] text-white/20">Market closed or unavailable</div>}
        </Card>

        {/* Correlations */}
        <Card title="CORRELATIONS (7D HOURLY)">
          {d.data.correlations ? <>
            {[
              ['BTC / ETH', d.data.correlations.ethBtc, 'normally 0.85+'],
              ['BTC / DXY', d.data.correlations.dxyBtc, 'normally negative'],
              ['BTC / SPX', d.data.correlations.spxBtc, 'risk-on correlation'],
              ['BTC / Gold', d.data.correlations.goldBtc, 'safe haven comparison'],
            ].map(([label, val, note]) => {
              const v = val as number | null
              const absV = Math.abs(v || 0)
              const barCol = v === null ? '#333' : v > 0 ? '#00e5a0' : '#ff4976'
              return (
                <div key={label as string} className="flex items-center gap-2 py-1.5 border-b border-white/[0.02]">
                  <span className="w-[80px] text-[10px] text-white/40">{label as string}</span>
                  <div className="flex-1 h-2 bg-white/[0.03] rounded overflow-hidden relative">
                    <div className="absolute h-full rounded" style={{
                      background: barCol, width: `${absV * 50}%`,
                      left: (v || 0) >= 0 ? '50%' : `${50 - absV * 50}%`,
                    }} />
                    <div className="absolute h-full w-px bg-white/10 left-1/2" />
                  </div>
                  <span className="w-[40px] text-right text-[10px] font-semibold" style={{ color: barCol }}>
                    {v !== null ? (v > 0 ? '+' : '') + v.toFixed(2) : '—'}
                  </span>
                </div>
              )
            })}
            <div className="text-[9px] text-white/15 mt-1">← inverse | neutral | correlated →</div>
          </> : <div className="text-[10px] text-white/20">Computing...</div>}
        </Card>

        {/* Stablecoins */}
        <Card title="STABLECOIN SUPPLY (24H)">
          {d.data.stablecoins ? <>
            <div className="flex gap-4 mb-3">
              {d.data.stablecoins.usdtMcap && <div>
                <div className="text-[8px] text-white/20">USDT</div>
                <div className="text-sm font-semibold">${fmtK(d.data.stablecoins.usdtMcap)}</div>
                <div className="text-[9px]" style={{ color: c(d.data.stablecoins.usdtChange24h || 0) }}>
                  {d.data.stablecoins.usdtChange24h > 0 ? '+' : ''}{d.data.stablecoins.usdtChange24h}%
                </div>
              </div>}
              {d.data.stablecoins.usdcMcap && <div>
                <div className="text-[8px] text-white/20">USDC</div>
                <div className="text-sm font-semibold">${fmtK(d.data.stablecoins.usdcMcap)}</div>
                <div className="text-[9px]" style={{ color: c(d.data.stablecoins.usdcChange24h || 0) }}>
                  {d.data.stablecoins.usdcChange24h > 0 ? '+' : ''}{d.data.stablecoins.usdcChange24h}%
                </div>
              </div>}
            </div>
            <div className="text-[10px]" style={{ color: d.data.stablecoins.totalChange > 0 ? '#00e5a0' : d.data.stablecoins.totalChange < 0 ? '#ff4976' : '#5c6370' }}>
              {d.data.stablecoins.signal}
            </div>
          </> : <div className="text-[10px] text-white/20">Loading...</div>}
        </Card>

        {/* On-chain */}
        <Card title="LARGE BTC TRANSACTIONS">
          {d.data.onchain && d.data.onchain.count > 0 ? <>
            <div className="text-[10px] text-white/30 mb-2">
              {d.data.onchain.count} large txs | Total: {d.data.onchain.totalBTC} BTC
            </div>
            {(d.data.onchain.recent || []).map((tx: any, i: number) => (
              <div key={i} className="flex justify-between text-[10px] py-0.5 border-b border-white/[0.02]">
                <span className="text-white/30 font-mono">{tx.hash}...</span>
                <span className="font-semibold text-[#c678dd]">{tx.btc} BTC</span>
              </div>
            ))}
          </> : <div className="text-[10px] text-white/20">No large transactions detected</div>}
        </Card>
      </div>
    </div>
  )
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] ${className}`}>
      <div className="text-[9px] text-white/20 tracking-widest font-semibold mb-2.5">{title}</div>
      {children}
    </div>
  )
}

function Tag({ label, bull }: { label: string; bull: boolean }) {
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded font-semibold tracking-wider uppercase ${
      bull ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-[#ff4976]/10 text-[#ff4976]'
    }`}>{label}</span>
  )
}

function OBRow({ price, qty, pct, side }: { price: number; qty: number; pct: number; side: 'bid' | 'ask' }) {
  return (
    <div className="flex items-center gap-1 py-[1px] relative">
      <div className="absolute inset-0 opacity-[0.08]" style={{
        background: side === 'bid' ? '#00e5a0' : '#ff4976',
        width: `${pct}%`,
        [side === 'bid' ? 'right' : 'left']: 0,
      }} />
      <span className={`w-[85px] text-right text-[10px] relative z-10 ${side === 'bid' ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>
        {price.toFixed(1)}
      </span>
      <span className="w-[55px] text-right text-[10px] text-white/30 relative z-10">{qty.toFixed(3)}</span>
    </div>
  )
}
