'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import NewsItem from '../../../components/dashboard/news-item'
import { Newspaper, Globe, TrendingUp, DollarSign, Scale, AlertCircle } from 'lucide-react'

type Category = 'All' | 'Macro' | 'Whale' | 'Funding' | 'Regulatory'

const categories: Category[] = ['All', 'Macro', 'Whale', 'Funding', 'Regulatory']

// Mock news data
const mockNews = [
  {
    id: '1',
    title: 'Fed Minutes Preview: Markets brace for hawkish tone as inflation data remains sticky above 2% target',
    impact: 'HIGH' as const,
    timeAgo: '12m',
    category: 'Macro' as const,
    content: 'Federal Reserve officials expected to discuss aggressive monetary policy measures...'
  },
  {
    id: '2',
    title: 'BTC Whale Alert: 3,200 BTC ($220M) moved from Coinbase Pro to unknown cold storage wallet',
    impact: 'MED' as const,
    timeAgo: '28m',
    category: 'Whale' as const,
    content: 'Large institutional movement detected, potentially signaling long-term accumulation...'
  },
  {
    id: '3',
    title: 'Perpetual funding rates turn negative across major exchanges: Short squeeze potential builds',
    impact: 'MED' as const,
    timeAgo: '45m',
    category: 'Funding' as const,
    content: 'BTC perpetual funding at -0.008% suggests overleveraged short positions...'
  },
  {
    id: '4',
    title: 'SEC Chairman signals stricter crypto enforcement ahead of presidential election cycle',
    impact: 'HIGH' as const,
    timeAgo: '1h',
    category: 'Regulatory' as const,
    content: 'Regulatory uncertainty continues to weigh on institutional adoption...'
  },
  {
    id: '5',
    title: 'Ethereum L2 TVL hits all-time high of $45B as scaling solutions gain traction',
    impact: 'MED' as const,
    timeAgo: '1h 15m',
    category: 'Macro' as const,
    content: 'Layer 2 ecosystems showing strong growth with Arbitrum leading at $18B TVL...'
  },
  {
    id: '6',
    title: 'Whale accumulation: 8,450 ETH ($23M) purchased during morning dip by top 100 holder',
    impact: 'MED' as const,
    timeAgo: '1h 32m',
    category: 'Whale' as const,
    content: 'Smart money continues buying weakness as retail sentiment remains bearish...'
  },
  {
    id: '7',
    title: 'Binance perpetual funding hits -0.02%: Highest negative rate since October 2023 crash',
    impact: 'HIGH' as const,
    timeAgo: '2h',
    category: 'Funding' as const,
    content: 'Extreme negative funding suggests potential short squeeze setup...'
  },
  {
    id: '8',
    title: 'European Central Bank exploring digital euro pilot program with major banks',
    impact: 'LOW' as const,
    timeAgo: '2h 20m',
    category: 'Regulatory' as const,
    content: 'CBDC development accelerating across major economies...'
  },
  {
    id: '9',
    title: 'DXY strengthens to 106.8 as Treasury yields surge on inflation concerns',
    impact: 'HIGH' as const,
    timeAgo: '2h 45m',
    category: 'Macro' as const,
    content: 'Dollar strength putting pressure on risk assets including crypto...'
  },
  {
    id: '10',
    title: 'MicroStrategy adds another 1,500 BTC to treasury: Total holdings now exceed 175,000 BTC',
    impact: 'MED' as const,
    timeAgo: '3h',
    category: 'Whale' as const,
    content: 'Corporate Bitcoin adoption continues despite market volatility...'
  },
  {
    id: '11',
    title: 'Solana futures open interest spikes 340% ahead of major ecosystem upgrades',
    impact: 'MED' as const,
    timeAgo: '3h 15m',
    category: 'Funding' as const,
    content: 'Derivative markets pricing in significant volatility for SOL...'
  },
  {
    id: '12',
    title: 'Hong Kong approves first batch of crypto ETFs for retail trading starting next month',
    impact: 'HIGH' as const,
    timeAgo: '4h',
    category: 'Regulatory' as const,
    content: 'Asian markets opening up to crypto investment products...'
  }
]

const categoryIcons = {
  All: Globe,
  Macro: TrendingUp,
  Whale: DollarSign,
  Funding: AlertCircle,
  Regulatory: Scale
}

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  
  const filteredNews = selectedCategory === 'All' 
    ? mockNews 
    : mockNews.filter(news => news.category === selectedCategory)
  
  const impactCounts = {
    HIGH: mockNews.filter(n => n.impact === 'HIGH').length,
    MED: mockNews.filter(n => n.impact === 'MED').length,
    LOW: mockNews.filter(n => n.impact === 'LOW').length
  }
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#00F0B5]/20 rounded-xl flex items-center justify-center">
            <Newspaper size={18} className="text-[#00F0B5]" />
          </div>
          <div>
            <div className="text-sm text-[#6b7280]">Market News</div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#f87171] font-semibold">{impactCounts.HIGH} High Impact</span>
              <span className="text-[#fbbf24] font-semibold">{impactCounts.MED} Medium</span>
              <span className="text-[#6b7280] font-semibold">{impactCounts.LOW} Low</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Category Tabs */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex gap-1">
          {categories.map(category => {
            const IconComponent = categoryIcons[category]
            const isActive = selectedCategory === category
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00F0B5]/20 text-[#00F0B5]'
                    : 'text-[#6b7280] hover:text-[#9ca3af] hover:bg-[#1b2332]/50'
                }`}
              >
                <IconComponent size={16} />
                {category}
              </button>
            )
          })}
        </div>
      </motion.div>
      
      {/* News List */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="space-y-0">
          {filteredNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.03, duration: 0.4 }}
            >
              <NewsItem news={news} />
            </motion.div>
          ))}
          
          {filteredNews.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Newspaper size={48} className="text-[#1b2332] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No news found</h3>
              <p className="text-[#6b7280]">Try selecting a different category.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* News Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#f87171]/20 rounded-xl flex items-center justify-center">
              <AlertCircle size={16} className="text-[#f87171]" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">High Impact Events</div>
              <div className="text-xs text-[#6b7280]">Today</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{impactCounts.HIGH}</div>
        </div>
        
        <div className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#fbbf24]/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-[#fbbf24]" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Market Sentiment</div>
              <div className="text-xs text-[#6b7280]">AI Analysis</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-[#fbbf24] font-mono">Bearish</div>
        </div>
        
        <div className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#4ade80]/20 rounded-xl flex items-center justify-center">
              <Globe size={16} className="text-[#4ade80]" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">News Volume</div>
              <div className="text-xs text-[#6b7280]">24h Activity</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{mockNews.length}</div>
        </div>
      </motion.div>
    </motion.div>
  )
}