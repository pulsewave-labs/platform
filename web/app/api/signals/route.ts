import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const pair = searchParams.get('pair')
    const direction = searchParams.get('direction')
    const timeframe = searchParams.get('timeframe')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'active'

    // Build the query
    let query = supabaseAdmin
      .from('signals')
      .select('*')
      .eq('status', status)
      .order('confidence', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (pair) {
      query = query.eq('pair', pair)
    }
    
    if (direction) {
      query = query.eq('direction', direction.toUpperCase())
    }
    
    if (timeframe) {
      query = query.eq('timeframe', timeframe)
    }

    const { data: signals, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch signals', message: error.message },
        { status: 500 }
      )
    }

    // Calculate R:R ratio and format response
    const formattedSignals = signals?.map(signal => ({
      ...signal,
      risk_reward_ratio: signal.entry_price && signal.stop_loss && signal.take_profit
        ? Math.abs(signal.take_profit - signal.entry_price) / Math.abs(signal.entry_price - signal.stop_loss)
        : null,
      price_to_stop: signal.entry_price && signal.stop_loss 
        ? Math.abs((signal.entry_price - signal.stop_loss) / signal.entry_price * 100)
        : null,
      price_to_target: signal.entry_price && signal.take_profit
        ? Math.abs((signal.take_profit - signal.entry_price) / signal.entry_price * 100) 
        : null
    })) || []

    return NextResponse.json({ 
      signals: formattedSignals,
      meta: {
        count: formattedSignals.length,
        filters: { pair, direction, timeframe, status },
        limit
      }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}