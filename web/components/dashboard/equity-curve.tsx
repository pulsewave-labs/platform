'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface EquityPoint {
  date: string
  value: number
  isWin?: boolean
}

interface EquityCurveProps {
  data: EquityPoint[]
  width?: number
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  className?: string
  delay?: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export default function EquityCurve({
  data,
  width = 400,
  height = 200,
  showGrid = true,
  showTooltip = false,
  className = '',
  delay = 0
}: EquityCurveProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-900/30 rounded-lg border border-gray-800 ${className}`} style={{ width, height }}>
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    )
  }
  
  const values = data.map(d => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1
  
  const padding = 20
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  
  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
    return { x, y, ...point }
  })
  
  // Create path string for the line
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')
  
  // Create area path for gradient fill
  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`
  
  // Determine overall trend
  const startValue = values[0]
  const endValue = values[values.length - 1]
  const isPositiveTrend = endValue >= startValue
  const totalReturn = endValue - startValue
  const returnPercentage = ((endValue - startValue) / startValue) * 100
  
  // Grid lines
  const gridLines = showGrid ? Array.from({ length: 5 }, (_, i) => {
    const y = padding + (i / 4) * chartHeight
    const value = maxValue - (i / 4) * valueRange
    return { y, value }
  }) : []
  
  return (
    <motion.div
      className={`relative bg-gray-900/30 rounded-lg border border-gray-800 overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6 }}
      style={{ width, height }}
    >
      {/* Header with trend info */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            isPositiveTrend 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {isPositiveTrend ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Equity Curve
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-sm font-bold ${
            isPositiveTrend ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {isPositiveTrend ? '+' : ''}{formatCurrency(totalReturn)}
          </p>
          <p className={`text-xs ${
            isPositiveTrend ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
          </p>
        </div>
      </div>
      
      <svg width={width} height={height} className="absolute inset-0">
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop 
              offset="0%" 
              stopColor={isPositiveTrend ? '#34d399' : '#f87171'} 
              stopOpacity="0.3" 
            />
            <stop 
              offset="100%" 
              stopColor={isPositiveTrend ? '#34d399' : '#f87171'} 
              stopOpacity="0" 
            />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {gridLines.map((line, index) => (
          <g key={index}>
            <line
              x1={padding}
              y1={line.y}
              x2={width - padding}
              y2={line.y}
              stroke="rgb(55, 65, 81)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity="0.5"
            />
            <text
              x={padding - 5}
              y={line.y + 3}
              fill="rgb(107, 114, 128)"
              fontSize="10"
              textAnchor="end"
              className="font-mono"
            >
              ${Math.round(line.value / 1000)}K
            </text>
          </g>
        ))}
        
        {/* Area fill */}
        <motion.path
          d={areaData}
          fill="url(#equityGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.8 }}
        />
        
        {/* Main line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={isPositiveTrend ? '#34d399' : '#f87171'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            delay: delay + 0.5, 
            duration: 2,
            ease: [0.23, 1, 0.32, 1]
          }}
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={point.isWin !== undefined ? (point.isWin ? '#34d399' : '#f87171') : '#60a5fa'}
            stroke="#1f2937"
            strokeWidth="2"
            className="cursor-pointer hover:r-4 transition-all"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: delay + 0.8 + (index * 0.02),
              duration: 0.3,
              type: "spring",
              bounce: 0.4
            }}
          >
            {showTooltip && (
              <title>
                {formatDate(point.date)}: {formatCurrency(point.value)}
              </title>
            )}
          </motion.circle>
        ))}
        
        {/* Date labels on x-axis */}
        {[0, Math.floor(data.length / 2), data.length - 1].map(index => {
          if (index >= data.length) return null
          const point = points[index]
          return (
            <text
              key={index}
              x={point.x}
              y={height - 5}
              fill="rgb(107, 114, 128)"
              fontSize="10"
              textAnchor="middle"
              className="font-mono"
            >
              {formatDate(data[index].date)}
            </text>
          )
        })}
      </svg>
      
      {/* Performance indicators */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-400">
        <span className="font-mono">
          Start: {formatCurrency(startValue)}
        </span>
        <span className="font-mono">
          Current: {formatCurrency(endValue)}
        </span>
      </div>
    </motion.div>
  )
}