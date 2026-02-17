// Core types for the PulseWave trading platform

export type Regime = 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'VOLATILE'

export type SignalDirection = 'LONG' | 'SHORT'

export type SignalStatus = 'active' | 'hit_tp' | 'hit_sl' | 'expired' | 'pending'

export type SubscriptionTier = 'pulse' | 'wave' | 'tsunami'

export type NewsImpact = 'low' | 'medium' | 'high'

export type RiskLevel = 'low' | 'medium' | 'high'

export type TradeStatus = 'open' | 'closed' | 'pending'

export type OrderType = 'market' | 'limit' | 'stop'

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w'

// Signal interface
export interface Signal {
  id: string
  pair: string
  direction: SignalDirection
  entry: number
  stopLoss: number
  takeProfit: number
  confidence: number // 0-100
  regime: Regime
  reasoning: string
  factors: SignalFactor[]
  timeframe: Timeframe
  createdAt: string
  updatedAt: string
  status: SignalStatus
  riskReward: number
  tags?: string[]
}

export interface SignalFactor {
  name: string
  score: number // -100 to 100
  weight: number // 0-1
  description?: string
}

// Trade interface
export interface Trade {
  id: string
  userId: string
  signalId?: string
  pair: string
  direction: SignalDirection
  orderType: OrderType
  entryPrice: number
  exitPrice?: number
  quantity: number
  stopLoss?: number
  takeProfit?: number
  realizedPnL?: number
  unrealizedPnL?: number
  fees: number
  status: TradeStatus
  openedAt: string
  closedAt?: string
  notes?: string
  tags?: string[]
  exchange?: string
  rMultiple?: number
}

// News interface
export interface NewsItem {
  id: string
  title: string
  content: string
  source: string
  impact: NewsImpact
  publishedAt: string
  url: string
  pairs: string[]
  sentiment: number // -1 to 1
  relevanceScore: number // 0-1
  category: string
  tags?: string[]
}

// Market levels interface
export interface Level {
  id: string
  pair: string
  type: 'support' | 'resistance'
  price: number
  strength: number // 1-5
  timeframe: Timeframe
  touches: number
  lastTouch: string
  isActive: boolean
  notes?: string
}

// Market data interface
export interface MarketData {
  pair: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap?: number
  lastUpdated: string
}

// OHLCV candle data
export interface CandleData {
  time: number // Unix timestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// User interface
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  subscriptionTier: SubscriptionTier
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing'
  trialEndsAt?: string
  createdAt: string
  preferences: UserPreferences
  stats: UserStats
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  notifications: {
    signals: boolean
    trades: boolean
    news: boolean
    riskAlerts: boolean
  }
  riskSettings: {
    maxDailyLoss: number
    maxPositions: number
    maxPositionSize: number
  }
  tradingSettings: {
    defaultQuantity: number
    autoStopLoss: boolean
    autoTakeProfit: boolean
  }
}

export interface UserStats {
  totalTrades: number
  winRate: number
  profitFactor: number
  totalPnL: number
  bestTrade: number
  worstTrade: number
  averageRMultiple: number
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
  sharpeRatio?: number
}

// Portfolio interface
export interface Portfolio {
  id: string
  userId: string
  totalValue: number
  cashBalance: number
  positions: Position[]
  dailyPnL: number
  weeklyPnL: number
  monthlyPnL: number
  riskUsed: number // 0-1
  openPositions: number
  lastUpdated: string
}

export interface Position {
  id: string
  pair: string
  side: SignalDirection
  size: number
  entryPrice: number
  currentPrice: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  riskAmount: number
  stopLoss?: number
  takeProfit?: number
  openedAt: string
}

// Risk management
export interface RiskMetrics {
  portfolioHeat: number // 0-1
  dailyVaR: number
  maxDrawdown: number
  currentDrawdown: number
  sharpeRatio: number
  correlationRisk: RiskLevel
  positionSizing: number
  tiltScore: number // -100 to 100
}

// WebSocket message types
export interface WSMessage {
  type: string
  data: any
  timestamp: string
}

export interface SignalUpdate extends WSMessage {
  type: 'signal_update'
  data: Partial<Signal>
}

export interface PriceUpdate extends WSMessage {
  type: 'price_update'
  data: {
    pair: string
    price: number
    change: number
  }
}

export interface NewsUpdate extends WSMessage {
  type: 'news_update'
  data: NewsItem
}

export interface TradeUpdate extends WSMessage {
  type: 'trade_update' 
  data: Partial<Trade>
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  name: string
}

export interface TradeForm {
  pair: string
  direction: SignalDirection
  orderType: OrderType
  quantity: number
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  notes?: string
}

// Chart configuration
export interface ChartConfig {
  pair: string
  timeframe: Timeframe
  indicators: string[]
  showLevels: boolean
  showSignals: boolean
  theme: 'light' | 'dark'
}

// Subscription plans
export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    signals: number
    trades: number
    pairs: number
  }
  stripePriceId: string
}

export default {}