import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodeFetch from 'node-fetch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TG_ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID

export const runtime = 'nodejs'

async function sendTelegram(message: string) {
  if (!TG_BOT_TOKEN || !TG_ADMIN_CHAT) return
  await nodeFetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_ADMIN_CHAT, text: message, parse_mode: 'HTML' }),
  }).catch(() => {})
}

// Check current snapshot against alert conditions
export async function POST(req: Request) {
  try {
    const { secret, snapshot } = await req.json()
    if (secret !== process.env.INTELLIGENCE_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const alerts: { type: string; message: string }[] = []
    const d = snapshot.data || {}
    const s = snapshot.signals || {}

    // Get last snapshot for comparison
    const { data: prev } = await supabase
      .from('intelligence_snapshots')
      .select('composite, bias, fear_greed, cvd, ls_ratio')
      .order('ts', { ascending: false })
      .limit(1)
      .single()

    // ── Alert Conditions ──────────────────────────────

    // 1. Bias flip
    if (prev && prev.bias !== snapshot.bias) {
      const isBullFlip = snapshot.composite > (prev.composite || 0)
      alerts.push({
        type: 'bias_flip',
        message: `🔄 <b>BIAS FLIP</b>: ${prev.bias} → ${snapshot.bias}\nComposite: ${snapshot.composite > 0 ? '+' : ''}${snapshot.composite} (${snapshot.confidence}% conf)\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }

    // 2. Extreme composite (>50 or <-50)
    if (Math.abs(snapshot.composite) >= 50 && (!prev || Math.abs(prev.composite) < 50)) {
      alerts.push({
        type: 'extreme_composite',
        message: `⚡ <b>EXTREME ${snapshot.composite > 0 ? 'BULLISH' : 'BEARISH'}</b>: Composite ${snapshot.composite > 0 ? '+' : ''}${snapshot.composite}\n${snapshot.confidence}% confidence\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }

    // 3. CVD divergence
    if (d.cvd?.divergence && (!prev || !prev.cvd)) {
      alerts.push({
        type: 'cvd_divergence',
        message: `⚠️ <b>CVD DIVERGENCE</b>: ${d.cvd.divergenceType.replace('_', ' ')}\nCVD: ${d.cvd.cvd.toFixed(1)} | Price ${snapshot.price > (prev?.composite || 0) ? 'up' : 'down'}\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }

    // 4. Extreme fear (≤10) or extreme greed (≥90)
    if (d.fearGreed?.value <= 10 && (!prev || prev.fear_greed > 10)) {
      alerts.push({
        type: 'extreme_fear',
        message: `😱 <b>EXTREME FEAR</b>: F&G Index at ${d.fearGreed.value}\nHistorically a contrarian buy signal\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }
    if (d.fearGreed?.value >= 90 && (!prev || prev.fear_greed < 90)) {
      alerts.push({
        type: 'extreme_greed',
        message: `🤑 <b>EXTREME GREED</b>: F&G Index at ${d.fearGreed.value}\nHistorically a contrarian sell signal\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }

    // 5. L/S ratio extreme (>2.5 = crowded longs, <0.5 = crowded shorts)
    if (d.lsRatio?.ratio > 2.5 && (!prev || (prev.ls_ratio && +prev.ls_ratio <= 2.5))) {
      alerts.push({
        type: 'crowded_longs',
        message: `📊 <b>CROWDED LONGS</b>: L/S Ratio ${d.lsRatio.ratio.toFixed(2)}\n${d.lsRatio.longPct}% long / ${d.lsRatio.shortPct}% short\nSqueeze risk elevated\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }
    if (d.lsRatio?.ratio < 0.5 && (!prev || (prev.ls_ratio && +prev.ls_ratio >= 0.5))) {
      alerts.push({
        type: 'crowded_shorts',
        message: `📊 <b>CROWDED SHORTS</b>: L/S Ratio ${d.lsRatio.ratio.toFixed(2)}\nShort squeeze risk elevated\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }

    // 6. Large price move (>2% in any snapshot interval)
    if (prev && snapshot.price && prev.composite) {
      // We don't have prev price directly, but we can check via signals
    }

    // 7. Funding rate spike (>0.05% or <-0.05%)
    if (d.funding?.rate && Math.abs(d.funding.rate) > 0.0005) {
      alerts.push({
        type: 'funding_spike',
        message: `💰 <b>FUNDING SPIKE</b>: ${(d.funding.rate * 100).toFixed(4)}%\n${d.funding.rate > 0 ? 'Longs paying — potential top signal' : 'Shorts paying — potential bottom signal'}\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }

    // 8. Whale activity (>5 BTC net in large trades)
    if (d.largeTrades?.whaleCount >= 3) {
      const dir = d.largeTrades.netDelta > 0 ? 'BUYING' : 'SELLING'
      alerts.push({
        type: 'whale_activity',
        message: `🐋 <b>WHALE ACTIVITY</b>: ${d.largeTrades.whaleCount} whale trades detected\nNet: ${d.largeTrades.netDelta > 0 ? '+' : ''}${d.largeTrades.netDelta.toFixed(1)} BTC (${dir})\nBTC: $${snapshot.price.toLocaleString()}`,
      })
    }

    // Deduplicate: don't fire same alert type within 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    const { data: recentAlerts } = await supabase
      .from('intelligence_alerts')
      .select('alert_type')
      .gt('ts', twoHoursAgo)

    const recentTypes = new Set((recentAlerts || []).map(a => a.alert_type))
    const newAlerts = alerts.filter(a => !recentTypes.has(a.type))

    // Store and send
    for (const alert of newAlerts) {
      await supabase.from('intelligence_alerts').insert({
        alert_type: alert.type,
        message: alert.message,
        data: { snapshot: { price: snapshot.price, composite: snapshot.composite, bias: snapshot.bias } },
      })
      await sendTelegram(`🔔 PulseWave Intelligence\n\n${alert.message}`)
    }

    return NextResponse.json({ ok: true, fired: newAlerts.length, alerts: newAlerts.map(a => a.type) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
