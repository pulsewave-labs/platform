'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import NewsItem from '../../../components/dashboard/news-item'
import { NewsItemSkeleton } from '../../../components/ui/skeleton'
import { EmptyState, DemoModeBanner } from '../../../components/ui/empty-state'
import { useNews } from '../../../lib/hooks'
import { Newspaper, Globe, TrendingUp, DollarSign, Scale, AlertCircle, RefreshCw } from 'lucide-react'

type Category = 'All' | 'Macro' | 'Whale' | 'Funding' | 'Regulatory'

const categories: Category[] = ['All', 'Macro', 'Whale', 'Funding', 'Regulatory']

// Mock news data - using snake_case to match API
const mockNews = [
  {
    id: '1',
    title: 'Fed Minutes Preview: Markets brace for hawkish tone as inflation data remains sticky above 2% target',
    summary: 'Federal Reserve officials expected to discuss aggressive monetary policy measures...',
    source: 'Reuters',
    url: 'https://reuters.com/markets/fed-minutes',
    category: 'Macro',
    image_url: null,
    published_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    impact: 'HIGH' as const
  },
  {
    id: '2',
    title: 'BTC Whale Alert: 3,200 BTC ($220M) moved from Coinbase Pro to unknown cold storage wallet',
    summary: 'Large institutional movement detected, potentially signaling long-term accumulation...',
    source: 'Whale Alert',
    url: 'https://whale-alert.io/transaction/bitcoin',
    category: 'Whale',
    image_url: null,
    published_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    impact: 'MED' as const
  },
  {
    id: '3',
    title: 'Perpetual funding rates turn negative across major exchanges: Short squeeze potential builds',
    summary: 'BTC perpetual funding at -0.008% suggests overleveraged short positions...',
    source: 'CoinDesk',
    url: 'https://coindesk.com/markets/funding-rates',
    category: 'Funding',
    image_url: null,
    published_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    impact: 'MED' as const
  },
  {
    id: '4',
    title: 'SEC Chairman signals stricter crypto enforcement ahead of presidential election cycle',
    summary: 'Regulatory uncertainty continues to weigh on institutional adoption...',
    source: 'Bloomberg',
    url: 'https://bloomberg.com/news/sec-crypto-enforcement',
    category: 'Regulatory',
    image_url: null,
    published_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    impact: 'HIGH' as const
  },
  {
    id: '5',
    title: 'Ethereum L2 TVL hits all-time high of $45B as scaling solutions gain traction',
    summary: 'Layer 2 ecosystems showing strong growth with Arbitrum leading at $18B TVL...',
    source: 'DeFiPulse',
    url: 'https://defipulse.com/ethereum-l2-tvl',
    category: 'Macro',
    image_url: null,
    published_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    impact: 'MED' as const
  },
  {
    id: '6',
    title: 'Whale accumulation: 8,450 ETH ($23M) purchased during morning dip by top 100 holder',
    summary: 'Smart money continues buying weakness as retail sentiment remains bearish...',
    source: 'Etherscan',
    url: 'https://etherscan.io/whale-tracking',
    category: 'Whale',
    image_url: null,
    published_at: new Date(Date.now() - 92 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 92 * 60 * 1000).toISOString(),
    impact: 'MED' as const
  },
  {
    id: '7',
    title: 'Binance perpetual funding hits -0.02%: Highest negative rate since October 2023 crash',
    summary: 'Extreme negative funding suggests potential short squeeze setup...',
    source: 'The Block',
    url: 'https://theblock.co/binance-funding-rates',
    category: 'Funding',
    image_url: null,
    published_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    impact: 'HIGH' as const
  },
  {
    id: '8',
    title: 'European Central Bank exploring digital euro pilot program with major banks',
    summary: 'CBDC development accelerating across major economies...',
    source: 'Financial Times',
    url: 'https://ft.com/ecb-digital-euro',
    category: 'Regulatory',
    image_url: null,
    published_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    impact: 'LOW' as const
  },
  {
    id: '9',
    title: 'DXY strengthens to 106.8 as Treasury yields surge on inflation concerns',
    summary: 'Dollar strength putting pressure on risk assets including crypto...',
    source: 'MarketWatch',
    url: 'https://marketwatch.com/dxy-treasury-yields',
    category: 'Macro',
    image_url: null,
    published_at: new Date(Date.now() - 165 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 165 * 60 * 1000).toISOString(),
    impact: 'HIGH' as const
  },
  {
    id: '10',
    title: 'MicroStrategy adds another 1,500 BTC to treasury: Total holdings now exceed 175,000 BTC',
    summary: 'Corporate Bitcoin adoption continues despite market volatility...',
    source: 'MicroStrategy PR',
    url: 'https://microstrategy.com/bitcoin-purchase',
    category: 'Whale',
    image_url: null,
    published_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    impact: 'MED' as const
  },
  {
    id: '11',
    title: 'Solana futures open interest spikes 340% ahead of major ecosystem upgrades',
    summary: 'Derivative markets pricing in significant volatility for SOL...',
    source: 'CoinGlass',
    url: 'https://coinglass.com/solana-oi',
    category: 'Funding',
    image_url: null,
    published_at: new Date(Date.now() - 195 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 195 * 60 * 1000).toISOString(),
    impact: 'MED' as const
  },
  {
    id: '12',
    title: 'Hong Kong approves first batch of crypto ETFs for retail trading starting next month',
    summary: 'Asian markets opening up to crypto investment products...',
    source: 'South China Morning Post',
    url: 'https://scmp.com/hong-kong-crypto-etf',
    category: 'Regulatory',
    image_url: null,
    published_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    impact: 'HIGH' as const
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
  
  // Fetch news data
  const { data: news, loading, error, refetch } = useNews(selectedCategory)
  
  const newsData = news || mockNews
  const filteredNews = selectedCategory === 'All' 
    ? newsData 
    : newsData.filter(item => item.category === selectedCategory)
  
  const impactCounts = {
    HIGH: newsData.filter(n => n.impact === 'HIGH').length,
    MED: newsData.filter(n => n.impact === 'MED').length,
    LOW: newsData.filter(n => n.impact === 'LOW').length
  }
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Demo Mode Banner */}
      {error && <DemoModeBanner />}
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
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
          
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-[#6b7280] hover:text-white border border-[#1b2332] rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </motion.div>
      
      {/* Category Tabs */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-2 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map(category => {
            const IconComponent = categoryIcons[category]
            const isActive = selectedCategory === category
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 min-h-[44px] ${
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
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <NewsItemSkeleton key={index} />
            ))
          ) : filteredNews.length > 0 ? (
            filteredNews.map((newsItem, index) => (
              <motion.div
                key={newsItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.03, duration: 0.4 }}
              >
                <NewsItem news={newsItem} />
              </motion.div>
            ))
          ) : (
            <div className="py-12">
              <EmptyState
                icon={Newspaper}
                title="No news found"
                description="Try selecting a different category or refresh to load new articles."
                action={{ label: 'Refresh', onClick: refetch }}
              />
            </div>
          )}
        </div>
      </motion.div>
      
      {/* News Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
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