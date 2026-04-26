import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../lib/supabase/api'

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

    const parsePositiveNumber = (value: any, field: string, required = false) => {
      if (value === null || value === undefined || value === '') {
        if (required) throw new Error(`${field} is required`)
        return null
      }
      const parsed = Number(value)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`${field} must be a positive number`)
      }
      return parsed
    }

    if (!body.pair) {
      return NextResponse.json(
        { error: 'Validation error', message: "Field 'pair' is required" },
        { status: 400 }
      )
    }

    let entryPrice: number
    let exitPrice: number | null
    let stopLoss: number | null
    let takeProfit: number | null
    let positionSize: number | null
    let riskAmount: number | null
    let fees: number | null

    try {
      entryPrice = parsePositiveNumber(body.entry_price, 'Entry price', true) as number
      exitPrice = parsePositiveNumber(body.exit_price, 'Exit price')
      stopLoss = parsePositiveNumber(body.stop_loss, 'Stop loss')
      takeProfit = parsePositiveNumber(body.take_profit, 'Take profit')
      positionSize = parsePositiveNumber(body.position_size, 'Size')
      riskAmount = parsePositiveNumber(body.risk_amount, 'Risk amount')
      fees = body.fees === null || body.fees === undefined || body.fees === '' ? 0 : Number(body.fees)
      if (!Number.isFinite(fees) || fees < 0) throw new Error('Fees must be zero or greater')
    } catch (validationError: any) {
      return NextResponse.json(
        { error: 'Validation error', message: validationError.message },
        { status: 400 }
      )
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

    if (exitPrice && stopLoss) {
      const risk = Math.abs(entryPrice - stopLoss)
      const reward = body.direction.toUpperCase() === 'LONG' 
        ? exitPrice - entryPrice
        : entryPrice - exitPrice
      
      r_multiple = risk > 0 ? reward / risk : 0
      
      if (positionSize) {
        pnl = reward * positionSize - (fees || 0)
        pnl_percent = (reward / entryPrice) * 100
      }
    }

    // Prepare trade data
    const tradeData = {
      user_id: user.id,
      pair: body.pair.toUpperCase(),
      direction: body.direction.toUpperCase(),
      entry_price: entryPrice,
      exit_price: exitPrice,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      position_size: positionSize,
      pnl,
      pnl_percent,
      r_multiple,
      fees: fees || 0,
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
      signal_id: body.signal_id || null,
      emotional_state: body.emotional_state || null,
      pre_thesis: body.pre_thesis || null,
      post_right: body.post_right || null,
      post_wrong: body.post_wrong || null,
      lesson: body.lesson || null,
      grade: body.grade || null,
      confluence: body.confluence || null,
      screenshot_entry: body.screenshot_entry || null,
      screenshot_exit: body.screenshot_exit || null,
      session: body.session || null,
      risk_amount: riskAmount,
      auto_imported: body.auto_imported || false
    }

    let { data: trade, error } = await supabaseAdmin
      .from('trades')
      .insert(tradeData)
      .select()
      .single()

    // Some older PulseWave databases used quantity/opened_at instead of
    // position_size/entry_date. Retry with the compatible base schema so users
    // can still log trades while migrations catch up.
    if (error && /position_size|entry_date|exit_date|screenshots|strategy|auto_imported/i.test(error.message || '')) {
      const compatibleTradeData = {
        user_id: user.id,
        signal_id: body.signal_id || null,
        pair: body.pair.toUpperCase(),
        direction: body.direction.toUpperCase(),
        entry_price: entryPrice,
        exit_price: exitPrice,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        quantity: positionSize,
        pnl,
        pnl_percent,
        r_multiple,
        fees: fees || 0,
        status: body.status || 'open',
        source: body.source || 'manual',
        exchange: body.exchange || null,
        notes: body.notes || body.pre_thesis || null,
        tags: body.tags || [],
        opened_at: body.entry_date || new Date().toISOString(),
        closed_at: body.exit_date || null,
      }

      const retry = await supabaseAdmin
        .from('trades')
        .insert(compatibleTradeData)
        .select()
        .single()

      trade = retry.data
      error = retry.error
    }

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