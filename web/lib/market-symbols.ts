export type NormalizedMarketSymbol = {
  input: string
  pair: string
  base: string
  quote: string
  binanceSymbol: string
  coinGeckoSymbol: string
}

export const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  bitcoin: 'bitcoin',
  btc: 'bitcoin',
  ethereum: 'ethereum',
  eth: 'ethereum',
  solana: 'solana',
  sol: 'solana',
  cardano: 'cardano',
  ada: 'cardano',
  polkadot: 'polkadot',
  dot: 'polkadot',
  chainlink: 'chainlink',
  link: 'chainlink',
  polygon: 'matic-network',
  matic: 'matic-network',
  avalanche: 'avalanche-2',
  avax: 'avalanche-2',
  cosmos: 'cosmos',
  atom: 'cosmos',
  near: 'near',
  algorand: 'algorand',
  algo: 'algorand',
  fantom: 'fantom',
  ftm: 'fantom',
  arbitrum: 'arbitrum',
  arb: 'arbitrum',
  optimism: 'optimism',
  op: 'optimism',
  dogecoin: 'dogecoin',
  doge: 'dogecoin',
  ripple: 'ripple',
  xrp: 'ripple',
  sui: 'sui',
  aptos: 'aptos',
  apt: 'aptos',
  injective: 'injective-protocol',
  inj: 'injective-protocol',
  render: 'render-token',
  rndr: 'render-token',
  pepe: 'pepe',
}

const QUOTE_ASSETS = ['USDT', 'USDC', 'USD', 'BTC', 'ETH', 'BNB', 'FDUSD', 'TUSD']

export function normalizeMarketSymbol(rawInput: string): NormalizedMarketSymbol {
  const input = (rawInput || '').trim()
  if (!input) {
    throw new Error('Ticker is required')
  }

  const cleaned = input.toUpperCase().replace(/\s+/g, '').replace(/-/g, '/')
  let base = ''
  let quote = 'USDT'

  if (cleaned.includes('/')) {
    const [rawBase, rawQuote] = cleaned.split('/')
    base = rawBase
    quote = rawQuote || 'USDT'
  } else {
    const detectedQuote = QUOTE_ASSETS.find(candidate => cleaned.endsWith(candidate) && cleaned.length > candidate.length)
    if (detectedQuote) {
      base = cleaned.slice(0, -detectedQuote.length)
      quote = detectedQuote
    } else {
      base = cleaned
    }
  }

  base = base.replace(/[^A-Z0-9]/g, '')
  quote = quote.replace(/[^A-Z0-9]/g, '') || 'USDT'

  if (!base) {
    throw new Error('Ticker is required')
  }

  return {
    input,
    pair: `${base}/${quote}`,
    base,
    quote,
    binanceSymbol: `${base}${quote}`,
    coinGeckoSymbol: base.toLowerCase(),
  }
}

export function coinGeckoIdForSymbol(symbol: string): string {
  return SYMBOL_TO_COINGECKO_ID[symbol.toLowerCase()] || symbol.toLowerCase()
}

export function formatLivePrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return ''
  if (price >= 1000) return price.toFixed(2)
  if (price >= 1) return price.toFixed(4)
  if (price >= 0.01) return price.toFixed(6)
  return price.toPrecision(6).replace(/0+$/, '').replace(/\.$/, '')
}
