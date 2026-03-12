import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/api'

// Auto-import closed signals as journal entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signal_id } = body

    if (!signal_id) {
      return NextResponse.json({ error: 'signal_id required' }, { status: 400 })
    }

    // Fetch the signal
    const { data: signal, error: sigError } = await supabaseAdmin
      .from('signals')
      .select('*')
      .eq('id', signal_id)
      .single()

    if (sigError || !signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    if (!['hit_tp', 'hit_sl'].includes(signal.status)) {
      return NextResponse.json({ error: 'Signal not closed yet' }, { status: 400 })
    }

    // Check if already imported
    const { data: existing } = await supabaseAdmin
      .from('trades')
      .select('id')
      .eq('signal_id', signal_id)
      .eq('auto_imported', true)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already imported', trade_id: existing.id })
    }

    // Determine exit price and PnL
    const exitPrice = signal.status === 'hit_tp' ? signal.take_profit : signal.stop_loss
    const direction = signal.direction
    const reward = direction === 'LONG'
      ? exitPrice - signal.entry_price
      : signal.entry_price - exitPrice
    const risk = Math.abs(signal.entry_price - signal.stop_loss)
    const rMultiple = risk > 0 ? reward / risk : 0
    const pnlPercent = (reward / signal.entry_price) * 100

    // Detect session from signal creation time
    const hour = new Date(signal.created_at).getUTCHours()
    const session = hour < 8 ? 'asian' : hour < 13 ? 'london' : 'ny'

    // Find users who followed this signal (from user_signals table)
    const { data: followers } = await supabaseAdmin
      .from('user_signals')
      .select('user_id')
      .eq('signal_id', signal_id)
      .eq('status', 'followed')

    const userIds = followers?.map(f => f.user_id) || []

    // If no followers, skip
    if (userIds.length === 0) {
      return NextResponse.json({ message: 'No followers to import for' })
    }

    // Create trade entries for each follower
    const trades = userIds.map(userId => ({
      user_id: userId,
      signal_id: signal.id,
      pair: signal.pair,
      direction: signal.direction,
      entry_price: signal.entry_price,
      exit_price: exitPrice,
      stop_loss: signal.stop_loss,
      take_profit: signal.take_profit,
      pnl_percent: Math.round(pnlPercent * 100) / 100,
      r_multiple: Math.round(rMultiple * 100) / 100,
      status: 'closed',
      source: 'signal',
      auto_imported: true,
      timeframe: signal.timeframe || null,
      session,
      entry_date: signal.created_at,
      exit_date: signal.updated_at || new Date().toISOString(),
      opened_at: signal.created_at,
      closed_at: signal.updated_at || new Date().toISOString(),
    }))

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('trades')
      .insert(trades)
      .select('id')

    if (insertError) {
      console.error('Auto-import error:', insertError)
      return NextResponse.json({ error: 'Failed to import', message: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `Imported ${inserted?.length || 0} trades`,
      trade_ids: inserted?.map(t => t.id) || [],
    }, { status: 201 })

  } catch (error) {
    console.error('Auto-import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
