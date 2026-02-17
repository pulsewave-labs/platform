# PulseWave Labs — Trading Platform

A complete AI-powered trading command center with real-time signals, automated journaling, risk management, and market intelligence.

## 🚀 Features

- **AI-Powered Signals** — High-confidence trading signals with confluence analysis
- **Auto-Journaling** — Automatic trade logging with exchange integration
- **Risk Management** — Real-time portfolio heat monitoring and position sizing
- **Market Intelligence** — AI-filtered news feed and market regime detection
- **TradingView Charts** — Advanced charting with S/R levels and signal overlays
- **Real-time Updates** — WebSocket-powered live data and notifications

## 🛠 Tech Stack

### Frontend (`web/`)
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase Auth**
- **TradingView Lightweight Charts**
- **Stripe** (payments)

### Backend (`api/`)
- **Express.js** (TypeScript)
- **WebSocket** (real-time data)
- **Supabase** (database)
- **Redis** (caching/rate limiting)
- **Binance API** (exchange integration)
- **Stripe** (webhooks)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- Docker & Docker Compose (for local development)

### 1. Clone & Install
```bash
git clone <repo>
cd pulsewave-platform
npm install
```

### 2. Environment Setup
```bash
# Copy environment files
cp web/.env.example web/.env.local
cp api/.env.example api/.env

# Fill in your API keys and database URLs
# See DEPLOY.md for detailed setup instructions
```

### 3. Start Development Services
```bash
# Start local database & Redis
docker-compose up -d

# Start both web & API in development mode
npm run dev
```

### 4. Open in Browser
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📦 Project Structure

```
├── web/                 # Next.js frontend
│   ├── app/            # App router pages
│   ├── components/     # React components
│   ├── lib/           # Utilities & clients
│   └── types/         # TypeScript types
├── api/                # Express backend
│   ├── src/           # Source code
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   ├── middleware/ # Express middleware
│   │   └── ws/        # WebSocket handlers
│   └── Dockerfile     # Docker config
├── docker-compose.yml  # Local development stack
└── DEPLOY.md          # Deployment guide
```

## 🚀 Deployment

See [DEPLOY.md](./DEPLOY.md) for complete deployment instructions:
- Frontend: Vercel
- Backend: Railway
- Database: Supabase
- Payments: Stripe

## 📖 Development

### Commands
```bash
npm run dev          # Start both web & API in dev mode
npm run dev:web      # Start only frontend
npm run dev:api      # Start only backend
npm run build        # Build both applications
npm run type-check   # Run TypeScript checks
```

### Environment Variables
See individual `.env.example` files in `web/` and `api/` directories.

### Database Schema
Database migrations and schema can be found in `DEPLOY.md`.

## 🤖 AI Signal Engine

The platform integrates with a Python-based signal generation engine. Signals include:
- Entry/exit levels
- Stop loss & take profit
- Confidence scores
- Market regime analysis
- Risk-reward ratios

## 📊 Real-time Features

- Live price updates
- Signal notifications
- News feed updates
- Trade execution alerts
- Risk threshold warnings

## 🛡️ Security

- Supabase Row Level Security (RLS)
- JWT-based authentication
- API rate limiting
- Webhook signature verification
- Environment variable encryption

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

## 📝 License

Proprietary — PulseWave Labs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Need Help?** Check our [documentation](./docs/) or open an issue.
