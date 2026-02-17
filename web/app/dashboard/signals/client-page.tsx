'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import SignalCard from '../../../components/dashboard/signal-card'
import { SignalCardSkeleton } from '../../../components/ui/skeleton'
import { EmptyState, DemoModeBanner } from '../../../components/ui/empty-state'
import { useSignals } from '../../../lib/hooks'
import { ChevronDown, Filter, Target } from 'lucide-react'

type Direction = 'ALL' | 'LONG' | 'SHORT'
type Timeframe = 'ALL' | '15m' | '30m' | '1H' | '4H' | '1D'

// Mock signals data - using snake_case to match API
const mockSignals = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG' as const,
    entry: 69420,
    stop_loss: 68200,
    take_profit: 72100,
    confidence: 87,
    timeframe: '4H',
    status: 'active' as const,
    risk_reward_ratio: 2.2,
    reasoning: 'Strong support bounce at key level + RSI oversold + volume spike confirms bullish momentum',
    regime: 'trending',
    factors: ['support_bounce', 'oversold_rsi', 'volume_spike'],
    min_tier: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    expires_at: '2024-01-16T10:00:00Z',
    price_to_stop: 1220,
    price_to_target: 2680
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT' as const,
    entry: 2742,
    stop_loss: 2820,
    take_profit: 2586,
    confidence: 73,
    timeframe: '1D',
    status: 'active' as const,
    risk_reward_ratio: 2.0,
    reasoning: 'Daily resistance rejection with bearish divergence on RSI, volume profile shows selling pressure',
    regime: 'range_bound',
    factors: ['resistance_rejection', 'bearish_divergence', 'volume_selling'],
    min_tier: 1,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
    expires_at: '2024-01-16T08:00:00Z',
    price_to_stop: 78,
    price_to_target: 156
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG' as const,
    entry: 142.50,
    stop_loss: 138.20,
    take_profit: 150.80,
    confidence: 68,
    timeframe: '2H',
    status: 'pending' as const,
    risk_reward_ratio: 1.9,
    reasoning: 'Waiting for volume confirmation above 50 EMA, bullish flag pattern completion needed',
    regime: 'trending',
    factors: ['ema_test', 'flag_pattern', 'volume_confirm'],
    min_tier: 2,
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    expires_at: '2024-01-16T12:00:00Z',
    price_to_stop: 4.30,
    price_to_target: 8.30
  },
  {
    id: '4',
    pair: 'AVAX/USDT',
    direction: 'SHORT' as const,
    entry: 35.80,
    stop_loss: 37.20,
    take_profit: 32.90,
    confidence: 82,
    timeframe: '1H',
    status: 'active' as const,
    risk_reward_ratio: 2.1,
    reasoning: 'Break below key support with high volume, momentum indicators turning bearish',
    regime: 'trending',
    factors: ['support_break', 'high_volume', 'bearish_momentum'],
    min_tier: 1,
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
    expires_at: '2024-01-16T14:00:00Z',
    price_to_stop: 1.40,
    price_to_target: 2.90
  },
  {
    id: '5',
    pair: 'MATIC/USDT',
    direction: 'LONG' as const,
    entry: 0.8420,
    stop_loss: 0.8180,
    take_profit: 0.8950,
    confidence: 91,
    timeframe: '30m',
    status: 'filled' as const,
    risk_reward_ratio: 2.2,
    reasoning: 'Perfect bounce from daily support, bullish engulfing candle with strong volume',
    regime: 'trending',
    factors: ['support_bounce', 'bullish_engulfing', 'strong_volume'],
    min_tier: 1,
    created_at: '2024-01-15T11:30:00Z',
    updated_at: '2024-01-15T11:30:00Z',
    expires_at: '2024-01-16T11:30:00Z',
    price_to_stop: 0.0240,
    price_to_target: 0.0530
  },
  {
    id: '6',
    pair: 'LINK/USDT',
    direction: 'LONG' as const,
    entry: 14.25,
    stop_loss: 13.85,
    take_profit: 15.45,
    confidence: 76,
    timeframe: '4H',
    status: 'active' as const,
    risk_reward_ratio: 3.0,
    reasoning: 'Breaking out of symmetrical triangle, RSI showing positive momentum divergence',
    regime: 'trending',
    factors: ['triangle_breakout', 'momentum_divergence', 'rsi_positive'],
    min_tier: 1,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    expires_at: '2024-01-16T09:00:00Z',
    price_to_stop: 0.40,
    price_to_target: 1.20
  },
  {
    id: '7',
    pair: 'ADA/USDT',
    direction: 'SHORT' as const,
    entry: 0.4580,
    stop_loss: 0.4720,
    take_profit: 0.4300,
    confidence: 64,
    timeframe: '1D',
    status: 'pending' as const,
    risk_reward_ratio: 2.0,
    reasoning: 'Failed retest of broken support level, looking for confirmation of lower high formation',
    regime: 'range_bound',
    factors: ['failed_retest', 'broken_support', 'lower_high'],
    min_tier: 2,
    created_at: '2024-01-15T07:00:00Z',
    updated_at: '2024-01-15T07:00:00Z',
    expires_at: '2024-01-16T07:00:00Z',
    price_to_stop: 0.0140,
    price_to_target: 0.0280
  },
  {
    id: '8',
    pair: 'DOT/USDT',
    direction: 'LONG' as const,
    entry: 6.85,
    stop_loss: 6.55,
    take_profit: 7.75,
    confidence: 79,
    timeframe: '2H',
    status: 'active' as const,
    risk_reward_ratio: 3.0,
    reasoning: 'Double bottom pattern completion, volume increasing on breakout attempt',
    regime: 'trending',
    factors: ['double_bottom', 'volume_increase', 'breakout_attempt'],
    min_tier: 1,
    created_at: '2024-01-15T13:00:00Z',
    updated_at: '2024-01-15T13:00:00Z',
    expires_at: '2024-01-16T13:00:00Z',
    price_to_stop: 0.30,
    price_to_target: 0.90
  }
]

const pairs = ['ALL', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'MATIC/USDT', 'LINK/USDT', 'ADA/USDT', 'DOT/USDT']
const directions: Direction[] = ['ALL', 'LONG', 'SHORT']
const timeframes: Timeframe[] = ['ALL', '15m', '30m', '1H', '4H', '1D']

export default function SignalsPage() {
  const [selectedPair, setSelectedPair] = useState('ALL')
  const [selectedDirection, setSelectedDirection] = useState<Direction>('ALL')
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('ALL')
  
  // Fetch signals with filters
  const { data: signals, loading, error, refetch } = useSignals({
    pair: selectedPair === 'ALL' ? undefined : selectedPair,
    direction: selectedDirection === 'ALL' ? undefined : selectedDirection,
    timeframe: selectedTimeframe === 'ALL' ? undefined : selectedTimeframe
  })

  // Use mock data for demo mode
  const filteredSignals = signals || mockSignals.filter(signal => {
    const pairMatch = selectedPair === 'ALL' || signal.pair === selectedPair
    const directionMatch = selectedDirection === 'ALL' || signal.direction === selectedDirection
    const timeframeMatch = selectedTimeframe === 'ALL' || signal.timeframe === selectedTimeframe
    
    return pairMatch && directionMatch && timeframeMatch
  })
  
  const activeCount = filteredSignals.filter(s => s.status === 'active').length
  const pendingCount = filteredSignals.filter(s => s.status === 'pending').length
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#00F0B5]/20 rounded-xl flex items-center justify-center">
            <Target size={18} className="text-[#00F0B5]" />
          </div>
          <div>
            <div className="text-sm text-[#6b7280]">AI Trading Signals</div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#4ade80] font-semibold">{activeCount} Active</span>
              <span className="text-[#fbbf24] font-semibold">{pendingCount} Pending</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Filters */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-[#6b7280]" />
          <span className="text-sm font-medium text-[#6b7280] uppercase tracking-wide">Filters</span>
        </div>
        
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          {/* Pair Filter */}
          <div className="relative">
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-base md:text-sm text-white appearance-none cursor-pointer hover:border-[#1b2332]/80 transition-colors min-h-[48px]"
            >
              {pairs.map(pair => (
                <option key={pair} value={pair}>{pair === 'ALL' ? 'All Pairs' : pair}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
          </div>
          
          {/* Direction Filter */}
          <div className="flex bg-[#0a0e17] border border-[#1b2332] rounded-xl p-1 min-h-[48px]">
            {directions.map(direction => (
              <button
                key={direction}
                onClick={() => setSelectedDirection(direction)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors min-h-[44px] ${
                  selectedDirection === direction
                    ? 'bg-[#00F0B5]/20 text-[#00F0B5]'
                    : 'text-[#6b7280] hover:text-[#9ca3af]'
                }`}
              >
                {direction === 'ALL' ? 'All' : direction}
              </button>
            ))}
          </div>
          
          {/* Timeframe Filter */}
          <div className="relative">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as Timeframe)}
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-base md:text-sm text-white appearance-none cursor-pointer hover:border-[#1b2332]/80 transition-colors min-h-[48px]"
            >
              {timeframes.map(tf => (
                <option key={tf} value={tf}>{tf === 'ALL' ? 'All Timeframes' : tf}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
          </div>
        </div>
      </motion.div>
      
      {/* Demo Mode Banner */}
      {error && <DemoModeBanner />}
      
      {/* Signals List */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <SignalCardSkeleton key={index} />
          ))
        ) : filteredSignals.length > 0 ? (
          filteredSignals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
            >
              <SignalCard signal={signal} />
              {signal.reasoning && (
                <div className="mt-3 ml-4 p-4 bg-[#0a0e17] border-l-2 border-[#1b2332] rounded-r-xl">
                  <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">Analysis</div>
                  <p className="text-sm text-[#9ca3af] leading-relaxed">{signal.reasoning}</p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon={Target}
            title="No signals found"
            description="Try adjusting your filters to see more signals."
            action={{ label: 'Refresh', onClick: refetch }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}