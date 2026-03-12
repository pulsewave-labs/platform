/**
 * PulseWave Universal Backtester
 * Runs the BOS + OB strategy against any market's historical data
 * 
 * Usage:
 *   node backtester.js                    # Run all configured sweeps
 *   node backtester.js --symbol ES        # Single symbol
 *   node backtester.js --market futures   # All futures
 *   node backtester.js --market forex     # All forex
 */
const strategy = require('../live/strategies/market-structure');
const { fetchHistorical } = require('./data-providers');
const fs = require('fs');
const path = require('path');

// ── Backtest Configuration ──
const SWEEP_CONFIG = {
  futures: {
    symbols: ['ES', 'NQ', 'YM', 'CL', 'GC'],
    timeframes: ['1h', '2h', '4h', '6h', '8h', '12h', '1d'],
    pivotLookbacks: [3, 5, 8, 10, 13],
  },
  forex: {
    symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'GBPJPY', 'EURJPY'],
    timeframes: ['1h', '2h', '4h', '6h', '8h', '12h', '1d'],
    pivotLookbacks: [3, 5, 8, 10, 13],
  },
  crypto: {
    symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT', 'XRPUSDT'],
    timeframes: ['4h', '6h', '8h', '12h'],
    pivotLookbacks: [3, 5, 8, 10, 13],
  },
};

// ── Risk params (match live engine) ──
const ACCOUNT_SIZE = 10000;
const RISK_PERCENT = 0.10;  // 10% per trade
const RISK_AMOUNT = ACCOUNT_SIZE * RISK_PERCENT;

/**
 * Run backtest on a single candle set with given params
 */
function runBacktest(candles, pivotLookback, riskReward = 2.5) {
  if (candles.length < 100) return null;

  strategy.setConfig({
    pivotLookback,
    volumePeriod: 20,
    volumeThreshold: 1.0,
    riskReward,
    maxOBAge: 20,
    atrPeriod: 14,
    minSwings: 4,
  });

  const precomputed = strategy.precompute(candles, { pivotLookback });

  const trades = [];
  let openPosition = null;

  for (let i = 50; i < candles.length; i++) {
    const c = candles[i];
    const high = c[2];
    const low = c[3];
    const close = c[4];
    const ts = c[0];

    // Check if open position hits TP or SL
    if (openPosition) {
      const pos = openPosition;
      if (pos.action === 'LONG') {
        if (low <= pos.stop_loss) {
          // SL hit
          const pnl = pos.stop_loss - pos.entry;
          const pnlPct = pnl / pos.entry * 100;
          trades.push({ ...pos, exit: pos.stop_loss, exitTime: ts, pnl, pnlPct, result: 'LOSS' });
          openPosition = null;
        } else if (high >= pos.take_profit) {
          // TP hit
          const pnl = pos.take_profit - pos.entry;
          const pnlPct = pnl / pos.entry * 100;
          trades.push({ ...pos, exit: pos.take_profit, exitTime: ts, pnl, pnlPct, result: 'WIN' });
          openPosition = null;
        }
      } else { // SHORT
        if (high >= pos.stop_loss) {
          const pnl = pos.entry - pos.stop_loss;
          const pnlPct = pnl / pos.entry * 100;
          trades.push({ ...pos, exit: pos.stop_loss, exitTime: ts, pnl, pnlPct, result: 'LOSS' });
          openPosition = null;
        } else if (low <= pos.take_profit) {
          const pnl = pos.entry - pos.take_profit;
          const pnlPct = pnl / pos.entry * 100;
          trades.push({ ...pos, exit: pos.take_profit, exitTime: ts, pnl, pnlPct, result: 'WIN' });
          openPosition = null;
        }
      }
      continue; // Don't look for new signals while in a position
    }

    // Look for new signal
    const signal = strategy(candles, precomputed, i);
    if (signal) {
      const entry = signal.entry === 'MARKET' ? close : signal.entry;
      openPosition = {
        action: signal.action,
        entry,
        stop_loss: signal.stop_loss,
        take_profit: signal.take_profit,
        confidence: signal.confidence,
        entryTime: ts,
        entryIndex: i,
      };
    }
  }

  return analyzeTrades(trades);
}

/**
 * Analyze trade results
 */
function analyzeTrades(trades) {
  if (trades.length === 0) return { trades: 0 };

  const wins = trades.filter(t => t.result === 'WIN');
  const losses = trades.filter(t => t.result === 'LOSS');
  const winRate = wins.length / trades.length * 100;

  const grossProfit = wins.reduce((s, t) => s + Math.abs(t.pnlPct), 0);
  const grossLoss = losses.reduce((s, t) => s + Math.abs(t.pnlPct), 0);
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);

  // Equity curve for max drawdown
  let equity = ACCOUNT_SIZE;
  let peak = equity;
  let maxDrawdown = 0;
  const equityCurve = [equity];

  for (const t of trades) {
    const risk = Math.abs(t.entry - t.stop_loss);
    if (risk === 0) continue;
    const positionSize = RISK_AMOUNT / risk;
    const pnlDollar = t.pnl * positionSize;
    equity += pnlDollar;
    equityCurve.push(equity);
    if (equity > peak) peak = equity;
    const dd = (peak - equity) / peak * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const totalReturn = (equity - ACCOUNT_SIZE) / ACCOUNT_SIZE * 100;

  // Time span
  const firstTrade = new Date(trades[0].entryTime);
  const lastTrade = new Date(trades[trades.length - 1].entryTime);
  const daysSpan = (lastTrade - firstTrade) / (1000 * 60 * 60 * 24);
  const tradesPerMonth = daysSpan > 0 ? trades.length / (daysSpan / 30) : trades.length;

  return {
    trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: Math.round(winRate * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    expectancy: Math.round(expectancy * 100) / 100,
    avgWinPct: Math.round(avgWin * 100) / 100,
    avgLossPct: Math.round(avgLoss * 100) / 100,
    maxDrawdownPct: Math.round(maxDrawdown * 100) / 100,
    totalReturnPct: Math.round(totalReturn * 100) / 100,
    finalEquity: Math.round(equity),
    tradesPerMonth: Math.round(tradesPerMonth * 10) / 10,
    daysSpan: Math.round(daysSpan),
    firstTrade: firstTrade.toISOString().split('T')[0],
    lastTrade: lastTrade.toISOString().split('T')[0],
  };
}

/**
 * Run parameter sweep for a single symbol
 */
async function sweepSymbol(symbol, timeframes, pivotLookbacks, market) {
  const results = [];

  for (const tf of timeframes) {
    let candles;
    try {
      candles = await fetchHistorical(symbol, tf, market);
    } catch (err) {
      console.log(`  ⚠ Skip ${symbol} ${tf}: ${err.message}`);
      continue;
    }

    if (!candles || candles.length < 100) {
      console.log(`  ⚠ Skip ${symbol} ${tf}: insufficient data (${candles?.length || 0})`);
      continue;
    }

    for (const pl of pivotLookbacks) {
      const result = runBacktest(candles, pl);
      if (result && result.trades >= 10) { // min 10 trades for significance
        results.push({
          symbol,
          market,
          timeframe: tf,
          pivotLookback: pl,
          ...result,
        });
        const pf = result.profitFactor;
        const wr = result.winRate;
        const emoji = pf >= 1.5 ? '🟢' : pf >= 1.2 ? '🟡' : '🔴';
        console.log(`  ${emoji} ${symbol} ${tf} PL=${pl} → ${result.trades} trades | WR=${wr}% | PF=${pf} | DD=${result.maxDrawdownPct}% | $${result.finalEquity}`);
      }
    }

    // Rate limit for Twelve Data
    if (market !== 'crypto') await new Promise(r => setTimeout(r, 8000));
  }

  return results;
}

/**
 * Run full sweep across a market
 */
async function sweepMarket(marketName) {
  const cfg = SWEEP_CONFIG[marketName];
  if (!cfg) throw new Error(`Unknown market: ${marketName}`);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  SWEEPING ${marketName.toUpperCase()} — ${cfg.symbols.length} symbols × ${cfg.timeframes.length} TFs × ${cfg.pivotLookbacks.length} PLs`);
  console.log(`${'═'.repeat(60)}\n`);

  const allResults = [];

  for (const symbol of cfg.symbols) {
    console.log(`\n── ${symbol} ──`);
    const results = await sweepSymbol(symbol, cfg.timeframes, cfg.pivotLookbacks, marketName);
    allResults.push(...results);
  }

  return allResults;
}

/**
 * Generate summary report
 */
function generateReport(results, marketName) {
  // Sort by profit factor
  const sorted = [...results].sort((a, b) => b.profitFactor - a.profitFactor);

  // Top configs (PF > 1.3, WR > 35%, DD < 40%, 20+ trades)
  const winners = sorted.filter(r =>
    r.profitFactor >= 1.3 &&
    r.winRate >= 35 &&
    r.maxDrawdownPct <= 40 &&
    r.trades >= 20
  );

  const report = {
    market: marketName,
    generated: new Date().toISOString(),
    totalConfigs: results.length,
    winnerConfigs: winners.length,
    winners: winners.slice(0, 20), // Top 20
    allResults: sorted,
  };

  // Save
  const outDir = path.join(__dirname, 'results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `${marketName}-sweep-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  // Console summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${marketName.toUpperCase()} RESULTS — ${results.length} configs tested`);
  console.log(`${'═'.repeat(60)}`);

  if (winners.length === 0) {
    console.log('\n  ❌ No winning configs found (PF≥1.3, WR≥35%, DD≤40%, 20+ trades)\n');
  } else {
    console.log(`\n  ✅ ${winners.length} WINNING CONFIGS:\n`);
    console.log('  Symbol    TF     PL   Trades  WinRate  PF     DD%     Return%  Equity');
    console.log('  ' + '─'.repeat(78));
    for (const w of winners.slice(0, 15)) {
      const sym = w.symbol.padEnd(9);
      const tf = w.timeframe.padEnd(6);
      const pl = String(w.pivotLookback).padEnd(4);
      const tr = String(w.trades).padEnd(7);
      const wr = (w.winRate + '%').padEnd(8);
      const pf = String(w.profitFactor).padEnd(6);
      const dd = (w.maxDrawdownPct + '%').padEnd(7);
      const ret = (w.totalReturnPct + '%').padEnd(8);
      const eq = '$' + w.finalEquity.toLocaleString();
      console.log(`  ${sym} ${tf} ${pl} ${tr} ${wr} ${pf} ${dd} ${ret} ${eq}`);
    }
  }

  console.log(`\n  📁 Full results saved to: ${outFile}\n`);
  return report;
}

// ── CLI ──
async function main() {
  const args = process.argv.slice(2);
  const marketFlag = args.find((_, i) => args[i - 1] === '--market');
  const symbolFlag = args.find((_, i) => args[i - 1] === '--symbol');

  if (symbolFlag) {
    // Single symbol mode
    let market = marketFlag || 'auto';
    if (market === 'auto') {
      if (['ES', 'NQ', 'YM', 'CL', 'GC', 'SI', 'RTY'].includes(symbolFlag)) market = 'futures';
      else if (symbolFlag.length === 6 && !symbolFlag.includes('USDT')) market = 'forex';
      else market = 'crypto';
    }
    const cfg = SWEEP_CONFIG[market] || SWEEP_CONFIG.futures;
    console.log(`\n── Single Symbol: ${symbolFlag} (${market}) ──`);
    const results = await sweepSymbol(symbolFlag, cfg.timeframes, cfg.pivotLookbacks, market);
    generateReport(results, `${market}-${symbolFlag}`);
    return;
  }

  const markets = marketFlag ? [marketFlag] : ['futures', 'forex'];

  for (const m of markets) {
    const results = await sweepMarket(m);
    generateReport(results, m);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
