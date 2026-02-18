'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  DollarSign,
  Target,
  Clock,
  Download
} from 'lucide-react'

interface Trade {
  pair: string
  timeframe: string
  action: 'LONG' | 'SHORT'
  entry_price: number
  exit_price: number
  stop_loss: number
  take_profit: number
  pnl: number
  pnl_pct: number
  fees: number
  risk_amount: number
  position_size: number
  notional: number
  exit_reason: string
  confidence: number
  entry_time: string
  exit_time: string
  balance_after: number
  strategy: string
  status: string
}

interface PerformanceData {
  stats: {
    startingCapital: number
    finalBalance: number
    totalReturn: number
    totalTrades: number
    wins: number
    losses: number
    winRate: number
    profitFactor: number
    maxDrawdown: number
    profitableMonths: number
    totalMonths: number
    avgMonthlyPnl: number
  }
  trades: Trade[]
}

export default function HistoryClientPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPair, setFilterPair] = useState('')
  const [filterDirection, setFilterDirection] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [sortField, setSortField] = useState('entry_time')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const tradesPerPage = 25

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/performance')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedTrades = useMemo(() => {
    if (!data) return []

    let filtered = data.trades.filter(trade => {
      const matchesSearch = trade.pair.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPair = !filterPair || trade.pair === filterPair
      const matchesDirection = !filterDirection || trade.action === filterDirection
      const matchesResult = !filterResult || 
        (filterResult === 'TP' && trade.exit_reason === 'TP') ||
        (filterResult === 'SL' && trade.exit_reason === 'SL') ||
        (filterResult === 'WIN' && trade.pnl > 0) ||
        (filterResult === 'LOSS' && trade.pnl < 0)

      return matchesSearch && matchesPair && matchesDirection && matchesResult
    })

    filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })

    return filtered
  }, [data, searchTerm, filterPair, filterDirection, filterResult, sortField, sortDirection])

  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * tradesPerPage
    return filteredAndSortedTrades.slice(start, start + tradesPerPage)
  }, [filteredAndSortedTrades, currentPage])

  const totalPages = Math.ceil(filteredAndSortedTrades.length / tradesPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading trade history...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Failed to load trade history</p>
          <button 
            onClick={fetchPerformanceData}
            className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const pairSet = new Set(data.trades.map((t: Trade) => t.pair))
  const uniquePairs = Array.from(pairSet).sort()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Trade History</h1>
        <p className="text-zinc-400">Complete record of all trading signals and performance</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total P&L', 
            value: `$${(data.stats.finalBalance - data.stats.startingCapital).toLocaleString()}`, 
            icon: DollarSign, 
            color: 'text-green-400',
            trend: '+2,084%'
          },
          { 
            label: 'Win Rate', 
            value: `${data.stats.winRate}%`, 
            icon: Target, 
            color: 'text-blue-400',
            trend: `${data.stats.wins}/${data.stats.totalTrades}`
          },
          { 
            label: 'Profit Factor', 
            value: data.stats.profitFactor.toFixed(2), 
            icon: BarChart3, 
            color: 'text-purple-400',
            trend: 'Strong'
          },
          { 
            label: 'Avg Monthly', 
            value: `$${data.stats.avgMonthlyPnl.toLocaleString()}`, 
            icon: TrendingUp, 
            color: 'text-teal-400',
            trend: `${data.stats.profitableMonths}/${data.stats.totalMonths} months`
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-zinc-400">{stat.label}</div>
            <div className="text-xs text-zinc-500 mt-1">{stat.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
      >
        <div className="grid md:grid-cols-5 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          
          <select
            value={filterPair}
            onChange={(e) => setFilterPair(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-green-500"
          >
            <option value="">All Pairs</option>
            {uniquePairs.map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>

          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-green-500"
          >
            <option value="">All Directions</option>
            <option value="LONG">LONG</option>
            <option value="SHORT">SHORT</option>
          </select>

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-green-500"
          >
            <option value="">All Results</option>
            <option value="WIN">Winners</option>
            <option value="LOSS">Losers</option>
            <option value="TP">Take Profit</option>
            <option value="SL">Stop Loss</option>
          </select>

          <button 
            onClick={() => {
              setSearchTerm('')
              setFilterPair('')
              setFilterDirection('')
              setFilterResult('')
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition-colors"
          >
            Clear All
          </button>
        </div>
      </motion.div>

      {/* Trade Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">
            All Trades ({filteredAndSortedTrades.length} results)
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors">
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50">
              <tr className="text-left">
                {[
                  { key: 'entry_time', label: 'Date' },
                  { key: 'pair', label: 'Pair' },
                  { key: 'action', label: 'Direction' },
                  { key: 'entry_price', label: 'Entry' },
                  { key: 'exit_price', label: 'Exit' },
                  { key: 'pnl', label: 'P&L ($)' },
                  { key: 'pnl_pct', label: 'P&L (%)' },
                  { key: 'exit_reason', label: 'Result' },
                  { key: 'confidence', label: 'Confidence' },
                ].map((col) => (
                  <th 
                    key={col.key}
                    className="px-6 py-4 font-semibold text-zinc-300 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {sortField === col.key && (
                        <span className="text-green-400">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-zinc-400">
                    {new Date(trade.entry_time).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{trade.pair}</div>
                    <div className="text-xs text-zinc-400">{trade.timeframe}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.action === 'LONG' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">${trade.entry_price.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono">${trade.exit_price.toLocaleString()}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${
                    trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 font-mono ${
                    trade.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl_pct >= 0 ? '+' : ''}{trade.pnl_pct.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {trade.exit_reason === 'TP' ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                      <span className={`text-xs font-bold ${
                        trade.exit_reason === 'TP' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.exit_reason}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold">{trade.confidence}%</span>
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${trade.confidence}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-zinc-800">
            <div className="text-sm text-zinc-400">
              Showing {(currentPage - 1) * tradesPerPage + 1}-{Math.min(currentPage * tradesPerPage, filteredAndSortedTrades.length)} of {filteredAndSortedTrades.length} trades
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}