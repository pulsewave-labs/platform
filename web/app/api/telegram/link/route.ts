import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../../lib/supabase/api'
import crypto from 'crypto'

// POST — Generate a link code for the user
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a random 8-char link code
    const link_code = crypto.randomBytes(4).toString('hex')

    // Save to profile
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ telegram_link_code: link_code })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to generate link code' }, { status: 500 })
    }

    const bot_username = process.env.TELEGRAM_BOT_USERNAME || 'PulseWaveSignalsBot'
    const deep_link = `https://t.me/${bot_username}?start=${link_code}`

    return NextResponse.json({ link_code, deep_link })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — Check current Telegram link status
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('telegram_chat_id, telegram_linked_at')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      linked: !!profile?.telegram_chat_id,
      linked_at: profile?.telegram_linked_at || null,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — Unlink Telegram
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabaseAdmin
      .from('profiles')
      .update({ telegram_chat_id: null, telegram_link_code: null, telegram_linked_at: null })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
