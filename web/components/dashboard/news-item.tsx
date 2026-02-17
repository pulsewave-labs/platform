'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Clock, TrendingUp } from 'lucide-react'
import { NewsItem as NewsItemType } from '../../types'

interface NewsItemProps {
  news: NewsItemType
  delay?: number
  onClick?: () => void
}

function ImpactBadge({ impact }: { impact: NewsItemType['impact'] }) {
  const impactConfig = {
    high: {
      label: 'HIGH',
      className: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    medium: {
      label: 'MEDIUM', 
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    low: {
      label: 'LOW',
      className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }
  
  const config = impactConfig[impact]
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${config.className}`}>
      {config.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const categoryColors: Record<string, string> = {
    'Macro': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Whale Alerts': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Funding Rates': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Earnings': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Regulatory': 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  
  const colorClass = categoryColors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
      {category}
    </span>
  )
}

function SentimentIndicator({ sentiment }: { sentiment: number }) {
  let color = 'text-gray-400'
  let bgColor = 'bg-gray-500/20'
  let label = 'NEUTRAL'
  
  if (sentiment > 0.3) {
    color = 'text-emerald-400'
    bgColor = 'bg-emerald-500/20'
    label = 'BULLISH'
  } else if (sentiment < -0.3) {
    color = 'text-red-400'
    bgColor = 'bg-red-500/20'
    label = 'BEARISH'
  }
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${bgColor} ${color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${
        sentiment > 0.3 ? 'bg-emerald-400' : 
        sentiment < -0.3 ? 'bg-red-400' : 'bg-gray-400'
      }`} />
      <span className="text-xs font-medium">{label}</span>
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

export default function NewsItem({ news, delay = 0, onClick }: NewsItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default behavior: open URL in new tab
      if (news.url) {
        window.open(news.url, '_blank', 'noopener,noreferrer')
      }
    }
  }
  
  return (
    <motion.div
      className="border-b border-gray-800/50 py-3 last:border-b-0 cursor-pointer group hover:bg-gray-900/30 hover:px-2 transition-all duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={handleClick}
    >
      {/* Header with time and impact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={12} />
          <span>{formatTimeAgo(news.publishedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ImpactBadge impact={news.impact} />
          {news.url && (
            <ExternalLink 
              size={12} 
              className="text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" 
            />
          )}
        </div>
      </div>
      
      {/* Title */}
      <h4 className="font-medium text-white text-sm leading-relaxed mb-2 group-hover:text-blue-400 transition-colors">
        {news.title}
      </h4>
      
      {/* Footer with source, category, and sentiment */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">{news.source}</span>
          <CategoryBadge category={news.category} />
        </div>
        
        <div className="flex items-center gap-2">
          {news.pairs && news.pairs.length > 0 && (
            <div className="flex items-center gap-1">
              {news.pairs.slice(0, 3).map((pair, index) => (
                <span
                  key={index}
                  className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-mono"
                >
                  {pair}
                </span>
              ))}
              {news.pairs.length > 3 && (
                <span className="text-xs text-gray-500">+{news.pairs.length - 3}</span>
              )}
            </div>
          )}
          <SentimentIndicator sentiment={news.sentiment} />
        </div>
      </div>
      
      {/* Relevance indicator */}
      {news.relevanceScore > 0.7 && (
        <motion.div
          className="mt-2 flex items-center gap-1 text-xs text-blue-400"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          <TrendingUp size={12} />
          <span className="font-medium">High Relevance</span>
        </motion.div>
      )}
      
      {/* Preview snippet if available */}
      {news.content && news.content.length > 0 && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {news.content.substring(0, 120)}...
        </p>
      )}
    </motion.div>
  )
}