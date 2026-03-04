# InSilico Terminal — Course 3: Sharpening Your Edge (Digest)

**Source**: 21 transcripts (Modules 1-5)
**Instructors**: Trip (ranges, exchange UI, derivatives) and Zoran (leverage, systems, mindset)

---

## Module 1: Getting Started with Derivatives

### Order Types
1. **Market Order**: Immediate execution, no guaranteed price. Higher fee (taker). Use for breakouts, compounding, emergency exits.
2. **Limit Order**: Resting order at specific price. Lower fee (maker). Use for swing entries, take-profits, building positions.
3. **Stop Orders**: Two-part mechanism — trigger price activates a market or limit order.
   - **Stop Market**: Triggers immediate market sell/buy. Use for stop losses with "close on trigger" enabled.
   - **Stop Limit**: Triggers a limit order. More control but risk of not filling.
   - For stop losses: always use **last price** trigger with close on trigger ON.
   - For breakout entries: stop buy above resistance (no close on trigger).

**Key principle**: "Trading without stop losses is gambling."

### Maker vs Taker Fees
- **Maker** (limit orders) = providing liquidity = lower fees
- **Taker** (market orders) = taking liquidity = higher fees

### Exchange Interface (BitMEX Testnet Walkthrough)
- Account tab: wallet balance, deposits, withdrawals, transaction history
- Trade tab: order placement, order book, positions
- Positions table: open positions, closed (realized P&L), active orders, stops, fills, order history
- Contract details: index price, 24h turnover, open interest, funding rate
- Calculator tool: profit/loss, target price, liquidation price
- **Perpetual swap** (XBTUSD) = most liquid crypto derivative
- **Futures contracts** = specified expiration dates (quarterly)
- Assets denominated in XBT (Bitcoin)

---

## Module 2: Understanding Leverage

### What Leverage Actually Is
- Increased purchasing power via margin/borrowed funds
- **Leverage is IRRELEVANT** to position sizing — it only affects margin requirements
- Two legitimate uses:
  1. **Counterparty risk mitigation**: Keep less capital on exchange (protect against hacks/insolvency)
  2. **Capital optimization**: Take multiple positions across assets simultaneously

### The Critical Rule
> "Leverage should NEVER affect your position size. If you use leverage to increase risk, you are using it INCORRECTLY."

**Correct usage**: Same position size, same risk, less margin posted.
**Wrong usage**: 10x leverage = 10x position size = 10x risk = gambling.

**Example**: 
- Portfolio: 200 BTC. System says risk 3.7% = 7.5 BTC on this trade.
- Without leverage: need to post ~101 BTC as collateral (50%+ of portfolio)
- With 10x leverage: only post ~10 BTC as collateral. **Same risk, same position size.**
- Critical check: liquidation price must be BELOW stop loss (for longs)

### Types of Margin
1. **Cross Margin**: Uses full account balance. Good for swing/position traders who may size up.
2. **Isolated Margin**: Restricts to predefined multiplier. Good for scalpers/day traders with multiple positions.

### Margin Requirements
- **Initial Margin**: Minimum collateral to open position
- **Maintenance Margin**: Minimum to avoid liquidation
- Must post both. Requirements increase with position size (risk limits).

### Liquidations
- Forced closing when below maintenance margin
- **Should NEVER happen** — stop loss must always trigger first
- In TradFi: can lead to debt/lawsuits. In crypto: just lose your margin.
- "Stop losses are the only defense against liquidations"

### Real Trade Example: ETH Swing Long
- Entry: $134.83, Stop: $124.95, TP: $160 → R:R 2.55
- Used 10x leverage correctly (liquidation at $122.19, well below stop)
- Trade evolved: spotted Ichimoku setup on 2D chart → extended TP to $282 (14.9 R:R)
- **Funding ate margin** over weeks → liquidation price crept up above original stop
- Moved stop to breakeven to cover funding
- Price reached $281.90 — missed $282 TP by 10 cents
- Exited at $268 via LTE on lower timeframe
- **Lesson**: Funding ate 20%+ of profits. Consider instrument choice, hedging, trade duration.

---

## Module 3: Applying the Basics (Advanced S/R)

### How Price Moves
- Price moves due to **imbalance** between buyers and sellers
- Demand > Supply → price rises
- Supply > Demand → price falls
- Demand = Supply → **consolidation**
- Two types of movement: **continuation** and **reversal**
- **Consolidation zones occur between all price movements** — they ARE the access points

### DBS and SSR Zones

**DBS Zone** (Demand Buyers Support):
- Consolidation before bullish move
- Defined: lowest price (including wicks) → highest opening price of range
- OR: single significant down candle before a higher high in uptrend

**SSR Zone** (Supply Sellers Resistance):
- Consolidation before bearish move
- Defined: highest price (including wicks) → lowest opening price of range
- OR: single significant up candle before a lower low in downtrend

### Three Fundamentals of DBS/SSR Zones

1. **Strength**: More explosive breakout from zone = stronger zone. Must see clear higher high (bullish) or lower low (bearish).
2. **Time**: Less time forming = stronger. Single candle > multi-session range (dominant party showed clear force).
3. **Depletion Factor**: First test = strongest reaction. Each subsequent retest consumes orders → zone weakens → eventually breaks. **This is why S/R is finite.**

### Trading Strategies with DBS/SSR
- **Aggressive long**: Bid at upper limit of DBS zone, stop below zone
- **Aggressive short**: Ask at lower limit of SSR zone, stop above zone
- **Conservative**: Layer bids/asks within zone, stop at another invalidation level
- **S/R Flip trading**: When SSR zone breaks upward → becomes DBS zone. Buy the retest. (And vice versa.)
- "One of the most fundamental aspects in trading revolves around identifying S/R flips in real time"

### Range Trading (Trip's Core Strategy)

**Components:**
1. **Range Low** = buyers/demand/support
2. **Range High** = sellers/supply/resistance
3. **Midpoint** = gauge/guide (use Fib tool 0.5)

**Rules:**
1. **First test = highest probability**: Fresh DBS/SSR test has highest hit rate. Conservative + high probability.
2. **Midpoint as guide**: Above mid → more likely to reach high. Below mid → more likely to reach low. Mid-range = "chop zone" — DO NOT TRADE.
3. **Rule of Fives**: Count touches of range high/low. By the 5th touch, S/R is likely depleted → expect breakout/breakdown. NOT a high-probability entry on 5th touch.
4. **Swing points for invalidation**: Place stop loss below/above swing lows/highs with buffer.

**Range Trading Process:**
1. Identify range on 4H → confirm with HTF context (was this range low/high a prior S/R level?)
2. Drop to 1H for execution timeframe
3. Mark range high, range low, midpoint
4. Long setup: Buy near range low → stop below swing low → target range high (R:R ~4:1)
5. Short setup: Sell near range high → stop above swing high → target range low (R:R ~3:1)
6. Manage using midpoint as progress gauge / trailing stop level
7. Watch depletion factor — if range has been hit 4+ times, expect the break

**Live example showed:**
- Successful long at range low (2nd test) → profit at range high
- Successful short at range high → profit at range low (midpoint failed to reclaim → confirmed downside)
- Failed short on 5th touch of range high → rule of fives breakout → loss (journaled as "won't take this setup again")

---

## Module 4: Crafting Your System

### Trading System Components
A complete framework including:
1. **Markets & Timeframes**: Which markets? Trending or ranging? Analysis TF vs execution TF? Trade duration?
2. **Risk & Position Sizing**: Max risk per trade. Compounding rules. Total acceptable drawdown (tied to win rate + avg R).
3. **Trade Setups**: Technical (indicator-based) vs discretionary (structure-based)?
4. **Entry Triggers**: What signals entry? (LTE framework, indicator crosses, etc.)
5. **Exit Triggers**: Set-and-forget, trailing stops, partial TPs?
6. **Trade Management**: How involved? Compounding winners? Averaging into entries?

**Key principles:**
- "A trading system is only as robust as the trader crafting it"
- More explicit system → more consistent trading
- **Trust your system** — losing streaks are inevitable. Blame lack of discipline, not the system.
- Edges are finite and need iteration; systems are static within their conditions.

### Trading Plan
Set of rules for executing the system per session:
- Markets and levels to watch
- Position sizing and compounding rules
- Directional bias and expectations
- Results review and execution audit
- "Always ask yourself: where did I do well? Where did things go poorly?"

### Trading Journal (Edgewonk)
**Components:**
- Entry, stop loss, take-profit
- Screenshots of chart + trade thesis
- Reasoning behind the trade
- Risk/reward profile
- **Custom stats**: sleep, hunger, meditation, emotional state, exercise

**Zoran's Real Losing Trade Example (BTC July 2019):**
- Swing long at $11,749, stop at $10,790, TP at $15,375
- Price reached $13,272 but reversed → moved stop DOWN by $200 (greed)
- Got stopped out at $10,340 (slippage) → lost 55 BTC (~2.5% of portfolio)
- Journal review: 3 hours sleep, full stomach, greedy emotional state
- Lessons: could have trailed with $300 stop, should have marketed into buy wall liquidity, micromanaged on wrong timeframe
- "3 hours of sleep + full stomach + greed = poor execution"

---

## Module 5: Unlocking Your Potential

### Finding Your Edge
- **Edge** = ability to consistently outsmart the market
- Crafted through experience + experimentation + vigorous journal review
- **Edges are finite** — require frequent iteration
- Two types:
  - **Discretionary Edge**: Based on observation (e.g., CME gap fills)
  - **Systemic Edge**: Based on experimentation (e.g., modified Kelly position sizing)

### Developing a Trader's Mindset
- Traders = professional athletes. Same performance demands, but solo sport.
- Three key areas:
  1. **Routines & Habits**: Screen time (10,000 hours to mastery), physical health, meditation
  2. **Work-Life Balance**: Outlets for stress (gaming, fishing, surfing, photography). Rules of engagement for screen time.
  3. **Discipline**: Accountability. No revenge trading. Stick to your system through drawdowns.

### Screen Time
- #1 way to improve as a trader
- Watch markets daily — observe structures forming and resolving
- Notice similarities in indicators before certain outcomes
- Practice > theory

### Physical Health
- Exercise directly correlates with trading performance
- 5-10 min walks to recharge and wipe subjective biases
- "Sluggish in one area → sluggish in others"

### Meditation
- Essential for discretionary traders
- Creates clarity, promotes objectivity, improves emotional control
- Basic technique: sit upright, breathe deeply, focus on breath, gently refocus when mind wanders
- Recommended app: Headspace
- "The refocusing of attention back on the breath IS the essence of meditation"

### Emotional Control
- Complete emotional control comes with experience + discipline
- Don't impose your will on the market
- Don't revenge trade after losses
- Hot streaks don't mean change your system — exploit them, don't get arrogant
- Filter out noise (especially crypto Twitter 24/7 dialogue)
- "You versus you versus the market"

### The Evolution of a Trader
- Big losses → small losses → breakeven → profitability
- Each stage reveals edges hidden in journal data
- "What ties these winners together? What ties these losers together?"
- Execution is the hardest part — good analysis ≠ good trading
- "Step up to a golf ball: practice swing is easy. Real swing with real money is a different game."

---

## Key Takeaways for PulseWave

### Concepts to Potentially Integrate:
1. **DBS/SSR Zone visualization** — Draw demand/supply zones on chart with explicit labeling. Single-candle zones highlighted stronger.
2. **Depletion Factor counter** — Show how many times a level has been tested (1st test = high probability, 5th = expect break)
3. **Rule of Fives indicator** — Count touches at S/R levels, warn when approaching 5th touch
4. **Range detection with midpoint** — Auto-identify range-bound markets, mark low/high/mid, identify chop zone
5. **DBS/SSR zone strength scoring** — Rate zones by: time (fewer candles = stronger), breakout distance (farther = stronger), test count (fewer = stronger)
6. **Funding rate awareness** — For signal users on perpetual swaps, flag high funding environments

### Validates PulseWave Approach:
- S/R zones (DBS/SSR) are EXACTLY what PulseWave identifies — consolidation zones before impulsive moves
- First-test-is-strongest principle validates PulseWave's focus on fresh levels
- Rule of Fives aligns with InSilico Course 1's same concept — S/R is finite
- Range trading with midpoint is a systematic, repeatable strategy — could be automated
- Leverage education validates the need for risk management in signal delivery
- Journal-driven system optimization mirrors PulseWave's backtesting approach
- "Trading is a solo sport" — reinforces the value of automated signals removing emotional execution
