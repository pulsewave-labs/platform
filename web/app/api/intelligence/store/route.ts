import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Called after each intelligence fetch to store the snapshot
export async function POST(req: Request) {
  try {
    const { secret, snapshot } = await req.json()
    if (secret !== process.env.INTELLIGENCE_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const d = snapshot.data || {}
    const s = snapshot.signals || {}

    const row = {
      ts: new Date(snapshot.timestamp).toISOString(),
      price: snapshot.price,
      composite: snapshot.composite,
      bias: snapshot.bias,
      confidence: snapshot.confidence,
      // Signal scores
      s_orderbook: s.orderbook?.score ?? null,
      s_funding: s.funding?.score ?? null,
      s_oi: s.openInterest?.score ?? null,
      s_longshort: s.longShort?.score ?? null,
      s_taker: s.taker?.score ?? null,
      s_options: s.options?.score ?? null,
      s_feargreed: s.fearGreed?.score ?? null,
      s_technicals: s.technicals?.score ?? null,
      s_cvd: s.cvd?.score ?? null,
      s_volumeprofile: s.volumeProfile?.score ?? null,
      s_largetrades: s.largeTrades?.score ?? null,
      s_optionsflow: s.optionsFlow?.score ?? null,
      s_fundingdiff: s.fundingDiff?.score ?? null,
      s_cme: s.cme?.score ?? null,
      s_correlations: s.correlations?.score ?? null,
      s_stablecoins: s.stablecoins?.score ?? null,
      // Key data points
      funding_rate: d.funding?.rate ?? null,
      oi_delta_24h: d.oi?.delta24h ?? null,
      ls_ratio: d.lsRatio?.ratio ?? null,
      taker_ratio: d.taker?.ratio ?? null,
      cvd: d.cvd?.cvd ?? null,
      fear_greed: d.fearGreed?.value ?? null,
      pc_ratio: d.options?.pcRatio ?? null,
      cme_basis: d.cme?.basis ?? null,
      // Full snapshot
      raw: snapshot,
    }

    const { error } = await supabase.from('intelligence_snapshots').insert(row)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
