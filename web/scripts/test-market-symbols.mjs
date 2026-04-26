import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const sourcePath = path.join(root, 'lib/market-symbols.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
})

const module = { exports: {} }
const fn = new Function('module', 'exports', compiled.outputText)
fn(module, module.exports)

const { normalizeMarketSymbol, coinGeckoIdForSymbol, formatLivePrice } = module.exports

assert.deepEqual(normalizeMarketSymbol('btc'), {
  input: 'btc',
  pair: 'BTC/USDT',
  base: 'BTC',
  quote: 'USDT',
  binanceSymbol: 'BTCUSDT',
  coinGeckoSymbol: 'btc',
})

assert.equal(normalizeMarketSymbol('ETHUSDT').pair, 'ETH/USDT')
assert.equal(normalizeMarketSymbol('sol-usdc').binanceSymbol, 'SOLUSDC')
assert.equal(normalizeMarketSymbol('xrp/usd').pair, 'XRP/USD')
assert.equal(coinGeckoIdForSymbol('btc'), 'bitcoin')
assert.equal(coinGeckoIdForSymbol('DOGE'), 'dogecoin')
assert.equal(formatLivePrice(67234.12345), '67234.12')
assert.equal(formatLivePrice(0.000012345), '0.000012345')
assert.throws(() => normalizeMarketSymbol(''), /Ticker is required/)

console.log('market-symbols tests passed')
