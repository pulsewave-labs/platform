import fetch from 'node-fetch'
import { config } from '../config.js'

async function get(path) {
  const res = await fetch(`${config.deribitApi}${path}`, { timeout: 10000 })
  if (!res.ok) throw new Error(`Deribit ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.result
}

// BTC options overview
export async function getOptionsData() {
  // Get BTC index price
  const index = await get('/get_index_price?index_name=btc_usd')
  const btcPrice = index.index_price

  // Get book summary for BTC options
  const summary = await get('/get_book_summary_by_currency?currency=BTC&kind=option')

  let totalCallOI = 0, totalPutOI = 0
  let totalCallVolume = 0, totalPutVolume = 0
  const strikes = {}

  for (const opt of summary) {
    const name = opt.instrument_name // BTC-28MAR26-70000-C
    const parts = name.split('-')
    const strike = +parts[2]
    const type = parts[3] // C or P
    const oi = opt.open_interest || 0
    const vol = opt.volume_usd || 0

    if (type === 'C') {
      totalCallOI += oi
      totalCallVolume += vol
    } else {
      totalPutOI += oi
      totalPutVolume += vol
    }

    // Track significant strikes
    if (oi > 100) {
      if (!strikes[strike]) strikes[strike] = { strike, callOI: 0, putOI: 0 }
      if (type === 'C') strikes[strike].callOI += oi
      else strikes[strike].putOI += oi
    }
  }

  // Sort strikes by total OI
  const topStrikes = Object.values(strikes)
    .map(s => ({ ...s, totalOI: s.callOI + s.putOI }))
    .sort((a, b) => b.totalOI - a.totalOI)
    .slice(0, 10)

  // Estimate max pain — strike with least payout to option sellers
  // Simplified: strike closest to where call OI ≈ put OI weighted
  let maxPain = btcPrice
  let minPain = Infinity
  for (const s of Object.values(strikes)) {
    const painAtStrike = s.callOI * Math.max(0, btcPrice - s.strike) +
                          s.putOI * Math.max(0, s.strike - btcPrice)
    if (painAtStrike < minPain) {
      minPain = painAtStrike
      maxPain = s.strike
    }
  }

  const pcRatio = totalPutOI / (totalCallOI || 1)

  return {
    source: 'deribit_options',
    btcPrice,
    totalCallOI: Math.round(totalCallOI),
    totalPutOI: Math.round(totalPutOI),
    pcRatio: +pcRatio.toFixed(3),
    totalCallVolume: Math.round(totalCallVolume),
    totalPutVolume: Math.round(totalPutVolume),
    maxPain,
    topStrikes,
  }
}

// IV and term structure
export async function getVolatility() {
  const data = await get('/get_historical_volatility?currency=BTC')
  const recent = data.slice(-7) // last 7 data points

  return {
    source: 'deribit_volatility',
    current: recent[recent.length - 1]?.[1],
    history: recent.map(([ts, vol]) => ({ ts, vol: +vol.toFixed(2) }))
  }
}
