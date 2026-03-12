-- PulseWave Trade Journal Migration
-- Run this manually against Supabase SQL Editor
-- Adds journal-specific columns to the existing trades table

-- Add journal columns to trades table
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS setup_type TEXT,
  ADD COLUMN IF NOT EXISTS timeframe TEXT,
  ADD COLUMN IF NOT EXISTS emotional_state TEXT,
  ADD COLUMN IF NOT EXISTS pre_thesis TEXT,
  ADD COLUMN IF NOT EXISTS post_right TEXT,
  ADD COLUMN IF NOT EXISTS post_wrong TEXT,
  ADD COLUMN IF NOT EXISTS lesson TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT CHECK (grade IN ('A','B','C','D','F')),
  ADD COLUMN IF NOT EXISTS confluence INT,
  ADD COLUMN IF NOT EXISTS screenshot_entry TEXT,
  ADD COLUMN IF NOT EXISTS screenshot_exit TEXT,
  ADD COLUMN IF NOT EXISTS session TEXT,
  ADD COLUMN IF NOT EXISTS risk_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS auto_imported BOOLEAN DEFAULT FALSE;

-- Create trading_rules table for rule tracking
CREATE TABLE IF NOT EXISTS public.trading_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trade_rule_compliance table
CREATE TABLE IF NOT EXISTS public.trade_rule_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.trading_rules(id) ON DELETE CASCADE,
  followed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trade_id, rule_id)
);

-- RLS policies for trading_rules
ALTER TABLE public.trading_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rules" ON public.trading_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules" ON public.trading_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules" ON public.trading_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules" ON public.trading_rules
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for trade_rule_compliance
ALTER TABLE public.trade_rule_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compliance" ON public.trade_rule_compliance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trades WHERE trades.id = trade_rule_compliance.trade_id AND trades.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own compliance" ON public.trade_rule_compliance
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trades WHERE trades.id = trade_rule_compliance.trade_id AND trades.user_id = auth.uid())
  );

-- Create storage bucket for journal screenshots (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('journal-screenshots', 'journal-screenshots', true);

-- Index for faster journal queries
CREATE INDEX IF NOT EXISTS idx_trades_user_status ON public.trades(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trades_user_setup ON public.trades(user_id, setup_type);
CREATE INDEX IF NOT EXISTS idx_trades_user_session ON public.trades(user_id, session);
CREATE INDEX IF NOT EXISTS idx_trades_user_emotional ON public.trades(user_id, emotional_state);
CREATE INDEX IF NOT EXISTS idx_trading_rules_user ON public.trading_rules(user_id, active);
