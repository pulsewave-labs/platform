-- PulseWave Labs — Database Migration
-- Paste this entire file into Supabase SQL Editor and click "Run"

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pulse', 'wave', 'tsunami')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. SIGNALS
-- ============================================
CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  timeframe TEXT NOT NULL,
  entry NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  take_profit NUMERIC NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  regime TEXT CHECK (regime IN ('TRENDING_UP', 'TRENDING_DOWN', 'RANGING', 'VOLATILE')),
  reasoning TEXT,
  factors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'hit_tp', 'hit_sl', 'expired', 'cancelled')),
  min_tier TEXT DEFAULT 'pulse' CHECK (min_tier IN ('pulse', 'wave', 'tsunami')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_signals_status ON public.signals(status);
CREATE INDEX idx_signals_pair ON public.signals(pair);
CREATE INDEX idx_signals_created ON public.signals(created_at DESC);

-- ============================================
-- 3. TRADES (Journal)
-- ============================================
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES public.signals(id),
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  quantity NUMERIC,
  pnl NUMERIC,
  pnl_percent NUMERIC,
  r_multiple NUMERIC,
  fees NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'signal', 'exchange_import')),
  exchange TEXT,
  exchange_order_id TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_user ON public.trades(user_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_opened ON public.trades(opened_at DESC);

-- ============================================
-- 4. WAITLIST
-- ============================================
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- ============================================
-- 5. NEWS CACHE
-- ============================================
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source TEXT,
  url TEXT,
  summary TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
  category TEXT,
  related_pairs TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_published ON public.news(published_at DESC);
CREATE INDEX idx_news_impact ON public.news(impact);

-- ============================================
-- 6. S/R LEVELS
-- ============================================
CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  price NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('support', 'resistance')),
  strength INTEGER CHECK (strength BETWEEN 1 AND 5),
  touches INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_levels_pair ON public.levels(pair, timeframe);
CREATE INDEX idx_levels_active ON public.levels(active) WHERE active = TRUE;

-- ============================================
-- 7. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trades: users can CRUD their own
CREATE POLICY "Users can read own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades
  FOR DELETE USING (auth.uid() = user_id);

-- Signals: all authenticated users can read
CREATE POLICY "Authenticated users can read signals" ON public.signals
  FOR SELECT USING (auth.role() = 'authenticated');

-- Waitlist: anyone can insert (for the landing page form)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- News: all authenticated users can read
CREATE POLICY "Authenticated users can read news" ON public.news
  FOR SELECT USING (auth.role() = 'authenticated');

-- Levels: all authenticated users can read
CREATE POLICY "Authenticated users can read levels" ON public.levels
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role bypass (for API/admin operations)
-- The service_role key already bypasses RLS

-- ============================================
-- 8. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON public.signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_levels_updated_at BEFORE UPDATE ON public.levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- DONE! 🚀
-- ============================================
