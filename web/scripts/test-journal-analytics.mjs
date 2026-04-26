import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const sourcePath = join(root, 'lib', 'journal-analytics.ts')
assert.equal(existsSync(sourcePath), true, 'lib/journal-analytics.ts should exist')

const source = readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText

const module = { exports: {} }
const sandbox = { exports: module.exports, module, require }
vm.runInNewContext(compiled, sandbox, { filename: sourcePath })
const analytics = sandbox.module.exports

const sampleTrades = [
  {
    id: 'win-r',
    pair: 'BTCUSDT',
    status: 'closed',
    pnl: 120,
    r_multiple: 1.2,
    setup_type: 'breakout',
    emotional_state: 'confident',
    session: 'london',
    timeframe: '15m',
    pre_thesis: 'Breakout retest with defined invalidation and upside target.',
    post_right: 'Waited for close.',
    closed_at: '2026-01-05T12:00:00Z',
    created_at: '2026-01-05T11:00:00Z',
  },
  {
    id: 'loss-r',
    pair: 'ETHUSDT',
    status: 'closed',
    pnl: -80,
    r_multiple: -0.8,
    setup_type: 'breakout',
    emotional_state: 'fomo',
    session: 'ny',
    timeframe: '5m',
    pre_thesis: '',
    post_wrong: '',
    closed_at: '2026-01-06T12:00:00Z',
    created_at: '2026-01-06T11:00:00Z',
  },
  {
    id: 'win-no-r',
    pair: 'SOLUSDT',
    status: 'closed',
    pnl: 40,
    r_multiple: null,
    setup_type: 'rejection',
    emotional_state: 'neutral',
    session: 'ny',
    timeframe: '1h',
    pre_thesis: 'Rejection from level with planned invalidation.',
    post_right: 'Followed the plan.',
    closed_at: '2026-01-07T12:00:00Z',
    created_at: '2026-01-07T11:00:00Z',
  },
  {
    id: 'open',
    pair: 'XRPUSDT',
    status: 'open',
    pnl: null,
    r_multiple: null,
    setup_type: 'scalp',
    emotional_state: 'uncertain',
    session: 'asia',
    timeframe: '5m',
    pre_thesis: null,
    closed_at: null,
    created_at: '2026-01-08T11:00:00Z',
  },
  {
    id: 'pending-with-notes',
    pair: 'ADAUSDT',
    status: 'pending',
    pnl: null,
    r_multiple: null,
    setup_type: 'breakout',
    emotional_state: 'neutral',
    session: 'asia',
    timeframe: '1h',
    pre_thesis: '',
    notes: 'Fallback plan is written in the notes field.',
    closed_at: null,
    created_at: '2026-01-09T11:00:00Z',
  },
]

assert.equal(analytics.toNumber('12.5'), 12.5)
assert.equal(analytics.toNumber(''), null)
assert.equal(analytics.toNumber('abc'), null)

const closed = analytics.getClosedTrades(sampleTrades)
assert.deepEqual(closed.map((trade) => trade.id), ['win-r', 'loss-r', 'win-no-r'])
assert.equal(analytics.getOpenTrades(sampleTrades).length, 2)
assert.equal(analytics.getOpenTrades(sampleTrades, { openStatusMode: 'openOnly' }).length, 1)
assert.equal(analytics.countClosedTradesMissingPnl(sampleTrades), 0)

const overview = analytics.buildJournalOverview(sampleTrades)
assert.equal(overview.closedTrades.length, 3)
assert.equal(overview.winningTrades.length, 2)
assert.equal(overview.losingTrades.length, 1)
assert.equal(overview.winRate, 2 / 3)
assert.equal(overview.totalPnl, 80)
assert.equal(overview.avgPnl, 80 / 3)
assert.ok(Math.abs(overview.avgR - 0.2) < 0.000001)
assert.ok(Math.abs(overview.expectancyR - 0.2) < 0.000001)
assert.equal(overview.missingThesis, 3)
assert.equal(overview.reviewedClosed, 2)

const dashboardOverview = analytics.buildJournalOverview(sampleTrades, { openStatusMode: 'openOnly', missingThesisMode: 'thesisOrNotes' })
assert.equal(dashboardOverview.openTrades.length, 1)
assert.equal(dashboardOverview.missingThesis, 2)

const setupSegments = analytics.segmentTrades(closed, (trade) => trade.setup_type)
const breakout = setupSegments.find((segment) => segment.key === 'breakout')
assert.equal(breakout.total, 2)
assert.equal(breakout.pnl, 40)
assert.equal(breakout.rCount, 2)
assert.equal(breakout.avgR, 0.19999999999999996)
assert.equal(analytics.segmentScore(breakout), breakout.avgR)
assert.equal(analytics.segmentMetric(breakout), '+0.20R')

const rejection = setupSegments.find((segment) => segment.key === 'rejection')
assert.equal(rejection.rCount, 0)
assert.equal(rejection.expectancy, 40)
assert.equal(analytics.segmentScore(rejection), 40)
assert.equal(analytics.segmentMetric(rejection), '+$40/trade')

const stats = analytics.buildPerformanceStats(closed)
assert.equal(stats.totalPnl, 80)
assert.equal(stats.grossProfit, 160)
assert.equal(stats.grossLoss, 80)
assert.equal(stats.profitFactor, 2)
assert.equal(stats.maxDrawdown, 80)
assert.equal(stats.currentStreak, 1)
assert.equal(stats.maxWinStreak, 1)
assert.equal(stats.maxLossStreak, 1)
assert.ok(Math.abs(stats.avgR - 0.2) < 0.000001)
assert.ok(Math.abs(stats.expectancyR - 0.2) < 0.000001)
assert.equal(stats.bestTrade.id, 'win-r')
assert.equal(stats.worstTrade.id, 'loss-r')

const equity = analytics.buildEquityCurve(closed)
assert.deepEqual(equity.map((point) => point.pnl), [120, 40, 80])
assert.deepEqual(equity.map((point) => point.drawdown), [0, 80, 40])
assert.deepEqual(equity.map((point) => point.r), [1.2, 0.4, null])

const dayRows = analytics.buildDayBreakdown(closed)
assert.equal(dayRows.length, 7)
assert.equal(dayRows[1].label, 'Mon')
assert.equal(dayRows[1].total, 1)
assert.equal(dayRows[1].pnl, 120)
assert.equal(dayRows[1].avgR, 1.2)

const monthly = analytics.buildMonthlyBreakdown(closed)
assert.equal(JSON.stringify(monthly), JSON.stringify([{ month: '2026-01', pnl: 80, trades: 3, wins: 2 }]))

assert.equal(analytics.formatMoney(0), '$0')
assert.equal(analytics.formatMoney(12.345), '+$12.35')
assert.equal(analytics.formatMoney(-8), '-$8')
assert.equal(analytics.formatPercent(2 / 3), '66.7%')
assert.equal(analytics.formatR(null), 'No R data')
assert.equal(analytics.formatR(0.2), '+0.20R')
assert.equal(analytics.cleanLabel('kijun_bounce'), 'Kijun Bounce')
assert.equal(analytics.formatDateUtc('2026-01-05T12:00:00Z'), 'Jan 5')

console.log('journal analytics tests passed')
