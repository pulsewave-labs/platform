import { useState, useEffect, useCallback } from 'react'
import { api } from './api'

interface UseDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

// Generic data fetching hook
function useData<T>(path: string | null, initialData: T | null = null): UseDataResult<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!path) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await api.get(path)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Keep existing data on error for graceful degradation
    } finally {
      setLoading(false)
    }
  }, [path])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Signals hook
export function useSignals(params?: { pair?: string; direction?: string; timeframe?: string; limit?: number }) {
  const queryString = params ? new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== 'ALL')
  ).toString() : ''
  
  const path = `/api/signals${queryString ? `?${queryString}` : ''}`
  return useData<any[]>(path, [])
}

// Journal hooks
export function useJournal(params?: { status?: string; pair?: string; limit?: number; offset?: number }) {
  const queryString = params ? new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  ).toString() : ''
  
  const path = `/api/journal${queryString ? `?${queryString}` : ''}`
  return useData<any[]>(path, [])
}

export function useJournalStats() {
  return useData<{
    totalPnL: number
    winRate: number
    avgRMultiple: number
    profitFactor: number
    totalTrades: number
  }>('/api/journal/stats')
}

// Portfolio hook
export function usePortfolio(days: number = 30) {
  return useData<any[]>(`/api/portfolio?days=${days}`, [])
}

// Market data hooks
export function useMarketPrices(symbols?: string[]) {
  const path = symbols?.length 
    ? `/api/market/prices?symbols=${symbols.join(',')}`
    : '/api/market/prices'
  return useData<Record<string, number>>(path, {})
}

export function useNews(category?: string) {
  const path = category && category !== 'All' 
    ? `/api/market/news?category=${category}`
    : '/api/market/news'
  return useData<any[]>(path, [])
}

// Settings hook
export function useSettings() {
  const result = useData<any>('/api/settings')
  
  const updateSettings = useCallback(async (updates: any) => {
    try {
      const updated = await api.patch('/api/settings', updates)
      result.refetch()
      return updated
    } catch (error) {
      throw error
    }
  }, [result])

  return {
    ...result,
    updateSettings
  }
}

// Journal mutations
export function useJournalMutations() {
  const [loading, setLoading] = useState(false)

  const createTrade = useCallback(async (trade: any) => {
    setLoading(true)
    try {
      const result = await api.post('/api/journal', trade)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTrade = useCallback(async (id: string, updates: any) => {
    setLoading(true)
    try {
      const result = await api.patch(`/api/journal/${id}`, updates)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTrade = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await api.delete(`/api/journal/${id}`)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createTrade,
    updateTrade,
    deleteTrade,
    loading
  }
}

// Risk calculation hook
export function useRiskCalculation() {
  const [loading, setLoading] = useState(false)

  const calculateRisk = useCallback(async (params: {
    accountSize: number
    riskPercent: number
    entryPrice: number
    stopLoss: number
  }) => {
    setLoading(true)
    try {
      const result = await api.post('/api/risk/calculate', params)
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    calculateRisk,
    loading
  }
}