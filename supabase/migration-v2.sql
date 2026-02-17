-- Migration V2: Add user_settings and portfolio_snapshots tables
-- Run this in Supabase Dashboard → SQL Editor

-- User settings/preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  risk_per_trade decimal DEFAULT 1.0,
  max_daily_loss decimal DEFAULT 3.0,
  max_positions integer DEFAULT 5,
  default_timeframe text DEFAULT '4h',
  preferred_pairs text[] DEFAULT ARRAY['BTC/USDT', 'ETH/USDT'],
  notifications jsonb DEFAULT '{"email": true, "push": false, "signals": true, "risk_alerts": true}'::jsonb,
  exchanges jsonb DEFAULT '[]'::jsonb,
  theme text DEFAULT 'dark',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolio snapshots (daily snapshots for equity curve)
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  balance decimal NOT NULL,
  pnl decimal DEFAULT 0,
  trades_count integer DEFAULT 0,
  win_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- User signal interactions
CREATE TABLE IF NOT EXISTS user_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signal_id uuid REFERENCES signals(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'watching' CHECK (status IN ('watching', 'followed', 'ignored')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, signal_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can CRUD own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own snapshots" ON portfolio_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert snapshots" ON portfolio_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can CRUD own signal interactions" ON user_signals FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user_date ON portfolio_snapshots(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_active ON signals(status, created_at DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed some demo signals
INSERT INTO signals (pair, direction, timeframe, entry, stop_loss, take_profit, confidence, regime, reasoning, factors, status) VALUES
('BTC/USDT', 'LONG', '4h', 68450, 66800, 72100, 92, 'TRENDING_UP', 'Strong bullish momentum with rising volume. Price bouncing off 4h support at 68000 with RSI divergence confirming strength. EMA ribbon expanding bullishly.', '{"rsi": 0.85, "volume": 0.9, "trend": 0.95, "support": 0.88, "momentum": 0.92}', 'active'),
('ETH/USDT', 'LONG', '1h', 2680, 2580, 2890, 87, 'RANGING', 'ETH consolidating above key support. Volume profile shows strong accumulation zone. MACD crossing bullish on 1h with increasing histogram.', '{"rsi": 0.78, "volume": 0.82, "trend": 0.85, "support": 0.9, "momentum": 0.88}', 'active'),
('SOL/USDT', 'SHORT', '4h', 198.50, 206.00, 182.00, 79, 'TRENDING_DOWN', 'SOL showing distribution pattern at resistance. Bearish divergence on RSI with declining volume on pushes higher. Key resistance at 200 holding.', '{"rsi": 0.75, "volume": 0.7, "trend": 0.72, "support": 0.85, "momentum": 0.8}', 'active'),
('DOGE/USDT', 'LONG', '1d', 0.1850, 0.1720, 0.2150, 74, 'RANGING', 'DOGE breaking out of descending wedge on daily. Volume surge on breakout candle. Social sentiment turning positive.', '{"rsi": 0.7, "volume": 0.85, "trend": 0.68, "support": 0.75, "momentum": 0.72}', 'active'),
('XRP/USDT', 'LONG', '4h', 2.45, 2.30, 2.85, 81, 'TRENDING_UP', 'XRP in strong uptrend with consecutive higher highs. Pullback to 20 EMA providing ideal entry. Institutional volume detected.', '{"rsi": 0.8, "volume": 0.88, "trend": 0.82, "support": 0.78, "momentum": 0.85}', 'active'),
('AVAX/USDT', 'SHORT', '1h', 42.50, 44.80, 38.00, 71, 'TRENDING_DOWN', 'AVAX failing at overhead resistance with bearish engulfing pattern. Volume declining on relief rallies. RSI making lower highs.', '{"rsi": 0.72, "volume": 0.65, "trend": 0.7, "support": 0.68, "momentum": 0.74}', 'active'),
('LINK/USDT', 'LONG', '4h', 18.20, 17.10, 21.50, 85, 'TRENDING_UP', 'LINK breaking key resistance with volume. Oracle narrative strengthening. Price above all major moving averages.', '{"rsi": 0.82, "volume": 0.88, "trend": 0.9, "support": 0.8, "momentum": 0.86}', 'active'),
('ADA/USDT', 'LONG', '1d', 0.72, 0.65, 0.92, 68, 'RANGING', 'ADA testing multi-month range resistance. Accumulation phase evident from volume profile. Catalyst: upcoming hard fork.', '{"rsi": 0.65, "volume": 0.72, "trend": 0.6, "support": 0.7, "momentum": 0.68}', 'active');

-- Seed some news
INSERT INTO news (title, source, url, summary, impact, category, related_pairs, published_at) VALUES
('Bitcoin ETF Inflows Hit $2.4B Weekly Record', 'Bloomberg', 'https://bloomberg.com', 'Spot Bitcoin ETFs saw record weekly inflows of $2.4 billion, driven by institutional demand ahead of the halving.', 'high', 'macro', ARRAY['BTC/USDT'], now() - interval '2 hours'),
('Fed Signals Potential Rate Cut in September', 'Reuters', 'https://reuters.com', 'Federal Reserve officials hint at possible rate reduction in September meeting, citing cooling inflation data.', 'high', 'macro', ARRAY['BTC/USDT', 'ETH/USDT'], now() - interval '4 hours'),
('Whale Alert: 15,000 BTC Moved to Cold Storage', 'Whale Alert', 'https://whale-alert.io', 'A whale moved 15,000 BTC (~$1.03B) from Binance to an unknown cold wallet, suggesting long-term accumulation.', 'medium', 'whale', ARRAY['BTC/USDT'], now() - interval '6 hours'),
('Ethereum Foundation Announces EIP-7702 Timeline', 'CoinDesk', 'https://coindesk.com', 'Account abstraction upgrade EIP-7702 scheduled for Q3, bringing native smart wallet functionality to Ethereum.', 'medium', 'regulatory', ARRAY['ETH/USDT'], now() - interval '8 hours'),
('Solana DEX Volume Surpasses Ethereum for Third Week', 'The Block', 'https://theblock.co', 'Solana DeFi ecosystem continues to grow with DEX volumes exceeding Ethereum, driven by memecoin activity and improved UX.', 'medium', 'macro', ARRAY['SOL/USDT'], now() - interval '10 hours'),
('Binance Launches New Institutional Custody Solution', 'CoinTelegraph', 'https://cointelegraph.com', 'Binance introduces enterprise-grade custody for institutional clients, competing with Coinbase Prime.', 'low', 'regulatory', ARRAY['BTC/USDT', 'ETH/USDT'], now() - interval '12 hours'),
('XRP Lawsuit: SEC Appeal Deadline Approaching', 'Decrypt', 'https://decrypt.co', 'SEC has until March 15 to file appeal in Ripple case. Legal experts suggest settlement more likely than appeal.', 'high', 'regulatory', ARRAY['XRP/USDT'], now() - interval '14 hours'),
('Bitcoin Mining Difficulty Hits All-Time High', 'Bitcoin Magazine', 'https://bitcoinmagazine.com', 'Mining difficulty adjusted up 3.2%, reaching new all-time high. Hash rate continues to climb post-halving.', 'low', 'macro', ARRAY['BTC/USDT'], now() - interval '16 hours'),
('DeFi Protocol TVL Crosses $100B Again', 'DeFi Llama', 'https://defillama.com', 'Total DeFi TVL surpasses $100B for the first time since 2022, signaling renewed confidence in decentralized finance.', 'medium', 'macro', ARRAY['ETH/USDT'], now() - interval '18 hours'),
('Chainlink CCIP Integration Expands to 12 New Chains', 'Chainlink Blog', 'https://chain.link', 'Chainlinks Cross-Chain Interoperability Protocol now supports 12 additional blockchains, boosting oracle network utility.', 'medium', 'macro', ARRAY['LINK/USDT'], now() - interval '20 hours');
