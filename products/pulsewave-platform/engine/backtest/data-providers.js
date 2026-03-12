/**
 * PulseWave Multi-Market Data Providers
 * Fetches historical OHLCV from Twelve Data (futures/forex) and Binance (crypto)
 * 
 * Output format: [[timestamp, open, high, low, close, volume], ...]
 */
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '.cache');

// ── Twelve Data (Futures + Forex) ──
// Free tier: 800 API calls/day, 8 per minute
// Docs: https://twelvedata.com/docs#time-series
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_KEY || '';

const TWELVE_DATA_SYMBOLS = {
  // Futures (continuous contracts)
  'ES':  'ES1!',   // S&P 500 E-mini
  'NQ':  'NQ1!',   // Nasdaq 100 E-mini
  'YM':  'YM1!',   // Dow E-mini
  'CL':  'CL1!',   // Crude Oil
  'GC':  'GC1!',   // Gold
  'SI':  'SI1!',   // Silver
  'RTY': 'RTY1!',  // Russell 2000 E-mini
  // Forex
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'AUDUSD': 'AUD/USD',
  'GBPJPY': 'GBP/JPY',
  'EURJPY': 'EUR/JPY',
  'USDCHF': 'USD/CHF',
  'USDCAD': 'USD/CAD',
  'NZDUSD': 'NZD/USD',
};

// Map our timeframes to Twelve Data intervals
const TWELVE_TF_MAP = {
  '1h': '1h', '2h': '2h', '4h': '4h',
  '8h': '8h', '12h': null, // 12h not supported — we'll aggregate from 4h
  '1d': '1day', 'D': '1day',
};

/**
 * Ensure cache directory exists
 */
function ensureCache() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Cache key for a fetch
 */
function cacheKey(provider, symbol, tf, outputSize) {
  return `${provider}_${symbol.replace(/[/!]/g, '_')}_${tf}_${outputSize}`;
}

/**
 * Read from disk cache
 */
function readCache(key) {
  ensureCache();
  const file = path.join(CACHE_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return null;
  const stat = fs.statSync(file);
  // Cache for 24h
  if (Date.now() - stat.mtimeMs > 24 * 60 * 60 * 1000) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Write to disk cache
 */
function writeCache(key, data) {
  ensureCache();
  const file = path.join(CACHE_DIR, `${key}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
}

/**
 * Fetch from Twelve Data API
 */
async function fetchTwelveData(symbol, interval, outputSize = 5000) {
  const key = cacheKey('twelve', symbol, interval, outputSize);
  const cached = readCache(key);
  if (cached) return cached;

  if (!TWELVE_DATA_KEY) throw new Error('TWELVE_DATA_KEY not set');

  const tdSymbol = TWELVE_DATA_SYMBOLS[symbol] || symbol;
  const tdInterval = TWELVE_TF_MAP[interval];
  if (!tdInterval) throw new Error(`Twelve Data doesn't support ${interval} — aggregate manually`);

  const url = `https://api.twelvedata.com/time_series?symbol=${tdSymbol}&interval=${tdInterval}&outputsize=${outputSize}&apikey=${TWELVE_DATA_KEY}&format=JSON`;

  console.log(`  Fetching ${tdSymbol} ${tdInterval} from Twelve Data (${outputSize} bars)...`);
  const res = await fetch(url, { timeout: 30000 });
  const json = await res.json();

  if (json.status === 'error') {
    throw new Error(`Twelve Data error: ${json.message}`);
  }

  if (!json.values || json.values.length === 0) {
    throw new Error(`No data returned for ${symbol} ${interval}`);
  }

  // Twelve Data returns newest first — reverse to oldest first
  // Format: { datetime, open, high, low, close, volume }
  const candles = json.values.reverse().map(v => [
    new Date(v.datetime).getTime(),
    parseFloat(v.open),
    parseFloat(v.high),
    parseFloat(v.low),
    parseFloat(v.close),
    parseFloat(v.volume || 0),
  ]);

  writeCache(key, candles);
  console.log(`  → ${candles.length} candles cached`);
  return candles;
}

/**
 * Fetch from Binance (crypto) — free, no API key
 */
async function fetchBinance(symbol, interval, limit = 1000) {
  const key = cacheKey('binance', symbol, interval, limit);
  const cached = readCache(key);
  if (cached) return cached;

  // Binance supports: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
  const binanceSymbol = symbol.replace('/', '');
  
  // Fetch multiple pages to get more history
  const allCandles = [];
  let endTime = undefined;
  const pages = Math.ceil(limit / 1000);

  for (let p = 0; p < pages; p++) {
    const params = new URLSearchParams({
      symbol: binanceSymbol,
      interval: interval,
      limit: '1000',
    });
    if (endTime) params.set('endTime', String(endTime - 1));

    const url = `https://data-api.binance.vision/api/v3/klines?${params}`;
    console.log(`  Fetching ${binanceSymbol} ${interval} from Binance (page ${p + 1})...`);
    const res = await fetch(url, { timeout: 15000 });
    const raw = await res.json();

    if (!Array.isArray(raw) || raw.length === 0) break;

    const candles = raw.map(k => [
      k[0],
      parseFloat(k[1]),
      parseFloat(k[2]),
      parseFloat(k[3]),
      parseFloat(k[4]),
      parseFloat(k[5]),
    ]);

    allCandles.unshift(...candles);
    endTime = candles[0][0];
    
    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  writeCache(key, allCandles);
  console.log(`  → ${allCandles.length} candles cached`);
  return allCandles;
}

/**
 * Aggregate candles to a higher timeframe
 * e.g. 4h candles → 12h candles (3:1 ratio)
 */
function aggregateCandles(candles, ratio) {
  const result = [];
  for (let i = 0; i <= candles.length - ratio; i += ratio) {
    const chunk = candles.slice(i, i + ratio);
    result.push([
      chunk[0][0],                                           // timestamp (first)
      chunk[0][1],                                           // open (first)
      Math.max(...chunk.map(c => c[2])),                     // high (max)
      Math.min(...chunk.map(c => c[3])),                     // low (min)
      chunk[chunk.length - 1][4],                            // close (last)
      chunk.reduce((s, c) => s + c[5], 0),                   // volume (sum)
    ]);
  }
  return result;
}

/**
 * Universal fetch — routes to correct provider
 */
async function fetchHistorical(symbol, interval, market = 'auto') {
  // Auto-detect market
  if (market === 'auto') {
    if (symbol.includes('USDT') || symbol.includes('BTC')) market = 'crypto';
    else if (['ES', 'NQ', 'YM', 'CL', 'GC', 'SI', 'RTY'].includes(symbol)) market = 'futures';
    else market = 'forex';
  }

  if (market === 'crypto') {
    return fetchBinance(symbol, interval, 5000);
  }

  // Futures + Forex via Twelve Data
  if (interval === '12h') {
    // Aggregate from 4h (3:1)
    const candles4h = await fetchTwelveData(symbol, '4h', 5000);
    return aggregateCandles(candles4h, 3);
  }
  if (interval === '6h') {
    // Twelve Data might not have 6h — aggregate from 1h (6:1)
    const candles1h = await fetchTwelveData(symbol, '1h', 5000);
    return aggregateCandles(candles1h, 6);
  }

  return fetchTwelveData(symbol, interval, 5000);
}

module.exports = { fetchHistorical, fetchTwelveData, fetchBinance, aggregateCandles, TWELVE_DATA_SYMBOLS };
