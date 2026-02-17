'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Rss, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Globe,
  Zap,
  DollarSign,
  Building,
  Scale
} from 'lucide-react'
import NewsItem from '../../../components/dashboard/news-item'
import AIBriefing from '../../../components/dashboard/ai-briefing'
import { NewsItem as NewsItemType } from '../../../types'

// Mock news data
const mockNews: NewsItemType[] = [
  {
    id: '1',
    title: 'Fed Minutes Preview: Markets brace for hawkish tone as inflation data remains sticky',
    content: 'Federal Reserve officials are expected to discuss the path forward for monetary policy amid persistent inflationary pressures. Key focus areas include the terminal rate and duration of restrictive policy.',
    source: 'Reuters',
    impact: 'high',
    publishedAt: '2026-02-17T17:49:00Z',
    url: 'https://example.com/news/1',
    pairs: ['BTC/USDT', 'ETH/USDT', 'SPX'],
    sentiment: -0.4,
    relevanceScore: 0.95,
    category: 'Macro',
    tags: ['FOMC', 'inflation', 'monetary-policy']
  },
  {
    id: '2',
    title: 'BTC Whale Alert: 2,400 BTC ($165M) moved from Coinbase to unknown wallet',
    content: 'Large institutional movement detected on the Bitcoin network. The transaction occurred during low volume hours, potentially signaling strategic accumulation by a major holder.',
    source: 'Whale Alert',
    impact: 'medium',
    publishedAt: '2026-02-17T17:33:00Z',
    url: 'https://example.com/news/2',
    pairs: ['BTC/USDT'],
    sentiment: 0.2,
    relevanceScore: 0.85,
    category: 'Whale Alerts',
    tags: ['whale-movement', 'accumulation', 'coinbase']
  },
  {
    id: '3',
    title: 'Funding Rates Turn Negative: BTC perp funding at -0.01% signals potential squeeze',
    content: 'Bitcoin perpetual funding rates have turned negative for the first time in three weeks, suggesting an overabundance of short positions. Historically, this setup has led to significant upward price movements.',
    source: 'Coinglass',
    impact: 'medium',
    publishedAt: '2026-02-17T17:16:00Z',
    url: 'https://example.com/news/3',
    pairs: ['BTC/USDT'],
    sentiment: 0.4,
    relevanceScore: 0.8,
    category: 'Funding Rates',
    tags: ['funding-rates', 'short-squeeze', 'derivatives']
  },
  {
    id: '4',
    title: 'Options Expiry Alert: $2.1B in BTC options expire Friday with max pain at $71K',
    content: 'Significant options expiry this Friday could drive price action as market makers adjust delta hedging positions. Current max pain level sits at $71,000.',
    source: 'Deribit',
    impact: 'high',
    publishedAt: '2026-02-17T15:30:00Z',
    url: 'https://example.com/news/4',
    pairs: ['BTC/USDT'],
    sentiment: 0.1,
    relevanceScore: 0.9,
    category: 'Macro',
    tags: ['options', 'expiry', 'max-pain', 'derivatives']
  },
  {
    id: '5',
    title: 'Ethereum Foundation Sells 100 ETH, Treasury Management Continues',
    content: 'The Ethereum Foundation has sold another 100 ETH from its treasury wallet as part of ongoing operational funding. This represents a minor portion of their holdings.',
    source: 'Etherscan',
    impact: 'low',
    publishedAt: '2026-02-17T15:10:00Z',
    url: 'https://example.com/news/5',
    pairs: ['ETH/USDT'],
    sentiment: -0.1,
    relevanceScore: 0.4,
    category: 'Regulatory',
    tags: ['ethereum-foundation', 'treasury', 'selling']
  },
  {
    id: '6',
    title: 'MicroStrategy Adds 3,000 BTC to Holdings, Now Owns 193,000 Bitcoin',
    content: 'MicroStrategy has purchased an additional 3,000 Bitcoin for approximately $205 million, bringing their total holdings to 193,000 BTC. The purchase was funded through convertible bonds.',
    source: 'SEC Filing',
    impact: 'high',
    publishedAt: '2026-02-17T14:45:00Z',
    url: 'https://example.com/news/6',
    pairs: ['BTC/USDT'],
    sentiment: 0.7,
    relevanceScore: 0.85,
    category: 'Whale Alerts',
    tags: ['microstrategy', 'accumulation', 'institutional']
  },
  {
    id: '7',
    title: 'Solana DEX Volume Hits New ATH at $4.2B Daily',
    content: 'Solana-based decentralized exchanges processed a record $4.2 billion in trading volume over the past 24 hours, driven by meme coin trading and increased institutional adoption.',
    source: 'DeFiLlama',
    impact: 'medium',
    publishedAt: '2026-02-17T14:20:00Z',
    url: 'https://example.com/news/7',
    pairs: ['SOL/USDT'],
    sentiment: 0.6,
    relevanceScore: 0.75,
    category: 'Earnings',
    tags: ['solana', 'dex', 'volume', 'meme-coins']
  },
  {
    id: '8',
    title: 'SEC Chair Gensler Hints at Clearer Crypto Regulations by Q3 2026',
    content: 'SEC Chairman Gary Gensler suggested that comprehensive cryptocurrency regulations could be finalized by the third quarter of 2026, providing long-awaited clarity for the industry.',
    source: 'CoinDesk',
    impact: 'high',
    publishedAt: '2026-02-17T13:50:00Z',
    url: 'https://example.com/news/8',
    pairs: ['BTC/USDT', 'ETH/USDT'],
    sentiment: 0.3,
    relevanceScore: 0.9,
    category: 'Regulatory',
    tags: ['SEC', 'regulation', 'gensler', 'clarity']
  },
  {
    id: '9',
    title: 'Tether Mints 1B USDT on Ethereum Network',
    content: 'Tether has minted 1 billion USDT tokens on the Ethereum network, potentially signaling preparation for increased market demand or exchange inventory replenishment.',
    source: 'Tether Treasury',
    impact: 'medium',
    publishedAt: '2026-02-17T13:15:00Z',
    url: 'https://example.com/news/9',
    pairs: ['USDT', 'BTC/USDT', 'ETH/USDT'],
    sentiment: 0.2,
    relevanceScore: 0.7,
    category: 'Whale Alerts',
    tags: ['tether', 'usdt', 'mint', 'liquidity']
  },
  {
    id: '10',
    title: 'Japan Central Bank Considers Digital Yen Pilot Program',
    content: 'The Bank of Japan is reportedly considering a pilot program for a digital yen, joining other major economies in exploring central bank digital currencies.',
    source: 'Nikkei',
    impact: 'medium',
    publishedAt: '2026-02-17T12:45:00Z',
    url: 'https://example.com/news/10',
    pairs: ['JPY', 'BTC/USDT'],
    sentiment: 0.1,
    relevanceScore: 0.6,
    category: 'Regulatory',
    tags: ['japan', 'cbdc', 'digital-yen', 'central-bank']
  }
]

const categories = ['All', 'Macro', 'Whale Alerts', 'Funding Rates', 'Earnings', 'Regulatory']
const impactLevels = ['All', 'High', 'Medium', 'Low']
const sentiments = ['All', 'Bullish', 'Bearish', 'Neutral']

const briefingData = [
  {
    type: 'trend' as const,
    title: 'Market Sentiment Overview',
    content: 'Mixed sentiment in crypto markets today with **institutional accumulation** offsetting retail fear. **Fed minutes tomorrow** creating uncertainty, but **negative funding rates** suggest potential for squeeze higher.'
  },
  {
    type: 'warning' as const,
    title: 'High Impact Events',
    content: '**FOMC Minutes** release tomorrow at 2:00 PM EST expected to show hawkish bias. **$2.1B BTC options expiry** Friday could drive volatility with max pain at **$71,000**.',
    time: 'Tomorrow 2:00 PM',
    priority: 'high' as const
  },
  {
    type: 'opportunity' as const,
    title: 'Market Opportunities',
    content: '**Solana ecosystem** showing strength with record DEX volumes. **Negative funding rates** on BTC perps creating potential short squeeze setup. Watch for breakout above **$69,500** resistance.',
    priority: 'medium' as const
  }
]

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedImpact, setSelectedImpact] = useState('All')
  const [selectedSentiment, setSelectedSentiment] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const filteredNews = mockNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         news.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         news.source.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || news.category === selectedCategory
    
    const matchesImpact = selectedImpact === 'All' || 
      news.impact === selectedImpact.toLowerCase()
    
    const matchesSentiment = selectedSentiment === 'All' ||
      (selectedSentiment === 'Bullish' && news.sentiment > 0.2) ||
      (selectedSentiment === 'Bearish' && news.sentiment < -0.2) ||
      (selectedSentiment === 'Neutral' && news.sentiment >= -0.2 && news.sentiment <= 0.2)

    return matchesSearch && matchesCategory && matchesImpact && matchesSentiment
  })

  const highImpactCount = mockNews.filter(n => n.impact === 'high').length
  const bullishCount = mockNews.filter(n => n.sentiment > 0.2).length
  const bearishCount = mockNews.filter(n => n.sentiment < -0.2).length

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'Macro': return <Globe size={16} />
      case 'Whale Alerts': return <Zap size={16} />
      case 'Funding Rates': return <TrendingUp size={16} />
      case 'Earnings': return <DollarSign size={16} />
      case 'Regulatory': return <Scale size={16} />
      default: return <Rss size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">📰 Market News</h1>
            <p className="text-gray-400">AI-filtered crypto market news and analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">High Impact</div>
              <div className="text-2xl font-bold text-red-400">{highImpactCount}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Bullish</div>
              <div className="text-2xl font-bold text-emerald-400">{bullishCount}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Bearish</div>
              <div className="text-2xl font-bold text-red-400">{bearishCount}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI News Briefing */}
      <AIBriefing 
        title="🧠 AI News Briefing"
        briefingItems={briefingData} 
        delay={0.2} 
      />

      {/* Search and Filters */}
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <Filter size={18} />
            <span className="font-medium">Filters</span>
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Impact
              </label>
              <select
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              >
                {impactLevels.map(impact => (
                  <option key={impact} value={impact}>{impact}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Sentiment
              </label>
              <select
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              >
                {sentiments.map(sentiment => (
                  <option key={sentiment} value={sentiment}>{sentiment}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            {getCategoryIcon(category)}
            <span>{category}</span>
            <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
              {category === 'All' ? mockNews.length : mockNews.filter(n => n.category === category).length}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Results Summary */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-gray-400">
          Showing {filteredNews.length} of {mockNews.length} news items
        </p>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle size={14} />
            <span className="text-red-400 text-sm font-medium">
              {filteredNews.filter(n => n.impact === 'high').length} High Impact
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <TrendingUp size={14} />
            <span className="text-emerald-400 text-sm font-medium">
              Relevance {Math.round(filteredNews.reduce((avg, n) => avg + n.relevanceScore, 0) / filteredNews.length * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* News Feed */}
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Latest Market News
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Live Feed</span>
            </div>
          </div>
        </div>
        
        <div className="max-h-[800px] overflow-y-auto">
          {filteredNews.map((news, index) => (
            <NewsItem
              key={news.id}
              news={news}
              delay={index * 0.05}
            />
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="p-12 text-center">
            <Rss size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No news found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedImpact('All')
                setSelectedSentiment('All')
              }}
              className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}