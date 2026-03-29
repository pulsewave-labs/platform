import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { config } from '../config.js'

const agent = new HttpsProxyAgent(config.proxy.url)
const opts = { agent, timeout: 15000 }

async function get(url) {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(`Binance ${res.status}: ${url}`)
  return res.json()
}

// ─── Cumulative Volume Delta (CVD) ─────────────────────────
// Uses klines buyVol vs totalVol to compute delta per candle
export async function getCVD() {
  // 5min candles for granular CVD over last 4 hours (48 candles)
  const klines = await get(`${config.binanceFapi}/klines?symbol=BTCUSDT&interval=5m&limit=48`)

  let cvd = 0
  const series = []

  for (const k of klines) {
    const totalVol = +k[5]       // total volume
    const buyVol = +k[9]         // taker buy volume
    const sellVol = totalVol - buyVol
    const delta = buyVol - sellVol
    cvd += delta

    series.push({
      ts: k[0],
      open: +k[1],
      close: +k[4],
      volume: totalVol,
      buyVol,
      sellVol,
      delta: +delta.toFixed(3),
      cvd: +cvd.toFixed(3),
    })
  }

  // CVD trend — is it rising or falling?
  const recent = series.slice(-12) // last hour
  const older = series.slice(-24, -12) // hour before
  const recentCVD = recent.reduce((s, c) => s + c.delta, 0)
  const olderCVD = older.reduce((s, c) => s + c.delta, 0)

  // Price vs CVD divergence
  const priceChange = series[series.length - 1].close - series[0].close
  const cvdDirection = cvd > 0 ? 'positive' : 'negative'
  const priceDirection = priceChange > 0 ? 'up' : 'down'
  const divergence = (cvdDirection === 'positive' && priceDirection === 'down') ||
                     (cvdDirection === 'negative' && priceDirection === 'up')

  // CVD trend label
  let trend = 'neutral'
  if (recentCVD > 0 && recentCVD > olderCVD) trend = 'accelerating_buy'
  else if (recentCVD > 0) trend = 'buying'
  else if (recentCVD < 0 && recentCVD < olderCVD) trend = 'accelerating_sell'
  else if (recentCVD < 0) trend = 'selling'

  return {
    source: 'cvd',
    cvd: +cvd.toFixed(3),
    trend,
    recentDelta1h: +recentCVD.toFixed(3),
    prevDelta1h: +olderCVD.toFixed(3),
    priceChange: +priceChange.toFixed(2),
    divergence,
    divergenceType: divergence ? (cvd > 0 ? 'bullish_divergence' : 'bearish_divergence') : 'none',
    series: series.slice(-12), // last 1h for charting
  }
}

// ─── Volume Profile ($100 buckets) ─────────────────────────
// Groups volume by price level to find POC, value area, etc.
export async function getVolumeProfile() {
  // 1min candles for last 4 hours = 240 candles
  const klines = await get(`${config.binanceFapi}/klines?symbol=BTCUSDT&interval=1m&limit=240`)

  const bucketSize = 100 // $100 price buckets
  const buckets = {}

  for (const k of klines) {
    const high = +k[2]
    const low = +k[3]
    const vol = +k[5]
    const buyVol = +k[9]
    const sellVol = vol - buyVol

    // Distribute volume across price buckets the candle touched
    const lowBucket = Math.floor(low / bucketSize) * bucketSize
    const highBucket = Math.floor(high / bucketSize) * bucketSize
    const numBuckets = Math.max(1, (highBucket - lowBucket) / bucketSize + 1)
    const volPerBucket = vol / numBuckets
    const buyPerBucket = buyVol / numBuckets
    const sellPerBucket = sellVol / numBuckets

    for (let price = lowBucket; price <= highBucket; price += bucketSize) {
      if (!buckets[price]) buckets[price] = { price, vol: 0, buyVol: 0, sellVol: 0, delta: 0 }
      buckets[price].vol += volPerBucket
      buckets[price].buyVol += buyPerBucket
      buckets[price].sellVol += sellPerBucket
      buckets[price].delta += (buyPerBucket - sellPerBucket)
    }
  }

  const sorted = Object.values(buckets).sort((a, b) => b.vol - a.vol)

  // POC — Point of Control (highest volume price)
  const poc = sorted[0]

  // Value Area — 70% of total volume centered on POC
  const totalVol = sorted.reduce((s, b) => s + b.vol, 0)
  const targetVol = totalVol * 0.7
  const allByPrice = Object.values(buckets).sort((a, b) => a.price - b.price)
  const pocIdx = allByPrice.findIndex(b => b.price === poc.price)

  let vaVol = poc.vol
  let vaHigh = poc.price
  let vaLow = poc.price
  let hi = pocIdx + 1
  let lo = pocIdx - 1

  while (vaVol < targetVol && (hi < allByPrice.length || lo >= 0)) {
    const hiVol = hi < allByPrice.length ? allByPrice[hi].vol : 0
    const loVol = lo >= 0 ? allByPrice[lo].vol : 0
    if (hiVol >= loVol && hi < allByPrice.length) {
      vaVol += allByPrice[hi].vol
      vaHigh = allByPrice[hi].price + bucketSize
      hi++
    } else if (lo >= 0) {
      vaVol += allByPrice[lo].vol
      vaLow = allByPrice[lo].price
      lo--
    } else break
  }

  const currentPrice = +klines[klines.length - 1][4]

  return {
    source: 'volume_profile',
    poc: { price: poc.price, vol: +poc.vol.toFixed(3), delta: +poc.delta.toFixed(3) },
    valueAreaHigh: vaHigh,
    valueAreaLow: vaLow,
    currentPrice,
    priceVsPOC: currentPrice > poc.price ? 'above' : currentPrice < poc.price ? 'below' : 'at',
    priceVsVA: currentPrice > vaHigh ? 'above_VA' : currentPrice < vaLow ? 'below_VA' : 'inside_VA',
    topBuckets: sorted.slice(0, 10).map(b => ({
      price: b.price,
      vol: +b.vol.toFixed(3),
      delta: +b.delta.toFixed(3),
      dominance: b.buyVol > b.sellVol ? 'buyers' : 'sellers'
    })),
    bucketSize,
  }
}

// ─── Large Trade Detection ─────────────────────────────────
// Fetches recent aggTrades and finds whale prints
export async function getLargeTrades() {
  // Get recent agg trades (last 1000)
  const trades = await get(`${config.binanceFapi}/aggTrades?symbol=BTCUSDT&limit=1000`)

  const threshold = 1.0 // BTC — trades >= 1 BTC are "large"
  const whaleThreshold = 5.0 // trades >= 5 BTC are "whale"

  const large = []
  let totalBuyVol = 0
  let totalSellVol = 0
  let largeBuyVol = 0
  let largeSellVol = 0

  for (const t of trades) {
    const qty = +t.q
    const price = +t.p
    const isSell = t.m // maker is buyer = taker is seller
    const value = qty * price

    if (isSell) totalSellVol += qty
    else totalBuyVol += qty

    if (qty >= threshold) {
      const trade = {
        time: t.T,
        price,
        qty: +qty.toFixed(4),
        value: Math.round(value),
        side: isSell ? 'SELL' : 'BUY',
        whale: qty >= whaleThreshold,
      }
      large.push(trade)

      if (isSell) largeSellVol += qty
      else largeBuyVol += qty
    }
  }

  // Time range of the sample
  const timeSpanMs = trades.length > 1 ? trades[trades.length - 1].T - trades[0].T : 0
  const timeSpanMin = Math.round(timeSpanMs / 60000)

  return {
    source: 'large_trades',
    totalTrades: trades.length,
    timeSpanMin,
    largeTrades: large.length,
    whaleTrades: large.filter(t => t.whale).length,
    largeBuyVol: +largeBuyVol.toFixed(3),
    largeSellVol: +largeSellVol.toFixed(3),
    largeNetDelta: +(largeBuyVol - largeSellVol).toFixed(3),
    totalBuyVol: +totalBuyVol.toFixed(3),
    totalSellVol: +totalSellVol.toFixed(3),
    largeToTotal: +((largeBuyVol + largeSellVol) / (totalBuyVol + totalSellVol) * 100).toFixed(1),
    recentLarge: large.slice(-20).reverse(), // most recent 20
  }
}

// ─── Liquidation Estimates ─────────────────────────────────
// Estimate where liquidations cluster based on OI + leverage assumptions
export async function getLiquidationEstimates() {
  const [ticker, oi] = await Promise.all([
    get(`${config.binanceFapi}/premiumIndex?symbol=BTCUSDT`),
    get(`${config.binanceFapi}/openInterest?symbol=BTCUSDT`),
  ])

  const price = +ticker.markPrice
  const openInterest = +oi.openInterest

  // Estimate liquidation clusters at common leverage levels
  // Long liquidations = price * (1 - 1/leverage) — approx
  // Short liquidations = price * (1 + 1/leverage) — approx
  const leverages = [5, 10, 20, 25, 50, 100]

  const longLiqs = leverages.map(lev => ({
    leverage: lev,
    price: +(price * (1 - 0.9 / lev)).toFixed(2), // ~90% of margin wiped
    distance: +((0.9 / lev) * 100).toFixed(1) + '%',
  }))

  const shortLiqs = leverages.map(lev => ({
    leverage: lev,
    price: +(price * (1 + 0.9 / lev)).toFixed(2),
    distance: +((0.9 / lev) * 100).toFixed(1) + '%',
  }))

  return {
    source: 'liquidation_estimates',
    currentPrice: price,
    openInterest,
    longLiquidations: longLiqs,
    shortLiquidations: shortLiqs,
    nearestLongLiq: longLiqs[longLiqs.length - 1], // highest leverage = nearest
    nearestShortLiq: shortLiqs[shortLiqs.length - 1],
  }
}
