import { NextRequest, NextResponse } from 'next/server'

// Cache for price data
const priceCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 30 * 1000 // 30 seconds

// Mapping from common trading symbols to CoinGecko IDs
const SYMBOL_TO_ID: { [key: string]: string } = {
  'bitcoin': 'bitcoin',
  'btc': 'bitcoin',
  'ethereum': 'ethereum', 
  'eth': 'ethereum',
  'solana': 'solana',
  'sol': 'solana',
  'cardano': 'cardano',
  'ada': 'cardano',
  'polkadot': 'polkadot',
  'dot': 'polkadot',
  'chainlink': 'chainlink',
  'link': 'chainlink',
  'polygon': 'matic-network',
  'matic': 'matic-network',
  'avalanche': 'avalanche-2',
  'avax': 'avalanche-2',
  'cosmos': 'cosmos',
  'atom': 'cosmos',
  'near': 'near',
  'algorand': 'algorand',
  'algo': 'algorand',
  'fantom': 'fantom',
  'ftm': 'fantom',
  'arbitrum': 'arbitrum',
  'arb': 'arbitrum',
  'optimism': 'optimism',
  'op': 'optimism'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols') || 'bitcoin,ethereum'
    const currency = searchParams.get('currency') || 'usd'
    
    // Parse and normalize symbols
    const requestedSymbols = symbolsParam.toLowerCase().split(',').map(s => s.trim())
    
    // Convert symbols to CoinGecko IDs
    const coinGeckoIds = requestedSymbols.map(symbol => {
      return SYMBOL_TO_ID[symbol] || symbol
    })
    
    const uniqueIds = [...new Set(coinGeckoIds)]
    const cacheKey = `${uniqueIds.join(',')}_${currency}`
    
    // Check cache
    const cached = priceCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return NextResponse.json(cached.data)
    }

    // Fetch from CoinGecko
    const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=${currency}&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    
    const response = await fetch(coinGeckoUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PulseWave-Labs/1.0'
      }
    })

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', message: 'Too many requests to price API' },
          { status: 429 }
        )
      }
      
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to a more user-friendly format
    const transformedData = {
      prices: {} as any,
      meta: {
        currency: currency.toUpperCase(),
        timestamp: new Date().toISOString(),
        cache_duration_seconds: CACHE_DURATION / 1000,
        source: 'coingecko'
      }
    }

    // Map the response back to requested symbols
    requestedSymbols.forEach((originalSymbol, index) => {
      const coinGeckoId = coinGeckoIds[index]
      const priceData = data[coinGeckoId]
      
      if (priceData) {
        const currencyKey = currency.toLowerCase()
        transformedData.prices[originalSymbol.toUpperCase()] = {
          price: priceData[currencyKey] || null,
          price_change_24h: priceData[`${currencyKey}_24h_change`] || null,
          market_cap: priceData[`${currencyKey}_market_cap`] || null,
          volume_24h: priceData[`${currencyKey}_24h_vol`] || null,
          symbol: originalSymbol.toUpperCase(),
          currency: currency.toUpperCase(),
          last_updated: transformedData.meta.timestamp
        }
      } else {
        // Symbol not found
        transformedData.prices[originalSymbol.toUpperCase()] = {
          price: null,
          price_change_24h: null,
          market_cap: null,
          volume_24h: null,
          symbol: originalSymbol.toUpperCase(),
          currency: currency.toUpperCase(),
          error: 'Symbol not found',
          last_updated: transformedData.meta.timestamp
        }
      }
    })

    // Calculate market summary if multiple symbols
    if (Object.keys(transformedData.prices).length > 1) {
      const validPrices = Object.values(transformedData.prices).filter((p: any) => p.price !== null)
      const totalMarketCap = validPrices.reduce((sum: number, p: any) => sum + (p.market_cap || 0), 0)
      const avgChange = validPrices.length > 0 
        ? validPrices.reduce((sum: number, p: any) => sum + (p.price_change_24h || 0), 0) / validPrices.length
        : 0

      transformedData.meta = {
        ...transformedData.meta,
        summary: {
          total_symbols: requestedSymbols.length,
          valid_symbols: validPrices.length,
          total_market_cap: totalMarketCap,
          average_24h_change: Math.round(avgChange * 100) / 100
        }
      }
    }

    // Cache the result
    priceCache.set(cacheKey, {
      data: transformedData,
      timestamp: Date.now()
    })

    // Clean old cache entries
    for (const [key, value] of priceCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_DURATION * 2) {
        priceCache.delete(key)
      }
    }

    return NextResponse.json(transformedData)
    
  } catch (error) {
    console.error('API error:', error)
    
    // Return cached data if available, even if stale
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols') || 'bitcoin,ethereum'
    const currency = searchParams.get('currency') || 'usd'
    const requestedSymbols = symbolsParam.toLowerCase().split(',').map(s => s.trim())
    const coinGeckoIds = requestedSymbols.map(symbol => SYMBOL_TO_ID[symbol] || symbol)
    const uniqueIds = [...new Set(coinGeckoIds)]
    const cacheKey = `${uniqueIds.join(',')}_${currency}`
    
    const cached = priceCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        meta: {
          ...cached.data.meta,
          warning: 'Using cached data due to API error',
          cache_age_seconds: Math.round((Date.now() - cached.timestamp) / 1000)
        }
      })
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch prices', 
        message: 'Unable to fetch current market prices',
        meta: {
          currency: currency.toUpperCase(),
          timestamp: new Date().toISOString(),
          source: 'coingecko'
        }
      },
      { status: 500 }
    )
  }
}