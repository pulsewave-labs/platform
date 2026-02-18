'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Search,
  Download,
  Calendar,
  BarChart3,
  Target,
  DollarSign
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
  monthly: Array<{
    month: string
    trades: number
    wins: number
    losses: number
    pnl: number
    pnlPct: number
    balance: number
  }>
  pairs: Array<{
    pair: string
    timeframe: string
    trades: number
    winRate: number
    pnl: number
    avgPnl: number
  }>
  trades: Trade[]
}

export default function PerformanceClientPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPair, setFilterPair] = useState('')
  const [filterDirection, setFilterDirection] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [sortField, setSortField] = useState<string>('entry_time')
  const [sortDirection, setSortDirection] = useState<string>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const tradesPerPage = 50

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
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading performance data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load performance data</p>
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

  const uniquePairs = [...new Set(data.trades.map(t => t.pair))].sort()

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="h-6 w-px bg-zinc-700" />
            <h1 className="text-2xl font-bold">Complete Performance Record</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-zinc-400">$10,000 →</span>{' '}
              <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                ${data.stats.finalBalance.toLocaleString()}
              </span>
            </h2>
            <p className="text-xl text-zinc-400">{data.stats.totalTrades} trades • $1,000 fixed risk per trade • 20x leverage</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Return', value: `+${data.stats.totalReturn}%`, color: 'text-green-400' },
              { label: 'Win Rate', value: `${data.stats.winRate}%`, color: 'text-blue-400' },
              { label: 'Profit Factor', value: data.stats.profitFactor.toFixed(2), color: 'text-teal-400' },
              { label: 'Max Drawdown', value: `${data.stats.maxDrawdown}%`, color: 'text-red-400' },
              { label: 'Avg Monthly P&L', value: `$${data.stats.avgMonthlyPnl.toLocaleString()}`, color: 'text-purple-400' },
              { label: 'Profitable Months', value: `${data.stats.profitableMonths}/${data.stats.totalMonths}`, color: 'text-yellow-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center"
              >
                <div className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Monthly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6">Monthly Performance</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-400 border-b border-zinc-800">
                    <th className="pb-3">Month</th>
                    <th className="pb-3">Trades</th>
                    <th className="pb-3">Wins</th>
                    <th className="pb-3">Losses</th>
                    <th className="pb-3 text-right">P&L ($)</th>
                    <th className="pb-3 text-right">Return (%)</th>
                    <th className="pb-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((month, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 last:border-b-0">
                      <td className="py-3 font-mono">{month.month}</td>
                      <td className="py-3">{month.trades}</td>
                      <td className="py-3 text-green-400">{month.wins}</td>
                      <td className="py-3 text-red-400">{month.losses}</td>
                      <td className={`py-3 text-right font-mono font-bold ${month.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {month.pnl >= 0 ? '+' : ''}${month.pnl.toLocaleString()}
                      </td>
                      <td className={`py-3 text-right font-mono ${month.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {month.pnlPct >= 0 ? '+' : ''}{month.pnlPct.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right font-mono">${month.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Trade Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6">How Every Trade Is Sized</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h4 className="font-bold text-lg mb-4">Trade Settings</h4>
              <div className="space-y-3">
                {[
                  { label: 'Starting Capital', value: '$10,000' },
                  { label: 'Risk Per Trade', value: '10% ($1,000 fixed)' },
                  { label: 'Leverage', value: '20x' },
                  { label: 'Position Sizing', value: 'Risk ÷ Stop Distance' },
                  { label: 'Compounding', value: 'None (fixed $1,000 risk)' },
                  { label: 'Fees', value: '0.1% maker/taker (included)' },
                  { label: 'Exchange', value: 'Bitget USDT-M Futures' },
                  { label: 'Strategy', value: 'Market Structure (BOS + OB)' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-b-0">
                    <span className="text-zinc-400 text-sm">{row.label}</span>
                    <span className="font-mono font-bold text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h4 className="font-bold text-lg mb-4">Position Sizing Formula</h4>
              <div className="bg-zinc-800/50 rounded-lg p-4 mb-4 font-mono text-sm">
                <div className="text-zinc-400 mb-2">// For every trade:</div>
                <div className="text-green-400">Risk Amount = Account × 10% = $1,000</div>
                <div className="text-blue-400 mt-1">Stop Distance = |Entry − Stop Loss| ÷ Entry</div>
                <div className="text-purple-400 mt-1">Position Size = $1,000 ÷ Stop Distance</div>
                <div className="text-yellow-400 mt-1">Margin Required = Position Size ÷ 20</div>
              </div>
              <p className="text-sm text-zinc-400 mb-4">The tighter the stop, the larger the position. The wider the stop, the smaller the position. Risk stays constant at $1,000 no matter what.</p>
              <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/50">
                <p className="text-xs text-zinc-500"><strong>Example:</strong> BTC LONG at $70K with SL at $67K → Stop = 4.3% → Position = $23,333 notional → Margin = $1,167. If TP hits at 2.5:1 R:R, profit = $2,500. If stopped out, loss = $1,000.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pair Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6">Performance by Pair</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.pairs.map((pair, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{pair.pair}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">${pair.pnl.toLocaleString()}</div>
                    <div className="text-sm text-zinc-400">total profit</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Trades</span>
                    <div className="font-mono font-bold">{pair.trades}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Win Rate</span>
                    <div className="font-mono font-bold">{pair.winRate}%</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Avg P&L</span>
                    <div className="font-mono font-bold">${pair.avgPnl.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trade Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Complete Trade Log</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">
                Showing {paginatedTrades.length} of {filteredAndSortedTrades.length} trades
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
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
                Clear Filters
              </button>
            </div>
          </div>

          {/* Trade Table */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
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
                      { key: 'notional', label: 'Position' },
                      { key: 'risk_amount', label: 'Risk' },
                      { key: 'fees', label: 'Fees' },
                      { key: 'pnl', label: 'P&L ($)' },
                      { key: 'exit_reason', label: 'Result' },
                      { key: 'balance_after', label: 'Balance' },
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
                    <tr key={i} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-400">
                        {new Date(trade.entry_time).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-semibold">{trade.pair}</td>
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
                      <td className="px-6 py-4 font-mono text-zinc-400">${Math.round(trade.notional).toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-yellow-400">${trade.risk_amount.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-zinc-500">${Math.round(trade.fees)}</td>
                      <td className={`px-6 py-4 font-mono font-bold ${
                        trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}${Math.round(trade.pnl).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.exit_reason === 'TP' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.exit_reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">${Math.round(trade.balance_after).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-zinc-900/50 border border-zinc-800 rounded-xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Start Trading?</h3>
          <p className="text-zinc-400 mb-6">Get the same signals that generated these results</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link 
              href="/auth/signup" 
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition-colors"
            >
              Start Trading Now
            </Link>
            <Link 
              href="/" 
              className="flex-1 px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg font-semibold hover:border-zinc-600 hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}