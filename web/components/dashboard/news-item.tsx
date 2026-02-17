'use client'

import { motion } from 'framer-motion'

type Impact = 'HIGH' | 'MED' | 'LOW'
type Category = 'Macro' | 'Whale' | 'Funding' | 'Regulatory'

interface NewsItemData {
  id: string
  title: string
  impact: Impact
  timeAgo: string
  category: Category
}

interface NewsItemProps {
  news: NewsItemData
}

const impactColors = {
  HIGH: 'bg-[#f87171]/20 text-[#f87171] border-[#f87171]/30',
  MED: 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30',
  LOW: 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
}

const categoryColors = {
  Macro: 'text-[#00F0B5]',
  Whale: 'text-[#8b5cf6]',
  Funding: 'text-[#f59e0b]',
  Regulatory: 'text-[#ef4444]'
}

export default function NewsItem({ news }: NewsItemProps) {
  return (
    <motion.div 
      className="flex items-start justify-between py-3 border-b border-[#1b2332] last:border-b-0 hover:bg-[#1b2332]/20 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ x: 2 }}
    >
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xs text-[#6b7280] font-mono tabular-nums whitespace-nowrap">
            {news.timeAgo}
          </span>
          <span className={`text-xs font-medium ${categoryColors[news.category]}`}>
            {news.category}
          </span>
        </div>
        
        <h3 className="text-sm text-[#9ca3af] leading-relaxed line-clamp-2">
          {news.title}
        </h3>
      </div>
      
      <div className={`text-xs px-2 py-1 rounded-md border font-medium whitespace-nowrap ${impactColors[news.impact]}`}>
        {news.impact}
      </div>
    </motion.div>
  )
}