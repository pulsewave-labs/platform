import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/api'

// Cache for news data
const newsCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Impact keywords for automatic categorization
const IMPACT_KEYWORDS = {
  high: [
    'regulation', 'sec', 'lawsuit', 'banned', 'hack', 'breach', 'crash', 
    'bull run', 'bear market', 'adoption', 'institutional', 'etf', 
    'federal reserve', 'interest rates', 'inflation'
  ],
  medium: [
    'partnership', 'integration', 'update', 'upgrade', 'listing', 
    'delisted', 'fork', 'airdrop', 'staking', 'defi', 'nft'
  ],
  low: [
    'minor', 'small', 'patch', 'maintenance', 'announcement', 'reminder'
  ]
}

function categorizeImpact(title: string, content: string): 'high' | 'medium' | 'low' {
  const text = `${title} ${content}`.toLowerCase()
  
  for (const keyword of IMPACT_KEYWORDS.high) {
    if (text.includes(keyword)) return 'high'
  }
  
  for (const keyword of IMPACT_KEYWORDS.medium) {
    if (text.includes(keyword)) return 'medium'
  }
  
  return 'low'
}

function extractRelatedPairs(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase()
  const pairs = []
  
  // Common crypto symbols
  const cryptoSymbols = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'cardano', 'ada',
    'polkadot', 'dot', 'chainlink', 'link', 'polygon', 'matic', 'avalanche', 'avax',
    'cosmos', 'atom', 'near', 'algorand', 'algo', 'fantom', 'ftm'
  ]
  
  for (const symbol of cryptoSymbols) {
    if (text.includes(symbol)) {
      if (symbol.length <= 4) {
        pairs.push(`${symbol.toUpperCase()}/USDT`)
      } else {
        // Convert full name to symbol
        const symbolMap: { [key: string]: string } = {
          'bitcoin': 'BTC',
          'ethereum': 'ETH', 
          'solana': 'SOL',
          'cardano': 'ADA',
          'polkadot': 'DOT',
          'chainlink': 'LINK',
          'polygon': 'MATIC',
          'avalanche': 'AVAX',
          'cosmos': 'ATOM',
          'algorand': 'ALGO',
          'fantom': 'FTM'
        }
        const sym = symbolMap[symbol]
        if (sym) pairs.push(`${sym}/USDT`)
      }
    }
  }
  
  return [...new Set(pairs)] // Remove duplicates
}

async function fetchFromCryptoPanic(): Promise<any[]> {
  try {
    // CryptoPanic free tier (no API key needed for public endpoint)
    const url = 'https://cryptopanic.com/api/free/v1/posts/?public=true&kind=news&filter=hot'
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PulseWave-Labs/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return (data.results || []).slice(0, 20).map((item: any) => ({
      title: item.title,
      summary: item.title, // CryptoPanic doesn't provide summary in free tier
      url: item.url,
      source: item.source?.title || 'CryptoPanic',
      published_at: item.published_at,
      impact: categorizeImpact(item.title, item.title),
      related_pairs: extractRelatedPairs(item.title, item.title),
      category: 'general',
      external_id: `cryptopanic_${item.id}`
    }))
  } catch (error) {
    console.error('CryptoPanic fetch error:', error)
    return []
  }
}

async function fetchFromCoinDesk(): Promise<any[]> {
  try {
    // CoinDesk RSS feed (free)
    const url = 'https://www.coindesk.com/arc/outboundfeeds/rss/'
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`CoinDesk RSS error: ${response.status}`)
    }
    
    const xmlText = await response.text()
    
    // Basic XML parsing (in production, use a proper XML parser)
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || []
    
    return items.slice(0, 10).map((item: string, index: number) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                   item.match(/<title>(.*?)<\/title>/)?.[1] || 'No title'
      
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString()
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                         item.match(/<description>(.*?)<\/description>/)?.[1] || title
      
      // Convert RSS pubDate to ISO
      let publishedAt = new Date().toISOString()
      try {
        publishedAt = new Date(pubDate).toISOString()
      } catch (e) {
        // Use current time if date parsing fails
      }
      
      return {
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        summary: description.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        url: link,
        source: 'CoinDesk',
        published_at: publishedAt,
        impact: categorizeImpact(title, description),
        related_pairs: extractRelatedPairs(title, description),
        category: 'news',
        external_id: `coindesk_${Date.now()}_${index}`
      }
    })
  } catch (error) {
    console.error('CoinDesk fetch error:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const impact = searchParams.get('impact') // high, medium, low
    const source = searchParams.get('source')
    
    const cacheKey = `news_${limit}_${impact || 'all'}_${source || 'all'}`
    
    // Check cache
    const cached = newsCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return NextResponse.json(cached.data)
    }

    // First, try to get recent news from database
    let query = supabaseAdmin
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (impact) {
      query = query.eq('impact', impact)
    }

    const { data: dbNews, error: dbError } = await query

    // Fetch fresh news from external sources
    const [cryptoPanicNews, coinDeskNews] = await Promise.all([
      fetchFromCryptoPanic(),
      fetchFromCoinDesk()
    ])

    // Combine and sort news
    let allNews = [...(dbNews || []), ...cryptoPanicNews, ...coinDeskNews]
    
    // Filter by source if specified
    if (source) {
      allNews = allNews.filter(item => 
        item.source?.toLowerCase().includes(source.toLowerCase())
      )
    }

    // Filter by impact if specified
    if (impact) {
      allNews = allNews.filter(item => item.impact === impact)
    }

    // Remove duplicates based on title similarity
    const uniqueNews = []
    const seenTitles = new Set()
    
    for (const item of allNews) {
      const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50)
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle)
        uniqueNews.push(item)
      }
    }

    // Sort by published date (most recent first)
    uniqueNews.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at)
      const dateB = new Date(b.published_at || b.created_at)
      return dateB.getTime() - dateA.getTime()
    })

    // Limit results
    const limitedNews = uniqueNews.slice(0, limit)

    // Store new external news in database (fire and forget)
    const externalNews = limitedNews.filter(item => item.external_id)
    if (externalNews.length > 0) {
      supabaseAdmin
        .from('news')
        .upsert(externalNews.map(item => ({
          title: item.title,
          summary: item.summary,
          url: item.url,
          source: item.source,
          published_at: item.published_at,
          impact: item.impact,
          related_pairs: item.related_pairs,
          category: item.category
        })), { onConflict: 'title' })
        .then(() => console.log(`Stored ${externalNews.length} news items`))
        .catch(err => console.error('Error storing news:', err))
    }

    // Format response
    const response = {
      news: limitedNews.map(item => ({
        id: item.id || item.external_id,
        title: item.title,
        summary: item.summary,
        url: item.url,
        source: item.source,
        impact: item.impact,
        category: item.category,
        related_pairs: item.related_pairs || [],
        published_at: item.published_at || item.created_at,
        created_at: item.created_at || new Date().toISOString()
      })),
      meta: {
        total: limitedNews.length,
        limit,
        filters: { impact, source },
        cached: false,
        timestamp: new Date().toISOString(),
        sources: ['database', 'cryptopanic', 'coindesk']
      }
    }

    // Cache the result
    newsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    // Clean old cache entries
    for (const [key, value] of newsCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_DURATION * 2) {
        newsCache.delete(key)
      }
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('API error:', error)
    
    // Try to return cached data if available
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const impact = searchParams.get('impact')
    const source = searchParams.get('source')
    const cacheKey = `news_${limit}_${impact || 'all'}_${source || 'all'}`
    
    const cached = newsCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        meta: {
          ...cached.data.meta,
          cached: true,
          warning: 'Using cached data due to API error',
          cache_age_seconds: Math.round((Date.now() - cached.timestamp) / 1000)
        }
      })
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch news', 
        message: 'Unable to fetch current crypto news',
        news: [],
        meta: {
          total: 0,
          limit,
          timestamp: new Date().toISOString(),
          error: true
        }
      },
      { status: 500 }
    )
  }
}