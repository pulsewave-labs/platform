'use client'

import { motion } from 'framer-motion'

interface EquityCurveProps {
  data?: number[]
  height?: number
}

export default function EquityCurve({ 
  data = [100000, 102500, 101800, 105600, 107200, 104500, 108900, 112300, 110800, 115600, 118200, 116800, 121400, 125300, 128700, 132100, 135800, 142847],
  height = 120
}: EquityCurveProps) {
  const width = 400
  const padding = 20
  
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const valueRange = maxValue - minValue
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - minValue) / valueRange) * (height - padding * 2)
    return { x, y, value }
  })
  
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  
  return (
    <div className="bg-[#0a0e17] rounded-xl p-4">
      <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-4">
        Account Equity Curve
      </div>
      
      <svg 
        width={width} 
        height={height} 
        className="w-full h-auto"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 24"
              fill="none"
              stroke="#1b2332"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Gradient fill under curve */}
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.path
          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#curveGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        
        {/* Main curve line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: 2, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.5 
          }}
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#4ade80"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.5 + (index * 0.1), 
              duration: 0.3 
            }}
          />
        ))}
      </svg>
      
      <div className="flex justify-between text-xs text-[#6b7280] mt-2">
        <span>${(minValue / 1000).toFixed(0)}k</span>
        <span>30 days</span>
        <span>${(maxValue / 1000).toFixed(0)}k</span>
      </div>
    </div>
  )
}