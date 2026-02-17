# PulseWave Labs API Documentation

This is the complete backend API for the PulseWave Labs trading platform built with Next.js 14 App Router.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via Supabase JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

Or rely on cookie-based session authentication from the Supabase client.

## Error Responses
All endpoints return consistent error responses:
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 1. Signals API

### GET `/api/signals`
Fetch active trading signals (public endpoint).

**Query Parameters:**
- `pair` (optional) - Filter by trading pair (e.g., "BTC/USDT")
- `direction` (optional) - Filter by direction ("LONG" or "SHORT")  
- `timeframe` (optional) - Filter by timeframe (e.g., "4h")
- `status` (optional) - Filter by status (default: "active")
- `limit` (optional) - Number of results (default: 20, max: 100)

**Response:**
```json
{
  "signals": [
    {
      "id": "uuid",
      "pair": "BTC/USDT",
      "direction": "LONG",
      "timeframe": "4h",
      "entry_price": 50000,
      "stop_loss": 48000,
      "take_profit": 54000,
      "confidence": 85,
      "status": "active",
      "reasoning": "Strong support level bounce...",
      "factors": {},
      "risk_reward_ratio": 2.0,
      "price_to_stop": 4.0,
      "price_to_target": 8.0,
      "created_at": "2024-01-01T00:00:00Z",
      "expires_at": "2024-01-02T00:00:00Z"
    }
  ],
  "meta": {
    "count": 10,
    "filters": {},
    "limit": 20
  }
}
```

---

## 2. Journal API

### GET `/api/journal`
Get user's trading journal entries (requires auth).

**Query Parameters:**
- `status` (optional) - Filter by status ("open", "closed", "cancelled")
- `pair` (optional) - Filter by trading pair
- `strategy` (optional) - Filter by strategy
- `tags` (optional) - Comma-separated tag filters
- `limit` (optional) - Number of results (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "trades": [
    {
      "id": "uuid",
      "pair": "BTC/USDT", 
      "direction": "LONG",
      "entry_price": 50000,
      "exit_price": 52000,
      "stop_loss": 48000,
      "take_profit": 54000,
      "position_size": 0.1,
      "pnl": 200,
      "pnl_percent": 4.0,
      "r_multiple": 1.0,
      "fees": 10,
      "status": "closed",
      "timeframe": "4h",
      "strategy": "Support Bounce",
      "setup_type": "Reversal",
      "notes": "Good entry at support",
      "tags": ["crypto", "swing"],
      "screenshots": [],
      "entry_date": "2024-01-01T10:00:00Z",
      "exit_date": "2024-01-01T14:00:00Z",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T14:00:00Z"
    }
  ],
  "meta": {
    "count": 25,
    "limit": 50,
    "offset": 0,
    "filters": {}
  }
}
```

### POST `/api/journal`
Create a new journal entry (requires auth).

**Request Body:**
```json
{
  "pair": "BTC/USDT",
  "direction": "LONG",
  "entry_price": 50000,
  "stop_loss": 48000,
  "take_profit": 54000,
  "position_size": 0.1,
  "timeframe": "4h",
  "strategy": "Support Bounce",
  "setup_type": "Reversal", 
  "notes": "Strong support level",
  "tags": ["crypto", "swing"],
  "entry_date": "2024-01-01T10:00:00Z"
}
```

**Response:** Single trade object (201 Created)

---

## 3. Individual Journal Entry

### GET `/api/journal/[id]`
Get a specific journal entry (requires auth).

**Response:** Single trade object

### PATCH `/api/journal/[id]`
Update a journal entry (requires auth).

**Request Body:** Partial trade object with fields to update

### DELETE `/api/journal/[id]`
Delete a journal entry (requires auth).

**Response:**
```json
{
  "message": "Trade deleted successfully"
}
```

---

## 4. Journal Statistics

### GET `/api/journal/stats`
Get comprehensive trading statistics (requires auth).

**Response:**
```json
{
  "stats": {
    "total_pnl": 1250.50,
    "total_pnl_percent": 12.51,
    "win_rate": 65.5,
    "profit_factor": 1.8,
    "avg_r_multiple": 1.2,
    "total_trades": 45,
    "closed_trades": 40,
    "open_trades": 5,
    "winning_trades": 26,
    "losing_trades": 12,
    "break_even_trades": 2,
    "avg_win": 150.25,
    "avg_loss": -85.50,
    "best_trade": 425.00,
    "worst_trade": -180.00,
    "current_streak": 3,
    "max_win_streak": 7,
    "max_loss_streak": 3,
    "avg_trade_duration": 2.5,
    "risk_reward_ratio": 1.85,
    "expectancy": 28.75,
    "gross_profit": 3900.50,
    "gross_loss": 1026.00
  }
}
```

---

## 5. User Settings

### GET `/api/settings`
Get user settings, create defaults if none exist (requires auth).

**Response:**
```json
{
  "settings": {
    "id": "uuid",
    "user_id": "uuid",
    "risk_per_trade": 2.0,
    "max_daily_loss": 5.0,
    "max_positions": 3,
    "default_timeframe": "4h",
    "preferred_pairs": ["BTC/USDT", "ETH/USDT"],
    "notifications": {
      "email": true,
      "push": false,
      "signals": true,
      "risk_alerts": true
    },
    "exchanges": [],
    "theme": "dark",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH `/api/settings`
Update user settings (requires auth).

**Request Body:** Partial settings object

---

## 6. Portfolio API

### GET `/api/portfolio`
Get portfolio snapshots for equity curve (requires auth).

**Query Parameters:**
- `days` (optional) - Number of days to retrieve (default: 30)

**Response:**
```json
{
  "snapshots": [
    {
      "date": "2024-01-01",
      "balance": 10500.00,
      "pnl": 250.00,
      "trades_count": 3,
      "win_count": 2,
      "daily_change": 250.00,
      "daily_change_percent": 2.44,
      "win_rate": 66.67,
      "created_at": "2024-01-01T23:59:59Z"
    }
  ],
  "summary": {
    "total_return": 1500.00,
    "total_return_percent": 15.0,
    "starting_balance": 10000.00,
    "current_balance": 11500.00,
    "total_trades": 45,
    "total_wins": 28,
    "days_active": 20,
    "best_day": {...},
    "worst_day": {...}
  },
  "meta": {
    "days": 30
  }
}
```

### POST `/api/portfolio/snapshot`
Create or update daily portfolio snapshot (requires auth).

**Request Body:**
```json
{
  "date": "2024-01-01",
  "starting_balance": 10000
}
```

**Response:** Snapshot object with calculated metrics

---

## 7. Market Data

### GET `/api/market/prices`
Get live cryptocurrency prices from CoinGecko.

**Query Parameters:**
- `symbols` (optional) - Comma-separated symbols (default: "bitcoin,ethereum")
- `currency` (optional) - Base currency (default: "usd")

**Response:**
```json
{
  "prices": {
    "BTC": {
      "price": 50000.00,
      "price_change_24h": 2.5,
      "market_cap": 980000000000,
      "volume_24h": 25000000000,
      "symbol": "BTC",
      "currency": "USD",
      "last_updated": "2024-01-01T12:00:00Z"
    }
  },
  "meta": {
    "currency": "USD",
    "timestamp": "2024-01-01T12:00:00Z", 
    "cache_duration_seconds": 30,
    "source": "coingecko",
    "summary": {
      "total_symbols": 2,
      "valid_symbols": 2,
      "total_market_cap": 1200000000000,
      "average_24h_change": 1.8
    }
  }
}
```

### GET `/api/market/news`
Get latest cryptocurrency news.

**Query Parameters:**
- `limit` (optional) - Number of articles (default: 20)
- `impact` (optional) - Filter by impact ("high", "medium", "low")
- `source` (optional) - Filter by news source

**Response:**
```json
{
  "news": [
    {
      "id": "uuid",
      "title": "Bitcoin Reaches New All-Time High",
      "summary": "Bitcoin has surged past $75,000...",
      "url": "https://example.com/news/btc-ath",
      "source": "CoinDesk",
      "impact": "high",
      "category": "price",
      "related_pairs": ["BTC/USDT"],
      "published_at": "2024-01-01T10:00:00Z",
      "created_at": "2024-01-01T10:05:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "limit": 20,
    "filters": {},
    "cached": false,
    "timestamp": "2024-01-01T12:00:00Z",
    "sources": ["database", "cryptopanic", "coindesk"]
  }
}
```

---

## 8. Risk Calculator

### POST `/api/risk/calculate`
Calculate position size and risk metrics.

**Request Body:**
```json
{
  "account_size": 10000,
  "risk_percent": 2,
  "entry_price": 50000,
  "stop_loss": 48000,
  "direction": "LONG",
  "leverage": 1,
  "fees_percent": 0.1
}
```

**Response:**
```json
{
  "position_size": 0.1,
  "position_value": 5000.00,
  "risk_amount": 200.00,
  "potential_loss": 200.00,
  "potential_loss_with_fees": 210.00,
  "stop_loss_distance": 2000.00,
  "stop_loss_distance_percent": 4.0,
  "take_profit": 54000.00,
  "potential_profit": 400.00,
  "risk_reward_ratio": 2.0,
  "r_multiple": 2.0,
  "fees": {
    "entry_fee": 5.00,
    "exit_fee": 4.80,
    "total_fees": 9.80
  },
  "warnings": []
}
```

### GET `/api/risk/calculate`
Get API documentation and example usage.

---

## Rate Limits & Caching

- **Price data**: Cached for 30 seconds
- **News data**: Cached for 5 minutes  
- **No authentication required**: Signals, prices, news, risk calculator
- **Authentication required**: Journal, settings, portfolio

## Database Schema

The API uses Supabase PostgreSQL with Row Level Security (RLS) enabled. Key tables:

- `trades` - User trading journal
- `signals` - Trading signals 
- `user_settings` - User preferences
- `portfolio_snapshots` - Daily portfolio snapshots
- `user_signals` - User signal interactions
- `news` - Cached news articles
- `profiles` - User profile data

## Development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and configure
3. Run migrations in Supabase SQL editor
4. Start development server: `npm run dev`

## Deployment

The API is designed for deployment on Vercel with automatic scaling and edge caching.