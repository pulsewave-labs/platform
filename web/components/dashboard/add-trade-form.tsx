'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useJournalMutations } from '../../lib/hooks'
import { useSuccessToast, useErrorToast } from '../ui/toast'
import { TrendingUp, TrendingDown, Calculator } from 'lucide-react'

interface AddTradeFormProps {
  onSuccess: () => void
}

const cryptoPairs = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'MATIC/USDT',
  'LINK/USDT', 'ADA/USDT', 'DOT/USDT', 'ATOM/USDT', 'UNI/USDT'
]

const timeframes = ['5m', '15m', '30m', '1H', '2H', '4H', '1D', '1W']
const strategies = ['Breakout', 'Support/Resistance', 'Moving Average', 'RSI', 'Scalping', 'Swing', 'Other']

export default function AddTradeForm({ onSuccess }: AddTradeFormProps) {
  const [formData, setFormData] = useState({
    pair: 'BTC/USDT',
    direction: 'LONG' as 'LONG' | 'SHORT',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    positionSize: '',
    timeframe: '4H',
    strategy: 'Breakout',
    notes: ''
  })

  const [calculations, setCalculations] = useState({
    rMultiple: 0,
    riskPercent: 0,
    potentialLoss: 0,
    potentialProfit: 0
  })

  const { createTrade, loading } = useJournalMutations()
  const showSuccess = useSuccessToast()
  const showError = useErrorToast()

  // Calculate risk metrics when relevant fields change
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice)
    const stop = parseFloat(formData.stopLoss)
    const tp = parseFloat(formData.takeProfit)
    const size = parseFloat(formData.positionSize)

    if (entry && stop && size) {
      const riskPerUnit = Math.abs(entry - stop)
      const potentialLoss = riskPerUnit * size
      
      let potentialProfit = 0
      let rMultiple = 0
      
      if (tp) {
        const rewardPerUnit = Math.abs(tp - entry)
        potentialProfit = rewardPerUnit * size
        rMultiple = rewardPerUnit / riskPerUnit
      }

      setCalculations({
        rMultiple: Math.round(rMultiple * 100) / 100,
        riskPercent: 0, // Would need account size from settings
        potentialLoss: Math.round(potentialLoss * 100) / 100,
        potentialProfit: Math.round(potentialProfit * 100) / 100
      })
    } else {
      setCalculations({ rMultiple: 0, riskPercent: 0, potentialLoss: 0, potentialProfit: 0 })
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.positionSize])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.entryPrice || !formData.stopLoss || !formData.positionSize) {
      showError('Missing required fields', 'Please fill in entry price, stop loss, and position size.')
      return
    }

    const entry = parseFloat(formData.entryPrice)
    const stop = parseFloat(formData.stopLoss)
    const size = parseFloat(formData.positionSize)

    if (entry <= 0 || stop <= 0 || size <= 0) {
      showError('Invalid values', 'Please enter positive values for all price fields.')
      return
    }

    // Validate stop loss direction
    if (formData.direction === 'LONG' && stop >= entry) {
      showError('Invalid stop loss', 'For LONG trades, stop loss must be below entry price.')
      return
    }

    if (formData.direction === 'SHORT' && stop <= entry) {
      showError('Invalid stop loss', 'For SHORT trades, stop loss must be above entry price.')
      return
    }

    try {
      const tradeData = {
        ...formData,
        entryPrice: entry,
        stopLoss: stop,
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
        positionSize: size,
        status: 'open',
        entryTime: new Date().toISOString()
      }

      await createTrade(tradeData)
      showSuccess('Trade added successfully', 'Your trade has been logged to the journal.')
      onSuccess()
      
      // Reset form
      setFormData({
        pair: 'BTC/USDT',
        direction: 'LONG',
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        positionSize: '',
        timeframe: '4H',
        strategy: 'Breakout',
        notes: ''
      })
    } catch (error) {
      showError('Failed to add trade', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pair and Direction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
            Trading Pair
          </label>
          <select
            value={formData.pair}
            onChange={(e) => handleInputChange('pair', e.target.value)}
            className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
          >
            {cryptoPairs.map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
            Direction
          </label>
          <div className="flex bg-[#0a0e17] border border-[#1b2332] rounded-xl p-1">
            {(['LONG', 'SHORT'] as const).map(direction => (
              <button
                key={direction}
                type="button"
                onClick={() => handleInputChange('direction', direction)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  formData.direction === direction
                    ? direction === 'LONG'
                      ? 'bg-[#4ade80]/20 text-[#4ade80]'
                      : 'bg-[#f87171]/20 text-[#f87171]'
                    : 'text-[#6b7280] hover:text-[#9ca3af]'
                }`}
              >
                {direction === 'LONG' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {direction}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
            Entry Price ($) *
          </label>
          <input
            type="number"
            value={formData.entryPrice}
            onChange={(e) => handleInputChange('entryPrice', e.target.value)}
            className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
            placeholder="69420.00"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
            Stop Loss ($) *
          </label>
          <input
            type="number"
            value={formData.stopLoss}
            onChange={(e) => handleInputChange('stopLoss', e.target.value)}
            className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
            placeholder="68200.00"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
            Take Profit ($)
          </label>
          <input
            type="number"
            value={formData.takeProfit}
            onChange={(e) => handleInputChange('takeProfit', e.target.value)}
            className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
            placeholder="72100.00"
            step="0.01"
          />
        </div>
      </div>

      {/* Position Size and Timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
            Position Size *
          </label>
          <input
            type="number"
            value={formData.positionSize}
            onChange={(e) => handleInputChange('positionSize', e.target.value)}
            className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
            placeholder="0.5000"
            step="0.0001"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
            Timeframe
          </label>
          <select
            value={formData.timeframe}
            onChange={(e) => handleInputChange('timeframe', e.target.value)}
            className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
          >
            {timeframes.map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Strategy */}
      <div>
        <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
          Strategy
        </label>
        <select
          value={formData.strategy}
          onChange={(e) => handleInputChange('strategy', e.target.value)}
          className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
        >
          {strategies.map(strategy => (
            <option key={strategy} value={strategy}>{strategy}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors resize-none"
          rows={3}
          placeholder="Trade reasoning, market conditions, etc..."
        />
      </div>

      {/* Risk Calculations */}
      {(calculations.rMultiple > 0 || calculations.potentialLoss > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0e17] border border-[#1b2332] rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calculator size={16} className="text-[#00F0B5]" />
            <span className="text-sm font-medium text-[#00F0B5]">Risk Calculation</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-[#6b7280]">Risk Amount</div>
              <div className="text-[#f87171] font-mono">${calculations.potentialLoss}</div>
            </div>
            <div>
              <div className="text-[#6b7280]">Potential Profit</div>
              <div className="text-[#4ade80] font-mono">${calculations.potentialProfit}</div>
            </div>
            <div>
              <div className="text-[#6b7280]">R-Multiple</div>
              <div className="text-white font-mono">{calculations.rMultiple}R</div>
            </div>
            <div>
              <div className="text-[#6b7280]">R:R Ratio</div>
              <div className="text-white font-mono">1:{calculations.rMultiple}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#00F0B5] text-white font-medium rounded-xl hover:bg-[#00F0B5]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding Trade...' : 'Add Trade'}
        </button>
      </div>
    </form>
  )
}