// Scoring engine — each data source gets a score from -100 (max bearish) to +100 (max bullish)

function clamp(val, min = -100, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)))
}

function scoreOrderbook(binance, bybit) {
  if (binance?.error && bybit?.error) return { score: 0, confidence: 0, reason: 'no data' }

  // Average imbalance from both exchanges
  const imbalances = []
  if (!binance?.error) imbalances.push(binance.imbalance)
  if (!bybit?.error) imbalances.push(bybit.imbalance)
  const avgImbalance = imbalances.reduce((s, v) => s + v, 0) / imbalances.length

  // Imbalance is -1 to +1, scale to -100 to +100
  // But orderbook is noisy, so we dampen it
  const score = clamp(avgImbalance * 150)
  const confidence = imbalances.length === 2 ? 60 : 40

  return {
    score,
    confidence,
    reason: `Bid/ask imbalance: ${(avgImbalance * 100).toFixed(1)}% ${avgImbalance > 0 ? '(bids heavier)' : '(asks heavier)'}`
  }
}

function scoreFunding(binance, bybit) {
  if (binance?.error && bybit?.error) return { score: 0, confidence: 0, reason: 'no data' }

  const rates = []
  if (!binance?.error) rates.push(binance.currentRate)
  if (!bybit?.error) rates.push(bybit.fundingRate)
  const avgRate = rates.reduce((s, v) => s + v, 0) / rates.length

  // Negative funding = shorts paying = contrarian bullish
  // Positive funding = longs paying = contrarian bearish
  // Scale: ±0.01% is mild, ±0.05% is extreme
  const score = clamp(-avgRate * 100000 * 2) // flip sign, scale
  const confidence = 70

  let reason = `Funding ${(avgRate * 100).toFixed(4)}%`
  if (avgRate < -0.01) reason += ' (very negative → shorts crowded → bullish)'
  else if (avgRate < 0) reason += ' (negative → lean bullish)'
  else if (avgRate > 0.01) reason += ' (very positive → longs crowded → bearish)'
  else if (avgRate > 0) reason += ' (positive → lean bearish)'
  else reason += ' (neutral)'

  return { score, confidence, reason }
}

function scoreOI(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  // Rising OI + rising price = bullish (new longs)
  // Rising OI + falling price = bearish (new shorts)
  // Falling OI = position closing (less directional)
  // We don't have price direction here, just OI deltas
  // OI rising alone is slightly bullish (money flowing in = conviction)
  const delta4h = data.delta4h || 0

  let score = 0
  if (delta4h > 2) score = 30  // big inflow
  else if (delta4h > 0.5) score = 15
  else if (delta4h < -2) score = -20  // big outflow (deleveraging)
  else if (delta4h < -0.5) score = -10

  return {
    score: clamp(score),
    confidence: 50,
    reason: `OI 4h delta: ${delta4h > 0 ? '+' : ''}${delta4h}% | 24h: ${data.delta24h > 0 ? '+' : ''}${data.delta24h}%`
  }
}

function scoreLSRatio(binance, bybit) {
  if (binance?.error && bybit?.error) return { score: 0, confidence: 0, reason: 'no data' }

  const ratios = []
  if (!binance?.error) ratios.push(binance.globalRatio)
  if (!bybit?.error) ratios.push(bybit.ratio)
  const avgRatio = ratios.reduce((s, v) => s + v, 0) / ratios.length

  // Contrarian: if too many longs → bearish, too many shorts → bullish
  // Ratio > 1 = more longs, < 1 = more shorts
  // Neutral at 1.0, extreme at 0.7 or 1.5
  const score = clamp((1 - avgRatio) * 100)
  const confidence = 55

  return {
    score,
    confidence,
    reason: `L/S ratio ${avgRatio.toFixed(3)} — ${avgRatio > 1.2 ? 'crowded longs (bearish)' : avgRatio < 0.8 ? 'crowded shorts (bullish)' : 'balanced'}`
  }
}

function scoreTaker(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  // Taker buy/sell ratio — direct aggression measure
  const ratio = data.ratio
  const score = clamp((ratio - 1) * 200) // 1.0 = neutral, >1 = buyers aggressive

  return {
    score,
    confidence: 65,
    reason: `Taker B/S ratio: ${ratio.toFixed(3)} | Net delta: ${data.netDelta > 0 ? '+' : ''}$${(data.netDelta / 1e6).toFixed(1)}M`
  }
}

function scoreOptions(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  // Put/Call ratio: high P/C = bearish sentiment (contrarian bullish)
  // Max pain: price tends to gravitate toward max pain by expiry
  const pc = data.pcRatio
  let score = 0

  // P/C contrarian: >0.7 = bearish sentiment = bullish signal
  if (pc > 1.0) score += 30
  else if (pc > 0.7) score += 15
  else if (pc < 0.4) score -= 20
  else if (pc < 0.5) score -= 10

  // Max pain gravity
  if (data.btcPrice && data.maxPain) {
    const diff = (data.maxPain - data.btcPrice) / data.btcPrice * 100
    if (diff > 2) score += 20  // max pain above → upward pull
    else if (diff < -2) score -= 20 // max pain below → downward pull
  }

  return {
    score: clamp(score),
    confidence: 50,
    reason: `P/C ratio: ${pc.toFixed(3)} | Max pain: $${data.maxPain?.toLocaleString() || '?'} | Call OI: ${data.totalCallOI} | Put OI: ${data.totalPutOI}`
  }
}

function scoreFearGreed(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  // Contrarian: extreme fear = bullish, extreme greed = bearish
  const val = data.value
  let score = 0
  if (val <= 15) score = 60       // Extreme fear → strong buy
  else if (val <= 25) score = 35  // Fear → buy
  else if (val <= 40) score = 15
  else if (val >= 85) score = -60 // Extreme greed → strong sell
  else if (val >= 75) score = -35
  else if (val >= 60) score = -15

  return {
    score: clamp(score),
    confidence: 45,
    reason: `Fear & Greed: ${val} (${data.label})`
  }
}

function scoreTechnicals(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  let score = 0
  const reasons = []

  // Multi-timeframe trend alignment
  const trendScores = { bullish: 30, leaning_bull: 15, neutral: 0, leaning_bear: -15, bearish: -30 }
  for (const [tf, label] of [['h1', '1H'], ['h4', '4H'], ['d1', '1D']]) {
    if (data[tf]?.trend) {
      const ts = trendScores[data[tf].trend.trend] || 0
      score += ts
      reasons.push(`${label}: ${data[tf].trend.trend}`)
    }
  }

  // RSI — contrarian at extremes
  const rsi4h = data.h4?.rsi
  if (rsi4h) {
    if (rsi4h < 30) { score += 20; reasons.push(`4H RSI oversold (${rsi4h})`) }
    else if (rsi4h > 70) { score -= 20; reasons.push(`4H RSI overbought (${rsi4h})`) }
  }

  // MACD direction on 4H
  if (data.h4?.macd?.rising) { score += 10; reasons.push('4H MACD rising') }
  else if (data.h4?.macd && !data.h4.macd.rising) { score -= 10; reasons.push('4H MACD falling') }

  return {
    score: clamp(score),
    confidence: 75,
    reason: reasons.join(' | ')
  }
}

function scoreMacro(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  let score = 0
  const reasons = []

  // DXY — inverse correlation with BTC
  if (data.dxy) {
    if (data.dxy.change1d < -0.3) { score += 15; reasons.push(`DXY falling (${data.dxy.change1d}%)`) }
    else if (data.dxy.change1d > 0.3) { score -= 15; reasons.push(`DXY rising (${data.dxy.change1d}%)`) }
  }

  // SPX — risk-on correlation
  if (data.spx) {
    if (data.spx.change1d > 0.5) { score += 10; reasons.push(`SPX up (${data.spx.change1d}%)`) }
    else if (data.spx.change1d < -0.5) { score -= 10; reasons.push(`SPX down (${data.spx.change1d}%)`) }
  }

  // Yields — rising yields bearish for risk assets
  if (data.us10y) {
    if (data.us10y.change1d > 2) { score -= 10; reasons.push(`10Y yield spiking`) }
    else if (data.us10y.change1d < -2) { score += 10; reasons.push(`10Y yield dropping`) }
  }

  return {
    score: clamp(score),
    confidence: 40,
    reason: reasons.join(' | ') || 'macro neutral'
  }
}

function scoreCVD(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  let score = 0
  const reasons = []

  // CVD trend
  const trendScores = {
    accelerating_buy: 60, buying: 30, neutral: 0, selling: -30, accelerating_sell: -60
  }
  score += trendScores[data.trend] || 0
  reasons.push(`CVD trend: ${data.trend}`)

  // Divergence is a powerful signal
  if (data.divergence) {
    if (data.divergenceType === 'bullish_divergence') {
      score += 30
      reasons.push('BULLISH DIVERGENCE (CVD up, price down)')
    } else {
      score -= 30
      reasons.push('BEARISH DIVERGENCE (CVD down, price up)')
    }
  }

  return {
    score: clamp(score),
    confidence: 75,
    reason: reasons.join(' | ') + ` | CVD: ${data.cvd > 0 ? '+' : ''}${data.cvd.toFixed(1)}`
  }
}

function scoreVolumeProfile(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  let score = 0
  const reasons = []

  // Price vs Value Area
  if (data.priceVsVA === 'above_VA') {
    score += 20 // breakout above value = bullish
    reasons.push('Price above Value Area (breakout)')
  } else if (data.priceVsVA === 'below_VA') {
    score -= 20 // breakdown below value = bearish
    reasons.push('Price below Value Area (breakdown)')
  } else {
    reasons.push('Price inside Value Area')
  }

  // POC delta — who dominated at the most-traded price
  if (data.poc.delta > 0) {
    score += 10
    reasons.push(`POC $${data.poc.price} buyer dominated`)
  } else {
    score -= 10
    reasons.push(`POC $${data.poc.price} seller dominated`)
  }

  return {
    score: clamp(score),
    confidence: 60,
    reason: reasons.join(' | ') + ` | VA: $${data.valueAreaLow}-$${data.valueAreaHigh}`
  }
}

function scoreLargeTrades(data) {
  if (data?.error) return { score: 0, confidence: 0, reason: 'no data' }

  const netDelta = data.largeNetDelta
  // Large trades net delta — whales buying or selling
  const score = clamp(netDelta * 15) // scale: ±5 BTC net = significant

  const side = netDelta > 0 ? 'net buying' : 'net selling'
  return {
    score,
    confidence: 70,
    reason: `Large trades: ${data.largeTrades} (${data.whaleTrades} whale) | ${side} ${Math.abs(netDelta).toFixed(1)} BTC | ${data.largeToTotal}% of volume`
  }
}

// Weights for final composite
const WEIGHTS = {
  orderbook: 0.08,
  funding: 0.12,
  openInterest: 0.07,
  longShort: 0.08,
  taker: 0.08,
  options: 0.08,
  fearGreed: 0.06,
  technicals: 0.13,
  macro: 0.07,
  cvd: 0.10,
  volumeProfile: 0.06,
  largeTrades: 0.07,
}

export function scoreAll(snapshot) {
  const d = snapshot.data

  const scores = {
    orderbook: scoreOrderbook(d.binanceOrderbook, d.bybitOrderbook),
    funding: scoreFunding(d.binanceFunding, d.bybitFunding),
    openInterest: scoreOI(d.binanceOI),
    longShort: scoreLSRatio(d.binanceLSRatio, d.bybitLSRatio),
    taker: scoreTaker(d.binanceTaker),
    options: scoreOptions(d.options),
    fearGreed: scoreFearGreed(d.fearGreed),
    technicals: scoreTechnicals(d.technicals),
    macro: scoreMacro(d.macro),
    cvd: scoreCVD(d.cvd),
    volumeProfile: scoreVolumeProfile(d.volumeProfile),
    largeTrades: scoreLargeTrades(d.largeTrades),
  }

  // Weighted composite
  let weightedSum = 0
  let totalWeight = 0
  let totalConfidence = 0
  let activeSignals = 0

  for (const [key, s] of Object.entries(scores)) {
    const w = WEIGHTS[key] || 0.1
    if (s.confidence > 0) {
      weightedSum += s.score * w * (s.confidence / 100)
      totalWeight += w * (s.confidence / 100)
      totalConfidence += s.confidence
      activeSignals++
    }
  }

  const composite = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  const avgConfidence = activeSignals > 0 ? Math.round(totalConfidence / activeSignals) : 0

  let bias = 'NEUTRAL'
  if (composite >= 40) bias = 'STRONG BULL'
  else if (composite >= 20) bias = 'BULLISH'
  else if (composite >= 5) bias = 'LEAN BULL'
  else if (composite <= -40) bias = 'STRONG BEAR'
  else if (composite <= -20) bias = 'BEARISH'
  else if (composite <= -5) bias = 'LEAN BEAR'

  return {
    composite,
    bias,
    confidence: avgConfidence,
    signals: scores,
    weights: WEIGHTS,
    timestamp: snapshot.timestamp,
    price: snapshot.price,
  }
}
