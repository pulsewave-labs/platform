'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Activity } from 'lucide-react'

type IconType = 'dollar' | 'percent' | 'chart' | 'trades'
type TrendType = 'up' | 'down' | 'neutral'

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: TrendType
  icon: IconType
}

const iconMap = {
  dollar: DollarSign,
  percent: Percent,
  chart: BarChart3,
  trades: Activity
}

const trendColors = {
  up: 'text-[#4ade80]',
  down: 'text-[#f87171]',
  neutral: 'text-[#6b7280]'
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Activity
}

export default function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  const IconComponent = iconMap[icon]
  const TrendIcon = trendIcons[trend]
  
  return (
    <motion.div 
      className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6 hover:border-[#1b2332]/80 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-3">
            {title}
          </div>
          
          <div className="text-2xl font-semibold text-white font-mono tabular-nums mb-2">
            {value}
          </div>
          
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend]}`}>
            <TrendIcon size={16} />
            {change}
          </div>
        </div>
        
        <div className="w-10 h-10 bg-[#1b2332] rounded-xl flex items-center justify-center">
          <IconComponent size={20} className="text-[#6b7280]" />
        </div>
      </div>
    </motion.div>
  )
}