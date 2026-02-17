'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import SignalCard from '../../../components/dashboard/signal-card'
import { ChevronDown, Filter, Target } from 'lucide-react'

type Direction = 'ALL' | 'LONG' | 'SHORT'
type Timeframe = 'ALL' | '15m' | '30m' | '1H' | '4H' | '1D'

// Mock signals data
const mockSignals = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG' as const,
    entry: 69420,
    stopLoss: 68200,
    takeProfit: 72100,
    confidence: 87,
    timeframe: '4H',
    status: 'active' as const,
    riskReward: 2.2,
    reasoning: 'Strong support bounce at key level + RSI oversold + volume spike confirms bullish momentum'
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT' as const,
    entry: 2742,
    stopLoss: 2820,
    takeProfit: 2586,
    confidence: 73,
    timeframe: '1D',
    status: 'active' as const,
    riskReward: 2.0,
    reasoning: 'Daily resistance rejection with bearish divergence on RSI, volume profile shows selling pressure'
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG' as const,
    entry: 142.50,
    stopLoss: 138.20,
    takeProfit: 150.80,
    confidence: 68,
    timeframe: '2H',
    status: 'pending' as const,
    riskReward: 1.9,
    reasoning: 'Waiting for volume confirmation above 50 EMA, bullish flag pattern completion needed'
  },
  {
    id: '4',
    pair: 'AVAX/USDT',
    direction: 'SHORT' as const,
    entry: 35.80,
    stopLoss: 37.20,
    takeProfit: 32.90,
    confidence: 82,
    timeframe: '1H',
    status: 'active' as const,
    riskReward: 2.1,
    reasoning: 'Break below key support with high volume, momentum indicators turning bearish'
  },
  {
    id: '5',
    pair: 'MATIC/USDT',
    direction: 'LONG' as const,
    entry: 0.8420,
    stopLoss: 0.8180,
    takeProfit: 0.8950,
    confidence: 91,
    timeframe: '30m',
    status: 'filled' as const,
    riskReward: 2.2,
    reasoning: 'Perfect bounce from daily support, bullish engulfing candle with strong volume'
  },
  {
    id: '6',
    pair: 'LINK/USDT',
    direction: 'LONG' as const,
    entry: 14.25,
    stopLoss: 13.85,
    takeProfit: 15.45,
    confidence: 76,
    timeframe: '4H',
    status: 'active' as const,
    riskReward: 3.0,
    reasoning: 'Breaking out of symmetrical triangle, RSI showing positive momentum divergence'
  },
  {
    id: '7',
    pair: 'ADA/USDT',
    direction: 'SHORT' as const,
    entry: 0.4580,
    stopLoss: 0.4720,
    takeProfit: 0.4300,
    confidence: 64,
    timeframe: '1D',
    status: 'pending' as const,
    riskReward: 2.0,
    reasoning: 'Failed retest of broken support level, looking for confirmation of lower high formation'
  },
  {
    id: '8',
    pair: 'DOT/USDT',
    direction: 'LONG' as const,
    entry: 6.85,
    stopLoss: 6.55,
    takeProfit: 7.75,
    confidence: 79,
    timeframe: '2H',
    status: 'active' as const,
    riskReward: 3.0,
    reasoning: 'Double bottom pattern completion, volume increasing on breakout attempt'
  }
]

const pairs = ['ALL', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'MATIC/USDT', 'LINK/USDT', 'ADA/USDT', 'DOT/USDT']
const directions: Direction[] = ['ALL', 'LONG', 'SHORT']
const timeframes: Timeframe[] = ['ALL', '15m', '30m', '1H', '4H', '1D']

export default function SignalsPage() {
  const [selectedPair, setSelectedPair] = useState('ALL')
  const [selectedDirection, setSelectedDirection] = useState<Direction>('ALL')
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('ALL')
  
  const filteredSignals = mockSignals.filter(signal => {
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
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-[#6b7280]" />
          <span className="text-sm font-medium text-[#6b7280] uppercase tracking-wide">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pair Filter */}
          <div className="relative">
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer hover:border-[#1b2332]/80 transition-colors"
            >
              {pairs.map(pair => (
                <option key={pair} value={pair}>{pair === 'ALL' ? 'All Pairs' : pair}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
          </div>
          
          {/* Direction Filter */}
          <div className="flex bg-[#0a0e17] border border-[#1b2332] rounded-xl p-1">
            {directions.map(direction => (
              <button
                key={direction}
                onClick={() => setSelectedDirection(direction)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer hover:border-[#1b2332]/80 transition-colors"
            >
              {timeframes.map(tf => (
                <option key={tf} value={tf}>{tf === 'ALL' ? 'All Timeframes' : tf}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none" />
          </div>
        </div>
      </motion.div>
      
      {/* Signals List */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {filteredSignals.map((signal, index) => (
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
        ))}
        
        {filteredSignals.length === 0 && (
          <motion.div
            className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Target size={48} className="text-[#1b2332] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No signals found</h3>
            <p className="text-[#6b7280]">Try adjusting your filters to see more signals.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}