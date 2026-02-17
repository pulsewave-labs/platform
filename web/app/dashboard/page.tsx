'use client'

import { motion } from 'framer-motion'
import AIBriefing from '../../components/dashboard/ai-briefing'
import StatCard from '../../components/dashboard/stat-card'
import SignalCard from '../../components/dashboard/signal-card'
import NewsItem from '../../components/dashboard/news-item'
import RiskGauge from '../../components/dashboard/risk-gauge'
import EquityCurve from '../../components/dashboard/equity-curve'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Target } from 'lucide-react'

// Mock data
const mockStats = [
  {
    title: 'Portfolio Value',
    value: '$142,847',
    change: '+2.3%',
    trend: 'up' as const,
    icon: 'dollar' as const
  },
  {
    title: 'Win Rate (30d)',
    value: '73%',
    change: '+5%',
    trend: 'up' as const,
    icon: 'percent' as const
  },
  {
    title: 'Profit Factor',
    value: '2.14',
    change: '+0.18',
    trend: 'up' as const,
    icon: 'chart' as const
  },
  {
    title: 'Open Trades',
    value: '3',
    change: '2 winning',
    trend: 'neutral' as const,
    icon: 'trades' as const
  }
]

const activeSignals = [
  {
    id: '1',
    pair: 'BTC/USDT',
    direction: 'LONG' as const,
    entry: 69420,
    stopLoss: 68200,
    takeProfit: 72100,
    confidence: 87,
    timeframe: '4H',
    status: 'active' as const,
    riskReward: 2.2
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    direction: 'SHORT' as const,
    entry: 2742,
    stopLoss: 2820,
    takeProfit: 2586,
    confidence: 73,
    timeframe: '1D',
    status: 'active' as const,
    riskReward: 2.0
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    direction: 'LONG' as const,
    entry: 142.50,
    stopLoss: 138.20,
    takeProfit: 150.80,
    confidence: 68,
    timeframe: '2H',
    status: 'pending' as const,
    riskReward: 1.9
  }
]

const recentNews = [
  {
    id: '1',
    title: 'Fed Minutes: Hawkish tone as inflation remains sticky above target',
    impact: 'HIGH' as const,
    timeAgo: '12m',
    category: 'Macro' as const
  },
  {
    id: '2',
    title: 'BTC Whale Alert: 3,200 BTC ($220M) moved from Coinbase',
    impact: 'MED' as const,
    timeAgo: '28m',
    category: 'Whale' as const
  },
  {
    id: '3',
    title: 'Funding rates turn negative: Short squeeze potential builds',
    impact: 'MED' as const,
    timeAgo: '45m',
    category: 'Funding' as const
  }
]

const recentTrades = [
  { pair: 'BTC/USDT', direction: 'LONG' as const, pnl: 1247.50, rMultiple: 2.1, date: 'Today' },
  { pair: 'ETH/USDT', direction: 'SHORT' as const, pnl: -342.20, rMultiple: -0.8, date: 'Yesterday' },
  { pair: 'SOL/USDT', direction: 'LONG' as const, pnl: 856.30, rMultiple: 1.9, date: 'Yesterday' }
]

const briefingText = `**BTC** testing key support at **$69,420** — 4H regime shows **VOLATILE** with strong volume. Fed minutes released **hawkish tone** causing macro fear. However, **funding rates turned negative** suggesting overleveraged shorts. Your portfolio heat at **42%** remains healthy. **3 active signals** with strong confluence factors.`

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

export default function Dashboard() {
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* AI Briefing */}
      <motion.div variants={itemVariants}>
        <AIBriefing content={briefingText} />
      </motion.div>

      {/* Stats Row */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        {mockStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </motion.div>

      {/* Main Content - Two Column */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Chart Area - 60% */}
        <motion.div 
          className="xl:col-span-3"
          variants={itemVariants}
        >
          <div className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold text-white">BTC/USDT</h3>
                <div className="flex gap-1">
                  {['15m', '30m', '1H', '4H', '1D'].map((timeframe) => (
                    <button
                      key={timeframe}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        timeframe === '4H'
                          ? 'bg-[#00F0B5]/20 text-[#00F0B5]'
                          : 'text-[#6b7280] hover:text-[#9ca3af]'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-mono text-white tabular-nums">$69,420</div>
                <div className="flex items-center gap-1 text-sm font-medium text-[#4ade80]">
                  <TrendingUp size={16} />
                  +2.3%
                </div>
              </div>
            </div>

            {/* Chart Placeholder with Price Action */}
            <div className="bg-[#0a0e17] rounded-xl h-80 flex items-center justify-center relative overflow-hidden">
              {/* Simulated candlestick chart */}
              <div className="absolute bottom-8 left-8 right-8 h-48 flex items-end justify-between">
                {Array.from({ length: 24 }, (_, i) => {
                  const isGreen = Math.random() > 0.45
                  const height = Math.random() * 60 + 20
                  
                  return (
                    <motion.div
                      key={i}
                      className={`w-1.5 rounded-sm ${isGreen ? 'bg-[#4ade80]' : 'bg-[#f87171]'}`}
                      style={{ height: `${height}px` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}px` }}
                      transition={{ delay: i * 0.05, duration: 0.8 }}
                    />
                  )
                })}
              </div>
              
              {/* Support/Resistance Lines */}
              <div className="absolute top-16 left-8 right-8 border-t border-dashed border-[#f87171]/40" />
              <div className="absolute top-14 right-8 text-xs text-[#f87171] font-mono">$71,200</div>
              
              <div className="absolute bottom-24 left-8 right-8 border-t border-dashed border-[#4ade80]/40" />
              <div className="absolute bottom-20 right-8 text-xs text-[#4ade80] font-mono">$68,200</div>
              
              <div className="text-[#6b7280] text-sm font-medium">Live Chart Integration</div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - 40% */}
        <motion.div 
          className="xl:col-span-2 space-y-6"
          variants={itemVariants}
        >
          {/* Active Signals */}
          <div className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Active Signals</div>
                <div className="flex items-center gap-2 mt-1">
                  <Target size={16} className="text-[#00F0B5]" />
                  <span className="text-sm font-semibold text-white">3 Live</span>
                </div>
              </div>
              <Link 
                href="/dashboard/signals"
                className="text-xs text-[#00F0B5] hover:text-[#00F0B5]/80 font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-3">
              {activeSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} compact />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row - Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent News */}
        <motion.div
          className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Recent News</div>
            <Link 
              href="/dashboard/news"
              className="text-xs text-[#00F0B5] hover:text-[#00F0B5]/80 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentNews.map((news) => (
              <NewsItem key={news.id} news={news} />
            ))}
          </div>
        </motion.div>

        {/* Latest Trades */}
        <motion.div
          className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Latest Trades</div>
            <Link 
              href="/dashboard/journal"
              className="text-xs text-[#00F0B5] hover:text-[#00F0B5]/80 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTrades.map((trade, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-[#1b2332] last:border-b-0">
                <div>
                  <div className="text-sm font-medium text-white">{trade.pair}</div>
                  <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                    <span className={`px-2 py-0.5 rounded text-white font-medium ${
                      trade.direction === 'LONG' ? 'bg-[#4ade80]' : 'bg-[#f87171]'
                    }`}>
                      {trade.direction}
                    </span>
                    <span>{trade.date}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-mono tabular-nums font-semibold ${
                    trade.pnl > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                  }`}>
                    {trade.pnl > 0 ? '+' : ''}${trade.pnl}
                  </div>
                  <div className={`text-xs font-mono tabular-nums ${
                    trade.rMultiple > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                  }`}>
                    {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple}R
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Overview */}
        <motion.div
          className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Risk Overview</div>
            <Link 
              href="/dashboard/risk"
              className="text-xs text-[#00F0B5] hover:text-[#00F0B5]/80 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex justify-center mb-6">
            <RiskGauge percentage={42} />
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6b7280]">Daily P&L</span>
              <span className="text-[#4ade80] font-semibold font-mono">+$1,247.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b7280]">Loss Limit Left</span>
              <span className="text-white font-mono">$1,200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b7280]">Max Positions</span>
              <span className="text-white">3 of 5</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}