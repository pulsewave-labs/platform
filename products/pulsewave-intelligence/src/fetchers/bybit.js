import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { config } from '../config.js'

const agent = new HttpsProxyAgent(config.proxy.url)

async function get(url) {
  const res = await fetch(url, { agent, timeout: 10000 })
  if (!res.ok) throw new Error(`Bybit ${res.status}: ${await res.text()}`)
  const data = await res.json()
  if (data.retCode !== 0) throw new Error(`Bybit error: ${data.retMsg}`)
  return data.result
}

// Bybit orderbook for cross-reference
export async function getOrderbook() {
  const data = await get(`${config.bybitApi}/market/orderbook?category=linear&symbol=BTCUSDT&limit=25`)
  const bids = data.b.map(([p, q]) => ({ price: +p, qty: +q, value: +p * +q }))
  const asks = data.a.map(([p, q]) => ({ price: +p, qty: +q, value: +p * +q }))
  const bidTotal = bids.reduce((s, b) => s + b.value, 0)
  const askTotal = asks.reduce((s, a) => s + a.value, 0)
  const imbalance = (bidTotal - askTotal) / (bidTotal + askTotal)

  return {
    source: 'bybit_orderbook',
    bidTotal: Math.round(bidTotal),
    askTotal: Math.round(askTotal),
    imbalance: +imbalance.toFixed(4),
  }
}

// Bybit funding
export async function getFunding() {
  const data = await get(`${config.bybitApi}/market/tickers?category=linear&symbol=BTCUSDT`)
  const ticker = data.list[0]

  return {
    source: 'bybit_funding',
    fundingRate: +ticker.fundingRate,
    nextFundingTime: +ticker.nextFundingTime,
    openInterest: +ticker.openInterest,
    openInterestValue: +ticker.openInterestValue || +ticker.openInterest * +ticker.lastPrice,
    price: +ticker.lastPrice,
    volume24h: +ticker.volume24h,
    turnover24h: +ticker.turnover24h,
  }
}

// Bybit long/short ratio
export async function getLongShortRatio() {
  const data = await get(`${config.bybitApi}/market/account-ratio?category=linear&symbol=BTCUSDT&period=1h&limit=1`)
  const latest = data.list[0]

  return {
    source: 'bybit_lsratio',
    buyRatio: +latest.buyRatio,
    sellRatio: +latest.sellRatio,
    ratio: +(+latest.buyRatio / +latest.sellRatio).toFixed(4),
    timestamp: +latest.timestamp
  }
}
