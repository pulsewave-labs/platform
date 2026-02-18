'use client'

import { useState, useEffect } from 'react'

function formatDuration(entry: string, exit: string) {
  var ms = new Date(exit).getTime() - new Date(entry).getTime()
  var hours = Math.floor(ms / 3600000)
  var days = Math.floor(hours / 24)
  if (days > 0) return days + 'd ' + (hours % 24) + 'h'
  return hours + 'h'
}

export default function HistoryClientPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterPair, setFilterPair] = useState('')
  const [filterDirection, setFilterDirection] = useState('')
  const [filterResult, setFilterResult] = useState('')
  const [expandedTrade, setExpandedTrade] = useState(null)
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

  // Summary stats for filtered trades
  var filteredWins = filtered.filter(function(t: any) { return t.pnl > 0 }).length
  var filteredPnl = filtered.reduce(function(s: number, t: any) { return s + t.pnl }, 0)
  var filteredFees = filtered.reduce(function(s: number, t: any) { return s + t.fees }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trade History</h1>
        <p className="text-zinc-400">Every trade from our signal bot — {allTrades.length} total trades</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xl font-bold text-green-400">${stats ? (stats.finalBalance - stats.startingCapital).toLocaleString() : '0'}</div>
          <div className="text-xs text-zinc-400">Total P&L</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xl font-bold text-blue-400">{stats ? stats.winRate : 0}%</div>
          <div className="text-xs text-zinc-400">Win Rate ({stats ? stats.wins + 'W / ' + stats.losses + 'L' : ''})</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xl font-bold text-purple-400">{stats ? stats.profitFactor.toFixed(2) : '0'}</div>
          <div className="text-xs text-zinc-400">Profit Factor</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xl font-bold text-teal-400">${stats ? stats.avgMonthlyPnl.toLocaleString() : '0'}</div>
          <div className="text-xs text-zinc-400">Avg Monthly</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="text-xl font-bold text-red-400">{stats ? stats.maxDrawdown : 0}%</div>
          <div className="text-xs text-zinc-400">Max Drawdown</div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <select value={filterPair} onChange={function(e) { setFilterPair(e.target.value); setCurrentPage(1) }} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
            <option value="">All Pairs</option>
            {pairs.map(function(p: any) { return <option key={p} value={p}>{p}</option> })}
          </select>
          <select value={filterDirection} onChange={function(e) { setFilterDirection(e.target.value); setCurrentPage(1) }} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
            <option value="">All Directions</option>
            <option value="LONG">LONG</option>
            <option value="SHORT">SHORT</option>
          </select>
          <select value={filterResult} onChange={function(e) { setFilterResult(e.target.value); setCurrentPage(1) }} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
            <option value="">All Results</option>
            <option value="WIN">Winners</option>
            <option value="LOSS">Losers</option>
            <option value="TP">Take Profit</option>
            <option value="SL">Stop Loss</option>
          </select>
          <button onClick={function() { setFilterPair(''); setFilterDirection(''); setFilterResult(''); setCurrentPage(1) }} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition-colors">
            Clear Filters
          </button>
        </div>
        {(filterPair || filterDirection || filterResult) && (
          <div className="mt-3 flex gap-4 text-xs text-zinc-400">
            <span>Showing {filtered.length} trades</span>
            <span className={filteredPnl >= 0 ? 'text-green-400' : 'text-red-400'}>P&L: {filteredPnl >= 0 ? '+' : ''}${Math.round(filteredPnl).toLocaleString()}</span>
            <span>WR: {filtered.length > 0 ? (filteredWins / filtered.length * 100).toFixed(1) : 0}%</span>
            <span>Fees: ${Math.round(filteredFees).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">All Trades ({filtered.length})</h2>
          <div className="text-xs text-zinc-500">10% risk per trade • $1,000 risk • 20x leverage</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-zinc-300">Date</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Pair</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Side</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Entry</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">SL</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">TP</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Exit</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Position</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Risk</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Fees</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">P&L</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Result</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Balance</th>
                <th className="px-4 py-3 font-semibold text-zinc-300">Duration</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(function(trade: any, i: number) {
                var isWin = trade.pnl >= 0
                var entryP = Number(trade.entry_price)
                var exitP = Number(trade.exit_price)
                var slP = Number(trade.stop_loss)
                var tpP = Number(trade.take_profit)
                var risk = Math.abs(entryP - slP)
                var reward = Math.abs(tpP - entryP)
                var rr = risk > 0 ? (reward / risk).toFixed(1) : '—'
                var isExpanded = expandedTrade === (startIdx + i)

                return (
                  <tr key={i} 
                    className={'border-b border-zinc-800/50 last:border-b-0 hover:bg-zinc-800/30 cursor-pointer ' + (isExpanded ? 'bg-zinc-800/40' : '')}
                    onClick={function() { setExpandedTrade(isExpanded ? null : (startIdx + i) as any) }}
                  >
                    <td className="px-4 py-3 font-mono text-zinc-400">{new Date(trade.entry_time).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{trade.pair}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={trade.action === 'LONG' ? 'px-1.5 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400' : 'px-1.5 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400'}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">${entryP.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 font-mono text-red-400/70">${slP.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 font-mono text-green-400/70">${tpP.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 font-mono">${exitP.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">${Math.round(Number(trade.notional)).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-yellow-400">${Number(trade.risk_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-zinc-500">${Number(trade.fees).toFixed(0)}</td>
                    <td className={isWin ? 'px-4 py-3 font-mono font-bold text-green-400' : 'px-4 py-3 font-mono font-bold text-red-400'}>
                      {isWin ? '+' : ''}${Number(trade.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </td>
                    <td className="px-4 py-3">
                      <span className={trade.exit_reason === 'TP' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {trade.exit_reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-300">${Math.round(Number(trade.balance_after)).toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDuration(trade.entry_time, trade.exit_time)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-400">
              Showing {startIdx + 1}–{Math.min(startIdx + tradesPerPage, filtered.length)} of {filtered.length} trades
            </div>
            <div className="flex items-center gap-2">
              <button onClick={function() { setCurrentPage(Math.max(1, currentPage - 1)) }} disabled={currentPage === 1} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs hover:bg-zinc-700 disabled:opacity-50">
                Previous
              </button>
              <span className="text-xs text-zinc-400">Page {currentPage} of {totalPages}</span>
              <button onClick={function() { setCurrentPage(Math.min(totalPages, currentPage + 1)) }} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs hover:bg-zinc-700 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-bold mb-3">Trade Settings Used</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-500">Starting Capital</span>
            <div className="font-mono font-bold">$10,000</div>
          </div>
          <div>
            <span className="text-zinc-500">Risk Per Trade</span>
            <div className="font-mono font-bold">10% ($1,000 fixed)</div>
          </div>
          <div>
            <span className="text-zinc-500">Leverage</span>
            <div className="font-mono font-bold">20x</div>
          </div>
          <div>
            <span className="text-zinc-500">Fees</span>
            <div className="font-mono font-bold">0.1% maker/taker</div>
          </div>
          <div>
            <span className="text-zinc-500">Strategy</span>
            <div className="font-mono font-bold">Market Structure</div>
          </div>
          <div>
            <span className="text-zinc-500">Position Sizing</span>
            <div className="font-mono font-bold">Risk / Stop Distance</div>
          </div>
          <div>
            <span className="text-zinc-500">Trading Since</span>
            <div className="font-mono font-bold">February 2024</div>
          </div>
          <div>
            <span className="text-zinc-500">Exchange</span>
            <div className="font-mono font-bold">Bitget USDT-M Futures</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-600">
          Past performance does not guarantee future results. Position sizes calculated as: Risk Amount / (Entry − Stop Loss) × Entry Price.
        </div>
      </div>
    </div>
  )
}
