'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calculator,
  Target,
  Activity,
  Zap,
  DollarSign,
  BarChart3
} from 'lucide-react'
import RiskGauge from '../../../components/dashboard/risk-gauge'
import StatCard from '../../../components/dashboard/stat-card'
import { Position } from '../../../types'

// Mock positions data
const mockPositions: Position[] = [
  {
    id: '1',
    pair: 'BTC/USDT',
    side: 'LONG',
    size: 0.2,
    entryPrice: 68840,
    currentPrice: 68961,
    unrealizedPnL: 24.20,
    unrealizedPnLPercent: 0.18,
    riskAmount: 184.00,
    stopLoss: 67920,
    takeProfit: 70680,
    openedAt: '2026-02-17T16:30:00Z'
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    side: 'SHORT',
    size: 2.5,
    entryPrice: 2685,
    currentPrice: 2692,
    unrealizedPnL: -17.50,
    unrealizedPnLPercent: -0.26,
    riskAmount: 137.50,
    stopLoss: 2740,
    takeProfit: 2575,
    openedAt: '2026-02-17T15:45:00Z'
  }
]

// Mock portfolio heat map data
const mockHeatMap = [
  { pair: 'BTC/USDT', allocation: 45, risk: 25, pnl: 1.2 },
  { pair: 'ETH/USDT', allocation: 35, risk: 20, pnl: -0.8 },
  { pair: 'SOL/USDT', allocation: 0, risk: 0, pnl: 0 },
  { pair: 'AVAX/USDT', allocation: 0, risk: 0, pnl: 0 },
  { pair: 'MATIC/USDT', allocation: 0, risk: 0, pnl: 0 },
  { pair: 'ADA/USDT', allocation: 0, risk: 0, pnl: 0 }
]

// Mock daily P&L data for chart
const mockDailyPnL = [
  { date: '2026-02-10', pnl: 120 },
  { date: '2026-02-11', pnl: -85 },
  { date: '2026-02-12', pnl: 245 },
  { date: '2026-02-13', pnl: -160 },
  { date: '2026-02-14', pnl: 95 },
  { date: '2026-02-15', pnl: 380 },
  { date: '2026-02-16', pnl: -142 },
  { date: '2026-02-17', pnl: 6.70 }
]

function TiltDetector({ score }: { score: number }) {
  const getTiltLevel = (score: number) => {
    if (score <= -60) return { level: 'Revenge Trading', emoji: '😡', color: 'text-red-400', bg: 'bg-red-500/10' }
    if (score <= -30) return { level: 'Frustrated', emoji: '😤', color: 'text-orange-400', bg: 'bg-orange-500/10' }
    if (score <= -10) return { level: 'Slightly Tilted', emoji: '😐', color: 'text-amber-400', bg: 'bg-amber-500/10' }
    if (score <= 10) return { level: 'Cool', emoji: '😎', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    if (score <= 30) return { level: 'Confident', emoji: '😏', color: 'text-blue-400', bg: 'bg-blue-500/10' }
    return { level: 'Overconfident', emoji: '🤑', color: 'text-purple-400', bg: 'bg-purple-500/10' }
  }
  
  const tilt = getTiltLevel(score)
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${tilt.bg} border-opacity-30`}>
      <div className="text-2xl">{tilt.emoji}</div>
      <div>
        <div className={`font-semibold ${tilt.color}`}>{tilt.level}</div>
        <div className="text-sm text-gray-400">Emotional State Score: {score}</div>
      </div>
    </div>
  )
}

function PositionSizeCalculator() {
  const [accountSize, setAccountSize] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [entryPrice, setEntryPrice] = useState(69000)
  const [stopLoss, setStopLoss] = useState(67500)
  
  const riskAmount = (accountSize * riskPercent) / 100
  const stopDistance = Math.abs(entryPrice - stopLoss)
  const positionSize = stopDistance > 0 ? riskAmount / stopDistance : 0
  
  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Position Size Calculator</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Account Size ($)</label>
          <input
            type="number"
            value={accountSize}
            onChange={(e) => setAccountSize(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Risk % per Trade</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            step="0.1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Entry Price ($)</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Stop Loss ($)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">${riskAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-400">Risk Amount</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{positionSize.toFixed(4)}</div>
          <div className="text-sm text-gray-400">Position Size</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{stopDistance.toFixed(2)}</div>
          <div className="text-sm text-gray-400">Stop Distance</div>
        </div>
      </div>
    </motion.div>
  )
}

function CorrelationMatrix() {
  const correlations = [
    { pair1: 'BTC/USDT', pair2: 'ETH/USDT', correlation: 0.85 },
    { pair1: 'BTC/USDT', pair2: 'SOL/USDT', correlation: 0.72 },
    { pair1: 'BTC/USDT', pair2: 'AVAX/USDT', correlation: 0.68 },
    { pair1: 'ETH/USDT', pair2: 'SOL/USDT', correlation: 0.79 },
    { pair1: 'ETH/USDT', pair2: 'AVAX/USDT', correlation: 0.82 },
    { pair1: 'SOL/USDT', pair2: 'AVAX/USDT', correlation: 0.74 }
  ]
  
  const getCorrelationColor = (corr: number) => {
    if (corr >= 0.8) return 'bg-red-500/20 text-red-400'
    if (corr >= 0.6) return 'bg-amber-500/20 text-amber-400'
    if (corr >= 0.4) return 'bg-emerald-500/20 text-emerald-400'
    return 'bg-gray-500/20 text-gray-400'
  }
  
  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-purple-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Correlation Matrix</h3>
      </div>
      
      <div className="space-y-2">
        {correlations.map((corr, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 + index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{corr.pair1}</span>
              <span className="text-gray-500">×</span>
              <span className="text-sm text-gray-300">{corr.pair2}</span>
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${getCorrelationColor(corr.correlation)}`}>
              {(corr.correlation * 100).toFixed(0)}%
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="text-sm text-amber-400 font-medium">⚠️ High Correlation Warning</div>
        <div className="text-xs text-gray-400 mt-1">
          BTC and ETH positions show 85% correlation - consider reducing exposure
        </div>
      </div>
    </motion.div>
  )
}

export default function RiskPage() {
  const totalRisk = mockPositions.reduce((sum, pos) => sum + pos.riskAmount, 0)
  const totalUnrealizedPnL = mockPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0)
  const riskUsedPercent = Math.min((totalRisk / 1000) * 100, 100) // Assuming $1000 daily limit
  
  const dailyLimit = 500
  const riskBudgetUsed = 45 // Current risk budget usage
  const tiltScore = 8 // Emotional state score

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
            <h1 className="text-2xl font-bold text-white mb-2">🛡️ Risk Management</h1>
            <p className="text-gray-400">Monitor and control your trading risk exposure</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Daily Risk Used</div>
              <div className="text-2xl font-bold text-emerald-400">{riskBudgetUsed}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Open Positions</div>
              <div className="text-2xl font-bold text-blue-400">{mockPositions.length}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Risk Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily P&L"
          value={`$${totalUnrealizedPnL.toFixed(2)}`}
          change={{
            value: totalUnrealizedPnL > 0 ? `+${totalUnrealizedPnL.toFixed(2)}` : `${totalUnrealizedPnL.toFixed(2)}`,
            type: totalUnrealizedPnL > 0 ? 'positive' : totalUnrealizedPnL < 0 ? 'negative' : 'neutral'
          }}
          delay={0}
        />
        <StatCard
          title="Risk at Risk"
          value={`$${totalRisk.toFixed(2)}`}
          change={{
            value: `${riskUsedPercent.toFixed(1)}% of limit`,
            type: riskUsedPercent > 80 ? 'negative' : riskUsedPercent > 60 ? 'neutral' : 'positive'
          }}
          delay={0.1}
        />
        <StatCard
          title="Loss Limit Remaining"
          value={`$${(dailyLimit - (dailyLimit * riskBudgetUsed / 100)).toFixed(2)}`}
          change={{
            value: `${(100 - riskBudgetUsed).toFixed(0)}% available`,
            type: riskBudgetUsed > 80 ? 'negative' : riskBudgetUsed > 60 ? 'neutral' : 'positive'
          }}
          delay={0.2}
        />
        <StatCard
          title="Max Positions"
          value={`${mockPositions.length}/5`}
          change={{
            value: `${5 - mockPositions.length} slots free`,
            type: mockPositions.length >= 4 ? 'neutral' : 'positive'
          }}
          delay={0.3}
        />
      </div>

      {/* Main Risk Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Risk Gauge */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-emerald-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Risk Gauge</h3>
          </div>
          
          <div className="flex justify-center">
            <RiskGauge percentage={riskBudgetUsed} size="lg" delay={0.5} />
          </div>
          
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Daily Loss Limit</span>
              <span className="text-white font-medium">${dailyLimit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Used Today</span>
              <span className="text-red-400 font-medium">${(dailyLimit * riskBudgetUsed / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Remaining</span>
              <span className="text-emerald-400 font-medium">${(dailyLimit - (dailyLimit * riskBudgetUsed / 100)).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Heat Map */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-red-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Portfolio Heat Map</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {mockHeatMap.map((item, index) => (
              <motion.div
                key={item.pair}
                className={`p-3 rounded-lg border ${
                  item.allocation > 0 
                    ? item.pnl > 0 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                    : 'bg-gray-800/50 border-gray-700'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="text-sm font-medium text-white mb-1">{item.pair}</div>
                <div className="text-xs text-gray-400">{item.allocation}% allocation</div>
                {item.allocation > 0 && (
                  <div className={`text-xs font-semibold mt-1 ${
                    item.pnl > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {item.pnl > 0 ? '+' : ''}{item.pnl.toFixed(1)}%
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tilt Detector */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-amber-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Emotional State</h3>
          </div>
          
          <TiltDetector score={tiltScore} />
          
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Recent Win Rate</span>
              <span className="text-emerald-400">67%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Hold Time</span>
              <span className="text-blue-400">2.3h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Deviation</span>
              <span className="text-amber-400">+8%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Open Positions */}
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Open Positions</h3>
        </div>
        
        {mockPositions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No open positions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-3 text-xs font-semibold text-gray-400 uppercase">Pair</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-400 uppercase">Side</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-400 uppercase">Size</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-400 uppercase">Entry</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-400 uppercase">Current</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-400 uppercase">P&L</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-400 uppercase">Risk</th>
                </tr>
              </thead>
              <tbody>
                {mockPositions.map((position, index) => (
                  <motion.tr
                    key={position.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                  >
                    <td className="p-3 font-medium text-white">{position.pair}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        position.side === 'LONG' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {position.side}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 font-mono">{position.size}</td>
                    <td className="p-3 text-gray-300 font-mono">${position.entryPrice.toLocaleString()}</td>
                    <td className="p-3 text-gray-300 font-mono">${position.currentPrice.toLocaleString()}</td>
                    <td className="p-3 font-semibold">
                      <div className={position.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                      </div>
                      <div className={`text-xs ${position.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-3 text-amber-400 font-semibold">${position.riskAmount.toFixed(2)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Bottom Row: Calculator and Correlation Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PositionSizeCalculator />
        <CorrelationMatrix />
      </div>
    </div>
  )
}