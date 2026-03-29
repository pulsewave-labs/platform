import fetch from 'node-fetch'
import { config } from '../config.js'

// Fear & Greed Index
export async function getFearGreed() {
  const res = await fetch(`${config.fngApi}/?limit=7`, { timeout: 10000 })
  const data = await res.json()
  const current = data.data[0]
  const history = data.data.map(d => ({
    value: +d.value,
    label: d.value_classification,
    ts: +d.timestamp * 1000
  }))

  return {
    source: 'fear_greed',
    value: +current.value,
    label: current.value_classification,
    history
  }
}

// Yahoo Finance for macro data (DXY, SPX, 10Y yield)
async function getYahooQuote(symbol) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const result = data.chart.result?.[0]
    if (!result) return null

    const closes = result.indicators.quote[0].close.filter(c => c !== null)
    const current = closes[closes.length - 1]
    const prev = closes[closes.length - 2]
    const change = prev ? ((current - prev) / prev * 100) : 0

    return {
      price: +current.toFixed(4),
      change1d: +change.toFixed(2),
      prices5d: closes.map(c => +c.toFixed(4))
    }
  } catch (e) {
    console.warn(`Yahoo ${symbol} failed:`, e.message)
    return null
  }
}

export async function getMacro() {
  const [dxy, spx, tnx, gold] = await Promise.all([
    getYahooQuote('DX-Y.NYB'),     // DXY
    getYahooQuote('^GSPC'),         // S&P 500
    getYahooQuote('^TNX'),          // 10Y yield
    getYahooQuote('GC=F'),          // Gold futures
  ])

  return {
    source: 'macro',
    dxy,
    spx,
    us10y: tnx,
    gold,
  }
}
