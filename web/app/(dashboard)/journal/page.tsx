'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  Calendar,
  DollarSign,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react'
import StatCard from '../../../components/dashboard/stat-card'
import EquityCurve from '../../../components/dashboard/equity-curve'
import { Trade } from '../../../types'

// Mock trades data
const mockTrades: Trade[] = [
  {
    id: '1',
    userId: 'user1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    orderType: 'market',
    entryPrice: 69200,
    exitPrice: 70540,
    quantity: 0.2,
    realizedPnL: 287.40,
    fees: 12.60,
    status: 'closed',
    openedAt: '2026-02-16T14:30:00Z',
    closedAt: '2026-02-16T16:45:00Z',
    rMultiple: 2.1,
    notes: 'Perfect S/R bounce with volume confirmation'
  },
  {
    id: '2',
    userId: 'user1',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    orderType: 'limit',
    entryPrice: 2720,
    exitPrice: 2678,
    quantity: 2.5,
    realizedPnL: -142.30,
    fees: 18.20,
    status: 'closed',
    openedAt: '2026-02-16T10:15:00Z',
    closedAt: '2026-02-16T11:30:00Z',
    rMultiple: -1.0,
    notes: 'Stopped out on false breakdown'
  },
  {
    id: '3',
    userId: 'user1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    orderType: 'market',
    entryPrice: 68500,
    exitPrice: 69912,
    quantity: 0.15,
    realizedPnL: 412.80,
    fees: 15.30,
    status: 'closed',
    openedAt: '2026-02-15T09:20:00Z',
    closedAt: '2026-02-15T15:10:00Z',
    rMultiple: 2.8,
    notes: 'Flag pattern breakout with strong follow-through'
  },
  {
    id: '4',
    userId: 'user1',
    pair: 'SOL/USDT',
    direction: 'LONG',
    orderType: 'limit',
    entryPrice: 139.50,
    exitPrice: 140.75,
    quantity: 3.0,
    realizedPnL: 89.20,
    fees: 8.50,
    status: 'closed',
    openedAt: '2026-02-15T11:30:00Z',
    closedAt: '2026-02-15T13:45:00Z',
    rMultiple: 1.2,
    notes: 'Quick scalp on news catalyst'
  },
  {
    id: '5',
    userId: 'user1',
    pair: 'BTC/USDT',
    direction: 'SHORT',
    orderType: 'market',
    entryPrice: 70100,
    exitPrice: 71200,
    quantity: 0.18,
    realizedPnL: -198.50,
    fees: 14.80,
    status: 'closed',
    openedAt: '2026-02-14T16:00:00Z',
    closedAt: '2026-02-14T17:20:00Z',
    rMultiple: -1.0,
    notes: 'Wrong timing on resistance short'
  },
  {
    id: '6',
    userId: 'user1',
    pair: 'AVAX/USDT',
    direction: 'LONG',
    orderType: 'limit',
    entryPrice: 41.20,
    exitPrice: 43.85,
    quantity: 12.0,
    realizedPnL: 318.00,
    fees: 22.50,
    status: 'closed',
    openedAt: '2026-02-14T08:15:00Z',
    closedAt: '2026-02-14T14:30:00Z',
    rMultiple: 1.8,
    notes: 'Layer 1 strength play worked perfectly'
  },
  {
    id: '7',
    userId: 'user1',
    pair: 'ETH/USDT',
    direction: 'LONG',
    orderType: 'market',
    entryPrice: 2650,
    exitPrice: 2545,
    quantity: 1.8,
    realizedPnL: -189.00,
    fees: 16.40,
    status: 'closed',
    openedAt: '2026-02-13T15:45:00Z',
    closedAt: '2026-02-13T18:10:00Z',
    rMultiple: -1.2,
    notes: 'Failed breakout, cut losses quickly'
  },
  {
    id: '8',
    userId: 'user1',
    pair: 'ADA/USDT',
    direction: 'SHORT',
    orderType: 'limit',
    entryPrice: 0.495,
    exitPrice: 0.468,
    quantity: 2500,
    realizedPnL: 675.00,
    fees: 35.80,
    status: 'closed',
    openedAt: '2026-02-13T09:30:00Z',
    closedAt: '2026-02-14T11:15:00Z',
    rMultiple: 2.4,
    notes: 'Perfect H&S pattern execution'
  }
]

// Calculate equity curve data
function generateEquityCurve(trades: Trade[]) {
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.closedAt || a.openedAt).getTime() - new Date(b.closedAt || b.openedAt).getTime()
  )
  
  let runningBalance = 10000 // Starting balance
  return sortedTrades.map((trade, index) => ({
    date: trade.closedAt || trade.openedAt,
    value: runningBalance += (trade.realizedPnL || 0),
    isWin: (trade.realizedPnL || 0) > 0
  }))
}

const equityData = generateEquityCurve(mockTrades)

// Calculate statistics
const totalTrades = mockTrades.length
const winningTrades = mockTrades.filter(t => (t.realizedPnL || 0) > 0).length
const losingTrades = mockTrades.filter(t => (t.realizedPnL || 0) < 0).length
const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

const totalPnL = mockTrades.reduce((sum, trade) => sum + (trade.realizedPnL || 0), 0)
const totalFees = mockTrades.reduce((sum, trade) => sum + trade.fees, 0)

const winningAmount = mockTrades
  .filter(t => (t.realizedPnL || 0) > 0)
  .reduce((sum, trade) => sum + (trade.realizedPnL || 0), 0)
const losingAmount = Math.abs(mockTrades
  .filter(t => (t.realizedPnL || 0) < 0)
  .reduce((sum, trade) => sum + (trade.realizedPnL || 0), 0))

const profitFactor = losingAmount > 0 ? winningAmount / losingAmount : 0

const bestTrade = Math.max(...mockTrades.map(t => t.realizedPnL || 0))
const worstTrade = Math.min(...mockTrades.map(t => t.realizedPnL || 0))

const rMultiples = mockTrades.map(t => t.rMultiple || 0)
const avgRMultiple = rMultiples.length > 0 ? 
  rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length : 0

export default function JournalPage() {
  const [selectedPair, setSelectedPair] = useState('All')
  const [selectedDirection, setSelectedDirection] = useState('All')
  const [selectedOutcome, setSelectedOutcome] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const pairs = ['All', ...Array.from(new Set(mockTrades.map(t => t.pair)))]
  const directions = ['All', 'LONG', 'SHORT']
  const outcomes = ['All', 'Winners', 'Losers']

  const filteredTrades = mockTrades.filter(trade => {
    const matchesPair = selectedPair === 'All' || trade.pair === selectedPair
    const matchesDirection = selectedDirection === 'All' || trade.direction === selectedDirection
    const matchesOutcome = selectedOutcome === 'All' || 
      (selectedOutcome === 'Winners' && (trade.realizedPnL || 0) > 0) ||
      (selectedOutcome === 'Losers' && (trade.realizedPnL || 0) < 0)
    
    return matchesPair && matchesDirection && matchesOutcome
  }).sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.closedAt || a.openedAt).getTime()
        bValue = new Date(b.closedAt || b.openedAt).getTime()
        break
      case 'pnl':
        aValue = a.realizedPnL || 0
        bValue = b.realizedPnL || 0
        break
      case 'r-multiple':
        aValue = a.rMultiple || 0
        bValue = b.rMultiple || 0
        break
      default:
        return 0
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

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
            <h1 className="text-2xl font-bold text-white mb-2">📓 Trading Journal</h1>
            <p className="text-gray-400">Track performance and analyze your trading patterns</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/20 transition-colors">
            <Download size={18} />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total P&L"
          value={`$${totalPnL.toFixed(2)}`}
          change={{
            value: totalPnL > 0 ? `+${totalPnL.toFixed(2)}` : `${totalPnL.toFixed(2)}`,
            type: totalPnL > 0 ? 'positive' : 'negative'
          }}
          delay={0}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          change={{
            value: `${winningTrades}W / ${losingTrades}L`,
            type: winRate >= 60 ? 'positive' : winRate >= 50 ? 'neutral' : 'negative'
          }}
          delay={0.1}
        />
        <StatCard
          title="Avg R-Multiple"
          value={avgRMultiple.toFixed(2)}
          change={{
            value: `${rMultiples.filter(r => r > 0).length} positive R`,
            type: avgRMultiple > 1 ? 'positive' : avgRMultiple > 0 ? 'neutral' : 'negative'
          }}
          suffix="R"
          delay={0.2}
        />
        <StatCard
          title="Profit Factor"
          value={profitFactor.toFixed(2)}
          change={{
            value: profitFactor > 2 ? 'Excellent' : profitFactor > 1.5 ? 'Good' : 'Needs work',
            type: profitFactor > 1.5 ? 'positive' : profitFactor > 1.2 ? 'neutral' : 'negative'
          }}
          delay={0.3}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-emerald-400" size={18} />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Best Trade</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">${bestTrade.toFixed(2)}</div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-400" size={18} />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Worst Trade</span>
          </div>
          <div className="text-xl font-bold text-red-400">${worstTrade.toFixed(2)}</div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-amber-400" size={18} />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Fees</span>
          </div>
          <div className="text-xl font-bold text-amber-400">${totalFees.toFixed(2)}</div>
        </motion.div>

        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-400" size={18} />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Trades</span>
          </div>
          <div className="text-xl font-bold text-blue-400">{totalTrades}</div>
        </motion.div>
      </div>

      {/* Equity Curve */}
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">📈 Equity Curve</h3>
        <EquityCurve 
          data={equityData}
          width={800}
          height={300}
          showTooltip={true}
          className="w-full"
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Pair
            </label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            >
              {directions.map(direction => (
                <option key={direction} value={direction}>{direction}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Outcome
            </label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            >
              {outcomes.map(outcome => (
                <option key={outcome} value={outcome}>{outcome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            >
              <option value="date">Date</option>
              <option value="pnl">P&L</option>
              <option value="r-multiple">R-Multiple</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Trades Table */}
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="p-5 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">
            Trade History ({filteredTrades.length} trades)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pair</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Direction</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Exit</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">P&L</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">R-Mult</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, index) => (
                <motion.tr
                  key={trade.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.05 }}
                >
                  <td className="p-4 text-sm text-gray-300">
                    {new Date(trade.closedAt || trade.openedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{trade.pair}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.direction === 'LONG' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-mono text-gray-300">${trade.entryPrice.toLocaleString()}</td>
                  <td className="p-4 text-sm font-mono text-gray-300">
                    {trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-4 text-sm font-semibold">
                    <span className={`${
                      (trade.realizedPnL || 0) > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {(trade.realizedPnL || 0) > 0 ? '+' : ''}${(trade.realizedPnL || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-semibold">
                    <span className={`${
                      (trade.rMultiple || 0) > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {(trade.rMultiple || 0) > 0 ? '+' : ''}{(trade.rMultiple || 0).toFixed(1)}R
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400 max-w-xs truncate">
                    {trade.notes || '-'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}