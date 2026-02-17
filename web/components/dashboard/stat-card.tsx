'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  sparkline?: number[]
  prefix?: string
  suffix?: string
  loading?: boolean
  delay?: number
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  if (data.length < 2) return null
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60
    const y = 20 - ((value - min) / range) * 20
    return `${x},${y}`
  }).join(' ')
  
  return (
    <svg width="60" height="20" className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function ChangeIndicator({ change }: { change: StatCardProps['change'] }) {
  if (!change) return null
  
  const icons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus
  }
  
  const colors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-amber-400'
  }
  
  const Icon = icons[change.type]
  
  return (
    <div className={`flex items-center gap-1 text-xs ${colors[change.type]}`}>
      <Icon size={12} />
      <span>{change.value}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-20"></div>
    </div>
  )
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  sparkline, 
  prefix = '', 
  suffix = '', 
  loading = false,
  delay = 0
}: StatCardProps) {
  if (loading) {
    return (
      <motion.div 
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        <LoadingSkeleton />
      </motion.div>
    )
  }
  
  const sparklineColor = change?.type === 'positive' ? '#34d399' : 
                         change?.type === 'negative' ? '#f87171' : '#fbbf24'
  
  return (
    <motion.div 
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center hover:border-gray-700 transition-all duration-300 group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        backgroundColor: 'rgba(17, 24, 39, 0.7)'
      }}
    >
      <motion.div 
        className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-1"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: delay + 0.2, 
          duration: 0.6,
          type: "spring",
          bounce: 0.4
        }}
      >
        {prefix && <span className="text-lg text-gray-400">{prefix}</span>}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-lg text-gray-400">{suffix}</span>}
      </motion.div>
      
      <motion.div 
        className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {title}
      </motion.div>
      
      <div className="flex items-center justify-center gap-3">
        {change && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.4 }}
          >
            <ChangeIndicator change={change} />
          </motion.div>
        )}
        
        {sparkline && sparkline.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
          >
            <Sparkline data={sparkline} color={sparklineColor} />
          </motion.div>
        )}
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
    </motion.div>
  )
}