import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config.js'

const client = new Anthropic({ apiKey: config.anthropicKey })

const SYSTEM_PROMPT = `You are a senior crypto market analyst at a quantitative trading firm. You analyze BTC market data and produce concise, actionable directional reads.

Your analysis style:
- Lead with the directional call and conviction level
- Cite specific data points that support your thesis  
- Identify the key risk/invalidation level
- Note any conflicting signals
- Keep it under 200 words — traders don't read essays
- Use plain language, not jargon soup
- Include specific price levels when relevant
- Mention timeframe for the call (next 4h, 24h, etc.)

You receive structured market data including:
- Exchange orderbook imbalance (Binance + Bybit)
- Funding rates (negative = shorts pay = crowded shorts)
- Open interest changes (money flowing in/out)
- Long/short ratios (contrarian indicator)
- Taker buy/sell volume (who's aggressive)
- Options data (P/C ratio, max pain, key strikes)
- Fear & Greed index
- Multi-timeframe technicals (1H/4H/1D trend, RSI, MACD, S/R)
- Macro (DXY, SPX, yields)
- A composite score from our scoring engine (-100 to +100)

Be honest about uncertainty. If signals conflict, say so. Never be more confident than the data warrants.`

export async function generateAnalysis(scoreResult, snapshot) {
  const prompt = `Here's the current BTC market data snapshot (${new Date(snapshot.timestamp).toISOString()}):

**Price:** $${snapshot.price?.toLocaleString() || '?'}

**Composite Score:** ${scoreResult.composite}/100 — ${scoreResult.bias} (${scoreResult.confidence}% avg confidence)

**Individual Signals:**
${Object.entries(scoreResult.signals).map(([k, v]) => 
  `- ${k}: ${v.score > 0 ? '+' : ''}${v.score} (${v.confidence}% conf) — ${v.reason}`
).join('\n')}

**Raw Data Highlights:**
- Binance Funding: ${snapshot.data.binanceFunding?.currentRate || '?'}
- Binance OI: ${snapshot.data.binanceOI?.currentOI || '?'} BTC (4h Δ: ${snapshot.data.binanceOI?.delta4h || '?'}%)
- Taker B/S: ${snapshot.data.binanceTaker?.ratio || '?'}
- Options P/C: ${snapshot.data.options?.pcRatio || '?'} | Max Pain: $${snapshot.data.options?.maxPain || '?'}
- Fear & Greed: ${snapshot.data.fearGreed?.value || '?'} (${snapshot.data.fearGreed?.label || '?'})
- 4H RSI: ${snapshot.data.technicals?.h4?.rsi || '?'}
- 4H Trend: ${snapshot.data.technicals?.h4?.trend?.trend || '?'}
- 1D Trend: ${snapshot.data.technicals?.d1?.trend?.trend || '?'}
- Key S/R (4H): S ${JSON.stringify(snapshot.data.technicals?.h4?.sr?.supports?.slice(0,2))} | R ${JSON.stringify(snapshot.data.technicals?.h4?.sr?.resistances?.slice(0,2))}

**Order Flow:**
- CVD: ${snapshot.data.cvd?.cvd || '?'} (trend: ${snapshot.data.cvd?.trend || '?'}) ${snapshot.data.cvd?.divergence ? '⚠️ DIVERGENCE: ' + snapshot.data.cvd?.divergenceType : ''}
- Volume Profile POC: $${snapshot.data.volumeProfile?.poc?.price || '?'} (delta: ${snapshot.data.volumeProfile?.poc?.delta || '?'}) | Price ${snapshot.data.volumeProfile?.priceVsVA || '?'}
- Value Area: $${snapshot.data.volumeProfile?.valueAreaLow || '?'} - $${snapshot.data.volumeProfile?.valueAreaHigh || '?'}
- Large Trades: ${snapshot.data.largeTrades?.largeTrades || '?'} (${snapshot.data.largeTrades?.whaleTrades || '?'} whale) | Net: ${snapshot.data.largeTrades?.largeNetDelta || '?'} BTC
- Liquidation magnets: Long liq (50x) $${snapshot.data.liquidations?.nearestLongLiq?.price || '?'} | Short liq (50x) $${snapshot.data.liquidations?.nearestShortLiq?.price || '?'}

Generate your market read. Be specific and actionable.`

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].text
}
