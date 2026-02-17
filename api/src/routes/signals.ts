import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { signalEngineService } from '../services/signal-engine'
import { supabase } from '../services/supabase'
import { broadcastMessage } from '../ws/handler'
import { checkTierLimits } from '../middleware/tier-check'

const router = Router()

// Validation schemas
const signalQuerySchema = z.object({
  pair: z.string().optional(),
  status: z.enum(['active', 'pending', 'completed', 'expired']).optional(),
  timeframe: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['created_at', 'confidence', 'pair']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

const signalCreateSchema = z.object({
  pair: z.string().regex(/^[A-Z]{2,10}\/[A-Z]{2,10}$/, 'Invalid trading pair format'),
  direction: z.enum(['LONG', 'SHORT']),
  entry: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit: z.number().positive(),
  confidence: z.number().min(0).max(100),
  regime: z.enum(['TRENDING_UP', 'TRENDING_DOWN', 'RANGING', 'VOLATILE']),
  reasoning: z.string().min(10).max(1000),
  factors: z.array(z.object({
    name: z.string(),
    score: z.number().min(-100).max(100),
    weight: z.number().min(0).max(1).optional(),
    description: z.string().optional(),
  })),
  timeframe: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']),
  tags: z.array(z.string()).optional(),
})

// Get signals (with pagination and filtering)
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = signalQuerySchema.parse(req.query)
    const userId = req.user?.id

    // Build Supabase query
    let supabaseQuery = supabase
      .from('signals')
      .select(`
        *,
        factors:signal_factors(name, score, weight, description)
      `)
      .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
      .range(query.offset, query.offset + query.limit - 1)

    // Apply filters
    if (query.pair) {
      supabaseQuery = supabaseQuery.eq('pair', query.pair)
    }

    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status)
    }

    if (query.timeframe) {
      supabaseQuery = supabaseQuery.eq('timeframe', query.timeframe)
    }

    // For authenticated users, show all signals
    // For public access, only show active signals
    if (!userId) {
      supabaseQuery = supabaseQuery.eq('status', 'active')
    }

    const { data: signals, error, count } = await supabaseQuery

    if (error) {
      console.error('Error fetching signals:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch signals'
      })
    }

    // Transform data to match our type definitions
    const transformedSignals = signals?.map(signal => ({
      ...signal,
      factors: signal.factors || [],
      riskReward: Math.abs(signal.takeProfit - signal.entry) / Math.abs(signal.entry - signal.stopLoss),
    }))

    res.json({
      success: true,
      data: transformedSignals,
      pagination: {
        offset: query.offset,
        limit: query.limit,
        total: count || 0,
        hasMore: (count || 0) > query.offset + query.limit,
      }
    })

  } catch (error) {
    console.error('Error in GET /signals:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get single signal by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const { data: signal, error } = await supabase
      .from('signals')
      .select(`
        *,
        factors:signal_factors(name, score, weight, description)
      `)
      .eq('id', id)
      .single()

    if (error || !signal) {
      return res.status(404).json({
        success: false,
        error: 'Signal not found'
      })
    }

    // Check access permissions
    if (!userId && signal.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    const transformedSignal = {
      ...signal,
      factors: signal.factors || [],
      riskReward: Math.abs(signal.takeProfit - signal.entry) / Math.abs(signal.entry - signal.stopLoss),
    }

    res.json({
      success: true,
      data: transformedSignal
    })

  } catch (error) {
    console.error('Error in GET /signals/:id:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Create new signal (admin only)
router.post('/', checkTierLimits('signals'), async (req: Request, res: Response) => {
  try {
    const signalData = signalCreateSchema.parse(req.body)
    const userId = req.user?.id

    // Check if user has permission to create signals (admin/system only)
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user || !['admin', 'system'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
    }

    // Calculate risk-reward ratio
    const riskReward = Math.abs(signalData.takeProfit - signalData.entry) / 
                       Math.abs(signalData.entry - signalData.stopLoss)

    // Create signal
    const { data: signal, error } = await supabase
      .from('signals')
      .insert({
        ...signalData,
        riskReward,
        createdBy: userId,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating signal:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to create signal'
      })
    }

    // Create signal factors if provided
    if (signalData.factors.length > 0) {
      const factorsData = signalData.factors.map(factor => ({
        signalId: signal.id,
        ...factor,
      }))

      const { error: factorsError } = await supabase
        .from('signal_factors')
        .insert(factorsData)

      if (factorsError) {
        console.error('Error creating signal factors:', factorsError)
        // Continue anyway, factors are optional
      }
    }

    // Broadcast new signal to WebSocket clients
    broadcastMessage({
      type: 'signal_update',
      data: signal,
      timestamp: new Date().toISOString(),
    })

    res.status(201).json({
      success: true,
      data: signal,
      message: 'Signal created successfully'
    })

  } catch (error) {
    console.error('Error in POST /signals:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signal data',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Update signal status (for signal results tracking)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, exitPrice, notes } = req.body
    const userId = req.user?.id

    // Validate status
    const validStatuses = ['active', 'hit_tp', 'hit_sl', 'expired', 'pending']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      })
    }

    // Check if user has permission to update signals
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user || !['admin', 'system'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
    }

    // Get existing signal
    const { data: existingSignal, error: fetchError } = await supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingSignal) {
      return res.status(404).json({
        success: false,
        error: 'Signal not found'
      })
    }

    // Calculate P&L if exit price provided
    let realizedPnL = null
    if (exitPrice && ['hit_tp', 'hit_sl'].includes(status)) {
      const direction = existingSignal.direction
      const entry = existingSignal.entry
      
      if (direction === 'LONG') {
        realizedPnL = exitPrice - entry
      } else {
        realizedPnL = entry - exitPrice
      }
    }

    // Update signal
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    }

    if (exitPrice) updateData.exitPrice = exitPrice
    if (notes) updateData.notes = notes
    if (realizedPnL !== null) updateData.realizedPnL = realizedPnL
    if (['hit_tp', 'hit_sl', 'expired'].includes(status)) {
      updateData.closedAt = new Date().toISOString()
    }

    const { data: updatedSignal, error } = await supabase
      .from('signals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating signal:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to update signal'
      })
    }

    // Broadcast signal update to WebSocket clients
    broadcastMessage({
      type: 'signal_update',
      data: updatedSignal,
      timestamp: new Date().toISOString(),
    })

    res.json({
      success: true,
      data: updatedSignal,
      message: 'Signal updated successfully'
    })

  } catch (error) {
    console.error('Error in PATCH /signals/:id/status:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get signal statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const timeframe = req.query.timeframe as string || '30d'

    // Calculate date range
    let dateFilter = ''
    switch (timeframe) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Get signal statistics
    const { data: stats, error } = await supabase.rpc('get_signal_stats', {
      start_date: dateFilter,
      user_id: userId
    })

    if (error) {
      console.error('Error fetching signal stats:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch signal statistics'
      })
    }

    res.json({
      success: true,
      data: stats || {
        totalSignals: 0,
        activeSignals: 0,
        completedSignals: 0,
        winRate: 0,
        avgConfidence: 0,
        avgRiskReward: 0,
        totalPnL: 0,
      }
    })

  } catch (error) {
    console.error('Error in GET /signals/stats/summary:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Refresh signals from signal engine
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    // Check if user has permission
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user || !['admin', 'system'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
    }

    // Trigger signal engine refresh
    const newSignals = await signalEngineService.refreshSignals()

    res.json({
      success: true,
      data: {
        newSignalsCount: newSignals.length,
        signals: newSignals,
      },
      message: `Refreshed ${newSignals.length} new signals`
    })

  } catch (error) {
    console.error('Error in POST /signals/refresh:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refresh signals'
    })
  }
})

export default router