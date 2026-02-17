import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '@/lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access your settings' },
        { status: 401 }
      )
    }

    // Try to get existing settings
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings', message: error.message },
        { status: 500 }
      )
    }

    // If no settings exist, create default ones
    if (!settings) {
      const defaultSettings = {
        user_id: user.id,
        risk_per_trade: 1.0,
        max_daily_loss: 3.0,
        max_positions: 5,
        default_timeframe: '4h',
        preferred_pairs: ['BTC/USDT', 'ETH/USDT'],
        notifications: {
          email: true,
          push: false,
          signals: true,
          risk_alerts: true
        },
        exchanges: [],
        theme: 'dark'
      }

      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (createError) {
        console.error('Database error creating settings:', createError)
        return NextResponse.json(
          { error: 'Failed to create settings', message: createError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ settings: newSettings })
    }

    return NextResponse.json({ settings })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to update your settings' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate numeric fields
    if (body.risk_per_trade !== undefined) {
      const risk = parseFloat(body.risk_per_trade)
      if (isNaN(risk) || risk < 0.1 || risk > 10) {
        return NextResponse.json(
          { error: 'Validation error', message: 'Risk per trade must be between 0.1% and 10%' },
          { status: 400 }
        )
      }
      body.risk_per_trade = risk
    }

    if (body.max_daily_loss !== undefined) {
      const maxLoss = parseFloat(body.max_daily_loss)
      if (isNaN(maxLoss) || maxLoss < 1 || maxLoss > 20) {
        return NextResponse.json(
          { error: 'Validation error', message: 'Max daily loss must be between 1% and 20%' },
          { status: 400 }
        )
      }
      body.max_daily_loss = maxLoss
    }

    if (body.max_positions !== undefined) {
      const maxPos = parseInt(body.max_positions)
      if (isNaN(maxPos) || maxPos < 1 || maxPos > 20) {
        return NextResponse.json(
          { error: 'Validation error', message: 'Max positions must be between 1 and 20' },
          { status: 400 }
        )
      }
      body.max_positions = maxPos
    }

    // Validate theme
    if (body.theme && !['light', 'dark'].includes(body.theme)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Theme must be light or dark' },
        { status: 400 }
      )
    }

    // Validate timeframe
    const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d', '1w']
    if (body.default_timeframe && !validTimeframes.includes(body.default_timeframe)) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Invalid timeframe' },
        { status: 400 }
      )
    }

    // Remove fields that shouldn't be updated
    delete body.id
    delete body.user_id
    delete body.created_at

    // Upsert settings
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .upsert(
        { user_id: user.id, ...body },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update settings', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}