'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, Target, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react'
import { Signal, SignalFactor } from '../../types'

interface SignalCardProps {
  signal: Signal
  isExpanded?: boolean
  onClick?: () => void
  showDetails?: boolean
  delay?: number
}

function RegimeBadge({ regime }: { regime: Signal['regime'] }) {
  const regimeConfig = {
    TRENDING_UP: {
      label: 'TRENDING',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: TrendingUp,
      dotColor: 'bg-emerald-400'
    },
    TRENDING_DOWN: {
      label: 'TRENDING',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: TrendingDown,
      dotColor: 'bg-emerald-400'
    },
    RANGING: {
      label: 'RANGING',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: Target,
      dotColor: 'bg-amber-400'
    },
    VOLATILE: {
      label: 'VOLATILE',
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
      icon: Zap,
      dotColor: 'bg-red-400'
    }
  }
  
  const config = regimeConfig[regime]
  const Icon = config.icon
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
      <Icon size={12} />
      <span>{config.label}</span>
    </div>
  )
}

function DirectionBadge({ direction }: { direction: Signal['direction'] }) {
  const isLong = direction === 'LONG'
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
      isLong 
        ? 'bg-emerald-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      {direction}
    </span>
  )
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'from-emerald-500 to-emerald-600'
    if (conf >= 60) return 'from-amber-500 to-amber-600'
    return 'from-red-500 to-red-600'
  }
  
  const getConfidenceText = (conf: number) => {
    if (conf >= 80) return 'text-emerald-400'
    if (conf >= 60) return 'text-amber-400'
    return 'text-red-400'
  }
  
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r rounded-full ${getConfidenceColor(confidence)}`}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <span className={`text-sm font-bold min-w-[40px] text-right ${getConfidenceText(confidence)}`}>
        {confidence}%
      </span>
    </div>
  )
}

function FactorBreakdown({ factors }: { factors: SignalFactor[] }) {
  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Factor Breakdown</h4>
      {factors.map((factor, index) => (
        <motion.div
          key={index}
          className="flex items-center justify-between text-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="text-gray-300">{factor.name}</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  factor.score > 0 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.abs(factor.score)}%` }}
              />
            </div>
            <span className={`text-xs font-mono min-w-[35px] text-right ${
              factor.score > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {factor.score > 0 ? '+' : ''}{factor.score}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export default function SignalCard({ 
  signal, 
  isExpanded = false, 
  onClick, 
  showDetails = true,
  delay = 0 
}: SignalCardProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setExpanded(!expanded)
    }
  }
  
  const isLong = signal.direction === 'LONG'
  const cardBorderColor = isLong ? 'border-emerald-500/30' : 'border-red-500/30'
  const cardBgColor = isLong ? 'bg-emerald-500/5' : 'bg-red-500/5'
  
  const riskReward = signal.riskReward || 
    ((signal.takeProfit - signal.entry) / Math.abs(signal.entry - signal.stopLoss))
  
  return (
    <motion.div
      className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-gray-600 ${cardBorderColor} ${cardBgColor} group`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.5,
        type: "spring",
        bounce: 0.2
      }}
      whileHover={{ 
        scale: 1.02,
        x: 4
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white text-lg">{signal.pair}</h3>
          <DirectionBadge direction={signal.direction} />
          <RegimeBadge regime={signal.regime} />
        </div>
        <div className="flex items-center gap-2">
          {signal.status === 'pending' && (
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <Clock size={12} />
              <span className="font-medium">PENDING</span>
            </div>
          )}
          {showDetails && (
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Price levels */}
      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-400 text-xs block">ENTRY</span>
          <span className="font-mono font-semibold text-white">
            ${signal.entry.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-xs block">STOP LOSS</span>
          <span className="font-mono font-semibold text-red-400">
            ${signal.stopLoss.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-xs block">TAKE PROFIT</span>
          <span className="font-mono font-semibold text-emerald-400">
            ${signal.takeProfit.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Confidence bar */}
      <ConfidenceBar confidence={signal.confidence} />
      
      {/* Meta info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
        <span>RR {riskReward.toFixed(1)}:1</span>
        <span>{formatTimeAgo(signal.createdAt)}</span>
      </div>
      
      {/* Reasoning */}
      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
        {signal.reasoning}
      </p>
      
      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && signal.factors && signal.factors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-800 pt-4 mt-4">
              <FactorBreakdown factors={signal.factors} />
              
              {/* Chart context placeholder */}
              <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-xs font-semibold text-gray-400 uppercase">Chart Context</span>
                </div>
                <div className="h-16 bg-gray-800/30 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Chart analysis would appear here</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}