'use client'
import { motion } from 'framer-motion'
import EquityCurve from '../../../components/dashboard/equity-curve'
import StatCard from '../../../components/dashboard/stat-card'
import { BookOpen, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

// Mock trades data
const mockTrades = [
  {
    id: '1',
    date: '2026-02-17',
    pair: 'BTC/USDT',
    direction: 'LONG' as const,
    entry: 69200,
    exit: 70540,
    pnl: 1287.40,
    rMultiple: 2.1,
    duration: '2h 15m',
    notes: 'Perfect bounce from 4H support level'
  },
  {
    id: '2',
    date: '2026-02-16',
    pair: 'ETH/USDT',
    direction: 'SHORT' as const,
    entry: 2720,
    exit: 2678,
    pnl: -342.30,
    rMultiple: -0.8,
    duration: '1h 15m',
    notes: 'Stopped out on false breakdown'
  },
  {
    id: '3',
    date: '2026-02-16',
    pair: 'SOL/USDT',
    direction: 'LONG' as const,
    entry: 138.50,
    exit: 142.80,
    pnl: 856.30,
    rMultiple: 1.9,
    duration: '4h 32m',
    notes: 'Strong breakout with volume confirmation'
  },
  {
    id: '4',
    date: '2026-02-15',
    pair: 'AVAX/USDT',
    direction: 'LONG' as const,
    entry: 34.20,
    exit: 35.95,
    pnl: 675.25,
    rMultiple: 2.3,
    duration: '6h 18m',
    notes: 'Bullish flag pattern completion'
  },
  {
    id: '5',
    date: '2026-02-15',
    pair: 'MATIC/USDT',
    direction: 'SHORT' as const,
    entry: 0.8520,
    exit: 0.8180,
    pnl: 420.80,
    rMultiple: 1.6,
    duration: '3h 45m',
    notes: 'Support breakdown with volume'
  },
  {
    id: '6',
    date: '2026-02-14',
    pair: 'BTC/USDT',
    direction: 'LONG' as const,
    entry: 68500,
    exit: 67820,
    pnl: -523.50,
    rMultiple: -1.2,
    duration: '45m',
    notes: 'Failed breakout, quick stop'
  },
  {
    id: '7',
    date: '2026-02-14',
    pair: 'LINK/USDT',
    direction: 'LONG' as const,
    entry: 14.25,
    exit: 15.48,
    pnl: 892.15,
    rMultiple: 2.8,
    duration: '8h 22m',
    notes: 'Triangle breakout with strong momentum'
  },
  {
    id: '8',
    date: '2026-02-13',
    pair: 'ADA/USDT',
    direction: 'SHORT' as const,
    entry: 0.4680,
    exit: 0.4420,
    pnl: 356.40,
    rMultiple: 1.4,
    duration: '2h 08m',
    notes: 'Resistance rejection with bearish divergence'
  },
  {
    id: '9',
    date: '2026-02-13',
    pair: 'DOT/USDT',
    direction: 'LONG' as const,
    entry: 6.85,
    exit: 7.75,
    pnl: 1124.70,
    rMultiple: 3.2,
    duration: '12h 45m',
    notes: 'Double bottom pattern, excellent R:R'
  },
  {
    id: '10',
    date: '2026-02-12',
    pair: 'ETH/USDT',
    direction: 'LONG' as const,
    entry: 2645,
    exit: 2698,
    pnl: 742.90,
    rMultiple: 1.8,
    duration: '3h 12m',
    notes: 'Support bounce with RSI oversold'
  },
  {
    id: '11',
    date: '2026-02-12',
    pair: 'SOL/USDT',
    direction: 'SHORT' as const,
    entry: 145.80,
    exit: 143.20,
    pnl: 485.60,
    rMultiple: 1.9,
    duration: '2h 36m',
    notes: 'Failed retest of resistance level'
  },
  {
    id: '12',
    date: '2026-02-11',
    pair: 'BTC/USDT',
    direction: 'LONG' as const,
    entry: 67200,
    exit: 69420,
    pnl: 1556.80,
    rMultiple: 2.6,
    duration: '16h 25m',
    notes: 'Weekly support bounce, strong momentum'
  },
  {
    id: '13',
    date: '2026-02-11',
    pair: 'AVAX/USDT',
    direction: 'SHORT' as const,
    entry: 36.40,
    exit: 35.85,
    pnl: -128.75,
    rMultiple: -0.3,
    duration: '25m',
    notes: 'Quick scalp, cut short on reversal'
  },
  {
    id: '14',
    date: '2026-02-10',
    pair: 'MATIC/USDT',
    direction: 'LONG' as const,
    entry: 0.8120,
    exit: 0.8480,
    pnl: 624.00,
    rMultiple: 2.1,
    duration: '5h 18m',
    notes: 'Cup and handle breakout'
  },
  {
    id: '15',
    date: '2026-02-10',
    pair: 'LINK/USDT',
    direction: 'SHORT' as const,
    entry: 15.20,
    exit: 14.85,
    pnl: 287.50,
    rMultiple: 1.2,
    duration: '1h 42m',
    notes: 'Resistance rejection, quick profits'
  }
]

const journalStats = [
  {
    title: 'Total P&L',
    value: '+$8,347.80',
    change: '+12.4%',
    trend: 'up' as const,
    icon: 'dollar' as const
  },
  {
    title: 'Win Rate',
    value: '73%',
    change: '11 of 15',
    trend: 'up' as const,
    icon: 'percent' as const
  },
  {
    title: 'Avg R-Multiple',
    value: '1.68R',
    change: '+0.23',
    trend: 'up' as const,
    icon: 'chart' as const
  },
  {
    title: 'Profit Factor',
    value: '2.84',
    change: 'Excellent',
    trend: 'up' as const,
    icon: 'trades' as const
  },
  {
    title: 'Total Trades',
    value: '15',
    change: '7 days',
    trend: 'neutral' as const,
    icon: 'trades' as const
  }
]

export default function JournalPage() {
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
            <BookOpen size={18} className="text-[#00F0B5]" />
          </div>
          <div>
            <div className="text-sm text-[#6b7280]">Trading Journal</div>
            <div className="text-sm text-[#9ca3af]">Performance tracking & analysis</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {journalStats.map((stat, index) => (
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

      {/* Equity Curve */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <EquityCurve />
      </motion.div>

      {/* Trades Table */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={16} className="text-[#6b7280]" />
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">Trade History</span>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-8 gap-4 text-xs font-medium text-[#6b7280] uppercase tracking-wide pb-4 border-b border-[#1b2332]">
          <span>Date</span>
          <span>Pair</span>
          <span>Direction</span>
          <span>Entry</span>
          <span>Exit</span>
          <span>P&L ($)</span>
          <span>R-Mult</span>
          <span>Duration</span>
        </div>
        
        {/* Table Rows */}
        <div className="space-y-0">
          {mockTrades.map((trade, index) => (
            <motion.div
              key={trade.id}
              className={`grid grid-cols-8 gap-4 text-sm py-4 border-b border-[#1b2332]/50 last:border-b-0 transition-colors hover:bg-[#1b2332]/20 -mx-2 px-2 rounded-lg ${
                trade.pnl > 0 ? 'bg-[#4ade80]/5' : trade.pnl < 0 ? 'bg-[#f87171]/5' : ''
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.02, duration: 0.4 }}
            >
              <span className="text-[#9ca3af] font-mono tabular-nums">
                {new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-white font-medium">{trade.pair}</span>
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                  trade.direction === 'LONG' ? 'bg-[#4ade80]' : 'bg-[#f87171]'
                }`}>
                  {trade.direction}
                </span>
              </div>
              <span className="text-white font-mono tabular-nums">${trade.entry.toLocaleString()}</span>
              <span className="text-white font-mono tabular-nums">${trade.exit.toLocaleString()}</span>
              <span className={`font-semibold font-mono tabular-nums ${
                trade.pnl > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
              }`}>
                {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
              </span>
              <span className={`font-semibold font-mono tabular-nums ${
                trade.rMultiple > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
              }`}>
                {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple}R
              </span>
              <span className="text-[#6b7280] text-xs">{trade.duration}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}