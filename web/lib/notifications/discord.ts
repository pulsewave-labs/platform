const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || ''

export type SignalData = {
  action: string
  pair: string
  entry: number
  stopLoss: number
  takeProfit: number
  timeframe: string
  confidence: number
  rr: string
}

function fmt(n: number): string {
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 1) return '$' + n.toFixed(2)
  return '$' + n.toFixed(4)
}

export async function sendDiscordSignal(signal: SignalData, webhookUrl?: string): Promise<boolean> {
  var url = webhookUrl || DISCORD_WEBHOOK_URL
  if (!url) return false

  var isLong = signal.action === 'LONG'
  var color = isLong ? 0x00e5a0 : 0xff4d4d
  var arrow = isLong ? '↗' : '↘'
  var icon = isLong ? '🟢' : '🔴'

  var slPct = Math.abs((signal.stopLoss - signal.entry) / signal.entry * 100).toFixed(2)

  var embed = {
    title: `${icon} ${signal.action} ${signal.pair} ${arrow}`,
    color: color,
    fields: [
      { name: 'Entry', value: `\`${fmt(signal.entry)}\``, inline: true },
      { name: 'Stop Loss', value: `\`${fmt(signal.stopLoss)}\` (${slPct}%)`, inline: true },
      { name: 'Take Profit', value: `\`${fmt(signal.takeProfit)}\``, inline: true },
      { name: 'Risk/Reward', value: `\`${signal.rr}\``, inline: true },
      { name: 'Timeframe', value: `\`${signal.timeframe}\``, inline: true },
      { name: 'Confidence', value: `\`${signal.confidence}%\``, inline: true },
    ],
    footer: { text: 'PulseWave Signals • Not financial advice' },
    timestamp: new Date().toISOString(),
  }

  try {
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'PulseWave Signals',
        avatar_url: 'https://www.pulsewavelabs.io/logo.png',
        embeds: [embed],
      }),
    })

    if (!res.ok) {
      console.error('[discord] Webhook error:', res.status, await res.text())
      return false
    }

    console.log('[discord] Signal sent:', signal.action, signal.pair)
    return true
  } catch (err) {
    console.error('[discord] Failed:', err)
    return false
  }
}
