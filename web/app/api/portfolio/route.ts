import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view your portfolio' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - days)

    // Fetch portfolio snapshots
    const { data: snapshots, error } = await supabaseAdmin
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch portfolio data', message: error.message },
        { status: 500 }
      )
    }

    // If no snapshots exist, generate basic data from trades
    if (!snapshots || snapshots.length === 0) {
      // Get trade data to calculate basic metrics
      const { data: trades, error: tradesError } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'closed')
        .not('pnl', 'is', null)
        .gte('entry_date', startDate.toISOString())
        .order('entry_date', { ascending: true })

      if (tradesError) {
        console.error('Database error fetching trades:', tradesError)
        return NextResponse.json({ snapshots: [] })
      }

      // Generate daily snapshots from trades
      const dailyData: { [key: string]: { pnl: number, trades: number, wins: number } } = {}
      
      if (trades) {
        for (const trade of trades) {
          const date = new Date(trade.entry_date).toISOString().split('T')[0]
          if (!dailyData[date]) {
            dailyData[date] = { pnl: 0, trades: 0, wins: 0 }
          }
          dailyData[date].pnl += trade.pnl || 0
          dailyData[date].trades += 1
          if ((trade.pnl || 0) > 0) {
            dailyData[date].wins += 1
          }
        }
      }

      // Convert to snapshots format
      const generatedSnapshots = []
      let cumulativePnl = 0
      const baseBalance = 10000 // Default starting balance

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dayData = dailyData[dateStr] || { pnl: 0, trades: 0, wins: 0 }
        
        cumulativePnl += dayData.pnl
        
        generatedSnapshots.push({
          date: dateStr,
          balance: baseBalance + cumulativePnl,
          pnl: dayData.pnl,
          trades_count: dayData.trades,
          win_count: dayData.wins,
          created_at: d.toISOString()
        })
      }

      return NextResponse.json({ 
        snapshots: generatedSnapshots,
        meta: {
          days,
          generated: true,
          message: 'Portfolio snapshots generated from trade data'
        }
      })
    }

    // Calculate additional metrics for existing snapshots
    const enrichedSnapshots = snapshots.map((snapshot, index) => {
      const prevSnapshot = index > 0 ? snapshots[index - 1] : null
      const dailyChange = prevSnapshot ? snapshot.balance - prevSnapshot.balance : 0
      const dailyChangePercent = prevSnapshot && prevSnapshot.balance > 0 
        ? (dailyChange / prevSnapshot.balance) * 100 
        : 0

      return {
        ...snapshot,
        daily_change: Math.round(dailyChange * 100) / 100,
        daily_change_percent: Math.round(dailyChangePercent * 100) / 100,
        win_rate: snapshot.trades_count > 0 ? (snapshot.win_count / snapshot.trades_count) * 100 : 0
      }
    })

    // Calculate portfolio summary
    const firstSnapshot = enrichedSnapshots[0]
    const lastSnapshot = enrichedSnapshots[enrichedSnapshots.length - 1]
    const totalReturn = firstSnapshot && lastSnapshot 
      ? lastSnapshot.balance - firstSnapshot.balance 
      : 0
    const totalReturnPercent = firstSnapshot && firstSnapshot.balance > 0 
      ? (totalReturn / firstSnapshot.balance) * 100 
      : 0

    const summary = {
      total_return: Math.round(totalReturn * 100) / 100,
      total_return_percent: Math.round(totalReturnPercent * 100) / 100,
      starting_balance: firstSnapshot?.balance || 0,
      current_balance: lastSnapshot?.balance || 0,
      total_trades: enrichedSnapshots.reduce((sum, s) => sum + s.trades_count, 0),
      total_wins: enrichedSnapshots.reduce((sum, s) => sum + s.win_count, 0),
      days_active: enrichedSnapshots.filter(s => s.trades_count > 0).length,
      best_day: enrichedSnapshots.reduce((best, current) => 
        current.daily_change > (best?.daily_change || -Infinity) ? current : best, enrichedSnapshots[0]
      ),
      worst_day: enrichedSnapshots.reduce((worst, current) => 
        current.daily_change < (worst?.daily_change || Infinity) ? current : worst, enrichedSnapshots[0]
      )
    }

    return NextResponse.json({ 
      snapshots: enrichedSnapshots,
      summary,
      meta: { days }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}