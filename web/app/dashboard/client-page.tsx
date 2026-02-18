'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Bell,
  Target,
  Clock,
  DollarSign,
  Percent,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Signal {
  id: string
  pair: string
  timeframe: string
  direction: 'LONG' | 'SHORT'
  entry_price: number
  stop_loss: number
  take_profit: number
  confidence: number
  status: 'ACTIVE' | 'CLOSED'
  entry_time: string
  exit_time?: string
  current_price?: number
  pnl?: number
  pnl_pct?: number
  exit_reason?: string
}

export default function DashboardClientPage() {
  const [activeSignals, setActiveSignals] = useState<Signal[]>([])
  const [recentSignals, setRecentSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayPnl: 0,
    weekPnl: 0,
    monthPnl: 0,
    totalPnl: 0
  })

  useEffect(() => {
    fetchSignals()
    fetchStats()
  }, [])

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals')
      const data = await response.json()
      
      // Separate active and recent signals
      const active = data.filter((s: Signal) => s.status === 'ACTIVE')
      const recent = data.filter((s: Signal) => s.status === 'CLOSED')
        .sort((a: Signal, b: Signal) => new Date(b.exit_time!).getTime() - new Date(a.exit_time!).getTime())
        .slice(0, 10)
      
      setActiveSignals(active)
      setRecentSignals(recent)
    } catch (error) {
      console.error('Failed to fetch signals:', error)
      // Mock data for demo
      setActiveSignals([
        {
          id: '1',
          pair: 'BTC/USDT',
          timeframe: '4h',
          direction: 'LONG',
          entry_price: 68450,
          stop_loss: 66800,
          take_profit: 72100,
          confidence: 92,
          status: 'ACTIVE',
          entry_time: new Date().toISOString(),
          current_price: 69200
        },
        {
          id: '2',
          pair: 'ETH/USDT',
          timeframe: '6h',
          direction: 'LONG',
          entry_price: 2680,
          stop_loss: 2580,
          take_profit: 2890,
          confidence: 87,
          status: 'ACTIVE',
          entry_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          current_price: 2720
        },
        {
          id: '3',
          pair: 'SOL/USDT',
          timeframe: '4h',
          direction: 'SHORT',
          entry_price: 198.50,
          stop_loss: 206.00,
          take_profit: 182.00,
          confidence: 79,
          status: 'ACTIVE',
          entry_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          current_price: 195.20
        }
      ])
      
      setRecentSignals([
        {
          id: '4',
          pair: 'AVAX/USDT',
          timeframe: '6h',
          direction: 'LONG',
          entry_price: 38.90,
          stop_loss: 37.20,
          take_profit: 42.30,
          confidence: 85,
          status: 'CLOSED',
          entry_time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          exit_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          pnl: 1789,
          pnl_pct: 8.7,
          exit_reason: 'TP'
        },
        {
          id: '5',
          pair: 'XRP/USDT',
          timeframe: '12h',
          direction: 'SHORT',
          entry_price: 0.875,
          stop_loss: 0.905,
          take_profit: 0.820,
          confidence: 76,
          status: 'CLOSED',
          entry_time: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
          exit_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          pnl: 1876,
          pnl_pct: 6.3,
          exit_reason: 'TP'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    // Mock stats - in real app would fetch from API
    setStats({
      todayPnl: 2340,
      weekPnl: 8750,
      monthPnl: 15400,
      totalPnl: 47832
    })
  }

  const calculateProgress = (signal: Signal) => {
    if (!signal.current_price) return 50

    const { entry_price, stop_loss, take_profit, current_price, direction } = signal
    
    if (direction === 'LONG') {
      if (current_price <= stop_loss) return 0
      if (current_price >= take_profit) return 100
      return ((current_price - entry_price) / (take_profit - entry_price)) * 100
    } else {
      if (current_price >= stop_loss) return 0
      if (current_price <= take_profit) return 100
      return ((entry_price - current_price) / (entry_price - take_profit)) * 100
    }
  }

  const calculateUnrealizedPnl = (signal: Signal) => {
    if (!signal.current_price) return 0
    
    const { entry_price, current_price, direction } = signal
    const mockPositionSize = 10000 // $10k position
    
    if (direction === 'LONG') {
      return ((current_price - entry_price) / entry_price) * mockPositionSize
    } else {
      return ((entry_price - current_price) / entry_price) * mockPositionSize
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m ago`
    }
    return `${diffMins}m ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading signals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Today's P&L", value: stats.todayPnl, icon: DollarSign, color: 'text-green-400' },
          { label: "This Week", value: stats.weekPnl, icon: TrendingUp, color: 'text-blue-400' },
          { label: "This Month", value: stats.monthPnl, icon: BarChart3, color: 'text-purple-400' },
          { label: "Total P&L", value: stats.totalPnl, icon: Target, color: 'text-teal-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={20} className={stat.color} />
              <span className="text-xs text-zinc-500">Demo Data</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              ${stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-zinc-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Active Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={24} className="text-green-400" />
            Active Signals
            <span className="text-sm font-normal text-zinc-400">({activeSignals.length} live)</span>
          </h2>
        </div>

        {activeSignals.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
            <Bell size={48} className="mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-400 mb-2">No Active Signals</h3>
            <p className="text-zinc-500">Our AI is scanning the markets. New signals will appear here when detected.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {activeSignals.map((signal, i) => {
              const progress = calculateProgress(signal)
              const unrealizedPnl = calculateUnrealizedPnl(signal)
              const isProfit = unrealizedPnl > 0
              
              return (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-zinc-900/50 border rounded-xl p-6 ${
                    signal.direction === 'LONG' ? 'border-green-500/30' : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{signal.pair}</h3>
                        <span className="text-sm text-zinc-400">{signal.timeframe}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          signal.direction === 'LONG' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {signal.direction}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        Entered {formatTimeAgo(signal.entry_time)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}${unrealizedPnl.toLocaleString()}
                      </div>
                      <div className="text-sm text-zinc-400">Unrealized P&L</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-zinc-400">Entry</span>
                      <div className="font-mono font-bold">${signal.entry_price.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-zinc-400">Current</span>
                      <div className="font-mono font-bold">${signal.current_price?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-zinc-400">Target</span>
                      <div className="font-mono font-bold text-green-400">${signal.take_profit.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-zinc-400">Stop</span>
                      <div className="font-mono font-bold text-red-400">${signal.stop_loss.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-zinc-400 mb-2">
                      <span>Stop Loss</span>
                      <span>Take Profit</span>
                    </div>
                    <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                          progress > 50 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, progress + 50))}%` }}
                      />
                      <div className="absolute top-1/2 left-1/2 w-1 h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-zinc-400">Confidence</div>
                      <div className="text-sm font-bold text-green-400">{signal.confidence}%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-zinc-400">Live</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={24} className="text-blue-400" />
            Recent Signals
          </h2>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold text-zinc-300">Pair</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300">Direction</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300">Entry</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300">Exit</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300">P&L</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300">Result</th>
                  <th className="px-6 py-4 font-semibold text-zinc-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSignals.map((signal, i) => (
                  <motion.tr
                    key={signal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold">{signal.pair}</div>
                      <div className="text-xs text-zinc-400">{signal.timeframe}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        signal.direction === 'LONG' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {signal.direction}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">${signal.entry_price.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono">${signal.take_profit.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className={`font-mono font-bold ${signal.pnl! > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.pnl! > 0 ? '+' : ''}${signal.pnl!.toLocaleString()}
                      </div>
                      <div className={`text-xs ${signal.pnl_pct! > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.pnl_pct! > 0 ? '+' : ''}{signal.pnl_pct!.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {signal.exit_reason === 'TP' ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <XCircle size={16} className="text-red-400" />
                        )}
                        <span className={`text-xs font-bold ${
                          signal.exit_reason === 'TP' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {signal.exit_reason}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {signal.exit_time ? formatTimeAgo(signal.exit_time) : '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}