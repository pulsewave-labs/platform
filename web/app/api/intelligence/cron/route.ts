import { NextResponse } from 'next/server'
import nodeFetch from 'node-fetch'

export const runtime = 'nodejs'
export const maxDuration = 60

// Vercel Cron endpoint — triggers intelligence fetch (stores snapshot) + backfill
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const baseUrl = new URL(req.url).origin
  const secret = process.env.INTELLIGENCE_SECRET

  try {
    // 1. Trigger intelligence fetch (this stores + checks alerts automatically)
    const fetchRes = await nodeFetch(`${baseUrl}/api/intelligence`, { timeout: 25000 })
    const snap = await fetchRes.json()

    // 2. Trigger backfill of outcome prices
    let backfill = null
    if (secret) {
      const bfRes = await nodeFetch(`${baseUrl}/api/intelligence/backfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
        timeout: 25000,
      })
      backfill = await bfRes.json()
    }

    return NextResponse.json({
      ok: true,
      snapshot: { price: (snap as any).price, bias: (snap as any).bias, sources: (snap as any).sourcesOk },
      backfill,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
