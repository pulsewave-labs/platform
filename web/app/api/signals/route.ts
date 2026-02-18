import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://iadevdgnaeykfqhxdpmy.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''

async function fetchSignals(status?: string) {
  const params = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '50' })
  if (status) params.append('status', `eq.${status}`)
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/signals?${params}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const signals = await fetchSignals(status || undefined)
    
    return NextResponse.json({
      signals,
      meta: { total: signals.length, source: 'live' }
    })
  } catch (error) {
    return NextResponse.json({ signals: [], meta: { total: 0, error: 'Failed to fetch signals' } }, { status: 500 })
  }
}
