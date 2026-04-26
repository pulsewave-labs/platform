export type JournalTrade = {
  id: string
  pair?: string | null
  direction?: string | null
  entry_price?: number | string | null
  exit_price?: number | string | null
  stop_loss?: number | string | null
  take_profit?: number | string | null
  pnl?: number | string | null
  pnl_percent?: number | string | null
  r_multiple?: number | string | null
  status: string
  setup_type?: string | null
  emotional_state?: string | null
  session?: string | null
  timeframe?: string | null
  grade?: string | null
  pre_thesis?: string | null
  post_right?: string | null
  post_wrong?: string | null
  lesson?: string | null
  notes?: string | null
  opened_at?: string | null
  closed_at?: string | null
  entry_date?: string | null
  exit_date?: string | null
  created_at: string
  risk_amount?: number | string | null
  confluence?: number | string | null
}

export type JournalOverviewOptions = {
  openStatusMode?: 'nonClosed' | 'openOnly'
  missingThesisMode?: 'strictThesis' | 'thesisOrNotes'
}

export type Segment = {
  key: string
  label: string
  total: number
  wins: number
  pnl: number
  rSum: number
  rCount: number
  avgR: number | null
  winRate: number
  expectancy: number
}

export type DayBreakdown = {
  label: string
  index: number
  total: number
  wins: number
  pnl: number
  rSum: number
  rCount: number
  avgR: number | null
  winRate: number
}

export type MonthlyBreakdown = {
  month: string
  pnl: number
  trades: number
  wins: number
}

export type EquityPoint = {
  index: number
  date: string
  pnl: number
  r: number | null
  drawdown: number
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

export function formatMoney(value: number | string | null | undefined, options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}) {
  const n = toNumber(value)
  if (n === null) return '—'
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  })}`
}

export function formatSigned(value: number | string | null | undefined, suffix = '') {
  const n = toNumber(value)
  if (n === null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}${suffix}`
}

export function formatPrice(value: number | string | null | undefined) {
  const n = toNumber(value)
  if (n === null) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 })
}

export function formatPercent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`
}

export function formatRoundedPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function formatR(value: number | string | null | undefined, emptyLabel = 'No R data') {
  const n = toNumber(value)
  if (n === null) return emptyLabel
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}R`
}

export function cleanLabel(value: string | null | undefined, map?: Record<string, string>, fallback = 'Unclassified') {
  if (!value) return fallback
  return map?.[value] || value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function compactLabel(value: string | null | undefined) {
  if (!value) return 'Unlabeled'
  return value.replace(/_/g, ' ')
}

export function getTradeDate(trade: Pick<JournalTrade, 'opened_at' | 'entry_date' | 'created_at'>) {
  return trade.opened_at || trade.entry_date || trade.created_at
}

export function getCloseDate(trade: Pick<JournalTrade, 'closed_at' | 'exit_date' | 'created_at'>) {
  return trade.closed_at || trade.exit_date || trade.created_at
}

export function formatDateUtc(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function sortByCloseDate<T extends JournalTrade>(a: T, b: T) {
  return getCloseDate(a).localeCompare(getCloseDate(b))
}

export function isClosedWithPnl(trade: JournalTrade) {
  return trade.status === 'closed' && toNumber(trade.pnl) !== null
}

export function getClosedTrades<T extends JournalTrade>(trades: T[]) {
  return trades.filter(isClosedWithPnl)
}

export function getClosedTradesSorted<T extends JournalTrade>(trades: T[]) {
  return getClosedTrades(trades).slice().sort(sortByCloseDate)
}

export function getOpenTrades<T extends JournalTrade>(trades: T[], options: Pick<JournalOverviewOptions, 'openStatusMode'> = {}) {
  const mode = options.openStatusMode || 'nonClosed'
  return trades.filter((trade) => mode === 'openOnly' ? trade.status === 'open' : trade.status !== 'closed')
}

export function countClosedTradesMissingPnl(trades: JournalTrade[]) {
  return trades.filter((trade) => trade.status === 'closed' && toNumber(trade.pnl) === null).length
}

export function isWinningTrade(trade: JournalTrade) {
  return isClosedWithPnl(trade) && (toNumber(trade.pnl) || 0) > 0
}

export function isLosingTrade(trade: JournalTrade) {
  return isClosedWithPnl(trade) && (toNumber(trade.pnl) || 0) < 0
}

export function hasReview(trade: JournalTrade) {
  return Boolean((trade.post_right && trade.post_right.trim()) || (trade.post_wrong && trade.post_wrong.trim()) || (trade.lesson && trade.lesson.trim()))
}

export function hasMeaningfulThesis(trade: JournalTrade, minLength = 20) {
  return Boolean(trade.pre_thesis && trade.pre_thesis.trim().length >= minLength)
}

export function hasThesisOrNotes(trade: JournalTrade) {
  return Boolean((trade.pre_thesis && trade.pre_thesis.trim()) || (trade.notes && trade.notes.trim()))
}

export function segmentTrades<T extends JournalTrade>(trades: T[], getKey: (trade: T) => string | null | undefined, labels?: Record<string, string>) {
  const map = new Map<string, Segment>()

  trades.forEach((trade) => {
    const key = getKey(trade) || 'unclassified'
    const current = map.get(key) || {
      key,
      label: key === 'unclassified' ? 'Unclassified' : cleanLabel(key, labels),
      total: 0,
      wins: 0,
      pnl: 0,
      rSum: 0,
      rCount: 0,
      avgR: null,
      winRate: 0,
      expectancy: 0,
    }
    const pnl = toNumber(trade.pnl) || 0
    const rMultiple = toNumber(trade.r_multiple)
    current.total += 1
    current.wins += pnl > 0 ? 1 : 0
    current.pnl += pnl
    if (rMultiple !== null) {
      current.rSum += rMultiple
      current.rCount += 1
    }
    map.set(key, current)
  })

  return Array.from(map.values())
    .map((segment) => ({
      ...segment,
      avgR: segment.rCount ? segment.rSum / segment.rCount : null,
      winRate: segment.total ? segment.wins / segment.total : 0,
      expectancy: segment.rCount ? segment.rSum / segment.rCount : segment.total ? segment.pnl / segment.total : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export function segmentScore(segment: Segment) {
  return segment.rCount && segment.avgR !== null ? segment.avgR : segment.pnl / Math.max(1, segment.total)
}

export function segmentMetric(segment: Segment) {
  return segment.rCount && segment.avgR !== null ? formatR(segment.avgR) : `${formatMoney(segment.pnl / Math.max(1, segment.total))}/trade`
}

export function buildJournalOverview<T extends JournalTrade>(trades: T[], options: JournalOverviewOptions = {}) {
  const closedTrades = getClosedTrades(trades)
  const winningTrades = closedTrades.filter(isWinningTrade)
  const losingTrades = closedTrades.filter(isLosingTrade)
  const openTrades = getOpenTrades(trades, { openStatusMode: options.openStatusMode })
  const rValues = closedTrades.map((trade) => toNumber(trade.r_multiple)).filter((value): value is number => value !== null)
  const pnlValues = closedTrades.map((trade) => toNumber(trade.pnl)).filter((value): value is number => value !== null)
  const totalPnl = pnlValues.reduce((sum, value) => sum + value, 0)
  const avgR = rValues.length ? average(rValues) : null
  const avgPnl = closedTrades.length ? totalPnl / closedTrades.length : 0

  return {
    closedTrades,
    winningTrades,
    losingTrades,
    openTrades,
    totalPnl,
    avgPnl,
    avgR,
    expectancyR: avgR,
    winRate: closedTrades.length ? winningTrades.length / closedTrades.length : 0,
    missingThesis: trades.filter((trade) => options.missingThesisMode === 'thesisOrNotes' ? !hasThesisOrNotes(trade) : !hasMeaningfulThesis(trade)).length,
    weakGradeRate: closedTrades.length ? closedTrades.filter((trade) => ['D', 'F'].includes(trade.grade || '')).length / closedTrades.length : 0,
    reviewedClosed: closedTrades.filter(hasReview).length,
  }
}

export function buildPerformanceStats<T extends JournalTrade>(closed: T[]) {
  const wins = closed.filter(isWinningTrade)
  const losses = closed.filter(isLosingTrade)
  const totalPnl = closed.reduce((sum, trade) => sum + (toNumber(trade.pnl) || 0), 0)
  const grossProfit = wins.reduce((sum, trade) => sum + (toNumber(trade.pnl) || 0), 0)
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + (toNumber(trade.pnl) || 0), 0))
  const avgWin = wins.length ? grossProfit / wins.length : 0
  const avgLoss = losses.length ? grossLoss / losses.length : 0
  const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  const avgPnl = closed.length ? totalPnl / closed.length : 0
  const rValues = closed.map((trade) => toNumber(trade.r_multiple)).filter((value): value is number => value !== null)
  const avgR = rValues.length ? average(rValues) : null
  const bestTrade = closed.reduce((best, trade) => !best || (toNumber(trade.pnl) || 0) > (toNumber(best.pnl) || 0) ? trade : best, null as T | null)
  const worstTrade = closed.reduce((worst, trade) => !worst || (toNumber(trade.pnl) || 0) < (toNumber(worst.pnl) || 0) ? trade : worst, null as T | null)

  let peak = 0
  let cumulative = 0
  let maxDrawdown = 0
  let currentStreak = 0
  let runningStreak = 0
  let maxWinStreak = 0
  let maxLossStreak = 0

  closed.forEach((trade) => {
    const pnl = toNumber(trade.pnl) || 0
    cumulative += pnl
    peak = Math.max(peak, cumulative)
    maxDrawdown = Math.max(maxDrawdown, peak - cumulative)

    const result = pnl > 0 ? 1 : pnl < 0 ? -1 : 0
    if (result === 0) {
      runningStreak = 0
    } else if (Math.sign(runningStreak) === result) {
      runningStreak += result
    } else {
      runningStreak = result
    }
    currentStreak = runningStreak
    if (runningStreak > 0) maxWinStreak = Math.max(maxWinStreak, runningStreak)
    if (runningStreak < 0) maxLossStreak = Math.max(maxLossStreak, Math.abs(runningStreak))
  })

  return {
    totalPnl,
    winRate: closed.length ? wins.length / closed.length : 0,
    grossProfit,
    grossLoss,
    avgWin,
    avgLoss,
    profitFactor,
    avgPnl,
    avgR,
    expectancyR: avgR,
    bestTrade,
    worstTrade,
    maxDrawdown,
    currentStreak,
    maxWinStreak,
    maxLossStreak,
  }
}

export function buildEquityCurve<T extends JournalTrade>(closed: T[]): EquityPoint[] {
  let cumulative = 0
  let cumulativeR = 0
  let peak = 0

  return closed.map((trade, index) => {
    const pnl = toNumber(trade.pnl) || 0
    const rMultiple = toNumber(trade.r_multiple)
    cumulative += pnl
    if (rMultiple !== null) cumulativeR += rMultiple
    peak = Math.max(peak, cumulative)

    return {
      index: index + 1,
      date: formatDateUtc(getCloseDate(trade)),
      pnl: Math.round(cumulative * 100) / 100,
      r: rMultiple !== null ? Math.round(cumulativeR * 100) / 100 : null,
      drawdown: Math.round((peak - cumulative) * 100) / 100,
    }
  })
}

export function getTradeDayUtc(trade: JournalTrade) {
  return new Date(getCloseDate(trade)).getUTCDay()
}

export function buildDayBreakdown<T extends JournalTrade>(closed: T[]): DayBreakdown[] {
  const rows = DAYS.map((label, index) => ({ label, index, total: 0, wins: 0, pnl: 0, rSum: 0, rCount: 0, avgR: null as number | null, winRate: 0 }))
  closed.forEach((trade) => {
    const row = rows[getTradeDayUtc(trade)]
    const pnl = toNumber(trade.pnl) || 0
    const rMultiple = toNumber(trade.r_multiple)
    row.total += 1
    row.pnl += pnl
    row.wins += pnl > 0 ? 1 : 0
    if (rMultiple !== null) {
      row.rSum += rMultiple
      row.rCount += 1
    }
  })
  return rows.map((row) => ({ ...row, avgR: row.rCount ? row.rSum / row.rCount : null, winRate: row.total ? row.wins / row.total : 0 }))
}

export function buildMonthlyBreakdown<T extends JournalTrade>(closed: T[], limit = 6): MonthlyBreakdown[] {
  const map = new Map<string, MonthlyBreakdown>()
  closed.forEach((trade) => {
    const key = new Date(getCloseDate(trade)).toISOString().slice(0, 7)
    const current = map.get(key) || { month: key, pnl: 0, trades: 0, wins: 0 }
    const pnl = toNumber(trade.pnl) || 0
    current.pnl += pnl
    current.trades += 1
    current.wins += pnl > 0 ? 1 : 0
    map.set(key, current)
  })
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-limit)
}
