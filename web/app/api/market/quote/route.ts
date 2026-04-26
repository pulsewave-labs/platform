import { NextRequest, NextResponse } from 'next/server'
import { coinGeckoIdForSymbol, normalizeMarketSymbol } from '../../../../lib/market-symbols'

export const dynamic = 'force-dynamic'

const quoteCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 15 * 1000

async function fetchBinanceQuote(binanceSymbol: string) {
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(binanceSymbol)}`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PulseWave-Labs/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`Binance quote unavailable: ${response.status}`)
  }

  const data = await response.json()
  const price = Number(data.lastPrice)
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Binance returned an invalid price')
  }

  return {
    price,
    price_change_24h: Number.isFinite(Number(data.priceChangePercent)) ? Number(data.priceChangePercent) : null,
    volume_24h: Number.isFinite(Number(data.quoteVolume)) ? Number(data.quoteVolume) : null,
    source: 'binance',
  }
}

async function fetchCoinGeckoQuote(base: string, currency: string) {
  const id = coinGeckoIdForSymbol(base)
  const vsCurrency = currency.toLowerCase() === 'usdt' || currency.toLowerCase() === 'usdc' ? 'usd' : currency.toLowerCase()
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vsCurrency)}&include_24hr_change=true&include_24hr_vol=true`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PulseWave-Labs/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`CoinGecko quote unavailable: ${response.status}`)
  }

  const data = await response.json()
  const priceData = data[id]
  const price = Number(priceData?.[vsCurrency])
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Ticker not found')
  }

  return {
    price,
    price_change_24h: Number.isFinite(Number(priceData?.[`${vsCurrency}_24h_change`])) ? Number(priceData[`${vsCurrency}_24h_change`]) : null,
    volume_24h: Number.isFinite(Number(priceData?.[`${vsCurrency}_24h_vol`])) ? Number(priceData[`${vsCurrency}_24h_vol`]) : null,
    source: 'coingecko',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('symbol') || searchParams.get('ticker') || searchParams.get('pair') || ''
    const normalized = normalizeMarketSymbol(ticker)
    const cacheKey = normalized.binanceSymbol

    const cached = quoteCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    let quote
    try {
      quote = await fetchBinanceQuote(normalized.binanceSymbol)
    } catch (binanceError) {
      quote = await fetchCoinGeckoQuote(normalized.base, normalized.quote)
    }

    const payload = {
      pair: normalized.pair,
      base: normalized.base,
      quote: normalized.quote,
      symbol: normalized.binanceSymbol,
      price: quote.price,
      price_change_24h: quote.price_change_24h,
      volume_24h: quote.volume_24h,
      meta: {
        source: quote.source,
        timestamp: new Date().toISOString(),
        cache_duration_seconds: CACHE_DURATION / 1000,
      },
    }

    quoteCache.set(cacheKey, { data: payload, timestamp: Date.now() })
    return NextResponse.json(payload)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch live price',
        message: error?.message || 'Unable to fetch current market price for that ticker',
      },
      { status: 400 }
    )
  }
}
