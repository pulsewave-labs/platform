'use client'

import { motion } from 'framer-motion'

interface RiskGaugeProps {
  percentage: number
}

export default function RiskGauge({ percentage }: RiskGaugeProps) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const getColor = (percent: number) => {
    if (percent <= 50) return '#4ade80'
    if (percent <= 75) return '#fbbf24'
    return '#f87171'
  }
  
  const getStatus = (percent: number) => {
    if (percent <= 30) return 'Low'
    if (percent <= 60) return 'Moderate'
    if (percent <= 80) return 'High'
    return 'Critical'
  }
  
  const color = getColor(percentage)
  const status = getStatus(percentage)
  
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#1b2332"
          strokeWidth="6"
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div 
          className="text-xl font-bold text-white font-mono tabular-nums"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {percentage}%
        </motion.div>
        <motion.div 
          className="text-xs text-[#6b7280] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          {status}
        </motion.div>
      </div>
    </div>
  )
}