'use client'

import { useState, useEffect } from 'react'

export default function HistoryClientPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterPair, setFilterPair] = useState('')
  const [filterDirection, setFilterDirection] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const tradesPerPage = 25

  useEffect(function loadData() {
    fetch('/api/performance')
      .then(function(res) { return res.json() })
      .then(function(result) { setData(result) })
      .catch(function(err) { console.error(err) })
      .finally(function() { setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading trade history...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load trade history</p>
      </div>
    )
  }

  var stats = (data as any).stats
  var allTrades = (data as any).trades || []
  
  var filtered = allTrades.filter(function(t: any) {
    if (filterPair && t.pair !== filterPair) return false
    if (filterDirection && t.action !== filterDirection) return false
    if (filterResult === 'WIN' && t.pnl <= 0) return false
    if (filterResult === 'LOSS' && t.pnl > 0) return false
    if (filterResult === 'TP' && t.exit_reason !== 'TP') return false
    if (filterResult === 'SL' && t.exit_reason !== 'SL') return false
    return true
  })

  var totalPages = Math.ceil(filtered.length / tradesPerPage)
  var startIdx = (currentPage - 1) * tradesPerPage
  var paginated = filtered.slice(startIdx, startIdx + tradesPerPage)

  var pairs = Array.from(new Set(allTrades.map(function(t: any) { return t.pair })))
  pairs.sort()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trade History</h1>
        <p className="text-zinc-400">Complete record of all {allTrades.length} trading signals</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="text-2xl font-bold text-green-400">${stats ? (stats.finalBalance - stats.startingCapital).toLocaleString() : '0'}</div>
          <div className="text-sm text-zinc-400">Total P&L</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="text-2xl font-bold text-blue-400">{stats ? stats.winRate : 0}%</div>
          <div className="text-sm text-zinc-400">Win Rate</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="text-2xl font-bold text-purple-400">{stats ? stats.profitFactor.toFixed(2) : '0'}</div>
          <div className="text-sm text-zinc-400">Profit Factor</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="text-2xl font-bold text-teal-400">${stats ? stats.avgMonthlyPnl.toLocaleString() : '0'}</div>
          <div className="text-sm text-zinc-400">Avg Monthly</div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <select value={filterPair} onChange={function(e) { setFilterPair(e.target.value); setCurrentPage(1) }} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
            <option value="">All Pairs</option>
            {pairs.map(function(p: any) { return <option key={p} value={p}>{p}</option> })}
          </select>
          <select value={filterDirection} onChange={function(e) { setFilterDirection(e.target.value); setCurrentPage(1) }} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
            <option value="">All Directions</option>
            <option value="LONG">LONG</option>
            <option value="SHORT">SHORT</option>
          </select>
          <select value={filterResult} onChange={function(e) { setFilterResult(e.target.value); setCurrentPage(1) }} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
            <option value="">All Results</option>
            <option value="WIN">Winners</option>
            <option value="LOSS">Losers</option>
            <option value="TP">Take Profit</option>
            <option value="SL">Stop Loss</option>
          </select>
          <button onClick={function() { setFilterPair(''); setFilterDirection(''); setFilterResult(''); setCurrentPage(1) }} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition-colors">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">All Trades ({filtered.length} results)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50">
              <tr className="text-left">
                <th className="px-6 py-4 font-semibold text-zinc-300">Date</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">Pair</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">Direction</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">Entry</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">Exit</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">P&L</th>
                <th className="px-6 py-4 font-semibold text-zinc-300">Result</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(function(trade: any, i: number) {
                return (
                  <tr key={i} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30">
                    <td className="px-6 py-4 font-mono text-zinc-400">{new Date(trade.entry_time).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{trade.pair}</div>
                      <div className="text-xs text-zinc-500">{trade.timeframe}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={trade.action === 'LONG' ? 'px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400' : 'px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400'}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">${Number(trade.entry_price).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono">${Number(trade.exit_price).toLocaleString()}</td>
                    <td className={trade.pnl >= 0 ? 'px-6 py-4 font-mono font-bold text-green-400' : 'px-6 py-4 font-mono font-bold text-red-400'}>
                      {trade.pnl >= 0 ? '+' : ''}${Number(trade.pnl).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={trade.exit_reason === 'TP' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {trade.exit_reason}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-zinc-800">
            <div className="text-sm text-zinc-400">
              Page {currentPage} of {totalPages} ({filtered.length} trades)
            </div>
            <div className="flex items-center gap-2">
              <button onClick={function() { setCurrentPage(Math.max(1, currentPage - 1)) }} disabled={currentPage === 1} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">
                Previous
              </button>
              <button onClick={function() { setCurrentPage(Math.min(totalPages, currentPage + 1)) }} disabled={currentPage === totalPages} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
