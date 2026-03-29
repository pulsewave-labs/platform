import { NextResponse } from 'next/server'

const PROXY_URL = 'http://masonboroff:UQdolU8%3Dg808@ddc.oxylabs.io:8001'
const BINANCE_FAPI = 'https://fapi.binance.com/fapi/v1'
const BINANCE_DATA = 'https://fapi.binance.com/futures/data'
const BYBIT_API = 'https://api.bybit.com/v5'
const DERIBIT_API = 'https://www.deribit.com/api/v2/public'
const FNG_API = 'https://api.alternative.me/fng'

// Cache: store last snapshot, refresh if older than 2 min
let cachedSnapshot: any = null
let cacheTime = 0
const CACHE_TTL = 2 * 60 * 1000

async function proxyFetch(url: string) {
  const needsProxy = url.includes('binance.com') || url.includes('bybit.com')

  if (needsProxy) {
    // Use HTTP CONNECT proxy via https-proxy-agent (Node.js runtime only)
    try {
      const { HttpsProxyAgent } = require('https-proxy-agent')
      const agent = new HttpsProxyAgent(PROXY_URL)
      const res = await fetch(url, { agent, signal: AbortSignal.timeout(12000) } as any)
      if (!res.ok) throw new Error(`${res.status}: ${await res.text().catch(() => '')}`)
      return res.json()
    } catch (e: any) {
      // Fallback: try direct (works from some Vercel regions)
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error(`direct-${res.status}`)
      return res.json()
    }
  }

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

// Force Node.js runtime (not Edge) so https-proxy-agent works
export const runtime = 'nodejs'
export const maxDuration = 30

async function safeFetch(name: string, url: string) {
  try {
    const data = await proxyFetch(url)
    return { name, data, ok: true }
  } catch (e: any) {
    return { name, data: null, ok: false, error: e.message }
  }
}

function clamp(val: number, min = -100, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)))
}

async function fetchSnapshot() {
  const results = await Promise.all([
    // Binance
    safeFetch('orderbook', `${BINANCE_FAPI}/depth?symbol=BTCUSDT&limit=20`),
    safeFetch('funding', `${BINANCE_FAPI}/premiumIndex?symbol=BTCUSDT`),
    safeFetch('fundingHistory', `${BINANCE_FAPI}/fundingRate?symbol=BTCUSDT&limit=8`),
    safeFetch('oi', `${BINANCE_FAPI}/openInterest?symbol=BTCUSDT`),
    safeFetch('oiHistory', `${BINANCE_DATA}/openInterestHist?symbol=BTCUSDT&period=5m&limit=288`),
    safeFetch('lsRatio', `${BINANCE_DATA}/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1`),
    safeFetch('topTrader', `${BINANCE_DATA}/topLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1`),
    safeFetch('topPosition', `${BINANCE_DATA}/topLongShortPositionRatio?symbol=BTCUSDT&period=5m&limit=1`),
    safeFetch('taker', `${BINANCE_DATA}/takerlongshortRatio?symbol=BTCUSDT&period=5m&limit=12`),
    safeFetch('klines5m', `${BINANCE_FAPI}/klines?symbol=BTCUSDT&interval=5m&limit=48`),
    safeFetch('klines1m', `${BINANCE_FAPI}/klines?symbol=BTCUSDT&interval=1m&limit=240`),
    safeFetch('klines1h', `${BINANCE_FAPI}/klines?symbol=BTCUSDT&interval=1h&limit=200`),
    safeFetch('klines4h', `${BINANCE_FAPI}/klines?symbol=BTCUSDT&interval=4h&limit=200`),
    safeFetch('klines1d', `${BINANCE_FAPI}/klines?symbol=BTCUSDT&interval=1d&limit=200`),
    safeFetch('aggTrades', `${BINANCE_FAPI}/aggTrades?symbol=BTCUSDT&limit=1000`),
    // Bybit
    safeFetch('bybitTicker', `${BYBIT_API}/market/tickers?category=linear&symbol=BTCUSDT`),
    safeFetch('bybitOB', `${BYBIT_API}/market/orderbook?category=linear&symbol=BTCUSDT&limit=25`),
    // Deribit
    safeFetch('options', `${DERIBIT_API}/get_book_summary_by_currency?currency=BTC&kind=option`),
    safeFetch('deribitIndex', `${DERIBIT_API}/get_index_price?index_name=btc_usd`),
    // Macro
    safeFetch('fng', `${FNG_API}/?limit=7`),
  ])

  const r: Record<string, any> = {}
  let okCount = 0
  for (const res of results) {
    r[res.name] = res
    if (res.ok) okCount++
  }

  // ─── Process data ────────────────────────────────
  const price = r.funding?.ok ? +r.funding.data.markPrice : r.bybitTicker?.ok ? +r.bybitTicker.data.result.list[0].lastPrice : 0

  // Orderbook
  let orderbook: any = null
  if (r.orderbook?.ok) {
    const bids = r.orderbook.data.bids.map(([p, q]: string[]) => ({ price: +p, qty: +q, value: +p * +q }))
    const asks = r.orderbook.data.asks.map(([p, q]: string[]) => ({ price: +p, qty: +q, value: +p * +q }))
    const bidTotal = bids.reduce((s: number, b: any) => s + b.value, 0)
    const askTotal = asks.reduce((s: number, a: any) => s + a.value, 0)
    orderbook = {
      imbalance: +((bidTotal - askTotal) / (bidTotal + askTotal)).toFixed(4),
      bidTotal: Math.round(bidTotal), askTotal: Math.round(askTotal),
      spread: +(asks[0].price - bids[0].price).toFixed(2),
      bids: bids.slice(0, 5), asks: asks.slice(0, 5),
    }
  }

  // Funding
  let funding: any = null
  if (r.funding?.ok) {
    funding = {
      rate: +r.funding.data.lastFundingRate,
      markPrice: +r.funding.data.markPrice,
      indexPrice: +r.funding.data.indexPrice,
      premium: +(+r.funding.data.markPrice - +r.funding.data.indexPrice).toFixed(2),
    }
  }

  // OI
  let oi: any = null
  if (r.oi?.ok && r.oiHistory?.ok) {
    const hist = r.oiHistory.data.map((h: any) => ({ ts: h.timestamp, val: +h.sumOpenInterestValue }))
    const now = hist[hist.length - 1]
    const h1 = hist[Math.max(0, hist.length - 13)]
    const h4 = hist[Math.max(0, hist.length - 49)]
    const h24 = hist[0]
    oi = {
      current: +r.oi.data.openInterest,
      delta1h: now && h1 ? +((now.val - h1.val) / h1.val * 100).toFixed(2) : 0,
      delta4h: now && h4 ? +((now.val - h4.val) / h4.val * 100).toFixed(2) : 0,
      delta24h: now && h24 ? +((now.val - h24.val) / h24.val * 100).toFixed(2) : 0,
    }
  }

  // L/S Ratio
  let lsRatio: any = null
  if (r.lsRatio?.ok) {
    lsRatio = {
      ratio: +r.lsRatio.data[0].longShortRatio,
      longPct: +(r.lsRatio.data[0].longAccount * 100).toFixed(1),
      shortPct: +(r.lsRatio.data[0].shortAccount * 100).toFixed(1),
      topTrader: r.topTrader?.ok ? +r.topTrader.data[0].longShortRatio : null,
      topPosition: r.topPosition?.ok ? +r.topPosition.data[0].longShortRatio : null,
    }
  }

  // Taker
  let taker: any = null
  if (r.taker?.ok) {
    const buyVol = r.taker.data.reduce((s: number, d: any) => s + +d.buyVol, 0)
    const sellVol = r.taker.data.reduce((s: number, d: any) => s + +d.sellVol, 0)
    taker = { buyVol: Math.round(buyVol), sellVol: Math.round(sellVol), ratio: +(buyVol / sellVol).toFixed(4), netDelta: Math.round(buyVol - sellVol) }
  }

  // CVD from 5m klines
  let cvd: any = null
  if (r.klines5m?.ok) {
    let cumDelta = 0
    const series = r.klines5m.data.map((k: any) => {
      const vol = +k[5], buyVol = +k[9], sellVol = vol - buyVol, delta = buyVol - sellVol
      cumDelta += delta
      return { ts: k[0], close: +k[4], delta: +delta.toFixed(3), cvd: +cumDelta.toFixed(3) }
    })
    const recent = series.slice(-12)
    const older = series.slice(-24, -12)
    const recentDelta = recent.reduce((s: number, c: any) => s + c.delta, 0)
    const olderDelta = older.reduce((s: number, c: any) => s + c.delta, 0)
    const priceChange = series[series.length - 1].close - series[0].close
    const divergence = (cumDelta > 0 && priceChange < 0) || (cumDelta < 0 && priceChange > 0)
    let trend = 'neutral'
    if (recentDelta > 0 && recentDelta > olderDelta) trend = 'accelerating_buy'
    else if (recentDelta > 0) trend = 'buying'
    else if (recentDelta < 0 && recentDelta < olderDelta) trend = 'accelerating_sell'
    else if (recentDelta < 0) trend = 'selling'
    cvd = { cvd: +cumDelta.toFixed(1), trend, recentDelta1h: +recentDelta.toFixed(1), divergence, divergenceType: divergence ? (cumDelta > 0 ? 'bullish_divergence' : 'bearish_divergence') : 'none', series: series.slice(-12) }
  }

  // Volume Profile from 1m klines
  let volumeProfile: any = null
  if (r.klines1m?.ok) {
    const bucketSize = 100
    const buckets: Record<number, { price: number; vol: number; buyVol: number; sellVol: number; delta: number }> = {}
    for (const k of r.klines1m.data) {
      const high = +k[2], low = +k[3], vol = +k[5], buyVol = +k[9]
      const lowB = Math.floor(low / bucketSize) * bucketSize
      const highB = Math.floor(high / bucketSize) * bucketSize
      const n = Math.max(1, (highB - lowB) / bucketSize + 1)
      for (let p = lowB; p <= highB; p += bucketSize) {
        if (!buckets[p]) buckets[p] = { price: p, vol: 0, buyVol: 0, sellVol: 0, delta: 0 }
        buckets[p].vol += vol / n
        buckets[p].buyVol += buyVol / n
        buckets[p].sellVol += (vol - buyVol) / n
        buckets[p].delta += (2 * buyVol - vol) / n
      }
    }
    const sorted = Object.values(buckets).sort((a, b) => b.vol - a.vol)
    const poc = sorted[0]
    const allByPrice = Object.values(buckets).sort((a, b) => a.price - b.price)
    const totalVol = sorted.reduce((s, b) => s + b.vol, 0)
    const target = totalVol * 0.7
    const pocIdx = allByPrice.findIndex(b => b.price === poc.price)
    let vaVol = poc.vol, vaHigh = poc.price, vaLow = poc.price, hi = pocIdx + 1, lo = pocIdx - 1
    while (vaVol < target && (hi < allByPrice.length || lo >= 0)) {
      const hiV = hi < allByPrice.length ? allByPrice[hi].vol : 0
      const loV = lo >= 0 ? allByPrice[lo].vol : 0
      if (hiV >= loV && hi < allByPrice.length) { vaVol += allByPrice[hi].vol; vaHigh = allByPrice[hi].price + bucketSize; hi++ }
      else if (lo >= 0) { vaVol += allByPrice[lo].vol; vaLow = allByPrice[lo].price; lo-- }
      else break
    }
    volumeProfile = {
      poc: { price: poc.price, vol: +poc.vol.toFixed(1), delta: +poc.delta.toFixed(1) },
      valueAreaHigh: vaHigh, valueAreaLow: vaLow,
      priceVsVA: price > vaHigh ? 'above_VA' : price < vaLow ? 'below_VA' : 'inside_VA',
      topBuckets: sorted.slice(0, 10).map(b => ({ price: b.price, vol: +b.vol.toFixed(1), delta: +b.delta.toFixed(1), dominance: b.buyVol > b.sellVol ? 'buyers' : 'sellers' })),
    }
  }

  // Large Trades
  let largeTrades: any = null
  if (r.aggTrades?.ok) {
    const trades = r.aggTrades.data
    const large: any[] = []
    let largeBuy = 0, largeSell = 0, totalBuy = 0, totalSell = 0
    for (const t of trades) {
      const qty = +t.q, p = +t.p, isSell = t.m
      if (isSell) totalSell += qty; else totalBuy += qty
      if (qty >= 1.0) {
        large.push({ time: t.T, price: p, qty: +qty.toFixed(4), value: Math.round(qty * p), side: isSell ? 'SELL' : 'BUY', whale: qty >= 5 })
        if (isSell) largeSell += qty; else largeBuy += qty
      }
    }
    largeTrades = {
      count: large.length, whaleCount: large.filter(t => t.whale).length,
      largeBuyVol: +largeBuy.toFixed(3), largeSellVol: +largeSell.toFixed(3),
      netDelta: +(largeBuy - largeSell).toFixed(3),
      pctOfTotal: +((largeBuy + largeSell) / (totalBuy + totalSell) * 100).toFixed(1),
      recent: large.slice(-20).reverse(),
    }
  }

  // Liquidation estimates
  const leverages = [5, 10, 20, 25, 50, 100]
  const liquidations = {
    longLiqs: leverages.map(l => ({ leverage: l, price: +(price * (1 - 0.9 / l)).toFixed(0), distance: (0.9 / l * 100).toFixed(1) + '%' })),
    shortLiqs: leverages.map(l => ({ leverage: l, price: +(price * (1 + 0.9 / l)).toFixed(0), distance: (0.9 / l * 100).toFixed(1) + '%' })),
  }

  // Options
  let options: any = null
  if (r.options?.ok && r.deribitIndex?.ok) {
    const btcPrice = r.deribitIndex.data?.index_price || r.deribitIndex.data?.result?.index_price
    let callOI = 0, putOI = 0
    const strikes: Record<number, { strike: number; callOI: number; putOI: number }> = {}
    const optionsData = Array.isArray(r.options.data) ? r.options.data : (r.options.data?.result || [])
    for (const opt of optionsData) {
      const parts = opt.instrument_name.split('-')
      const strike = +parts[2], type = parts[3], oiVal = opt.open_interest || 0
      if (type === 'C') callOI += oiVal; else putOI += oiVal
      if (oiVal > 100) {
        if (!strikes[strike]) strikes[strike] = { strike, callOI: 0, putOI: 0 }
        if (type === 'C') strikes[strike].callOI += oiVal; else strikes[strike].putOI += oiVal
      }
    }
    let maxPain = btcPrice, minPainVal = Infinity
    for (const s of Object.values(strikes)) {
      const pain = s.callOI * Math.max(0, btcPrice - s.strike) + s.putOI * Math.max(0, s.strike - btcPrice)
      if (pain < minPainVal) { minPainVal = pain; maxPain = s.strike }
    }
    options = {
      pcRatio: +(putOI / (callOI || 1)).toFixed(3), callOI: Math.round(callOI), putOI: Math.round(putOI),
      maxPain,
      topStrikes: Object.values(strikes).sort((a, b) => (b.callOI + b.putOI) - (a.callOI + a.putOI)).slice(0, 8),
    }
  }

  // Fear & Greed
  let fearGreed: any = null
  if (r.fng?.ok) {
    try {
      const fngData = r.fng.data?.data || r.fng.data
      fearGreed = { value: +fngData[0].value, label: fngData[0].value_classification }
    } catch {}
  }

  // Technicals from klines
  let technicals: any = null
  if (r.klines1h?.ok && r.klines4h?.ok && r.klines1d?.ok) {
    technicals = {}
    for (const [key, klines] of [['h1', r.klines1h.data], ['h4', r.klines4h.data], ['d1', r.klines1d.data]] as const) {
      const closes = klines.map((k: any) => +k[4])
      const p = closes[closes.length - 1]
      // EMA
      const ema = (data: number[], period: number) => {
        if (data.length < period) return null
        const k = 2 / (period + 1)
        let e = data.slice(0, period).reduce((s, v) => s + v, 0) / period
        for (let i = period; i < data.length; i++) e = data[i] * k + e * (1 - k)
        return e
      }
      const sma = (data: number[], period: number) => data.length < period ? null : data.slice(-period).reduce((s, v) => s + v, 0) / period
      // RSI
      let gains = 0, losses = 0
      const rsiPeriod = 14
      for (let i = closes.length - rsiPeriod; i < closes.length; i++) {
        const d = closes[i] - closes[i - 1]
        if (d > 0) gains += d; else losses -= d
      }
      const rsi = losses === 0 ? 100 : +(100 - 100 / (1 + gains / rsiPeriod / (losses / rsiPeriod))).toFixed(1)

      // MACD
      const emaFast = ema(closes, 12), emaSlow = ema(closes, 26)
      const macdVal = emaFast && emaSlow ? +(emaFast - emaSlow).toFixed(2) : null
      const prevCloses = closes.slice(0, -1)
      const prevMacd = ema(prevCloses, 12) && ema(prevCloses, 26) ? +(ema(prevCloses, 12)! - ema(prevCloses, 26)!).toFixed(2) : null

      // Trend
      const e9 = ema(closes, 9), e21 = ema(closes, 21), e50 = ema(closes, 50), s200 = sma(closes, 200)
      let bull = 0
      if (p > (e9 || 0)) bull++
      if (p > (e21 || 0)) bull++
      if (e50 && p > e50) bull++
      if (s200 && p > s200) bull++
      if ((e9 || 0) > (e21 || 0)) bull++
      const trend = bull >= 4 ? 'bullish' : bull >= 3 ? 'leaning_bull' : bull <= 1 ? 'bearish' : bull <= 2 ? 'leaning_bear' : 'neutral'

      // S/R
      const candles = klines.map((k: any) => ({ high: +k[2], low: +k[3] }))
      const supports: number[] = [], resistances: number[] = []
      for (let i = 2; i < candles.length - 2; i++) {
        if (candles[i].high > candles[i-1].high && candles[i].high > candles[i-2].high && candles[i].high > candles[i+1].high && candles[i].high > candles[i+2].high)
          resistances.push(+candles[i].high.toFixed(2))
        if (candles[i].low < candles[i-1].low && candles[i].low < candles[i-2].low && candles[i].low < candles[i+1].low && candles[i].low < candles[i+2].low)
          supports.push(+candles[i].low.toFixed(2))
      }

      technicals[key] = {
        rsi, trend, macd: macdVal !== null ? { value: macdVal, rising: prevMacd !== null && macdVal > prevMacd } : null,
        ema9: e9 ? +e9.toFixed(2) : null, ema21: e21 ? +e21.toFixed(2) : null,
        supports: supports.filter(s => s < p).sort((a, b) => b - a).slice(0, 3),
        resistances: resistances.filter(r => r > p).sort((a, b) => a - b).slice(0, 3),
      }
    }
  }

  // ─── Scoring ────────────────────────────────────
  const signals: Record<string, { score: number; confidence: number; reason: string }> = {}

  // Orderbook
  if (orderbook) {
    signals.orderbook = { score: clamp(orderbook.imbalance * 150), confidence: 60, reason: `Imbalance: ${(orderbook.imbalance * 100).toFixed(1)}% ${orderbook.imbalance > 0 ? '(bids)' : '(asks)'}` }
  }
  // Funding
  if (funding) {
    signals.funding = { score: clamp(-funding.rate * 100000 * 2), confidence: 70, reason: `Rate: ${(funding.rate * 100).toFixed(4)}%` }
  }
  // OI
  if (oi) {
    let s = 0
    if (oi.delta4h > 2) s = 30; else if (oi.delta4h > 0.5) s = 15; else if (oi.delta4h < -2) s = -20; else if (oi.delta4h < -0.5) s = -10
    signals.openInterest = { score: clamp(s), confidence: 50, reason: `4h: ${oi.delta4h > 0 ? '+' : ''}${oi.delta4h}% | 24h: ${oi.delta24h > 0 ? '+' : ''}${oi.delta24h}%` }
  }
  // L/S
  if (lsRatio) {
    signals.longShort = { score: clamp((1 - lsRatio.ratio) * 100), confidence: 55, reason: `L/S: ${lsRatio.ratio.toFixed(3)} (${lsRatio.ratio > 1.2 ? 'crowded longs' : lsRatio.ratio < 0.8 ? 'crowded shorts' : 'balanced'})` }
  }
  // Taker
  if (taker) {
    signals.taker = { score: clamp((taker.ratio - 1) * 200), confidence: 65, reason: `B/S: ${taker.ratio.toFixed(3)}` }
  }
  // Options
  if (options) {
    let s = 0
    if (options.pcRatio > 1.0) s += 30; else if (options.pcRatio > 0.7) s += 15; else if (options.pcRatio < 0.4) s -= 20
    if (options.maxPain > price * 1.02) s += 20; else if (options.maxPain < price * 0.98) s -= 20
    signals.options = { score: clamp(s), confidence: 50, reason: `P/C: ${options.pcRatio} | MaxPain: $${options.maxPain.toLocaleString()}` }
  }
  // F&G
  if (fearGreed) {
    let s = 0
    if (fearGreed.value <= 15) s = 60; else if (fearGreed.value <= 25) s = 35; else if (fearGreed.value <= 40) s = 15
    else if (fearGreed.value >= 85) s = -60; else if (fearGreed.value >= 75) s = -35; else if (fearGreed.value >= 60) s = -15
    signals.fearGreed = { score: clamp(s), confidence: 45, reason: `${fearGreed.value} (${fearGreed.label})` }
  }
  // Technicals
  if (technicals) {
    const trendScores: Record<string, number> = { bullish: 30, leaning_bull: 15, neutral: 0, leaning_bear: -15, bearish: -30 }
    let s = 0; const reasons: string[] = []
    for (const [tf, label] of [['h1', '1H'], ['h4', '4H'], ['d1', '1D']]) {
      if (technicals[tf]) { s += trendScores[technicals[tf].trend] || 0; reasons.push(`${label}: ${technicals[tf].trend}`) }
    }
    if (technicals.h4?.rsi < 30) { s += 20; reasons.push('4H RSI oversold') }
    else if (technicals.h4?.rsi > 70) { s -= 20; reasons.push('4H RSI overbought') }
    signals.technicals = { score: clamp(s), confidence: 75, reason: reasons.join(' | ') }
  }
  // CVD
  if (cvd) {
    const trendScores: Record<string, number> = { accelerating_buy: 60, buying: 30, neutral: 0, selling: -30, accelerating_sell: -60 }
    let s = trendScores[cvd.trend] || 0
    if (cvd.divergence) s += cvd.divergenceType === 'bullish_divergence' ? 30 : -30
    signals.cvd = { score: clamp(s), confidence: 75, reason: `${cvd.trend} | CVD: ${cvd.cvd}${cvd.divergence ? ' ⚠ ' + cvd.divergenceType : ''}` }
  }
  // Volume Profile
  if (volumeProfile) {
    let s = 0
    if (volumeProfile.priceVsVA === 'above_VA') s += 20; else if (volumeProfile.priceVsVA === 'below_VA') s -= 20
    if (volumeProfile.poc.delta > 0) s += 10; else s -= 10
    signals.volumeProfile = { score: clamp(s), confidence: 60, reason: `POC $${volumeProfile.poc.price} | ${volumeProfile.priceVsVA} | VA $${volumeProfile.valueAreaLow}-$${volumeProfile.valueAreaHigh}` }
  }
  // Large trades
  if (largeTrades) {
    signals.largeTrades = { score: clamp(largeTrades.netDelta * 15), confidence: 70, reason: `${largeTrades.count} large (${largeTrades.whaleCount} whale) | Net: ${largeTrades.netDelta > 0 ? '+' : ''}${largeTrades.netDelta} BTC` }
  }

  // Composite
  const WEIGHTS: Record<string, number> = {
    orderbook: 0.08, funding: 0.12, openInterest: 0.07, longShort: 0.08, taker: 0.08,
    options: 0.08, fearGreed: 0.06, technicals: 0.13, cvd: 0.10, volumeProfile: 0.06, largeTrades: 0.07,
  }
  let weightedSum = 0, totalWeight = 0, totalConf = 0, active = 0
  for (const [k, s] of Object.entries(signals)) {
    const w = WEIGHTS[k] || 0.07
    if (s.confidence > 0) { weightedSum += s.score * w * (s.confidence / 100); totalWeight += w * (s.confidence / 100); totalConf += s.confidence; active++ }
  }
  const composite = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  const confidence = active > 0 ? Math.round(totalConf / active) : 0
  let bias = 'NEUTRAL'
  if (composite >= 40) bias = 'STRONG BULL'; else if (composite >= 20) bias = 'BULLISH'; else if (composite >= 5) bias = 'LEAN BULL'
  else if (composite <= -40) bias = 'STRONG BEAR'; else if (composite <= -20) bias = 'BEARISH'; else if (composite <= -5) bias = 'LEAN BEAR'

  return {
    timestamp: Date.now(), price, sourcesOk: okCount, sourcesTotal: results.length,
    composite, bias, confidence, signals,
    data: { orderbook, funding, oi, lsRatio, taker, cvd, volumeProfile, largeTrades, liquidations, options, fearGreed, technicals },
  }
}

export async function GET() {
  try {
    if (cachedSnapshot && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedSnapshot)
    }
    const snapshot = await fetchSnapshot()
    cachedSnapshot = snapshot
    cacheTime = Date.now()
    return NextResponse.json(snapshot)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
