import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodeFetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PROXY_URL = 'http://masonboroff:UQdolU8%3Dg808@ddc.oxylabs.io:8001'
const proxyAgent = new HttpsProxyAgent(PROXY_URL)

export const runtime = 'nodejs'
export const maxDuration = 30

// Backfill outcome prices for snapshots that are old enough
export async function POST(req: Request) {
  try {
    const { secret } = await req.json()
    if (secret !== process.env.INTELLIGENCE_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Get snapshots missing outcomes that are old enough
    const now = Date.now()
    const h4ago = new Date(now - 4 * 3600 * 1000).toISOString()
    const h24ago = new Date(now - 24 * 3600 * 1000).toISOString()
    const h72ago = new Date(now - 72 * 3600 * 1000).toISOString()

    // Snapshots needing 4h fill
    const { data: need4h } = await supabase
      .from('intelligence_snapshots')
      .select('id, ts, price')
      .is('price_4h', null)
      .lt('ts', h4ago)
      .order('ts', { ascending: false })
      .limit(50)

    // Snapshots needing 24h fill
    const { data: need24h } = await supabase
      .from('intelligence_snapshots')
      .select('id, ts, price')
      .is('price_24h', null)
      .not('price_4h', 'is', null) // already has 4h
      .lt('ts', h24ago)
      .order('ts', { ascending: false })
      .limit(50)

    // Snapshots needing 72h fill
    const { data: need72h } = await supabase
      .from('intelligence_snapshots')
      .select('id, ts, price')
      .is('price_72h', null)
      .not('price_24h', 'is', null) // already has 24h
      .lt('ts', h72ago)
      .order('ts', { ascending: false })
      .limit(50)

    let filled = 0

    // Helper: get BTC price at a specific timestamp
    const getPriceAt = async (targetTs: number): Promise<number | null> => {
      try {
        // Use Binance klines — get 1m candle at the target time
        const url = `https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=1m&startTime=${targetTs}&limit=1`
        const res = await nodeFetch(url, { agent: proxyAgent, timeout: 10000 } as any)
        if (!res.ok) return null
        const data = await res.json() as any[]
        if (!data.length) return null
        return +data[0][4] // close price
      } catch { return null }
    }

    // Fill 4h outcomes
    for (const snap of (need4h || [])) {
      const targetTs = new Date(snap.ts).getTime() + 4 * 3600 * 1000
      const price4h = await getPriceAt(targetTs)
      if (price4h) {
        const change = +((price4h - snap.price) / snap.price * 100).toFixed(3)
        await supabase.from('intelligence_snapshots').update({
          price_4h: price4h, change_4h: change,
        }).eq('id', snap.id)
        filled++
      }
    }

    // Fill 24h outcomes
    for (const snap of (need24h || [])) {
      const targetTs = new Date(snap.ts).getTime() + 24 * 3600 * 1000
      const price24h = await getPriceAt(targetTs)
      if (price24h) {
        const change = +((price24h - snap.price) / snap.price * 100).toFixed(3)
        await supabase.from('intelligence_snapshots').update({
          price_24h: price24h, change_24h: change,
        }).eq('id', snap.id)
        filled++
      }
    }

    // Fill 72h outcomes
    for (const snap of (need72h || [])) {
      const targetTs = new Date(snap.ts).getTime() + 72 * 3600 * 1000
      const price72h = await getPriceAt(targetTs)
      if (price72h) {
        const change = +((price72h - snap.price) / snap.price * 100).toFixed(3)
        await supabase.from('intelligence_snapshots').update({
          price_72h: price72h, change_72h: change,
        }).eq('id', snap.id)
        filled++
      }
    }

    return NextResponse.json({
      ok: true, filled,
      pending: { h4: need4h?.length || 0, h24: need24h?.length || 0, h72: need72h?.length || 0 },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
