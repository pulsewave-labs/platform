import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../../lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view your statistics' },
        { status: 401 }
      )
    }

    // Fetch all user trades
    const { data: trades, error } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trades', message: error.message },
        { status: 500 }
      )
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        stats: {
          total_pnl: 0,
          total_pnl_percent: 0,
          win_rate: 0,
          profit_factor: 0,
          avg_r_multiple: 0,
          total_trades: 0,
          winning_trades: 0,
          losing_trades: 0,
          break_even_trades: 0,
          avg_win: 0,
          avg_loss: 0,
          best_trade: 0,
          worst_trade: 0,
          current_streak: 0,
          max_win_streak: 0,
          max_loss_streak: 0,
          avg_trade_duration: 0,
          risk_reward_ratio: 0,
          expectancy: 0
        }
      })
    }

    // Calculate statistics
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== null)
    
    if (closedTrades.length === 0) {
      return NextResponse.json({
        stats: {
          total_pnl: 0,
          total_pnl_percent: 0,
          win_rate: 0,
          profit_factor: 0,
          avg_r_multiple: 0,
          total_trades: trades.length,
          winning_trades: 0,
          losing_trades: 0,
          break_even_trades: 0,
          avg_win: 0,
          avg_loss: 0,
          best_trade: 0,
          worst_trade: 0,
          current_streak: 0,
          max_win_streak: 0,
          max_loss_streak: 0,
          avg_trade_duration: 0,
          risk_reward_ratio: 0,
          expectancy: 0,
          open_trades: trades.filter(t => t.status === 'open').length
        }
      })
    }

    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0)
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0)
    const breakEvenTrades = closedTrades.filter(t => (t.pnl || 0) === 0)

    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalPnlPercent = closedTrades.reduce((sum, t) => sum + (t.pnl_percent || 0), 0)
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
    
    const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0
    
    const bestTrade = Math.max(...closedTrades.map(t => t.pnl || 0))
    const worstTrade = Math.min(...closedTrades.map(t => t.pnl || 0))
    
    const avgRMultiple = closedTrades
      .filter(t => t.r_multiple !== null)
      .reduce((sum, t, _, arr) => sum + (t.r_multiple || 0) / arr.length, 0)

    // Calculate streaks
    let currentStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0
    let currentWinStreak = 0
    let currentLossStreak = 0

    for (let i = 0; i < closedTrades.length; i++) {
      const pnl = closedTrades[i].pnl || 0
      
      if (i === 0) {
        currentStreak = pnl > 0 ? 1 : pnl < 0 ? -1 : 0
      } else {
        const prevPnl = closedTrades[i - 1].pnl || 0
        
        if (pnl > 0) {
          currentWinStreak = prevPnl > 0 ? currentWinStreak + 1 : 1
          currentLossStreak = 0
          currentStreak = currentWinStreak
        } else if (pnl < 0) {
          currentLossStreak = prevPnl < 0 ? currentLossStreak + 1 : 1
          currentWinStreak = 0
          currentStreak = -currentLossStreak
        }
        
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
      }
    }

    // Calculate average trade duration
    const tradesWithDuration = closedTrades.filter(t => t.entry_date && t.exit_date)
    const avgTradeDuration = tradesWithDuration.length > 0 
      ? tradesWithDuration.reduce((sum, t) => {
          const duration = new Date(t.exit_date!).getTime() - new Date(t.entry_date).getTime()
          return sum + duration
        }, 0) / tradesWithDuration.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0

    // Calculate expectancy
    const expectancy = winRate > 0 && winRate < 100 
      ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss
      : 0

    // Calculate average risk-reward ratio
    const tradesWithRR = closedTrades.filter(t => t.entry_price && t.stop_loss && t.take_profit)
    const avgRiskRewardRatio = tradesWithRR.length > 0
      ? tradesWithRR.reduce((sum, t) => {
          const risk = Math.abs(t.entry_price - (t.stop_loss || 0))
          const reward = Math.abs((t.take_profit || 0) - t.entry_price)
          return sum + (risk > 0 ? reward / risk : 0)
        }, 0) / tradesWithRR.length
      : 0

    return NextResponse.json({
      stats: {
        total_pnl: Math.round(totalPnl * 100) / 100,
        total_pnl_percent: Math.round(totalPnlPercent * 100) / 100,
        win_rate: Math.round(winRate * 100) / 100,
        profit_factor: Math.round(profitFactor * 100) / 100,
        avg_r_multiple: Math.round(avgRMultiple * 100) / 100,
        total_trades: trades.length,
        closed_trades: closedTrades.length,
        open_trades: trades.filter(t => t.status === 'open').length,
        winning_trades: winningTrades.length,
        losing_trades: losingTrades.length,
        break_even_trades: breakEvenTrades.length,
        avg_win: Math.round(avgWin * 100) / 100,
        avg_loss: Math.round(avgLoss * 100) / 100,
        best_trade: Math.round(bestTrade * 100) / 100,
        worst_trade: Math.round(worstTrade * 100) / 100,
        current_streak,
        max_win_streak: maxWinStreak,
        max_loss_streak: maxLossStreak,
        avg_trade_duration: Math.round(avgTradeDuration * 100) / 100,
        risk_reward_ratio: Math.round(avgRiskRewardRatio * 100) / 100,
        expectancy: Math.round(expectancy * 100) / 100,
        gross_profit: Math.round(grossProfit * 100) / 100,
        gross_loss: Math.round(grossLoss * 100) / 100
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