# PulseWave Platform Deployment Guide

Complete step-by-step deployment guide for the PulseWave trading platform.

## Architecture Overview

- **Frontend**: Next.js 14 (deployed on Vercel)
- **Backend**: Express.js API (deployed on Railway)
- **Database**: Supabase (PostgreSQL)
- **Caching**: Upstash Redis
- **Payments**: Stripe
- **Monitoring**: Sentry (optional)

## Prerequisites

- Node.js 18+ installed locally
- Git repository created
- Domain name (optional but recommended)

## Step 1: Create GitHub Repository

```bash
# Initialize git repository
cd /path/to/pulsewave-platform/app
git init
git add .
git commit -m "Initial commit: PulseWave platform scaffold"

# Connect to GitHub
git remote add origin https://github.com/yourusername/pulsewave-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in and create a new project
3. Choose a region close to your users
4. Save your project URL and API keys

### 2.2 Run Database Migrations

Execute the following SQL in the Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('pulse', 'wave', 'tsunami');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE signal_direction AS ENUM ('LONG', 'SHORT');
CREATE TYPE signal_status AS ENUM ('active', 'hit_tp', 'hit_sl', 'expired', 'pending');
CREATE TYPE market_regime AS ENUM ('TRENDING_UP', 'TRENDING_DOWN', 'RANGING', 'VOLATILE');
CREATE TYPE trade_status AS ENUM ('open', 'closed', 'pending');
CREATE TYPE news_impact AS ENUM ('low', 'medium', 'high');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'system');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'pulse',
    subscription_status subscription_status DEFAULT 'trialing',
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days',
    role user_role DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair TEXT NOT NULL, -- e.g., 'BTC/USDT'
    direction signal_direction NOT NULL,
    entry DECIMAL(20,8) NOT NULL,
    stop_loss DECIMAL(20,8) NOT NULL,
    take_profit DECIMAL(20,8) NOT NULL,
    exit_price DECIMAL(20,8),
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    regime market_regime NOT NULL,
    reasoning TEXT NOT NULL,
    timeframe TEXT NOT NULL, -- e.g., '4h', '1d'
    status signal_status DEFAULT 'active',
    risk_reward DECIMAL(10,2),
    realized_pnl DECIMAL(20,8),
    tags TEXT[],
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Signal factors (confluence analysis)
CREATE TABLE IF NOT EXISTS signal_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= -100 AND score <= 100),
    weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support/Resistance levels
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('support', 'resistance')),
    price DECIMAL(20,8) NOT NULL,
    strength INTEGER NOT NULL CHECK (strength >= 1 AND strength <= 5),
    timeframe TEXT NOT NULL,
    touches INTEGER DEFAULT 1,
    last_touch TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table (user trades/journal)
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signal_id UUID REFERENCES signals(id),
    pair TEXT NOT NULL,
    direction signal_direction NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'market',
    entry_price DECIMAL(20,8) NOT NULL,
    exit_price DECIMAL(20,8),
    quantity DECIMAL(20,8) NOT NULL,
    stop_loss DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    realized_pnl DECIMAL(20,8),
    unrealized_pnl DECIMAL(20,8),
    fees DECIMAL(20,8) DEFAULT 0,
    status trade_status DEFAULT 'open',
    exchange TEXT,
    r_multiple DECIMAL(10,2),
    tags TEXT[],
    notes TEXT,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    source TEXT NOT NULL,
    impact news_impact NOT NULL,
    url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    pairs TEXT[],
    sentiment DECIMAL(3,2), -- -1 to 1
    relevance_score DECIMAL(3,2), -- 0 to 1
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair TEXT NOT NULL UNIQUE,
    price DECIMAL(20,8) NOT NULL,
    change_24h DECIMAL(20,8),
    change_percent_24h DECIMAL(10,4),
    volume_24h DECIMAL(30,8),
    high_24h DECIMAL(20,8),
    low_24h DECIMAL(20,8),
    market_cap DECIMAL(30,8),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats (denormalized for performance)
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    profit_factor DECIMAL(10,4) DEFAULT 0,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    best_trade DECIMAL(20,8) DEFAULT 0,
    worst_trade DECIMAL(20,8) DEFAULT 0,
    average_r_multiple DECIMAL(10,2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    longest_loss_streak INTEGER DEFAULT 0,
    sharpe_ratio DECIMAL(10,4),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions audit table
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    subscription_tier subscription_tier,
    stripe_event_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waitlist table (for landing page)
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    source TEXT DEFAULT 'website',
    utm_data JSONB,
    subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_signals_pair ON signals(pair);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_timeframe ON signals(timeframe);

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_opened_at ON trades(opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);

CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news(impact);
CREATE INDEX IF NOT EXISTS idx_news_pairs ON news USING GIN(pairs);

CREATE INDEX IF NOT EXISTS idx_levels_pair ON levels(pair);
CREATE INDEX IF NOT EXISTS idx_levels_active ON levels(is_active);
CREATE INDEX IF NOT EXISTS idx_levels_type ON levels(type);

CREATE INDEX IF NOT EXISTS idx_signal_factors_signal_id ON signal_factors(signal_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can read their own trades
CREATE POLICY "Users can view own trades" ON trades
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own trades
CREATE POLICY "Users can insert own trades" ON trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own trades
CREATE POLICY "Users can update own trades" ON trades
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own stats
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own subscription events
CREATE POLICY "Users can view own subscription events" ON subscription_events
    FOR SELECT USING (auth.uid() = user_id);

-- Public read access for signals (with status filter)
CREATE POLICY "Public can view active signals" ON signals
    FOR SELECT USING (status = 'active');

-- Public read access for news
CREATE POLICY "Public can view news" ON news
    FOR SELECT USING (true);

-- Public read access for levels
CREATE POLICY "Public can view levels" ON levels
    FOR SELECT USING (is_active = true);

-- Public read access for market data
CREATE POLICY "Public can view market data" ON market_data
    FOR SELECT USING (true);

-- Functions for stats calculation
CREATE OR REPLACE FUNCTION update_user_stats(user_uuid UUID)
RETURNS void AS $$
DECLARE
    total_trades_count INTEGER;
    winning_trades_count INTEGER;
    total_pnl_sum DECIMAL(20,8);
    best_trade_pnl DECIMAL(20,8);
    worst_trade_pnl DECIMAL(20,8);
    avg_r_mult DECIMAL(10,2);
    calculated_win_rate DECIMAL(5,2);
    calculated_profit_factor DECIMAL(10,4);
    total_profits DECIMAL(20,8);
    total_losses DECIMAL(20,8);
BEGIN
    -- Calculate basic stats
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE realized_pnl > 0),
        COALESCE(SUM(realized_pnl), 0),
        COALESCE(MAX(realized_pnl), 0),
        COALESCE(MIN(realized_pnl), 0),
        COALESCE(AVG(r_multiple), 0)
    INTO 
        total_trades_count,
        winning_trades_count,
        total_pnl_sum,
        best_trade_pnl,
        worst_trade_pnl,
        avg_r_mult
    FROM trades 
    WHERE user_id = user_uuid AND status = 'closed' AND realized_pnl IS NOT NULL;

    -- Calculate win rate
    calculated_win_rate := CASE 
        WHEN total_trades_count > 0 THEN (winning_trades_count::DECIMAL / total_trades_count) * 100
        ELSE 0 
    END;

    -- Calculate profit factor
    SELECT 
        COALESCE(SUM(realized_pnl) FILTER (WHERE realized_pnl > 0), 0),
        COALESCE(ABS(SUM(realized_pnl) FILTER (WHERE realized_pnl < 0)), 0)
    INTO total_profits, total_losses
    FROM trades 
    WHERE user_id = user_uuid AND status = 'closed' AND realized_pnl IS NOT NULL;

    calculated_profit_factor := CASE 
        WHEN total_losses > 0 THEN total_profits / total_losses
        WHEN total_profits > 0 THEN 999.99 -- Cap at high value if no losses
        ELSE 0 
    END;

    -- Update or insert user stats
    INSERT INTO user_stats (
        user_id, 
        total_trades, 
        win_rate, 
        profit_factor,
        total_pnl,
        best_trade,
        worst_trade,
        average_r_multiple,
        updated_at
    ) VALUES (
        user_uuid,
        total_trades_count,
        calculated_win_rate,
        calculated_profit_factor,
        total_pnl_sum,
        best_trade_pnl,
        worst_trade_pnl,
        avg_r_mult,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_trades = EXCLUDED.total_trades,
        win_rate = EXCLUDED.win_rate,
        profit_factor = EXCLUDED.profit_factor,
        total_pnl = EXCLUDED.total_pnl,
        best_trade = EXCLUDED.best_trade,
        worst_trade = EXCLUDED.worst_trade,
        average_r_multiple = EXCLUDED.average_r_multiple,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to get signal statistics
CREATE OR REPLACE FUNCTION get_signal_stats(start_date TIMESTAMP, user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_signals INTEGER,
    active_signals INTEGER,
    completed_signals INTEGER,
    win_rate DECIMAL(5,2),
    avg_confidence DECIMAL(5,2),
    avg_risk_reward DECIMAL(10,2),
    total_pnl DECIMAL(20,8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_signals,
        COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_signals,
        COUNT(*) FILTER (WHERE status IN ('hit_tp', 'hit_sl', 'expired'))::INTEGER as completed_signals,
        COALESCE(
            (COUNT(*) FILTER (WHERE status = 'hit_tp')::DECIMAL / 
             NULLIF(COUNT(*) FILTER (WHERE status IN ('hit_tp', 'hit_sl')), 0)) * 100,
            0
        ) as win_rate,
        COALESCE(AVG(confidence), 0) as avg_confidence,
        COALESCE(AVG(risk_reward), 0) as avg_risk_reward,
        COALESCE(SUM(realized_pnl), 0) as total_pnl
    FROM signals 
    WHERE created_at >= start_date;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_levels_updated_at BEFORE UPDATE ON levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create initial admin user (replace with your email)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@pulsewave.app',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert the user into our users table
INSERT INTO users (id, email, name, role, subscription_tier, subscription_status)
SELECT 
    id,
    email,
    'Admin User',
    'admin'::user_role,
    'tsunami'::subscription_tier,
    'active'::subscription_status
FROM auth.users 
WHERE email = 'admin@pulsewave.app'
ON CONFLICT (email) DO NOTHING;
```

### 2.3 Configure Authentication

In Supabase Dashboard:
1. Go to Authentication → Settings
2. Enable email confirmations
3. Set up redirect URLs:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/auth/callback`

## Step 3: Set Up Stripe

### 3.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account and get API keys
3. Create products and prices:

```bash
# Use Stripe CLI or Dashboard to create products
stripe products create --name="Pulse" --description="Basic trading signals"
stripe prices create --product=prod_xxx --unit-amount=4900 --currency=usd --recurring[interval]=month

stripe products create --name="Wave" --description="Advanced trading platform"
stripe prices create --product=prod_xxx --unit-amount=9900 --currency=usd --recurring[interval]=month

stripe products create --name="Tsunami" --description="Professional trading suite"
stripe prices create --product=prod_xxx --unit-amount=19900 --currency=usd --recurring[interval]=month
```

## Step 4: Set Up Redis (Upstash)

1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Get connection URL and token

## Step 5: Deploy Backend to Railway

### 5.1 Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create new project and select the `api` folder

### 5.2 Configure Environment Variables

Add these environment variables in Railway:

```bash
NODE_ENV=production
API_PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

JWT_SECRET=your_32_character_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret

ENABLE_RATE_LIMITING=true
ENABLE_REQUEST_LOGGING=true
```

### 5.3 Deploy

Railway will automatically deploy when you push to main branch.

## Step 6: Deploy Frontend to Vercel

### 6.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `web` folder as root directory

### 6.2 Configure Environment Variables

Add these environment variables in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

NEXT_PUBLIC_API_URL=https://your-railway-api-url.railway.app
NEXT_PUBLIC_APP_URL=https://yourdomain.com

NEXTAUTH_SECRET=your_nextauth_secret
```

### 6.3 Configure Build Settings

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Step 7: Set Up Domain and SSL

### 7.1 Configure Custom Domain

1. In Vercel: Project Settings → Domains
2. Add your domain name
3. Configure DNS records as instructed

### 7.2 Set up API Subdomain

1. In Railway: Project → Settings → Domains
2. Add `api.yourdomain.com`
3. Update environment variables with new API URL

## Step 8: Configure Webhooks

### 8.1 Stripe Webhooks

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.yourdomain.com/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 8.2 Update Environment Variables

Update `STRIPE_WEBHOOK_SECRET` with the signing secret from Stripe.

## Step 9: Test Deployment

### 9.1 Health Checks

- Frontend: `https://yourdomain.com`
- API: `https://api.yourdomain.com/health`
- Database: Check Supabase dashboard

### 9.2 Functionality Tests

1. Sign up flow
2. Login/logout
3. Subscription creation
4. WebSocket connections
5. Signal display
6. Trade journaling

## Step 10: Monitoring and Analytics

### 10.1 Set up Sentry (Optional)

```bash
# Add to environment variables
SENTRY_DSN=your_sentry_dsn
```

### 10.2 Set up Analytics

```bash
# Add to environment variables
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

## Step 11: Performance Optimization

### 11.1 Enable CDN

Vercel automatically provides CDN for static assets.

### 11.2 Database Optimization

- Monitor slow queries in Supabase
- Add additional indexes as needed
- Set up connection pooling

### 11.3 API Optimization

- Enable compression (already configured)
- Implement proper caching strategies
- Monitor response times

## Maintenance

### Daily Tasks

- Monitor application health
- Check error rates
- Review user signups

### Weekly Tasks

- Review database performance
- Check API usage patterns
- Update dependencies

### Monthly Tasks

- Security updates
- Performance analysis
- Feature usage analysis

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check ALLOWED_ORIGINS environment variable
2. **Database Connection**: Verify Supabase URL and keys
3. **WebSocket Issues**: Check Railway domain configuration
4. **Payment Issues**: Verify Stripe webhook endpoints

### Logs and Monitoring

- Vercel: Function logs in dashboard
- Railway: Application logs in dashboard  
- Supabase: Query logs and metrics
- Stripe: Webhook delivery logs

---

## 🎉 Congratulations!

Your PulseWave trading platform is now deployed and ready for users!

**Next Steps:**
1. Set up monitoring and alerts
2. Create comprehensive tests
3. Implement CI/CD pipeline
4. Plan for scaling as user base grows

**Support:**
- Check the README.md for development instructions
- Monitor error logs for issues
- Set up customer support channels