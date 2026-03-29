// Calculate technicals from kline data — no external dependency

function sma(data, period) {
  if (data.length < period) return null
  return data.slice(-period).reduce((s, v) => s + v, 0) / period
}

function ema(data, period) {
  if (data.length < period) return null
  const k = 2 / (period + 1)
  let ema = sma(data.slice(0, period), period)
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k)
  }
  return ema
}

function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null
  let gains = 0, losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return +(100 - 100 / (1 + rs)).toFixed(1)
}

function bollingerBands(closes, period = 20, mult = 2) {
  if (closes.length < period) return null
  const slice = closes.slice(-period)
  const mid = slice.reduce((s, v) => s + v, 0) / period
  const std = Math.sqrt(slice.reduce((s, v) => s + (v - mid) ** 2, 0) / period)
  return {
    upper: +(mid + mult * std).toFixed(2),
    mid: +mid.toFixed(2),
    lower: +(mid - mult * std).toFixed(2),
    bandwidth: +((mult * 2 * std) / mid * 100).toFixed(2),
    percentB: +((closes[closes.length - 1] - (mid - mult * std)) / (mult * 2 * std) * 100).toFixed(1)
  }
}

function macd(closes, fast = 12, slow = 26, signal = 9) {
  if (closes.length < slow + signal) return null
  const emaFast = ema(closes, fast)
  const emaSlow = ema(closes, slow)
  const macdLine = emaFast - emaSlow

  // Simplified — just current MACD value and direction
  const prevCloses = closes.slice(0, -1)
  const prevEmaFast = ema(prevCloses, fast)
  const prevEmaSlow = ema(prevCloses, slow)
  const prevMacd = prevEmaFast - prevEmaSlow

  return {
    value: +macdLine.toFixed(2),
    prev: +prevMacd.toFixed(2),
    rising: macdLine > prevMacd,
    positive: macdLine > 0,
  }
}

// Determine trend from EMAs
function trendStructure(closes) {
  const price = closes[closes.length - 1]
  const ema9 = ema(closes, 9)
  const ema21 = ema(closes, 21)
  const ema50 = ema(closes, 50)
  const sma200 = sma(closes, 200)

  let bullCount = 0
  if (price > ema9) bullCount++
  if (price > ema21) bullCount++
  if (ema50 && price > ema50) bullCount++
  if (sma200 && price > sma200) bullCount++
  if (ema9 > ema21) bullCount++

  let trend = 'neutral'
  if (bullCount >= 4) trend = 'bullish'
  else if (bullCount >= 3) trend = 'leaning_bull'
  else if (bullCount <= 1) trend = 'bearish'
  else if (bullCount <= 2) trend = 'leaning_bear'

  return {
    trend,
    bullScore: bullCount,
    price: +price.toFixed(2),
    ema9: ema9 ? +ema9.toFixed(2) : null,
    ema21: ema21 ? +ema21.toFixed(2) : null,
    ema50: ema50 ? +ema50.toFixed(2) : null,
    sma200: sma200 ? +sma200.toFixed(2) : null,
  }
}

// Find support/resistance from recent pivots
function findSR(candles, lookback = 20) {
  const levels = []
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i]
    // Swing high
    if (c.high > candles[i-1].high && c.high > candles[i-2].high &&
        c.high > candles[i+1].high && c.high > candles[i+2].high) {
      levels.push({ type: 'resistance', price: c.high, ts: c.ts })
    }
    // Swing low
    if (c.low < candles[i-1].low && c.low < candles[i-2].low &&
        c.low < candles[i+1].low && c.low < candles[i+2].low) {
      levels.push({ type: 'support', price: c.low, ts: c.ts })
    }
  }

  // Get the most recent levels
  const currentPrice = candles[candles.length - 1].close
  const supports = levels.filter(l => l.price < currentPrice).sort((a, b) => b.price - a.price).slice(0, 3)
  const resistances = levels.filter(l => l.price > currentPrice).sort((a, b) => a.price - b.price).slice(0, 3)

  return {
    supports: supports.map(s => +s.price.toFixed(2)),
    resistances: resistances.map(r => +r.price.toFixed(2)),
  }
}

export function calculateTechnicals(candles1h, candles4h, candles1d) {
  const closes1h = candles1h.map(c => c.close)
  const closes4h = candles4h.map(c => c.close)
  const closes1d = candles1d.map(c => c.close)

  return {
    source: 'technicals',
    h1: {
      rsi: rsi(closes1h),
      bb: bollingerBands(closes1h),
      macd: macd(closes1h),
      trend: trendStructure(closes1h),
      sr: findSR(candles1h),
    },
    h4: {
      rsi: rsi(closes4h),
      bb: bollingerBands(closes4h),
      macd: macd(closes4h),
      trend: trendStructure(closes4h),
      sr: findSR(candles4h),
    },
    d1: {
      rsi: rsi(closes1d),
      bb: bollingerBands(closes1d),
      macd: macd(closes1d),
      trend: trendStructure(closes1d),
      sr: findSR(candles1d),
    }
  }
}
