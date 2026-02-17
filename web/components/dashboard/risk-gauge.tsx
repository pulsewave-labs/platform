'use client'

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface RiskGaugeProps {
  percentage: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  animated?: boolean
  delay?: number
}

function RiskIcon({ percentage, size = 16 }: { percentage: number, size?: number }) {
  if (percentage >= 80) return <AlertTriangle size={size} className="text-red-400" />
  if (percentage >= 60) return <Shield size={size} className="text-amber-400" />
  return <CheckCircle size={size} className="text-emerald-400" />
}

function getRiskLevel(percentage: number): 'low' | 'medium' | 'high' {
  if (percentage >= 80) return 'high'
  if (percentage >= 60) return 'medium'
  return 'low'
}

function getRiskColors(level: 'low' | 'medium' | 'high') {
  return {
    low: {
      primary: '#34d399',
      secondary: '#10b981',
      background: 'from-emerald-500/20 to-emerald-600/20',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20'
    },
    medium: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      background: 'from-amber-500/20 to-amber-600/20',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20'
    },
    high: {
      primary: '#f87171',
      secondary: '#ef4444',
      background: 'from-red-500/20 to-red-600/20',
      text: 'text-red-400',
      glow: 'shadow-red-500/20'
    }
  }
}

export default function RiskGauge({ 
  percentage, 
  label = 'Risk Used',
  size = 'md',
  showIcon = true,
  animated = true,
  delay = 0
}: RiskGaugeProps) {
  const riskLevel = getRiskLevel(percentage)
  const colors = getRiskColors(riskLevel)
  
  // Gauge dimensions based on size
  const dimensions = {
    sm: { outer: 80, inner: 64, stroke: 8 },
    md: { outer: 120, inner: 96, stroke: 12 },
    lg: { outer: 160, inner: 132, stroke: 16 }
  }
  
  const { outer, inner, stroke } = dimensions[size]
  const radius = (outer - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const center = outer / 2
  
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.6,
        type: "spring",
        bounce: 0.2
      }}
    >
      {/* Gauge SVG */}
      <div className="relative">
        <svg width={outer} height={outer} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgb(31, 41, 55)"
            strokeWidth={stroke}
            className="drop-shadow-sm"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${riskLevel})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: animated ? strokeDashoffset : circumference - (percentage / 100) * circumference 
            }}
            transition={{ 
              duration: animated ? 1.5 : 0, 
              delay: delay + 0.3,
              ease: [0.23, 1, 0.32, 1]
            }}
            className={`drop-shadow-lg ${colors.glow}`}
          />
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id={`gradient-${riskLevel}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: delay + 0.5, 
              duration: 0.6,
              type: "spring",
              bounce: 0.4
            }}
            className={`text-center ${colors.text}`}
          >
            <div className={`font-bold mb-1 ${
              size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
            }`}>
              {percentage}%
            </div>
            {showIcon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.7, type: "spring", bounce: 0.3 }}
                className="flex justify-center mb-1"
              >
                <RiskIcon 
                  percentage={percentage} 
                  size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} 
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.8 }}
        className="mt-3 text-center"
      >
        <p className={`font-medium ${
          size === 'lg' ? 'text-sm' : 'text-xs'
        } text-gray-400 uppercase tracking-wider`}>
          {label}
        </p>
        
        {/* Risk level indicator */}
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            riskLevel === 'high' ? 'bg-red-400' :
            riskLevel === 'medium' ? 'bg-amber-400' :
            'bg-emerald-400'
          } animate-pulse`} />
          <span className={`text-xs font-semibold uppercase ${colors.text}`}>
            {riskLevel === 'high' ? 'High Risk' :
             riskLevel === 'medium' ? 'Moderate' :
             'Healthy'}
          </span>
        </div>
      </motion.div>
      
      {/* Warning pulse effect for high risk */}
      {riskLevel === 'high' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500/50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}