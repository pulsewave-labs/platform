import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Number formatting utilities
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPrice(price: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price)
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatRMultiple(rMultiple: number): string {
  const sign = rMultiple >= 0 ? '+' : ''
  return `${sign}${rMultiple.toFixed(1)}R`
}

// Date/time utilities
export function formatDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, 'MMM dd, yyyy')
}

export function formatDateTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, 'MMM dd, yyyy • h:mm a')
}

export function formatTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, 'h:mm a')
}

export function formatTimeAgo(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(parsedDate, { addSuffix: true })
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Trading utilities
export function calculatePnL(
  entry: number,
  exit: number,
  quantity: number,
  direction: 'LONG' | 'SHORT'
): number {
  if (direction === 'LONG') {
    return (exit - entry) * quantity
  } else {
    return (entry - exit) * quantity
  }
}

export function calculateRMultiple(
  entry: number,
  exit: number,
  stopLoss: number,
  direction: 'LONG' | 'SHORT'
): number {
  const riskAmount = Math.abs(entry - stopLoss)
  const profit = calculatePnL(entry, exit, 1, direction)
  return profit / riskAmount
}

export function calculateWinRate(trades: { realizedPnL?: number }[]): number {
  const completedTrades = trades.filter(t => t.realizedPnL !== undefined)
  if (completedTrades.length === 0) return 0
  
  const winningTrades = completedTrades.filter(t => (t.realizedPnL || 0) > 0)
  return (winningTrades.length / completedTrades.length) * 100
}

export function calculateProfitFactor(trades: { realizedPnL?: number }[]): number {
  const completedTrades = trades.filter(t => t.realizedPnL !== undefined)
  
  let totalProfit = 0
  let totalLoss = 0
  
  completedTrades.forEach(trade => {
    const pnl = trade.realizedPnL || 0
    if (pnl > 0) {
      totalProfit += pnl
    } else {
      totalLoss += Math.abs(pnl)
    }
  })
  
  return totalLoss === 0 ? (totalProfit > 0 ? Infinity : 0) : totalProfit / totalLoss
}

// Risk management utilities
export function calculatePositionSize(
  accountBalance: number,
  riskPercentage: number,
  entry: number,
  stopLoss: number
): number {
  const riskAmount = accountBalance * (riskPercentage / 100)
  const riskPerShare = Math.abs(entry - stopLoss)
  return riskAmount / riskPerShare
}

export function calculateRiskReward(
  entry: number,
  stopLoss: number,
  takeProfit: number,
  direction: 'LONG' | 'SHORT'
): number {
  const risk = Math.abs(entry - stopLoss)
  const reward = Math.abs(takeProfit - entry)
  return reward / risk
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password)
}

export function isValidTradingPair(pair: string): boolean {
  // Basic validation for trading pairs like BTC/USDT, ETH/USD, etc.
  const pairRegex = /^[A-Z]{2,10}\/[A-Z]{2,10}$/
  return pairRegex.test(pair)
}

// Color utilities for trading
export function getPnLColor(pnl: number): string {
  if (pnl > 0) return 'text-long-400'
  if (pnl < 0) return 'text-short-400'
  return 'text-dark-accent'
}

export function getRegimeColor(regime: string): string {
  switch (regime) {
    case 'TRENDING_UP':
    case 'TRENDING_DOWN':
      return 'text-trending'
    case 'RANGING':
      return 'text-ranging'
    case 'VOLATILE':
      return 'text-volatile'
    default:
      return 'text-dark-accent'
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 75) return 'text-long-400'
  if (confidence >= 50) return 'text-yellow-400'
  return 'text-short-400'
}

// Chart utilities
export function generateChartColors() {
  return {
    up: '#4ade80',      // Long/green
    down: '#f87171',    // Short/red
    volume: '#6b7280',  // Muted
    grid: '#1b2332',    // Border
    text: '#9ca3af',    // Accent text
    background: '#0d1117', // Surface
  }
}

// WebSocket utilities
export function createWebSocketUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const wsUrl = baseUrl.replace(/^http/, 'ws')
  return `${wsUrl}${path}`
}

// URL utilities
export function createShareableUrl(path: string, params?: Record<string, string>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = new URL(path, baseUrl)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  
  return url.toString()
}

// Local storage utilities (client-side only)
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

// Trading pair utilities
export function parseTradingPair(pair: string): { base: string; quote: string } {
  const [base, quote] = pair.split('/')
  return { base: base || '', quote: quote || '' }
}

export function formatTradingPair(base: string, quote: string): string {
  return `${base}/${quote}`
}

// Sleep utility for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  cn,
  formatCurrency,
  formatPrice,
  formatPercentage,
  formatLargeNumber,
  formatRMultiple,
  formatDate,
  formatDateTime,
  formatTime,
  formatTimeAgo,
  formatDuration,
  calculatePnL,
  calculateRMultiple,
  calculateWinRate,
  calculateProfitFactor,
  calculatePositionSize,
  calculateRiskReward,
  isValidEmail,
  isValidPassword,
  isValidTradingPair,
  getPnLColor,
  getRegimeColor,
  getConfidenceColor,
  generateChartColors,
  createWebSocketUrl,
  createShareableUrl,
  getLocalStorageItem,
  setLocalStorageItem,
  debounce,
  getErrorMessage,
  parseTradingPair,
  formatTradingPair,
  sleep,
}