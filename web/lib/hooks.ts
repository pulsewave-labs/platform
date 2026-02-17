import { useState, useEffect, useCallback } from 'react'
import { api } from './api'

interface UseDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

// Generic data fetching hook with optional key extraction
function useData<T>(path: string | null, initialData: T | null = null, extractKey?: string): UseDataResult<T> {
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
      // Extract nested key if specified (e.g., { signals: [...] } → [...])
      const extracted = extractKey && result && typeof result === 'object' && extractKey in result 
        ? result[extractKey] 
        : result
      setData(extracted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [path, extractKey])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Signals hook — API returns { signals: [...], meta: {...} }
export function useSignals(params?: { pair?: string; direction?: string; timeframe?: string; limit?: number }) {
  const queryString = params ? new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== 'ALL')
      .map(([k, v]) => [k, String(v)])
  ).toString() : ''
  
  const path = `/api/signals${queryString ? `?${queryString}` : ''}`
  return useData<any[]>(path, [], 'signals')
}

// Journal hooks — API returns { entries: [...] } or { journal: [...] }
export function useJournal(params?: { status?: string; pair?: string; limit?: number; offset?: number }) {
  const queryString = params ? new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([k, v]) => [k, String(v)])
  ).toString() : ''
  
  const path = `/api/journal${queryString ? `?${queryString}` : ''}`
  // API might return { entries: [...] } or { journal: [...] } or just [...] 
  // We use a smart extractor
  const result = useData<any>(path, null)
  
  return {
    ...result,
    data: result.data 
      ? (Array.isArray(result.data) ? result.data : result.data.entries || result.data.journal || result.data.data || [])
      : []
  }
}

export function useJournalStats() {
  const result = useData<any>('/api/journal/stats')
  return {
    ...result,
    data: result.data?.stats || result.data || null
  }
}

// Portfolio hook — API returns { snapshots: [...] } or just [...]
export function usePortfolio(days: number = 30) {
  const result = useData<any>(`/api/portfolio?days=${days}`, null)
  return {
    ...result,
    data: result.data 
      ? (Array.isArray(result.data) ? result.data : result.data.snapshots || result.data.data || [])
      : []
  }
}

// Market data hooks — API returns { prices: { BITCOIN: {...}, ... } }
export function useMarketPrices(symbols?: string[]) {
  const path = symbols?.length 
    ? `/api/market/prices?symbols=${symbols.join(',')}`
    : '/api/market/prices?symbols=bitcoin,ethereum,solana'
  return useData<any>(path, {}, 'prices')
}

// News hook — API returns { news: [...], meta: {...} }
export function useNews(category?: string) {
  const path = category && category !== 'All' 
    ? `/api/market/news?category=${category}`
    : '/api/market/news'
  return useData<any[]>(path, [], 'news')
}

// Settings hook
export function useSettings() {
  const result = useData<any>('/api/settings')
  
  // Extract settings from possible wrapper
  const settings = result.data?.settings || result.data

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
    data: settings,
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

  return { createTrade, updateTrade, deleteTrade, loading }
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

  return { calculateRisk, loading }
}
