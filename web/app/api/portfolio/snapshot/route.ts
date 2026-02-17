import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../../lib/supabase/api'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to create snapshots' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const targetDate = body.date ? new Date(body.date) : new Date()
    const dateStr = targetDate.toISOString().split('T')[0]

    // Check if snapshot already exists for this date
    const { data: existingSnapshot, error: checkError } = await supabaseAdmin
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database error checking existing snapshot:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing snapshot', message: checkError.message },
        { status: 500 }
      )
    }

    // Calculate metrics from trades
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get trades for the target date
    const { data: dayTrades, error: dayTradesError } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', startOfDay.toISOString())
      .lte('entry_date', endOfDay.toISOString())

    if (dayTradesError) {
      console.error('Database error fetching day trades:', dayTradesError)
      return NextResponse.json(
        { error: 'Failed to fetch trades for snapshot', message: dayTradesError.message },
        { status: 500 }
      )
    }

    // Get all closed trades up to this date for cumulative calculation
    const { data: allTrades, error: allTradesError } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'closed')
      .not('pnl', 'is', null)
      .lte('exit_date', endOfDay.toISOString())

    if (allTradesError) {
      console.error('Database error fetching all trades:', allTradesError)
      return NextResponse.json(
        { error: 'Failed to fetch historical trades', message: allTradesError.message },
        { status: 500 }
      )
    }

    // Calculate daily metrics
    const dayClosedTrades = (dayTrades || []).filter(t => 
      t.status === 'closed' && 
      t.pnl !== null &&
      t.exit_date &&
      new Date(t.exit_date) >= startOfDay &&
      new Date(t.exit_date) <= endOfDay
    )

    const dailyPnl = dayClosedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const dailyWins = dayClosedTrades.filter(t => (t.pnl || 0) > 0).length

    // Calculate cumulative balance
    const cumulativePnl = (allTrades || []).reduce((sum, t) => sum + (t.pnl || 0), 0)
    const startingBalance = body.starting_balance || 10000 // Default or user-provided
    const currentBalance = startingBalance + cumulativePnl

    // Create snapshot data
    const snapshotData = {
      user_id: user.id,
      date: dateStr,
      balance: currentBalance,
      pnl: dailyPnl,
      trades_count: dayClosedTrades.length,
      win_count: dailyWins
    }

    let snapshot
    if (existingSnapshot) {
      // Update existing snapshot
      const { data: updatedSnapshot, error: updateError } = await supabaseAdmin
        .from('portfolio_snapshots')
        .update(snapshotData)
        .eq('id', existingSnapshot.id)
        .select()
        .single()

      if (updateError) {
        console.error('Database error updating snapshot:', updateError)
        return NextResponse.json(
          { error: 'Failed to update snapshot', message: updateError.message },
          { status: 500 }
        )
      }

      snapshot = updatedSnapshot
    } else {
      // Create new snapshot
      const { data: newSnapshot, error: createError } = await supabaseAdmin
        .from('portfolio_snapshots')
        .insert(snapshotData)
        .select()
        .single()

      if (createError) {
        console.error('Database error creating snapshot:', createError)
        return NextResponse.json(
          { error: 'Failed to create snapshot', message: createError.message },
          { status: 500 }
        )
      }

      snapshot = newSnapshot
    }

    // Add calculated metrics to response
    const response = {
      snapshot,
      metrics: {
        daily_pnl: Math.round(dailyPnl * 100) / 100,
        daily_trades: dayClosedTrades.length,
        daily_wins: dailyWins,
        daily_win_rate: dayClosedTrades.length > 0 ? (dailyWins / dayClosedTrades.length) * 100 : 0,
        cumulative_pnl: Math.round(cumulativePnl * 100) / 100,
        total_trades_to_date: (allTrades || []).length,
        balance_change: dailyPnl
      },
      updated: !!existingSnapshot
    }

    return NextResponse.json(response, { status: existingSnapshot ? 200 : 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view snapshots' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const { data: snapshot, error } = await supabaseAdmin
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch snapshot', message: error.message },
        { status: 500 }
      )
    }

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Not found', message: 'No snapshot found for this date' },
        { status: 404 }
      )
    }

    return NextResponse.json({ snapshot })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}