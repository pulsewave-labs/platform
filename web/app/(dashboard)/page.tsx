'use client'

import { motion } from 'framer-motion'
import StatCard from '../../components/dashboard/stat-card'
import SignalCard from '../../components/dashboard/signal-card'
import NewsItem from '../../components/dashboard/news-item'
import RiskGauge from '../../components/dashboard/risk-gauge'
import AIBriefing from '../../components/dashboard/ai-briefing'
import { Signal, NewsItem as NewsItemType, Trade } from '../../types'

// Mock data for the dashboard
const mockStats = [
  {
    title: 'Portfolio Value',
    value: '$12,847',
    change: { value: '▼ 2.1% today', type: 'negative' as const },
    sparkline: [12500, 12800, 13100, 12900, 13200, 12950, 12847]
  },
  {
    title: 'Win Rate (30d)',
    value: '67%',
    change: { value: '▲ 4% vs last month', type: 'positive' as const },
    sparkline: [63, 65, 64, 66, 67, 68, 67]
  },
  {
    title: 'Profit Factor (30d)',
    value: '1.84',
    change: { value: '▲ 0.3', type: 'positive' as const },
    sparkline: [1.5, 1.6, 1.7, 1.8, 1.85, 1.82, 1.84]
  },
  {
    title: 'Trades This Month',
    value: 23,
    change: { value: 'Avg 1.1/day', type: 'neutral' as const },
    sparkline: [18, 19, 20, 21, 22, 23, 23]
  }
]

const mockSignals: Signal[] = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    entry: 68840,
    stopLoss: 67920,
    takeProfit: 70680,
    confidence: 82,
    regime: 'VOLATILE',
    reasoning: '4H S/R bounce + RSI oversold + volume spike',
    factors: [
      { name: 'Support/Resistance', score: 85, weight: 0.3 },
      { name: 'RSI Oversold', score: 75, weight: 0.2 },
      { name: 'Volume Spike', score: 90, weight: 0.25 },
      { name: 'Market Structure', score: 70, weight: 0.25 }
    ],
    timeframe: '4h',
    createdAt: '2026-02-17T16:30:00Z',
    updatedAt: '2026-02-17T16:30:00Z',
    status: 'active',
    riskReward: 2.0
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    entry: 2685,
    stopLoss: 2740,
    takeProfit: 2575,
    confidence: 68,
    regime: 'TRENDING_DOWN',
    reasoning: 'Daily resistance rejection + bearish divergence',
    factors: [
      { name: 'Resistance Level', score: 80, weight: 0.4 },
      { name: 'Bearish Divergence', score: 65, weight: 0.3 },
      { name: 'Volume Profile', score: 60, weight: 0.3 }
    ],
    timeframe: '1d',
    createdAt: '2026-02-17T15:45:00Z',
    updatedAt: '2026-02-17T15:45:00Z',
    status: 'active',
    riskReward: 2.0
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG',
    entry: 138.50,
    stopLoss: 135.20,
    takeProfit: 145.80,
    confidence: 45,
    regime: 'RANGING',
    reasoning: 'Signal pending — needs volume confirmation',
    factors: [],
    timeframe: '1h',
    createdAt: '2026-02-17T16:45:00Z',
    updatedAt: '2026-02-17T16:45:00Z',
    status: 'pending',
    riskReward: 2.2
  }
]

const mockNews: NewsItemType[] = [
  {
    id: '1',
    title: 'Fed Minutes Preview: Markets brace for hawkish tone as inflation data remains sticky',
    content: 'Federal Reserve officials are expected to discuss the path forward for monetary policy amid persistent inflationary pressures.',
    source: 'Reuters',
    impact: 'high',
    publishedAt: '2026-02-17T17:49:00Z',
    url: 'https://example.com/news/1',
    pairs: ['BTC/USDT', 'ETH/USDT'],
    sentiment: -0.3,
    relevanceScore: 0.9,
    category: 'Macro'
  },
  {
    id: '2',
    title: 'BTC Whale Alert: 2,400 BTC ($165M) moved from Coinbase to unknown wallet',
    content: 'Large institutional movement detected on the Bitcoin network, potentially signaling accumulation.',
    source: 'Whale Alert',
    impact: 'medium',
    publishedAt: '2026-02-17T17:33:00Z',
    url: 'https://example.com/news/2',
    pairs: ['BTC/USDT'],
    sentiment: 0.2,
    relevanceScore: 0.8,
    category: 'Whale Alerts'
  },
  {
    id: '3',
    title: 'Funding Rates: BTC perp funding turned negative (-0.01%) — short squeeze potential',
    content: 'Negative funding rates suggest overleveraged short positions, creating potential for upward price movement.',
    source: 'Coinglass',
    impact: 'medium',
    publishedAt: '2026-02-17T17:16:00Z',
    url: 'https://example.com/news/3',
    pairs: ['BTC/USDT'],
    sentiment: 0.4,
    relevanceScore: 0.7,
    category: 'Funding Rates'
  },
  {
    id: '4',
    title: 'Options Expiry: $2.1B in BTC options expire Friday — max pain at $71,000',
    content: 'Significant options expiry could drive price action as market makers adjust hedging positions.',
    source: 'Deribit',
    impact: 'high',
    publishedAt: '2026-02-17T15:30:00Z',
    url: 'https://example.com/news/4',
    pairs: ['BTC/USDT'],
    sentiment: 0.1,
    relevanceScore: 0.85,
    category: 'Macro'
  }
]

const mockTrades: Trade[] = [
  {
    id: '1',
    userId: 'user1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    orderType: 'market',
    entryPrice: 69200,
    exitPrice: 70540,
    quantity: 0.2,
    realizedPnL: 287.40,
    fees: 12.60,
    status: 'closed',
    openedAt: '2026-02-16T14:30:00Z',
    closedAt: '2026-02-16T16:45:00Z',
    rMultiple: 2.1
  },
  {
    id: '2',
    userId: 'user1',
    pair: 'ETH/USDT',
    direction: 'SHORT',
    orderType: 'limit',
    entryPrice: 2720,
    exitPrice: 2678,
    quantity: 2.5,
    realizedPnL: -142.30,
    fees: 18.20,
    status: 'closed',
    openedAt: '2026-02-16T10:15:00Z',
    closedAt: '2026-02-16T11:30:00Z',
    rMultiple: -1.0
  },
  {
    id: '3',
    userId: 'user1',
    pair: 'BTC/USDT',
    direction: 'LONG',
    orderType: 'market',
    entryPrice: 68500,
    exitPrice: 69912,
    quantity: 0.15,
    realizedPnL: 412.80,
    fees: 15.30,
    status: 'closed',
    openedAt: '2026-02-15T09:20:00Z',
    closedAt: '2026-02-15T15:10:00Z',
    rMultiple: 2.8
  }
]

const briefingData = [
  {
    type: 'trend' as const,
    title: 'Market Overview',
    content: '**BTC** dropped 3.2% overnight on macro fears — **4H regime shifted to VOLATILE**. Key support at **$68,961** is being tested now. Funding rates turned negative (-0.01%) suggesting overleveraged shorts building. **Fed minutes release tomorrow 2:00 PM EST** — expect volatility. Your portfolio heat is healthy at 45%. **2 active signals today** — both high confluence.'
  },
  {
    type: 'signal' as const,
    title: 'Active Signals',
    content: 'Two high-confidence signals are currently active: **BTC/USDT LONG** at 82% confidence and **ETH/USDT SHORT** at 68% confidence. Both signals show strong R:R ratios above 2:1.',
    time: '16:30'
  },
  {
    type: 'event' as const,
    title: 'Economic Calendar',
    content: '**FOMC Minutes** release scheduled for tomorrow at 2:00 PM EST. Historical volatility suggests **±4-6%** price movement. Consider reducing position sizes.',
    time: 'Tomorrow 2:00 PM',
    priority: 'high' as const
  },
  {
    type: 'warning' as const,
    title: 'Risk Alert',
    content: 'Options max pain at **$71,000** could create resistance. Large options expiry this Friday with **$2.1B** notional value.',
    priority: 'medium' as const
  }
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* AI Daily Briefing */}
      <AIBriefing briefingItems={briefingData} delay={0} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            sparkline={stat.sparkline}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Area - Takes 2/3 width on xl screens */}
        <div className="xl:col-span-2">
          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">BTC/USDT</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-red-400 text-sm font-semibold">VOLATILE</span>
                </div>
                <div className="flex gap-1">
                  {['15m', '30m', '1H', '4H', '1D'].map((timeframe, index) => (
                    <button
                      key={timeframe}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        timeframe === '30m'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">$68,961</div>
                <div className="text-sm text-red-400 font-medium">-3.2%</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-slate-950 rounded-lg h-80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent" />
              
              {/* Simulated candlestick chart */}
              <div className="absolute bottom-6 left-6 right-6 h-48 flex items-end justify-between">
                {Array.from({ length: 20 }, (_, i) => {
                  const isGreen = Math.random() > 0.5
                  const height = Math.random() * 80 + 20
                  const wickTop = Math.random() * 20 + 5
                  const wickBottom = Math.random() * 15 + 5
                  
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-0.5 ${isGreen ? 'bg-emerald-400' : 'bg-red-400'} opacity-60`}
                        style={{ height: `${wickTop}px` }}
                      />
                      <div
                        className={`w-2 ${isGreen ? 'bg-emerald-400' : 'bg-red-400'} rounded-sm`}
                        style={{ height: `${height}px` }}
                      />
                      <div
                        className={`w-0.5 ${isGreen ? 'bg-emerald-400' : 'bg-red-400'} opacity-60`}
                        style={{ height: `${wickBottom}px` }}
                      />
                    </div>
                  )
                })}
              </div>
              
              {/* Support/Resistance Lines */}
              <div className="absolute top-16 left-6 right-6 border-t border-dashed border-red-400/40" />
              <div className="absolute top-16 right-6 text-xs text-red-400 font-semibold">R1 $70,235</div>
              
              <div className="absolute top-32 left-6 right-6 border-t border-dashed border-red-400/40" />
              <div className="absolute top-32 right-6 text-xs text-red-400 font-semibold">R2 $69,500</div>
              
              <div className="absolute bottom-20 left-6 right-6 border-t border-dashed border-emerald-400/40" />
              <div className="absolute bottom-20 right-6 text-xs text-emerald-400 font-semibold">S1 $68,200</div>
              
              {/* Signal Marker */}
              <div className="absolute bottom-24 left-1/3 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-md">
                ▲ LONG 82%
              </div>
              
              <div className="text-gray-500 text-sm">TradingView Chart Integration</div>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar - Signals */}
        <div className="space-y-6">
          {/* Active Signals */}
          <motion.div
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                🎯 Active Signals
              </h3>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md">
                2 Live
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockSignals.map((signal, index) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  showDetails={false}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Feed */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              📰 News Feed
            </h3>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-md">
              AI Filtered
            </span>
          </div>
          
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {mockNews.map((news, index) => (
              <NewsItem
                key={news.id}
                news={news}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Recent Trades */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              📓 Recent Trades
            </h3>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-md">
              Auto-logged
            </span>
          </div>
          
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">
              <span>Date</span>
              <span>Pair</span>
              <span>Dir</span>
              <span>P&L</span>
              <span>R-Mult</span>
            </div>
            
            {/* Trades */}
            {mockTrades.map((trade, index) => (
              <motion.div
                key={trade.id}
                className="grid grid-cols-5 gap-2 text-sm py-2 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/20 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <span className="text-gray-400 text-xs">
                  {new Date(trade.openedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-white font-medium">{trade.pair}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  trade.direction === 'LONG' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {trade.direction}
                </span>
                <span className={`font-semibold ${
                  trade.realizedPnL && trade.realizedPnL > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {trade.realizedPnL && trade.realizedPnL > 0 ? '+' : ''}${trade.realizedPnL?.toFixed(2)}
                </span>
                <span className={`font-semibold ${
                  trade.rMultiple && trade.rMultiple > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {trade.rMultiple && trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple}R
                </span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              View all trades →
            </button>
          </div>
        </motion.div>

        {/* Risk Manager */}
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              🛡️ Risk Manager
            </h3>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md">
              HEALTHY
            </span>
          </div>
          
          <div className="flex justify-center mb-4">
            <RiskGauge percentage={45} delay={1} />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-800/50">
              <span className="text-gray-400">Open Positions</span>
              <span className="text-white">2 of 5 max</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-800/50">
              <span className="text-gray-400">Daily P&L</span>
              <span className="text-red-400 font-semibold">-$142.30</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-800/50">
              <span className="text-gray-400">Daily Loss Limit</span>
              <span className="text-white">$500 remaining</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-800/50">
              <span className="text-gray-400">Correlation Risk</span>
              <span className="text-emerald-400 font-semibold">Low</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-400">Tilt Score</span>
              <span className="text-emerald-400 font-semibold">😎 Cool</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}