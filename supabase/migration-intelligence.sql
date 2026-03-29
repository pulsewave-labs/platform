-- PulseWave Intelligence — Snapshot Storage + Pattern Engine
-- Run this in Supabase SQL Editor

-- Store every intelligence snapshot (one row per ~15 min)
CREATE TABLE IF NOT EXISTS intelligence_snapshots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ts timestamptz NOT NULL DEFAULT now(),
  price numeric NOT NULL,
  composite int NOT NULL,
  bias text NOT NULL,
  confidence int NOT NULL,
  -- Individual signal scores (stored flat for fast querying)
  s_orderbook int, s_funding int, s_oi int, s_longshort int, s_taker int,
  s_options int, s_feargreed int, s_technicals int, s_cvd int,
  s_volumeprofile int, s_largetrades int, s_optionsflow int,
  s_fundingdiff int, s_cme int, s_correlations int, s_stablecoins int,
  -- Key data points for pattern matching
  funding_rate numeric,
  oi_delta_24h numeric,
  ls_ratio numeric,
  taker_ratio numeric,
  cvd numeric,
  fear_greed int,
  pc_ratio numeric,
  cme_basis numeric,
  -- Full snapshot JSON (for detailed analysis)
  raw jsonb,
  -- Outcome tracking (filled in by cron job later)
  price_4h numeric,
  price_24h numeric,
  price_72h numeric,
  change_4h numeric,  -- percentage
  change_24h numeric,
  change_72h numeric
);

-- Indexes for fast pattern queries
CREATE INDEX IF NOT EXISTS idx_snapshots_ts ON intelligence_snapshots (ts DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_composite ON intelligence_snapshots (composite);
CREATE INDEX IF NOT EXISTS idx_snapshots_bias ON intelligence_snapshots (bias);
CREATE INDEX IF NOT EXISTS idx_snapshots_feargreed ON intelligence_snapshots (fear_greed);
CREATE INDEX IF NOT EXISTS idx_snapshots_lsratio ON intelligence_snapshots (ls_ratio);
CREATE INDEX IF NOT EXISTS idx_snapshots_cvd ON intelligence_snapshots (cvd);

-- Pattern matching function: find similar historical moments
CREATE OR REPLACE FUNCTION find_similar_snapshots(
  p_composite int,
  p_fear_greed int DEFAULT NULL,
  p_ls_ratio numeric DEFAULT NULL,
  p_bias text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id bigint,
  ts timestamptz,
  price numeric,
  composite int,
  bias text,
  fear_greed int,
  ls_ratio numeric,
  cvd numeric,
  change_4h numeric,
  change_24h numeric,
  change_72h numeric,
  similarity numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.ts, s.price, s.composite, s.bias, s.fear_greed, s.ls_ratio, s.cvd,
    s.change_4h, s.change_24h, s.change_72h,
    -- Similarity score (lower = more similar)
    (
      ABS(s.composite - p_composite)::numeric * 2 +
      CASE WHEN p_fear_greed IS NOT NULL AND s.fear_greed IS NOT NULL
        THEN ABS(s.fear_greed - p_fear_greed)::numeric * 0.5 ELSE 0 END +
      CASE WHEN p_ls_ratio IS NOT NULL AND s.ls_ratio IS NOT NULL
        THEN ABS(s.ls_ratio - p_ls_ratio)::numeric * 20 ELSE 0 END
    ) AS similarity
  FROM intelligence_snapshots s
  WHERE s.change_24h IS NOT NULL  -- only snapshots with outcome data
    AND (p_bias IS NULL OR s.bias = p_bias)
    AND s.ts < now() - interval '24 hours'  -- don't match against recent
  ORDER BY similarity ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Alerts log
CREATE TABLE IF NOT EXISTS intelligence_alerts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ts timestamptz NOT NULL DEFAULT now(),
  alert_type text NOT NULL,       -- 'bias_flip', 'cvd_divergence', 'extreme_fear', 'funding_spike', etc.
  message text NOT NULL,
  data jsonb,
  delivered boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_alerts_ts ON intelligence_alerts (ts DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON intelligence_alerts (alert_type, ts DESC);

-- View: recent patterns with outcomes
CREATE OR REPLACE VIEW intelligence_outcomes AS
SELECT
  ts, price, composite, bias, confidence,
  fear_greed, ls_ratio, cvd, funding_rate,
  price_4h, price_24h, price_72h,
  change_4h, change_24h, change_72h,
  CASE
    WHEN change_24h > 3 THEN 'strong_rally'
    WHEN change_24h > 1 THEN 'rally'
    WHEN change_24h > -1 THEN 'chop'
    WHEN change_24h > -3 THEN 'dip'
    ELSE 'crash'
  END as outcome_24h
FROM intelligence_snapshots
WHERE change_24h IS NOT NULL
ORDER BY ts DESC;
