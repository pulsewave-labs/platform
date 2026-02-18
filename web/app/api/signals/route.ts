import { NextRequest, NextResponse } from 'next/server'

// Mock signals data for demo
const mockActiveSignals = [
  {
    id: '1',
    pair: 'BTC/USDT',
    timeframe: '4h',
    direction: 'LONG',
    entry_price: 68450,
    stop_loss: 66800,
    take_profit: 72100,
    confidence: 92,
    status: 'ACTIVE',
    entry_time: new Date().toISOString(),
    current_price: 69200,
    strategy: 'market-structure'
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    timeframe: '6h',
    direction: 'LONG',
    entry_price: 2680,
    stop_loss: 2580,
    take_profit: 2890,
    confidence: 87,
    status: 'ACTIVE',
    entry_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    current_price: 2720,
    strategy: 'market-structure'
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    timeframe: '4h',
    direction: 'SHORT',
    entry_price: 198.50,
    stop_loss: 206.00,
    take_profit: 182.00,
    confidence: 79,
    status: 'ACTIVE',
    entry_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    current_price: 195.20,
    strategy: 'market-structure'
  }
]

const mockClosedSignals = [
  {
    id: '4',
    pair: 'AVAX/USDT',
    timeframe: '6h',
    direction: 'LONG',
    entry_price: 38.90,
    stop_loss: 37.20,
    take_profit: 42.30,
    confidence: 85,
    status: 'CLOSED',
    entry_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    exit_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    exit_price: 42.30,
    pnl: 1789,
    pnl_pct: 8.7,
    exit_reason: 'TP',
    strategy: 'market-structure'
  },
  {
    id: '5',
    pair: 'XRP/USDT',
    timeframe: '12h',
    direction: 'SHORT',
    entry_price: 0.875,
    stop_loss: 0.905,
    take_profit: 0.820,
    confidence: 76,
    status: 'CLOSED',
    entry_time: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    exit_time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    exit_price: 0.820,
    pnl: 1876,
    pnl_pct: 6.3,
    exit_reason: 'TP',
    strategy: 'market-structure'
  },
  {
    id: '6',
    pair: 'BTC/USDT',
    timeframe: '4h',
    direction: 'LONG',
    entry_price: 67200,
    stop_loss: 65800,
    take_profit: 70500,
    confidence: 88,
    status: 'CLOSED',
    entry_time: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    exit_time: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    exit_price: 65800,
    pnl: -1435,
    pnl_pct: -2.1,
    exit_reason: 'SL',
    strategy: 'market-structure'
  },
  {
    id: '7',
    pair: 'ETH/USDT',
    timeframe: '6h',
    direction: 'SHORT',
    entry_price: 2750,
    stop_loss: 2820,
    take_profit: 2580,
    confidence: 82,
    status: 'CLOSED',
    entry_time: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    exit_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    exit_price: 2580,
    pnl: 2145,
    pnl_pct: 6.2,
    exit_reason: 'TP',
    strategy: 'market-structure'
  },
  {
    id: '8',
    pair: 'SOL/USDT',
    timeframe: '4h',
    direction: 'LONG',
    entry_price: 185.20,
    stop_loss: 180.50,
    take_profit: 195.80,
    confidence: 84,
    status: 'CLOSED',
    entry_time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    exit_time: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    exit_price: 195.80,
    pnl: 1834,
    pnl_pct: 5.7,
    exit_reason: 'TP',
    strategy: 'market-structure'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const pair = searchParams.get('pair')
    const direction = searchParams.get('direction')
    const timeframe = searchParams.get('timeframe')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    // Combine all signals
    let allSignals = [...mockActiveSignals, ...mockClosedSignals]

    // Apply filters
    if (status && status !== 'all') {
      allSignals = allSignals.filter(signal => signal.status.toLowerCase() === status.toLowerCase())
    }
    
    if (pair) {
      allSignals = allSignals.filter(signal => signal.pair === pair)
    }
    
    if (direction) {
      allSignals = allSignals.filter(signal => signal.direction === direction.toUpperCase())
    }
    
    if (timeframe) {
      allSignals = allSignals.filter(signal => signal.timeframe === timeframe)
    }

    // Apply limit
    allSignals = allSignals.slice(0, limit)

    // Calculate additional metrics
    const formattedSignals = allSignals.map(signal => ({
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
    }))

    // For the main dashboard endpoint, return in the format expected by the client
    if (!status || status === 'all') {
      // Return both active and recent closed signals separately
      return NextResponse.json([
        ...mockActiveSignals,
        ...mockClosedSignals.slice(0, 10) // Recent closed signals
      ])
    }

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