'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import RiskGauge from '../../../components/dashboard/risk-gauge'
import { Shield, Calculator, AlertTriangle, TrendingDown } from 'lucide-react'

// Mock position data
const openPositions = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG' as const,
    size: '$12,500',
    unrealizedPnL: 847.30,
    riskPercent: 2.1
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT' as const,
    size: '$8,200',
    unrealizedPnL: -234.50,
    riskPercent: 1.8
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG' as const,
    size: '$5,800',
    unrealizedPnL: 156.20,
    riskPercent: 1.2
  }
]

const riskMetrics = [
  { label: 'Daily P&L', value: '+$1,247.50', status: 'positive' as const },
  { label: 'Loss Limit Remaining', value: '$1,200.00', status: 'neutral' as const },
  { label: 'Max Positions', value: '3 of 5', status: 'neutral' as const },
  { label: 'Correlation Risk', value: 'Low', status: 'positive' as const },
  { label: 'Tilt Score', value: '😎 Cool', status: 'positive' as const },
  { label: 'Drawdown', value: '2.3%', status: 'positive' as const }
]

export default function RiskPage() {
  const [accountSize, setAccountSize] = useState('50000')
  const [riskPercent, setRiskPercent] = useState('2')
  const [entryPrice, setEntryPrice] = useState('69420')
  const [stopLoss, setStopLoss] = useState('68200')
  
  const calculatePositionSize = () => {
    const account = parseFloat(accountSize)
    const risk = parseFloat(riskPercent) / 100
    const entry = parseFloat(entryPrice)
    const stop = parseFloat(stopLoss)
    
    if (account && risk && entry && stop && entry !== stop) {
      const riskAmount = account * risk
      const priceRisk = Math.abs(entry - stop)
      const positionSize = riskAmount / priceRisk
      return positionSize.toFixed(4)
    }
    return '0.0000'
  }
  
  const calculateRiskAmount = () => {
    const account = parseFloat(accountSize)
    const risk = parseFloat(riskPercent) / 100
    return (account * risk).toFixed(2)
  }
  
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
            <Shield size={18} className="text-[#00F0B5]" />
          </div>
          <div>
            <div className="text-sm text-[#6b7280]">Risk Management</div>
            <div className="text-sm text-[#9ca3af]">Portfolio risk analysis & controls</div>
          </div>
        </div>
      </motion.div>

      {/* Risk Gauge */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="text-center">
          <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-6">
            Portfolio Risk Usage
          </div>
          
          <div className="flex justify-center mb-6">
            <RiskGauge percentage={42} />
          </div>
          
          <div className="text-sm text-[#9ca3af]">
            You're using <span className="text-white font-semibold">42%</span> of your risk budget.
            <br />
            This is considered a <span className="text-[#4ade80] font-semibold">healthy</span> level.
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Open Positions */}
        <motion.div
          className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown size={16} className="text-[#6b7280]" />
            <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Open Positions</span>
          </div>
          
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-5 gap-3 text-xs font-medium text-[#6b7280] uppercase tracking-wide pb-3 border-b border-[#1b2332]">
              <span>Pair</span>
              <span>Direction</span>
              <span>Size</span>
              <span>P&L</span>
              <span>Risk %</span>
            </div>
            
            {/* Positions */}
            {openPositions.map((position, index) => (
              <motion.div
                key={position.id}
                className="grid grid-cols-5 gap-3 text-sm py-3 border-b border-[#1b2332]/50 last:border-b-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              >
                <span className="text-white font-medium">{position.pair}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold text-white w-fit ${
                  position.direction === 'LONG' ? 'bg-[#4ade80]' : 'bg-[#f87171]'
                }`}>
                  {position.direction}
                </span>
                <span className="text-white font-mono text-xs">{position.size}</span>
                <span className={`font-semibold font-mono text-xs ${
                  position.unrealizedPnL > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                }`}>
                  {position.unrealizedPnL > 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                </span>
                <span className="text-white font-mono text-xs">{position.riskPercent}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Risk Metrics */}
        <motion.div
          className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={16} className="text-[#6b7280]" />
            <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Key Metrics</span>
          </div>
          
          <div className="space-y-4">
            {riskMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="flex justify-between items-center py-3 border-b border-[#1b2332]/50 last:border-b-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
              >
                <span className="text-[#6b7280] text-sm">{metric.label}</span>
                <span className={`text-sm font-semibold font-mono ${
                  metric.status === 'positive' 
                    ? 'text-[#4ade80]' 
                    : metric.status === 'negative' 
                    ? 'text-[#f87171]' 
                    : 'text-white'
                }`}>
                  {metric.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Position Size Calculator */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Calculator size={16} className="text-[#6b7280]" />
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Position Size Calculator</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Inputs */}
          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
              Account Size ($)
            </label>
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
              placeholder="50000"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
              Risk Per Trade (%)
            </label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
              placeholder="2"
              step="0.1"
              max="10"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
              Entry Price ($)
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
              placeholder="69420"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
              Stop Loss ($)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
              placeholder="68200"
              step="0.01"
            />
          </div>
        </div>
        
        {/* Results */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0e17] rounded-xl p-4 border border-[#1b2332]">
            <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              Risk Amount
            </div>
            <div className="text-lg font-bold text-[#f87171] font-mono">
              ${calculateRiskAmount()}
            </div>
          </div>
          
          <div className="bg-[#0a0e17] rounded-xl p-4 border border-[#1b2332]">
            <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              Position Size
            </div>
            <div className="text-lg font-bold text-[#00F0B5] font-mono">
              {calculatePositionSize()} BTC
            </div>
          </div>
          
          <div className="bg-[#0a0e17] rounded-xl p-4 border border-[#1b2332]">
            <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-2">
              Price Risk
            </div>
            <div className="text-lg font-bold text-white font-mono">
              ${Math.abs(parseFloat(entryPrice || '0') - parseFloat(stopLoss || '0')).toFixed(2)}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}