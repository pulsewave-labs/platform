import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/api'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

function escapeTelegramHtml(value: string | null | undefined): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function sendTelegramMessage(chat_id: string | number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }),
  })
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional security layer)
    const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const message = body?.message
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    const chat_id = String(message.chat.id)
    const text = message.text.trim()

    // Handle /start with link code
    if (text.startsWith('/start ')) {
      const link_code = text.replace('/start ', '').trim()

      if (!link_code) {
        await sendTelegramMessage(chat_id, '❌ Invalid link code. Please generate a new one from your PulseWave dashboard.')
        return NextResponse.json({ ok: true })
      }

      // Find profile with this link code
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, telegram_chat_id')
        .eq('telegram_link_code', link_code)
        .single()

      if (error || !profile) {
        await sendTelegramMessage(chat_id, '❌ Link code expired or invalid. Please generate a new one from your PulseWave dashboard.')
        return NextResponse.json({ ok: true })
      }

      // Check if this chat is already linked to another account
      if (profile.telegram_chat_id && profile.telegram_chat_id !== chat_id) {
        // Allow re-link — update to new chat
      }

      // Link the account
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          telegram_chat_id: chat_id,
          telegram_link_code: null, // Clear code after use
          telegram_linked_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) {
        await sendTelegramMessage(chat_id, '❌ Something went wrong. Please try again.')
        return NextResponse.json({ ok: true })
      }

      await sendTelegramMessage(
        chat_id,
        `✅ <b>Account linked!</b>\n\nYour PulseWave account (<code>${escapeTelegramHtml(profile.email)}</code>) is now connected.\n\nTelegram is now available for journal-related account notifications and product updates.`
      )
      return NextResponse.json({ ok: true })
    }

    // Handle plain /start (no code)
    if (text === '/start') {
      await sendTelegramMessage(
        chat_id,
        `👋 <b>Welcome to PulseWave Journal.</b>\n\nTo link Telegram as an optional account integration:\n\n1. Go to your PulseWave dashboard\n2. Open Settings\n3. Click "Connect Telegram"\n4. Click the link it generates\n\nThat's it — your Telegram account will be connected to PulseWave.`
      )
      return NextResponse.json({ ok: true })
    }

    // Handle /status
    if (text === '/status') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, tier, telegram_linked_at')
        .eq('telegram_chat_id', chat_id)
        .single()

      if (!profile) {
        await sendTelegramMessage(chat_id, '❌ No account linked. Use your PulseWave dashboard to connect.')
      } else {
        await sendTelegramMessage(
          chat_id,
          `📊 <b>Account Status</b>\n\n📧 ${escapeTelegramHtml(profile.email)}\n📦 Plan: ${escapeTelegramHtml(profile.tier)}\n🔗 Linked: ${new Date(profile.telegram_linked_at).toLocaleDateString()}`
        )
      }
      return NextResponse.json({ ok: true })
    }

    // Handle /unlink
    if (text === '/unlink') {
      await supabaseAdmin
        .from('profiles')
        .update({ telegram_chat_id: null, telegram_linked_at: null })
        .eq('telegram_chat_id', chat_id)

      await sendTelegramMessage(chat_id, '✅ Account unlinked. Telegram notifications are now disabled.')
      return NextResponse.json({ ok: true })
    }

    // Unknown command
    await sendTelegramMessage(
      chat_id,
      `Available commands:\n/start — Link your account\n/status — Check account status\n/unlink — Disconnect your account`
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}
