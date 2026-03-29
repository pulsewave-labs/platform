import * as binance from './fetchers/binance.js'
import * as bybit from './fetchers/bybit.js'
import * as deribit from './fetchers/deribit.js'
import * as macro from './fetchers/macro.js'
import * as flow from './fetchers/flow.js'
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
  const results = {}
  const jobs = [
    ['binanceOrderbook', binance.getOrderbook],
    ['binanceFunding', binance.getFunding],
    ['binanceOI', binance.getOpenInterest],
    ['binanceLSRatio', binance.getLongShortRatio],
    ['binanceTaker', binance.getTakerVolume],
    ['bybitOrderbook', bybit.getOrderbook],
    ['bybitFunding', bybit.getFunding],
    ['bybitLSRatio', bybit.getLongShortRatio],
    ['options', deribit.getOptionsData],
    ['volatility', deribit.getVolatility],
    ['fearGreed', macro.getFearGreed],
    ['macro', macro.getMacro],
    ['cvd', flow.getCVD],
    ['volumeProfile', flow.getVolumeProfile],
    ['largeTrades', flow.getLargeTrades],
    ['liquidations', flow.getLiquidationEstimates],
    ['klines1h', () => binance.getKlines('1h', 200)],
    ['klines4h', () => binance.getKlines('4h', 200)],
    ['klines1d', () => binance.getKlines('1d', 200)],
  ]
  const fetched = await Promise.all(jobs.map(([name, fn]) => safeFetch(name, fn)))
  jobs.forEach(([name], i) => { results[name] = fetched[i] })
  const { binanceOrderbook, binanceFunding, binanceOI, binanceLSRatio, binanceTaker,
          bybitOrderbook, bybitFunding, bybitLSRatio, options, volatility,
          fearGreed, macro: macroData, cvd, volumeProfile, largeTrades, liquidations,
          klines1h, klines4h, klines1d } = results

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
      cvd,
      volumeProfile,
      largeTrades,
      liquidations,
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
