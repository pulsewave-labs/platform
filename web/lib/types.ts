// Trading types
export type Direction = 'LONG' | 'SHORT'
export type SignalStatus = 'active' | 'pending' | 'filled' | 'cancelled'
export type TradeStatus = 'open' | 'closed' | 'pending'
export type ImpactLevel = 'HIGH' | 'MED' | 'LOW'
export type Trend = 'up' | 'down' | 'neutral'
export type IconType = 'dollar' | 'percent' | 'chart' | 'trades'

export interface Signal {
  id: string
  pair: string
  direction: Direction
  entry: number
  stopLoss: number
  takeProfit: number
  confidence: number
  timeframe: string
  status: SignalStatus
  riskReward: number
  reasoning?: string
  createdAt?: string
}

export interface Trade {
  id: string
  pair: string
  direction: Direction
  entryPrice: number
  exitPrice?: number
  stopLoss: number
  takeProfit?: number
  positionSize: number
  pnl?: number
  rMultiple?: number
  status: TradeStatus
  entryTime: string
  exitTime?: string
  duration?: string
  notes?: string
  strategy?: string
  timeframe?: string
  unrealizedPnL?: number
}

export interface NewsItem {
  id: string
  title: string
  content?: string
  impact: ImpactLevel
  timeAgo: string
  category: string
  createdAt?: string
}

export interface JournalStats {
  totalPnL: number
  totalPnLChange?: string
  winRate: number
  avgRMultiple: number
  profitFactor: number
  totalTrades: number
  openTrades?: number
  winningTrades?: number
  portfolioValue?: number
  portfolioChange?: string
  dailyPnL?: number
  drawdown?: number
}

export interface StatCard {
  title: string
  value: string
  change: string
  trend: Trend
  icon: IconType
}

export interface PortfolioSnapshot {
  date: string
  value: number
  pnl: number
  equity: number
}

export interface Settings {
  profile?: {
    fullName: string
    email: string
    timezone: string
    tradingStyle: string
  }
  notifications?: {
    signals: boolean
    trades: boolean
    news: boolean
    risk: boolean
    email: boolean
    push: boolean
  }
  riskParams?: {
    maxRiskPerTrade: string
    maxDailyLoss: string
    maxPositions: string
    autoStopTrading: boolean
    requireConfirmation: boolean
  }
  accountSize?: number
  maxRiskPerTrade?: number
  maxDailyLoss?: number
  maxPositions?: number
}

export interface RiskCalculationParams {
  accountSize: number
  riskPercent: number
  entryPrice: number
  stopLoss: number
}

export interface RiskCalculationResult {
  positionSize: string
  riskAmount: string
  priceRisk: string
  riskRewardRatio?: number
}