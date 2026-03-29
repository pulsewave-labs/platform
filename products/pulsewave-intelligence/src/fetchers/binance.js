import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { config } from '../config.js'

const agent = new HttpsProxyAgent(config.proxy.url)
const opts = { agent, timeout: 10000 }

async function get(url) {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(`Binance ${res.status}: ${await res.text()}`)
  return res.json()
}

// Orderbook depth — top 20 levels
export async function getOrderbook() {
  const data = await get(`${config.binanceFapi}/depth?symbol=BTCUSDT&limit=20`)
  const bids = data.bids.map(([p, q]) => ({ price: +p, qty: +q, value: +p * +q }))
  const asks = data.asks.map(([p, q]) => ({ price: +p, qty: +q, value: +p * +q }))
  const bidTotal = bids.reduce((s, b) => s + b.value, 0)
  const askTotal = asks.reduce((s, a) => s + a.value, 0)
  const imbalance = (bidTotal - askTotal) / (bidTotal + askTotal) // -1 to +1

  return {
    source: 'binance_orderbook',
    bidTotal: Math.round(bidTotal),
    askTotal: Math.round(askTotal),
    imbalance: +imbalance.toFixed(4),
    topBid: bids[0].price,
    topAsk: asks[0].price,
    spread: +(asks[0].price - bids[0].price).toFixed(2),
    depth20: { bids: bids.slice(0, 5), asks: asks.slice(0, 5) }
  }
}

// Funding rate — current + recent history
export async function getFunding() {
  const [current, history] = await Promise.all([
    get(`${config.binanceFapi}/premiumIndex?symbol=BTCUSDT`),
    get(`${config.binanceFapi}/fundingRate?symbol=BTCUSDT&limit=8`)
  ])

  const rates = history.map(h => +h.fundingRate)
  const avg8h = rates.reduce((s, r) => s + r, 0) / rates.length

  return {
    source: 'binance_funding',
    currentRate: +current.lastFundingRate,
    nextFundingTime: +current.nextFundingTime,
    markPrice: +current.markPrice,
    indexPrice: +current.indexPrice,
    avg8hRate: +avg8h.toFixed(8),
    recentRates: rates,
    premium: +(+current.markPrice - +current.indexPrice).toFixed(2)
  }
}

// Open Interest — current + change
export async function getOpenInterest() {
  const [current, history] = await Promise.all([
    get(`${config.binanceFapi}/openInterest?symbol=BTCUSDT`),
    get(`https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=5m&limit=288`) // 24h of 5min
  ])

  const currentOI = +current.openInterest
  const hist = history.map(h => ({ ts: h.timestamp, oi: +h.sumOpenInterest, val: +h.sumOpenInterestValue }))

  // Calculate deltas
  const now = hist[hist.length - 1]
  const h1 = hist[Math.max(0, hist.length - 13)] // ~1h ago
  const h4 = hist[Math.max(0, hist.length - 49)] // ~4h ago
  const h24 = hist[0] // 24h ago

  return {
    source: 'binance_oi',
    currentOI,
    currentValueUSD: now?.val || 0,
    delta1h: now && h1 ? +((now.val - h1.val) / h1.val * 100).toFixed(2) : 0,
    delta4h: now && h4 ? +((now.val - h4.val) / h4.val * 100).toFixed(2) : 0,
    delta24h: now && h24 ? +((now.val - h24.val) / h24.val * 100).toFixed(2) : 0,
  }
}

// Long/Short ratio
export async function getLongShortRatio() {
  const base = 'https://fapi.binance.com/futures/data'
  const [global, topTrader, topPosition] = await Promise.all([
    get(`${base}/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1`),
    get(`${base}/topLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1`),
    get(`${base}/topLongShortPositionRatio?symbol=BTCUSDT&period=5m&limit=1`),
  ])

  return {
    source: 'binance_lsratio',
    globalRatio: +global[0].longShortRatio,
    globalLong: +(global[0].longAccount * 100).toFixed(1),
    globalShort: +(global[0].shortAccount * 100).toFixed(1),
    topTraderRatio: +topTrader[0].longShortRatio,
    topPositionRatio: +topPosition[0].longShortRatio,
  }
}

// Klines for technical calculations
export async function getKlines(interval = '1h', limit = 100) {
  const data = await get(`${config.binanceFapi}/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`)
  return data.map(k => ({
    ts: k[0],
    open: +k[1],
    high: +k[2],
    low: +k[3],
    close: +k[4],
    volume: +k[5],
    closeTs: k[6],
    quoteVol: +k[7],
    trades: k[8],
    buyVol: +k[9],
    buyQuoteVol: +k[10]
  }))
}

// Taker buy/sell volume
export async function getTakerVolume() {
  const data = await get(`https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=5m&limit=12`) // 1h
  const buyVol = data.reduce((s, d) => s + +d.buyVol, 0)
  const sellVol = data.reduce((s, d) => s + +d.sellVol, 0)

  return {
    source: 'binance_taker',
    buyVol: Math.round(buyVol),
    sellVol: Math.round(sellVol),
    ratio: +(buyVol / sellVol).toFixed(4),
    netDelta: Math.round(buyVol - sellVol),
  }
}
