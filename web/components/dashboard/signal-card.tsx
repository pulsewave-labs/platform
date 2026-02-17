'use client'

import { motion } from 'framer-motion'

type Direction = 'LONG' | 'SHORT'
type Status = 'active' | 'pending' | 'filled' | 'cancelled'

interface Signal {
  id: string
  pair: string
  direction: Direction
  entry: number
  stopLoss: number
  takeProfit: number
  confidence: number
  timeframe: string
  status: Status
  riskReward: number
}

interface SignalCardProps {
  signal: Signal
  compact?: boolean
}

const statusColors = {
  active: 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30',
  pending: 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30',
  filled: 'bg-[#00F0B5]/20 text-[#00F0B5] border-[#00F0B5]/30',
  cancelled: 'bg-[#f87171]/20 text-[#f87171] border-[#f87171]/30'
}

export default function SignalCard({ signal, compact = false }: SignalCardProps) {
  const isLong = signal.direction === 'LONG'
  
  return (
    <motion.div 
      className={`bg-[#0a0e17] border border-[#1b2332] ${
        isLong ? 'border-l-[#4ade80]' : 'border-l-[#f87171]'
      } border-l-2 rounded-xl p-4 hover:border-[#1b2332]/80 transition-colors`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-semibold text-white">{signal.pair}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                isLong ? 'bg-[#4ade80] text-white' : 'bg-[#f87171] text-white'
              }`}>
                {signal.direction}
              </span>
              <span className="text-xs text-[#6b7280]">{signal.timeframe}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-mono tabular-nums text-white font-semibold">
            {signal.confidence}%
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-md border ${statusColors[signal.status]}`}>
            {signal.status.toUpperCase()}
          </div>
        </div>
      </div>
      
      {!compact && (
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-[#6b7280]">Entry</span>
            <span className="text-white font-mono tabular-nums">${signal.entry.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#6b7280]">Stop Loss</span>
            <span className="text-[#f87171] font-mono tabular-nums">${signal.stopLoss.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#6b7280]">Take Profit</span>
            <span className="text-[#4ade80] font-mono tabular-nums">${signal.takeProfit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#6b7280]">R:R</span>
            <span className="text-white font-mono tabular-nums">{signal.riskReward}:1</span>
          </div>
        </div>
      )}
      
      {compact && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-4">
            <span className="text-[#6b7280]">Entry: <span className="text-white font-mono">${signal.entry.toLocaleString()}</span></span>
            <span className="text-[#6b7280]">R:R: <span className="text-white font-mono">{signal.riskReward}:1</span></span>
          </div>
        </div>
      )}
      
      {/* Confidence bar */}
      <div className="w-full h-1 bg-[#1b2332] rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isLong ? 'bg-[#4ade80]' : 'bg-[#f87171]'}`}
          initial={{ width: 0 }}
          animate={{ width: `${signal.confidence}%` }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </motion.div>
  )
}