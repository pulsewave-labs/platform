import { NextResponse } from 'next/server'
import { HttpsProxyAgent } from 'https-proxy-agent'
import nodeFetch from 'node-fetch'

const PROXY_URL = 'http://masonboroff:UQdolU8%3Dg808@ddc.oxylabs.io:8001'
const proxyAgent = new HttpsProxyAgent(PROXY_URL)
const BINANCE_FAPI = 'https://fapi.binance.com/fapi/v1'
const BINANCE_DATA = 'https://fapi.binance.com/futures/data'
const BYBIT_API = 'https://api.bybit.com/v5'
const DERIBIT_API = 'https://www.deribit.com/api/v2/public'
const FNG_API = 'https://api.alternative.me/fng'
const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const BLOCKCHAIR_API = 'https://api.blockchair.com/bitcoin'
const YAHOO_API = 'https://query1.finance.yahoo.com/v8/finance/chart'

// Cache: store last snapshot, refresh if older than 2 min
let cachedSnapshot: any = null
let cacheTime = 0
const CACHE_TTL = 2 * 60 * 1000

async function proxyFetch(url: string) {
  const needsProxy = url.includes('binance.com') || url.includes('bybit.com')

  if (needsProxy) {
    const res = await nodeFetch(url, { agent: proxyAgent, timeout: 12000 })
    if (!res.ok) throw new Error(`proxy-${res.status}`)
    return res.json()
  }

  const res = await nodeFetch(url, { timeout: 10000 })
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
    // Deribit options flow (recent large trades)
    safeFetch('deribitTrades', `${DERIBIT_API}/get_last_trades_by_currency?currency=BTC&kind=option&count=100`),
    // ETH klines for correlation
    safeFetch('ethKlines', `${BINANCE_FAPI}/klines?symbol=ETHUSDT&interval=1h&limit=168`),
    // CME BTC futures
    safeFetch('cmeBtc', `${YAHOO_API}/BTC=F?interval=1d&range=5d`),
    // Stablecoin market caps
    safeFetch('usdt', `${COINGECKO_API}/coins/tether?localization=false&tickers=false&community_data=false&developer_data=false`),
    safeFetch('usdc', `${COINGECKO_API}/coins/usd-coin?localization=false&tickers=false&community_data=false&developer_data=false`),
    // On-chain: large BTC transactions
    safeFetch('onchain', `${BLOCKCHAIR_API}/transactions?s=output_total(desc)&limit=10`),
    // Macro
    safeFetch('fng', `${FNG_API}/?limit=7`),
    safeFetch('dxy', `${YAHOO_API}/DX-Y.NYB?interval=1h&range=7d`),
    safeFetch('spx', `${YAHOO_API}/^GSPC?interval=1h&range=7d`),
    safeFetch('gold', `${YAHOO_API}/GC=F?interval=1h&range=7d`),
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

  // ─── NEW: Options Flow (large Deribit trades) ──────
  let optionsFlow: any = null
  if (r.deribitTrades?.ok) {
    try {
      const trades = r.deribitTrades.data?.result?.trades || []
      const largeTrades2 = trades.filter((t: any) => (t.amount || 0) * (t.price || 0) > 50000) // >$50K notional approx
      const bullFlow = largeTrades2.filter((t: any) => {
        const isCall = t.instrument_name?.includes('-C')
        const isBuy = t.direction === 'buy'
        return (isCall && isBuy) || (!isCall && !isBuy) // buy calls or sell puts = bullish
      })
      const bearFlow = largeTrades2.filter((t: any) => {
        const isCall = t.instrument_name?.includes('-C')
        const isBuy = t.direction === 'buy'
        return (!isCall && isBuy) || (isCall && !isBuy) // buy puts or sell calls = bearish
      })
      optionsFlow = {
        totalLarge: largeTrades2.length,
        bullish: bullFlow.length, bearish: bearFlow.length,
        netFlow: bullFlow.length - bearFlow.length,
        recent: largeTrades2.slice(0, 10).map((t: any) => ({
          instrument: t.instrument_name, direction: t.direction,
          amount: t.amount, price: t.price, iv: t.iv,
          ts: t.timestamp,
        }))
      }
    } catch {}
  }

  // ─── NEW: Funding Differential ────────────────────
  let fundingDiff: any = null
  if (r.funding?.ok && r.bybitTicker?.ok) {
    try {
      const binanceRate = +r.funding.data.lastFundingRate
      const bybitRate = +r.bybitTicker.data.result.list[0].fundingRate
      const diff = binanceRate - bybitRate
      fundingDiff = {
        binance: binanceRate, bybit: bybitRate,
        diff, absDiff: Math.abs(diff),
        signal: Math.abs(diff) > 0.0003 ? (diff > 0 ? 'binance_higher' : 'bybit_higher') : 'aligned',
      }
    } catch {}
  }

  // ─── NEW: CME Basis + Gap ─────────────────────────
  let cme: any = null
  if (r.cmeBtc?.ok) {
    try {
      const chart = r.cmeBtc.data?.chart?.result?.[0]
      if (chart) {
        const closes = chart.indicators.quote[0].close.filter((c: any) => c !== null)
        const cmeLast = closes[closes.length - 1]
        const cmePrev = closes[closes.length - 2]
        const spot = price || 0
        const basis = spot > 0 ? ((cmeLast - spot) / spot * 100) : 0
        const gap = cmePrev ? cmeLast - cmePrev : 0
        // Friday close vs current = potential gap
        cme = {
          price: +cmeLast.toFixed(2),
          basis: +basis.toFixed(3),
          basisLabel: basis > 0.5 ? 'premium (bullish institutional)' : basis < -0.5 ? 'discount (bearish institutional)' : 'neutral',
          fridayClose: cmePrev ? +cmePrev.toFixed(2) : null,
          gap: gap !== 0 ? +gap.toFixed(2) : null,
          gapFilled: gap !== 0 && Math.abs(spot - cmePrev) < Math.abs(gap) * 0.1,
        }
      }
    } catch {}
  }

  // ─── NEW: Correlations ────────────────────────────
  let correlations: any = null
  try {
    const calcCorrelation = (x: number[], y: number[]) => {
      const n = Math.min(x.length, y.length)
      if (n < 10) return null
      const xSlice = x.slice(-n), ySlice = y.slice(-n)
      const xMean = xSlice.reduce((s, v) => s + v, 0) / n
      const yMean = ySlice.reduce((s, v) => s + v, 0) / n
      let num = 0, denX = 0, denY = 0
      for (let i = 0; i < n; i++) {
        const dx = xSlice[i] - xMean, dy = ySlice[i] - yMean
        num += dx * dy; denX += dx * dx; denY += dy * dy
      }
      const den = Math.sqrt(denX * denY)
      return den === 0 ? 0 : +(num / den).toFixed(3)
    }

    const btcCloses = r.klines1h?.ok ? r.klines1h.data.map((k: any) => +k[4]) : []
    const ethCloses = r.ethKlines?.ok ? r.ethKlines.data.map((k: any) => +k[4]) : []

    const getYahooCloses = (d: any) => {
      try { return d.data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter((c: any) => c !== null) || [] } catch { return [] }
    }
    const dxyCloses = r.dxy?.ok ? getYahooCloses(r.dxy) : []
    const spxCloses = r.spx?.ok ? getYahooCloses(r.spx) : []
    const goldCloses = r.gold?.ok ? getYahooCloses(r.gold) : []

    // Convert to returns for correlation (price changes, not levels)
    const toReturns = (arr: number[]) => arr.slice(1).map((v, i) => (v - arr[i]) / arr[i])

    const btcReturns = toReturns(btcCloses)
    const ethReturns = toReturns(ethCloses)
    const dxyReturns = toReturns(dxyCloses)
    const spxReturns = toReturns(spxCloses)
    const goldReturns = toReturns(goldCloses)

    correlations = {
      ethBtc: calcCorrelation(btcReturns, ethReturns),
      dxyBtc: calcCorrelation(btcReturns, dxyReturns),
      spxBtc: calcCorrelation(btcReturns, spxReturns),
      goldBtc: calcCorrelation(btcReturns, goldReturns),
      period: '7d hourly',
    }
  } catch {}

  // ─── NEW: Stablecoin Supply ───────────────────────
  let stablecoins: any = null
  try {
    const usdtMcap = r.usdt?.ok ? r.usdt.data?.market_data?.market_cap?.usd : null
    const usdtChange24h = r.usdt?.ok ? r.usdt.data?.market_data?.market_cap_change_percentage_24h_in_currency?.usd : null
    const usdcMcap = r.usdc?.ok ? r.usdc.data?.market_data?.market_cap?.usd : null
    const usdcChange24h = r.usdc?.ok ? r.usdc.data?.market_data?.market_cap_change_percentage_24h_in_currency?.usd : null

    if (usdtMcap || usdcMcap) {
      const totalMcap = (usdtMcap || 0) + (usdcMcap || 0)
      // Weighted average change
      const totalChange = usdtMcap && usdcMcap
        ? ((usdtChange24h || 0) * usdtMcap + (usdcChange24h || 0) * usdcMcap) / totalMcap
        : (usdtChange24h || usdcChange24h || 0)

      stablecoins = {
        usdtMcap, usdtChange24h: usdtChange24h ? +usdtChange24h.toFixed(3) : null,
        usdcMcap, usdcChange24h: usdcChange24h ? +usdcChange24h.toFixed(3) : null,
        totalMcap, totalChange: +totalChange.toFixed(3),
        signal: totalChange > 0.1 ? 'minting (bullish)' : totalChange < -0.1 ? 'burning (bearish)' : 'stable',
      }
    }
  } catch {}

  // ─── NEW: On-chain Large Transactions ─────────────
  let onchain: any = null
  if (r.onchain?.ok) {
    try {
      const txs = r.onchain.data?.data || []
      const largeTxs = txs.filter((tx: any) => tx.output_total > 100 * 1e8) // >100 BTC
      onchain = {
        count: largeTxs.length,
        totalBTC: +(largeTxs.reduce((s: number, tx: any) => s + tx.output_total, 0) / 1e8).toFixed(2),
        recent: largeTxs.slice(0, 5).map((tx: any) => ({
          hash: tx.hash?.slice(0, 12),
          btc: +(tx.output_total / 1e8).toFixed(2),
          fee: +(tx.fee / 1e8).toFixed(6),
          ts: tx.time,
        }))
      }
    } catch {}
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
  // Options Flow
  if (optionsFlow && optionsFlow.totalLarge > 0) {
    const s = clamp(optionsFlow.netFlow * 15)
    signals.optionsFlow = { score: s, confidence: 55, reason: `${optionsFlow.bullish} bullish / ${optionsFlow.bearish} bearish large prints` }
  }
  // Funding Differential
  if (fundingDiff && fundingDiff.absDiff > 0.0001) {
    // Big diff = opportunity, direction depends on which is higher
    const s = clamp(fundingDiff.diff * -50000) // contrarian — if Binance higher, shorts crowded there
    signals.fundingDiff = { score: s, confidence: 45, reason: `Binance ${(fundingDiff.binance*100).toFixed(4)}% vs Bybit ${(fundingDiff.bybit*100).toFixed(4)}% (${fundingDiff.signal})` }
  }
  // CME
  if (cme) {
    let s = 0
    if (cme.basis > 0.5) s = 20; else if (cme.basis < -0.5) s = -20
    if (cme.gap && !cme.gapFilled) s += cme.gap > 0 ? -10 : 10 // gap fill pull
    signals.cme = { score: clamp(s), confidence: 50, reason: `Basis: ${cme.basis > 0 ? '+' : ''}${cme.basis}% | ${cme.gap ? 'Gap: $' + cme.gap : 'No gap'}` }
  }
  // Correlations
  if (correlations) {
    let s = 0; const reasons: string[] = []
    // DXY inverse correlation — if BTC-DXY correlation is strongly negative (normal), neutral. If breaking, alert.
    if (correlations.dxyBtc !== null) {
      if (correlations.dxyBtc > 0.3) { s -= 15; reasons.push(`BTC-DXY positive (unusual)`) }
      reasons.push(`DXY: ${correlations.dxyBtc}`)
    }
    if (correlations.spxBtc !== null) reasons.push(`SPX: ${correlations.spxBtc}`)
    if (correlations.ethBtc !== null && correlations.ethBtc < 0.7) { s -= 10; reasons.push(`ETH decorrelating (${correlations.ethBtc})`) }
    signals.correlations = { score: clamp(s), confidence: 40, reason: reasons.join(' | ') }
  }
  // Stablecoins
  if (stablecoins) {
    let s = 0
    if (stablecoins.totalChange > 0.3) s = 25 // big mint
    else if (stablecoins.totalChange > 0.1) s = 15
    else if (stablecoins.totalChange < -0.3) s = -25 // big burn
    else if (stablecoins.totalChange < -0.1) s = -15
    signals.stablecoins = { score: clamp(s), confidence: 50, reason: `24h supply change: ${stablecoins.totalChange > 0 ? '+' : ''}${stablecoins.totalChange}% (${stablecoins.signal})` }
  }

  // Composite — rebalanced weights
  const WEIGHTS: Record<string, number> = {
    orderbook: 0.06, funding: 0.09, openInterest: 0.06, longShort: 0.07, taker: 0.07,
    options: 0.06, fearGreed: 0.04, technicals: 0.10, cvd: 0.09, volumeProfile: 0.05,
    largeTrades: 0.06, optionsFlow: 0.06, fundingDiff: 0.04, cme: 0.05,
    correlations: 0.04, stablecoins: 0.06,
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
    data: { orderbook, funding, oi, lsRatio, taker, cvd, volumeProfile, largeTrades, liquidations, options, fearGreed, technicals, optionsFlow, fundingDiff, cme, correlations, stablecoins, onchain },
  }
}

// Fire-and-forget: store snapshot + check alerts
async function sideEffects(snapshot: any, baseUrl: string) {
  const secret = process.env.INTELLIGENCE_SECRET
  if (!secret) return
  try {
    await Promise.allSettled([
      nodeFetch(`${baseUrl}/api/intelligence/store`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, snapshot }), timeout: 5000,
      }),
      nodeFetch(`${baseUrl}/api/intelligence/alerts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, snapshot }), timeout: 5000,
      }),
    ])
  } catch {}
}

export async function GET(req: Request) {
  try {
    if (cachedSnapshot && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedSnapshot)
    }
    const snapshot = await fetchSnapshot()
    cachedSnapshot = snapshot
    cacheTime = Date.now()

    // Store snapshot + check alerts (non-blocking)
    const baseUrl = new URL(req.url).origin
    sideEffects(snapshot, baseUrl).catch(() => {})

    return NextResponse.json(snapshot)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
