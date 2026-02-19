import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSignalEmail, SignalEmailData } from '../../../../lib/emails/send'
import { sendDiscordSignal } from '../../../../lib/notifications/discord'

var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
var broadcastSecret = process.env.BROADCAST_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
var botToken = process.env.TELEGRAM_BOT_TOKEN || ''

function getAdmin() {
  return createClient(supabaseUrl, serviceKey)
}

async function sendTelegram(chatId: string, text: string) {
  if (!botToken) return
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

function formatTelegramSignal(s: any): string {
  var isLong = s.action === 'LONG'
  var icon = isLong ? '🟢' : '🔴'
  var arrow = isLong ? '↗' : '↘'
  var fmt = (n: number) => n >= 1000 ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n >= 1 ? '$' + n.toFixed(2) : '$' + n.toFixed(4)
  var slPct = Math.abs((s.stopLoss - s.entry) / s.entry * 100).toFixed(2)

  return [
    `${icon} <b>${s.action} ${s.pair}</b> ${arrow}`,
    '',
    `<b>Entry:</b> <code>${fmt(s.entry)}</code>`,
    `<b>Stop Loss:</b> <code>${fmt(s.stopLoss)}</code> (${slPct}%)`,
    `<b>Take Profit:</b> <code>${fmt(s.takeProfit)}</code>`,
    `<b>R:R:</b> <code>${s.rr}</code>`,
    `<b>TF:</b> ${s.timeframe} | <b>Confidence:</b> ${s.confidence}%`,
    '',
    '⚠️ <i>Not financial advice. Always use a stop loss.</i>',
  ].join('\n')
}

export async function POST(request: NextRequest) {
  try {
    // Auth: accept bearer token or x-api-key
    var auth = request.headers.get('authorization')?.replace('Bearer ', '') || request.headers.get('x-api-key') || ''
    if (!auth || auth !== broadcastSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    var body = await request.json()
    var signal = body.signal || body

    // Validate required fields
    if (!signal.action || !signal.pair || !signal.entry || !signal.stopLoss || !signal.takeProfit) {
      return NextResponse.json({ error: 'Missing required signal fields: action, pair, entry, stopLoss, takeProfit' }, { status: 400 })
    }

    // Defaults
    signal.timeframe = signal.timeframe || '4H'
    signal.confidence = signal.confidence || 0
    signal.rr = signal.rr || (Math.abs(signal.takeProfit - signal.entry) / Math.abs(signal.entry - signal.stopLoss)).toFixed(1) + ':1'

    var results = { telegram: 0, email: 0, discord: false }
    var supabase = getAdmin()

    // 1. Discord webhook — always fire
    results.discord = await sendDiscordSignal(signal)

    // 2. Telegram — send to all linked users with active subscriptions
    var { data: telegramUsers } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .not('telegram_chat_id', 'is', null)
      .eq('subscription_status', 'active')

    if (telegramUsers) {
      var tgText = formatTelegramSignal(signal)
      var tgPromises = telegramUsers.map(u => sendTelegram(u.telegram_chat_id, tgText))
      var tgResults = await Promise.allSettled(tgPromises)
      results.telegram = tgResults.filter(r => r.status === 'fulfilled').length
    }

    // 3. Email — send to all active users with email_signals enabled
    var { data: emailUsers } = await supabase
      .from('profiles')
      .select('email')
      .eq('subscription_status', 'active')
      .eq('email_signals', true)

    if (emailUsers) {
      var emailData: SignalEmailData = {
        action: signal.action,
        pair: signal.pair,
        entry: signal.entry,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        timeframe: signal.timeframe,
        confidence: signal.confidence,
        rr: signal.rr,
      }
      var emailPromises = emailUsers.map(u => sendSignalEmail(u.email, emailData))
      var emailResults = await Promise.allSettled(emailPromises)
      results.email = emailResults.filter(r => r.status === 'fulfilled' && r.value).length
    }

    console.log(`[broadcast] ${signal.action} ${signal.pair} → Discord:${results.discord} TG:${results.telegram} Email:${results.email}`)

    return NextResponse.json({
      ok: true,
      delivered: results,
    })
  } catch (err) {
    console.error('[broadcast] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
