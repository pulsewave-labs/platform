'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  Brain, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle,
  Target,
  Calendar,
  Zap
} from 'lucide-react'

interface BriefingItem {
  type: 'trend' | 'event' | 'signal' | 'warning' | 'opportunity'
  title: string
  content: string
  time?: string
  priority?: 'low' | 'medium' | 'high'
}

interface AIBriefingProps {
  title?: string
  briefingItems: BriefingItem[]
  isExpanded?: boolean
  delay?: number
}

function BriefingItemIcon({ type }: { type: BriefingItem['type'] }) {
  const iconProps = { size: 14 }
  
  switch (type) {
    case 'trend':
      return <TrendingUp {...iconProps} className="text-blue-400" />
    case 'event':
      return <Calendar {...iconProps} className="text-purple-400" />
    case 'signal':
      return <Target {...iconProps} className="text-emerald-400" />
    case 'warning':
      return <AlertCircle {...iconProps} className="text-red-400" />
    case 'opportunity':
      return <Zap {...iconProps} className="text-amber-400" />
    default:
      return <Brain {...iconProps} className="text-blue-400" />
  }
}

function PriorityIndicator({ priority }: { priority: BriefingItem['priority'] }) {
  if (!priority || priority === 'low') return null
  
  const colors = {
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30'
  }
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${colors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  )
}

function formatContent(content: string) {
  // Parse markdown-like syntax for bold text
  return content.split(/(\*\*.*?\*\*)/).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export default function AIBriefing({ 
  title = 'AI Daily Briefing',
  briefingItems,
  isExpanded = false,
  delay = 0
}: AIBriefingProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  
  return (
    <motion.div
      className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-blue-500/10 border border-blue-500/20 rounded-xl p-5 mb-6 overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.6,
        type: "spring",
        bounce: 0.2
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 animate-pulse opacity-50" />
      
      {/* Header */}
      <motion.div
        className="flex items-center justify-between cursor-pointer relative z-10"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-blue-500/20 rounded-lg"
            animate={{ 
              rotate: expanded ? 360 : 0,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: expanded ? 0.8 : 0,
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Brain size={20} className="text-blue-400" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-white text-lg">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Updated {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
      </motion.div>
      
      {/* Summary (always visible) */}
      <motion.div
        className="mt-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
      >
        {briefingItems.length > 0 && (
          <p className="text-gray-300 text-sm leading-relaxed">
            {formatContent(briefingItems[0].content)}
          </p>
        )}
      </motion.div>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden relative z-10"
          >
            <div className="border-t border-blue-500/20 pt-4 mt-4 space-y-4">
              {briefingItems.slice(1).map((item, index) => (
                <motion.div
                  key={index}
                  className="flex gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <BriefingItemIcon type={item.type} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white text-sm">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        {item.time && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{item.time}</span>
                          </div>
                        )}
                        <PriorityIndicator priority={item.priority} />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {formatContent(item.content)}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Action buttons */}
              <motion.div
                className="flex gap-2 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors border border-blue-500/20">
                  View Full Analysis
                </button>
                <button className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg text-xs font-medium transition-colors">
                  Dismiss
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Glowing border animation */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  )
}