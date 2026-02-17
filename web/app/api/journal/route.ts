import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access your journal' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const status = searchParams.get('status')
    const pair = searchParams.get('pair')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const strategy = searchParams.get('strategy')
    const tags = searchParams.get('tags')?.split(',') || []

    // Build the query
    let query = supabaseAdmin
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (pair) {
      query = query.eq('pair', pair)
    }
    
    if (strategy) {
      query = query.eq('strategy', strategy)
    }

    if (tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    const { data: trades, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch journal entries', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      trades: trades || [],
      meta: {
        count: count || 0,
        limit,
        offset,
        filters: { status, pair, strategy, tags }
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

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to create journal entries' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['pair', 'direction', 'entry_price']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: 'Validation error', message: `Field '${field}' is required` },
          { status: 400 }
        )
      }
    }

    // Validate direction
    if (!['LONG', 'SHORT'].includes(body.direction?.toUpperCase())) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Direction must be LONG or SHORT' },
        { status: 400 }
      )
    }

    // Calculate R-multiple if exit price is provided
    let r_multiple = null
    let pnl = null
    let pnl_percent = null

    if (body.exit_price && body.stop_loss && body.entry_price) {
      const risk = Math.abs(body.entry_price - body.stop_loss)
      const reward = body.direction.toUpperCase() === 'LONG' 
        ? body.exit_price - body.entry_price
        : body.entry_price - body.exit_price
      
      r_multiple = risk > 0 ? reward / risk : 0
      
      if (body.position_size) {
        pnl = reward * body.position_size - (body.fees || 0)
        pnl_percent = (reward / body.entry_price) * 100
      }
    }

    // Prepare trade data
    const tradeData = {
      user_id: user.id,
      pair: body.pair.toUpperCase(),
      direction: body.direction.toUpperCase(),
      entry_price: parseFloat(body.entry_price),
      exit_price: body.exit_price ? parseFloat(body.exit_price) : null,
      stop_loss: body.stop_loss ? parseFloat(body.stop_loss) : null,
      take_profit: body.take_profit ? parseFloat(body.take_profit) : null,
      position_size: body.position_size ? parseFloat(body.position_size) : null,
      pnl,
      pnl_percent,
      r_multiple,
      fees: body.fees ? parseFloat(body.fees) : 0,
      status: body.status || 'open',
      source: body.source || 'manual',
      exchange: body.exchange || null,
      notes: body.notes || null,
      tags: body.tags || [],
      timeframe: body.timeframe || null,
      strategy: body.strategy || null,
      setup_type: body.setup_type || null,
      screenshots: body.screenshots || [],
      entry_date: body.entry_date || new Date().toISOString(),
      exit_date: body.exit_date || null,
      signal_id: body.signal_id || null
    }

    const { data: trade, error } = await supabaseAdmin
      .from('trades')
      .insert(tradeData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create trade', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ trade }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}