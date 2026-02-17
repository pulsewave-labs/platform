'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { 
  createChart, 
  IChartApi, 
  ISeriesApi,
  CandlestickData,
  LineData,
  UTCTimestamp,
  ColorType,
  CrosshairMode,
  LineStyle,
  PriceScaleMode
} from 'lightweight-charts'
import { cn } from '@/lib/utils'
import type { CandleData, Signal, Level, Timeframe } from '@/types'

interface TradingChartProps {
  className?: string
  height?: number
  pair: string
  timeframe: Timeframe
  data: CandleData[]
  signals?: Signal[]
  levels?: Level[]
  showVolume?: boolean
  showGrid?: boolean
  onTimeframeChange?: (timeframe: Timeframe) => void
  onCrosshairMove?: (price: number, time: number) => void
}

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
]

export default function TradingChart({
  className,
  height = 400,
  pair,
  timeframe,
  data,
  signals = [],
  levels = [],
  showVolume = true,
  showGrid = true,
  onTimeframeChange,
  onCrosshairMove,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)

  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return

    // Create chart with dark theme
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: '#0d1117' 
        },
        textColor: '#9ca3af',
        fontSize: 12,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      },
      grid: {
        vertLines: { 
          color: showGrid ? '#1b2332' : 'transparent',
          style: LineStyle.Dashed,
        },
        horzLines: { 
          color: showGrid ? '#1b2332' : 'transparent',
          style: LineStyle.Dashed,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#00F0B5',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: '#00F0B5',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: '#1b2332',
        mode: PriceScaleMode.Normal,
        autoScale: true,
      },
      timeScale: {
        borderColor: '#1b2332',
        rightOffset: 20,
        barSpacing: 8,
        minBarSpacing: 4,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })

    chartRef.current = chart

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#4ade80',
      downColor: '#f87171',
      borderDownColor: '#f87171',
      borderUpColor: '#4ade80',
      wickDownColor: '#f87171',
      wickUpColor: '#4ade80',
    })

    candlestickSeriesRef.current = candlestickSeries

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#6b7280',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      })

      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })

      volumeSeriesRef.current = volumeSeries
    }

    // Handle crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (param.point && param.time) {
        const price = param.seriesData.get(candlestickSeries) as CandlestickData
        if (price && onCrosshairMove) {
          onCrosshairMove(price.close, param.time as number)
        }
      }
    })

    return chart
  }, [height, showVolume, showGrid, onCrosshairMove])

  // Convert our data format to lightweight-charts format
  const formatCandleData = useCallback((data: CandleData[]): CandlestickData[] => {
    return data.map(candle => ({
      time: candle.time as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))
  }, [])

  const formatVolumeData = useCallback((data: CandleData[]): LineData[] => {
    return data.map(candle => ({
      time: candle.time as UTCTimestamp,
      value: candle.volume,
      color: candle.close >= candle.open ? '#4ade80' : '#f87171',
    }))
  }, [])

  // Add support and resistance levels
  const addLevels = useCallback((chart: IChartApi, levels: Level[]) => {
    levels.forEach(level => {
      const lineSeries = chart.addLineSeries({
        color: level.type === 'support' ? '#4ade80' : '#f87171',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        title: `${level.type.toUpperCase()} ${level.price}`,
      })

      // Create horizontal line data
      const lineData: LineData[] = [
        { time: (Date.now() / 1000 - 86400 * 7) as UTCTimestamp, value: level.price },
        { time: (Date.now() / 1000) as UTCTimestamp, value: level.price },
      ]

      lineSeries.setData(lineData)
    })
  }, [])

  // Add signal markers
  const addSignalMarkers = useCallback((candlestickSeries: ISeriesApi<'Candlestick'>, signals: Signal[]) => {
    const markers = signals.map(signal => ({
      time: (new Date(signal.createdAt).getTime() / 1000) as UTCTimestamp,
      position: signal.direction === 'LONG' ? 'belowBar' as const : 'aboveBar' as const,
      color: signal.direction === 'LONG' ? '#4ade80' : '#f87171',
      shape: signal.direction === 'LONG' ? 'arrowUp' as const : 'arrowDown' as const,
      text: `${signal.direction} ${signal.confidence}%`,
      size: 2,
    }))

    candlestickSeries.setMarkers(markers)
  }, [])

  // Initialize chart
  useEffect(() => {
    const chart = initChart()
    if (!chart) return

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      candlestickSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [initChart])

  // Update data when props change
  useEffect(() => {
    if (!candlestickSeriesRef.current || !data.length) return

    const candleData = formatCandleData(data)
    candlestickSeriesRef.current.setData(candleData)
    
    // Update current price
    if (candleData.length > 0) {
      setCurrentPrice(candleData[candleData.length - 1].close)
    }

    // Update volume data
    if (volumeSeriesRef.current && showVolume) {
      const volumeData = formatVolumeData(data)
      volumeSeriesRef.current.setData(volumeData)
    }
  }, [data, formatCandleData, formatVolumeData, showVolume])

  // Add levels when they change
  useEffect(() => {
    if (!chartRef.current || !levels.length) return
    addLevels(chartRef.current, levels)
  }, [levels, addLevels])

  // Add signal markers when they change
  useEffect(() => {
    if (!candlestickSeriesRef.current || !signals.length) return
    addSignalMarkers(candlestickSeriesRef.current, signals)
  }, [signals, addSignalMarkers])

  return (
    <div className={cn('relative', className)}>
      {/* Chart Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-dark-text">{pair}</span>
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange?.(tf.value)}
                className={cn(
                  'px-2 py-1 text-xs rounded font-medium transition-colors',
                  timeframe === tf.value
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-accent hover:text-dark-text hover:bg-dark-border'
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Price */}
      {currentPrice > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-dark-surface border border-dark-border rounded-lg px-3 py-1">
            <span className="font-mono text-lg font-bold text-dark-text">
              ${currentPrice.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={chartContainerRef}
        className="w-full rounded-lg bg-dark-surface"
        style={{ height: `${height}px` }}
      />

      {/* Chart Controls */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
        <button
          onClick={() => chartRef.current?.timeScale().fitContent()}
          className="px-2 py-1 text-xs bg-dark-surface border border-dark-border rounded text-dark-text hover:bg-dark-border transition-colors"
        >
          Fit
        </button>
        <button
          onClick={() => chartRef.current?.timeScale().scrollToRealTime()}
          className="px-2 py-1 text-xs bg-dark-surface border border-dark-border rounded text-dark-text hover:bg-dark-border transition-colors"
        >
          Live
        </button>
      </div>

      {/* Loading State */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-surface rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-dark-muted text-sm">Loading chart data...</p>
          </div>
        </div>
      )}
    </div>
  )
}