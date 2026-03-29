import * as binance from './fetchers/binance.js'
import * as bybit from './fetchers/bybit.js'
import * as deribit from './fetchers/deribit.js'
import * as macro from './fetchers/macro.js'
import { calculateTechnicals } from './fetchers/technicals.js'

async function safeFetch(name, fn) {
  try {
    const result = await fn()
    console.log(`  ✓ ${name}`)
    return result
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`)
    return { source: name, error: e.message }
  }
}

export async function fetchAll() {
  console.log('Fetching market data...')
  const ts = Date.now()

  // Fetch everything in parallel
  const [
    binanceOrderbook,
    binanceFunding,
    binanceOI,
    binanceLSRatio,
    binanceTaker,
    bybitOrderbook,
    bybitFunding,
    bybitLSRatio,
    options,
    volatility,
    fearGreed,
    macroData,
    klines1h,
    klines4h,
    klines1d,
  ] = await Promise.all([
    safeFetch('binance_orderbook', binance.getOrderbook),
    safeFetch('binance_funding', binance.getFunding),
    safeFetch('binance_oi', binance.getOpenInterest),
    safeFetch('binance_lsratio', binance.getLongShortRatio),
    safeFetch('binance_taker', binance.getTakerVolume),
    safeFetch('bybit_orderbook', bybit.getOrderbook),
    safeFetch('bybit_funding', bybit.getFunding),
    safeFetch('bybit_lsratio', bybit.getLongShortRatio),
    safeFetch('deribit_options', deribit.getOptionsData),
    safeFetch('deribit_volatility', deribit.getVolatility),
    safeFetch('fear_greed', macro.getFearGreed),
    safeFetch('macro', macro.getMacro),
    safeFetch('klines_1h', () => binance.getKlines('1h', 200)),
    safeFetch('klines_4h', () => binance.getKlines('4h', 200)),
    safeFetch('klines_1d', () => binance.getKlines('1d', 200)),
  ])

  // Calculate technicals from klines
  let technicals = { source: 'technicals', error: 'kline data missing' }
  if (!klines1h.error && !klines4h.error && !klines1d.error) {
    technicals = calculateTechnicals(klines1h, klines4h, klines1d)
  }

  const snapshot = {
    timestamp: ts,
    price: binanceFunding.markPrice || bybitFunding.price || null,
    data: {
      binanceOrderbook,
      binanceFunding,
      binanceOI,
      binanceLSRatio,
      binanceTaker,
      bybitOrderbook,
      bybitFunding,
      bybitLSRatio,
      options,
      volatility,
      fearGreed,
      macro: macroData,
      technicals,
    }
  }

  const elapsed = Date.now() - ts
  const errors = Object.values(snapshot.data).filter(d => d.error).length
  console.log(`Done in ${elapsed}ms — ${Object.keys(snapshot.data).length - errors}/${Object.keys(snapshot.data).length} sources OK`)

  return snapshot
}

// Run standalone
if (process.argv[1]?.endsWith('fetch-all.js')) {
  fetchAll().then(s => console.log(JSON.stringify(s, null, 2))).catch(console.error)
}
