'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Filter, Search, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react'
import SignalCard from '../../../components/dashboard/signal-card'
import { Signal } from '../../../types'

// Mock signals data
const mockSignals: Signal[] = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    entry: 68840,
    stopLoss: 67920,
    takeProfit: 70680,
    confidence: 82,
    regime: 'VOLATILE',
    reasoning: '4H S/R bounce + RSI oversold + volume spike. Strong confluence at key support level with bullish divergence forming.',
    factors: [
      { name: 'Support/Resistance', score: 85, weight: 0.3, description: 'Perfect bounce off 4H support level' },
      { name: 'RSI Oversold', score: 75, weight: 0.2, description: 'RSI showing oversold conditions on 4H' },
      { name: 'Volume Spike', score: 90, weight: 0.25, description: 'Unusual volume spike indicating institutional interest' },
      { name: 'Market Structure', score: 70, weight: 0.25, description: 'Higher lows forming on lower timeframes' }
    ],
    timeframe: '4h',
    createdAt: '2026-02-17T16:30:00Z',
    updatedAt: '2026-02-17T16:30:00Z',
    status: 'active',
    riskReward: 2.0,
    tags: ['breakout', 'momentum']
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    entry: 2685,
    stopLoss: 2740,
    takeProfit: 2575,
    confidence: 68,
    regime: 'TRENDING_DOWN',
    reasoning: 'Daily resistance rejection + bearish divergence. Expecting continuation of downward trend with volume confirmation.',
    factors: [
      { name: 'Resistance Level', score: 80, weight: 0.4, description: 'Strong rejection at daily resistance' },
      { name: 'Bearish Divergence', score: 65, weight: 0.3, description: 'Price vs RSI divergence forming' },
      { name: 'Volume Profile', score: 60, weight: 0.3, description: 'Low volume on rallies, high on selloffs' }
    ],
    timeframe: '1d',
    createdAt: '2026-02-17T15:45:00Z',
    updatedAt: '2026-02-17T15:45:00Z',
    status: 'active',
    riskReward: 2.0,
    tags: ['reversal', 'resistance']
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG',
    entry: 138.50,
    stopLoss: 135.20,
    takeProfit: 145.80,
    confidence: 45,
    regime: 'RANGING',
    reasoning: 'Range bound play waiting for volume confirmation. Need to see buying interest at support level.',
    factors: [
      { name: 'Range Support', score: 70, weight: 0.4, description: 'Testing range support level' },
      { name: 'Volume Confirmation', score: 20, weight: 0.3, description: 'Waiting for volume spike' },
      { name: 'Market Sentiment', score: 45, weight: 0.3, description: 'Mixed sentiment, needs catalyst' }
    ],
    timeframe: '1h',
    createdAt: '2026-02-17T16:45:00Z',
    updatedAt: '2026-02-17T16:45:00Z',
    status: 'pending',
    riskReward: 2.2,
    tags: ['range', 'support']
  },
  {
    id: '4',
    pair: 'AVAX/USDT',
    direction: 'LONG',
    entry: 42.80,
    stopLoss: 40.50,
    takeProfit: 47.30,
    confidence: 76,
    regime: 'TRENDING_UP',
    reasoning: 'Bullish flag pattern completion with strong momentum. Layer 1 tokens showing relative strength.',
    factors: [
      { name: 'Flag Pattern', score: 85, weight: 0.35, description: 'Clean bullish flag breakout' },
      { name: 'Relative Strength', score: 78, weight: 0.3, description: 'Outperforming BTC and ETH' },
      { name: 'Sector Rotation', score: 65, weight: 0.35, description: 'L1 tokens gaining favor' }
    ],
    timeframe: '4h',
    createdAt: '2026-02-17T14:20:00Z',
    updatedAt: '2026-02-17T14:20:00Z',
    status: 'active',
    riskReward: 1.95,
    tags: ['breakout', 'pattern']
  },
  {
    id: '5',
    pair: 'ADA/USDT',
    direction: 'SHORT',
    entry: 0.485,
    stopLoss: 0.505,
    takeProfit: 0.445,
    confidence: 71,
    regime: 'VOLATILE',
    reasoning: 'Head and shoulders pattern completed. Expecting weakness in altcoins as BTC dominance rises.',
    factors: [
      { name: 'H&S Pattern', score: 82, weight: 0.4, description: 'Classic head and shoulders breakdown' },
      { name: 'BTC Dominance', score: 68, weight: 0.3, description: 'BTC.D showing strength' },
      { name: 'Weak Fundamentals', score: 63, weight: 0.3, description: 'Limited ecosystem growth' }
    ],
    timeframe: '1d',
    createdAt: '2026-02-17T13:15:00Z',
    updatedAt: '2026-02-17T13:15:00Z',
    status: 'active',
    riskReward: 2.0,
    tags: ['pattern', 'breakdown']
  },
  {
    id: '6',
    pair: 'DOT/USDT',
    direction: 'LONG',
    entry: 8.25,
    stopLoss: 7.80,
    takeProfit: 9.15,
    confidence: 64,
    regime: 'RANGING',
    reasoning: 'Oversold bounce play in ranging market. Good R:R at support level with limited downside.',
    factors: [
      { name: 'Oversold RSI', score: 75, weight: 0.4, description: 'RSI below 30 on daily chart' },
      { name: 'Support Level', score: 60, weight: 0.35, description: 'Historical support area' },
      { name: 'Mean Reversion', score: 57, weight: 0.25, description: 'Extended from moving averages' }
    ],
    timeframe: '1d',
    createdAt: '2026-02-17T12:30:00Z',
    updatedAt: '2026-02-17T12:30:00Z',
    status: 'active',
    riskReward: 2.0,
    tags: ['oversold', 'bounce']
  },
  {
    id: '7',
    pair: 'LINK/USDT',
    direction: 'SHORT',
    entry: 18.50,
    stopLoss: 19.20,
    takeProfit: 16.80,
    confidence: 59,
    regime: 'VOLATILE',
    reasoning: 'Failed breakout above resistance. Expecting retest of lower range with potential breakdown.',
    factors: [
      { name: 'Failed Breakout', score: 70, weight: 0.4, description: 'Could not hold above resistance' },
      { name: 'Volume Divergence', score: 55, weight: 0.3, description: 'Lower volume on recent rally' },
      { name: 'Market Weakness', score: 52, weight: 0.3, description: 'General market showing weakness' }
    ],
    timeframe: '4h',
    createdAt: '2026-02-17T11:45:00Z',
    updatedAt: '2026-02-17T11:45:00Z',
    status: 'active',
    riskReward: 2.43,
    tags: ['failed-breakout', 'range']
  },
  {
    id: '8',
    pair: 'MATIC/USDT',
    direction: 'LONG',
    entry: 0.92,
    stopLoss: 0.875,
    takeProfit: 1.02,
    confidence: 55,
    regime: 'RANGING',
    reasoning: 'Polygon ecosystem showing signs of life. Technical setup suggests potential upward move.',
    factors: [
      { name: 'Ecosystem Growth', score: 60, weight: 0.3, description: 'Increased developer activity' },
      { name: 'Technical Setup', score: 55, weight: 0.4, description: 'Bullish divergence forming' },
      { name: 'Risk Management', score: 50, weight: 0.3, description: 'Tight stop loss available' }
    ],
    timeframe: '4h',
    createdAt: '2026-02-17T10:15:00Z',
    updatedAt: '2026-02-17T10:15:00Z',
    status: 'pending',
    riskReward: 2.22,
    tags: ['ecosystem', 'divergence']
  },
  {
    id: '9',
    pair: 'UNI/USDT',
    direction: 'SHORT',
    entry: 12.80,
    stopLoss: 13.50,
    takeProfit: 11.40,
    confidence: 48,
    regime: 'TRENDING_DOWN',
    reasoning: 'DEX tokens under pressure from regulation fears. Technical picture supports continued weakness.',
    factors: [
      { name: 'Regulatory Pressure', score: 65, weight: 0.3, description: 'SEC scrutiny increasing' },
      { name: 'Technical Weakness', score: 45, weight: 0.4, description: 'Below key moving averages' },
      { name: 'Sector Rotation', score: 35, weight: 0.3, description: 'Money flowing out of DeFi' }
    ],
    timeframe: '1d',
    createdAt: '2026-02-17T09:30:00Z',
    updatedAt: '2026-02-17T09:30:00Z',
    status: 'expired',
    riskReward: 2.0,
    tags: ['regulation', 'sector-weakness']
  }
]

const pairs = ['All', 'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT', 'MATIC/USDT', 'UNI/USDT']
const directions = ['All', 'LONG', 'SHORT']
const timeframes = ['All', '1h', '4h', '1d', '1w']
const statuses = ['All', 'active', 'pending', 'expired', 'hit_tp', 'hit_sl']

export default function SignalsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPair, setSelectedPair] = useState('All')
  const [selectedDirection, setSelectedDirection] = useState('All')
  const [selectedTimeframe, setSelectedTimeframe] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const filteredSignals = mockSignals.filter(signal => {
    const matchesSearch = signal.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         signal.reasoning.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPair = selectedPair === 'All' || signal.pair === selectedPair
    const matchesDirection = selectedDirection === 'All' || signal.direction === selectedDirection
    const matchesTimeframe = selectedTimeframe === 'All' || signal.timeframe === selectedTimeframe
    const matchesStatus = selectedStatus === 'All' || signal.status === selectedStatus

    return matchesSearch && matchesPair && matchesDirection && matchesTimeframe && matchesStatus
  })

  const activeSignals = mockSignals.filter(s => s.status === 'active').length
  const pendingSignals = mockSignals.filter(s => s.status === 'pending').length
  const totalSignals = mockSignals.length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🎯 Trading Signals</h1>
            <p className="text-gray-400">AI-powered market analysis and trade recommendations</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Active Signals</div>
              <div className="text-2xl font-bold text-emerald-400">{activeSignals}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Pending</div>
              <div className="text-2xl font-bold text-amber-400">{pendingSignals}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Today</div>
              <div className="text-2xl font-bold text-blue-400">{totalSignals}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search signals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Filter size={18} />
            <span className="font-medium">Filters</span>
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Pair
              </label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {pairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Direction
              </label>
              <select
                value={selectedDirection}
                onChange={(e) => setSelectedDirection(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {directions.map(direction => (
                  <option key={direction} value={direction}>{direction}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Timeframe
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe} value={timeframe}>{timeframe}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Results Summary */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-gray-400">
          Showing {filteredSignals.length} of {totalSignals} signals
        </p>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <TrendingUp size={14} />
            <span className="text-emerald-400 text-sm font-medium">
              {filteredSignals.filter(s => s.direction === 'LONG').length} Long
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <TrendingDown size={14} />
            <span className="text-red-400 text-sm font-medium">
              {filteredSignals.filter(s => s.direction === 'SHORT').length} Short
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Clock size={14} />
            <span className="text-amber-400 text-sm font-medium">
              {filteredSignals.filter(s => s.status === 'pending').length} Pending
            </span>
          </div>
        </div>
      </motion.div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredSignals.map((signal, index) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            delay={index * 0.1}
            isExpanded={false}
            showDetails={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredSignals.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Target size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No signals found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedPair('All')
              setSelectedDirection('All')
              setSelectedTimeframe('All')
              setSelectedStatus('All')
            }}
            className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  )
}