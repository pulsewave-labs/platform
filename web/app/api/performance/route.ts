import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Trade {
  pair: string
  timeframe: string
  action: 'LONG' | 'SHORT'
  entry_price: number
  exit_price: number
  stop_loss: number
  take_profit: number
  pnl: number
  pnl_pct: number
  fees: number
  risk_amount: number
  position_size: number
  notional: number
  exit_reason: string
  confidence: number
  entry_time: string
  exit_time: string
  balance_after: number
  strategy: string
  status: string
}

export async function GET() {
  try {
    // Load trade data
    const dataPath = path.join(process.cwd(), 'public', 'data', 'trades.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const trades: Trade[] = JSON.parse(rawData)

    // Calculate basic stats
    const startingCapital = 10000
    const finalBalance = trades[trades.length - 1]?.balance_after || 218418
    const totalReturn = ((finalBalance - startingCapital) / startingCapital) * 100
    const totalTrades = trades.length
    const wins = trades.filter(t => t.pnl > 0).length
    const losses = totalTrades - wins
    const winRate = (wins / totalTrades) * 100

    // Calculate profit factor
    const grossProfit = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0

    // Calculate max drawdown
    let maxDrawdown = 0
    let peak = startingCapital
    for (const trade of trades) {
      if (trade.balance_after > peak) {
        peak = trade.balance_after
      }
      const drawdown = ((peak - trade.balance_after) / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    // Group trades by month
    const monthlyGroups: { [key: string]: Trade[] } = {}
    trades.forEach(trade => {
      const date = new Date(trade.entry_time)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = []
      }
      monthlyGroups[monthKey].push(trade)
    })

    // Calculate monthly performance
    let runningBalance = startingCapital
    const monthly = Object.entries(monthlyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, monthTrades]) => {
        const monthPnl = monthTrades.reduce((sum, t) => sum + t.pnl, 0)
        const previousBalance = runningBalance
        runningBalance += monthPnl
        const monthlyReturn = (monthPnl / previousBalance) * 100

        return {
          month,
          trades: monthTrades.length,
          wins: monthTrades.filter(t => t.pnl > 0).length,
          losses: monthTrades.filter(t => t.pnl < 0).length,
          pnl: Math.round(monthPnl),
          pnlPct: parseFloat(monthlyReturn.toFixed(1)),
          balance: Math.round(runningBalance)
        }
      })

    const profitableMonths = monthly.filter(m => m.pnl > 0).length
    const totalMonths = monthly.length
    const avgMonthlyPnl = monthly.reduce((sum, m) => sum + m.pnl, 0) / totalMonths

    // Group trades by pair/timeframe
    const pairGroups: { [key: string]: Trade[] } = {}
    trades.forEach(trade => {
      const pairKey = `${trade.pair}-${trade.timeframe}`
      if (!pairGroups[pairKey]) {
        pairGroups[pairKey] = []
      }
      pairGroups[pairKey].push(trade)
    })

    // Calculate pair performance
    const pairs = Object.entries(pairGroups)
      .map(([pairKey, pairTrades]) => {
        const [pair, timeframe] = pairKey.split('-')
        const pairPnl = pairTrades.reduce((sum, t) => sum + t.pnl, 0)
        const pairWins = pairTrades.filter(t => t.pnl > 0).length
        const pairWinRate = (pairWins / pairTrades.length) * 100
        const avgPnl = pairPnl / pairTrades.length

        return {
          pair,
          timeframe,
          trades: pairTrades.length,
          winRate: parseFloat(pairWinRate.toFixed(1)),
          pnl: Math.round(pairPnl),
          avgPnl: Math.round(avgPnl)
        }
      })
      .sort((a, b) => b.pnl - a.pnl)

    // Public trades are delayed by 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const publicTrades = trades.filter(t => new Date(t.exit_time) <= sevenDaysAgo)
      .sort((a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime())

    const response = {
      stats: {
        startingCapital,
        finalBalance: Math.round(finalBalance),
        totalReturn: parseFloat(totalReturn.toFixed(1)),
        totalTrades,
        wins,
        losses,
        winRate: parseFloat(winRate.toFixed(1)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        maxDrawdown: parseFloat(maxDrawdown.toFixed(1)),
        profitableMonths,
        totalMonths,
        avgMonthlyPnl: Math.round(avgMonthlyPnl)
      },
      monthly,
      pairs,
      trades: publicTrades,
      delayed: true,
      delayDays: 7
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error loading performance data:', error)
    return NextResponse.json(
      { error: 'Failed to load performance data' },
      { status: 500 }
    )
  }
}