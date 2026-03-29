import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const composite = parseInt(url.searchParams.get('composite') || '0')
  const fearGreed = url.searchParams.get('fearGreed') ? parseInt(url.searchParams.get('fearGreed')!) : null
  const lsRatio = url.searchParams.get('lsRatio') ? parseFloat(url.searchParams.get('lsRatio')!) : null
  const bias = url.searchParams.get('bias') || null

  try {
    // Find similar historical snapshots using the DB function
    const { data: similar, error: simError } = await supabase.rpc('find_similar_snapshots', {
      p_composite: composite,
      p_fear_greed: fearGreed,
      p_ls_ratio: lsRatio,
      p_bias: bias,
      p_limit: 20,
    })

    if (simError) throw simError

    if (!similar || similar.length === 0) {
      return NextResponse.json({
        matches: 0,
        message: 'Not enough historical data yet. Patterns will appear after ~48 hours of data collection.',
        outcomes: null,
      })
    }

    // Aggregate outcomes
    const with4h = similar.filter((s: any) => s.change_4h !== null)
    const with24h = similar.filter((s: any) => s.change_24h !== null)
    const with72h = similar.filter((s: any) => s.change_72h !== null)

    const avg = (arr: any[], key: string) => arr.length > 0 ? +(arr.reduce((s: number, x: any) => s + x[key], 0) / arr.length).toFixed(2) : null
    const median = (arr: number[]) => {
      if (arr.length === 0) return null
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[mid] : +((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
    }
    const winRate = (arr: any[], key: string) => {
      if (arr.length === 0) return null
      const wins = arr.filter((s: any) => s[key] > 0).length
      return +((wins / arr.length) * 100).toFixed(1)
    }

    // Classify outcomes
    const outcomeDistribution = (arr: any[], key: string) => {
      const total = arr.length
      if (total === 0) return null
      const strongRally = arr.filter((s: any) => s[key] > 3).length
      const rally = arr.filter((s: any) => s[key] > 1 && s[key] <= 3).length
      const chop = arr.filter((s: any) => s[key] >= -1 && s[key] <= 1).length
      const dip = arr.filter((s: any) => s[key] < -1 && s[key] >= -3).length
      const crash = arr.filter((s: any) => s[key] < -3).length
      return {
        strongRally: +((strongRally / total) * 100).toFixed(1),
        rally: +((rally / total) * 100).toFixed(1),
        chop: +((chop / total) * 100).toFixed(1),
        dip: +((dip / total) * 100).toFixed(1),
        crash: +((crash / total) * 100).toFixed(1),
      }
    }

    const outcomes = {
      h4: {
        count: with4h.length,
        avgChange: avg(with4h, 'change_4h'),
        medianChange: median(with4h.map((s: any) => s.change_4h)),
        bullRate: winRate(with4h, 'change_4h'),
        best: with4h.length ? Math.max(...with4h.map((s: any) => s.change_4h)).toFixed(2) : null,
        worst: with4h.length ? Math.min(...with4h.map((s: any) => s.change_4h)).toFixed(2) : null,
      },
      h24: {
        count: with24h.length,
        avgChange: avg(with24h, 'change_24h'),
        medianChange: median(with24h.map((s: any) => s.change_24h)),
        bullRate: winRate(with24h, 'change_24h'),
        best: with24h.length ? Math.max(...with24h.map((s: any) => s.change_24h)).toFixed(2) : null,
        worst: with24h.length ? Math.min(...with24h.map((s: any) => s.change_24h)).toFixed(2) : null,
        distribution: outcomeDistribution(with24h, 'change_24h'),
      },
      h72: {
        count: with72h.length,
        avgChange: avg(with72h, 'change_72h'),
        medianChange: median(with72h.map((s: any) => s.change_72h)),
        bullRate: winRate(with72h, 'change_72h'),
        best: with72h.length ? Math.max(...with72h.map((s: any) => s.change_72h)).toFixed(2) : null,
        worst: with72h.length ? Math.min(...with72h.map((s: any) => s.change_72h)).toFixed(2) : null,
        distribution: outcomeDistribution(with72h, 'change_72h'),
      },
    }

    // Top 5 most similar for display
    const topMatches = similar.slice(0, 5).map((s: any) => ({
      ts: s.ts,
      price: +s.price,
      composite: s.composite,
      bias: s.bias,
      fearGreed: s.fear_greed,
      lsRatio: s.ls_ratio ? +s.ls_ratio : null,
      change4h: s.change_4h ? +s.change_4h : null,
      change24h: s.change_24h ? +s.change_24h : null,
      change72h: s.change_72h ? +s.change_72h : null,
      similarity: +s.similarity,
    }))

    return NextResponse.json({
      matches: similar.length,
      outcomes,
      topMatches,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
