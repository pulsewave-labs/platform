'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Icon size={48} className="text-[#1b2332] mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#6b7280] mb-6">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-[#00F0B5] text-white font-medium rounded-xl hover:bg-[#00F0B5]/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}

// Demo mode banner for when user isn't authenticated or API fails
export function DemoModeBanner() {
  return (
    <motion.div
      className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-xl p-4 mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-[#fbbf24] rounded-full animate-pulse" />
        <div className="text-sm text-[#fbbf24] font-medium">
          Demo Mode - Sign in to see your real trading data
        </div>
      </div>
    </motion.div>
  )
}