import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../../lib/supabase/api'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access your journal' },
        { status: 401 }
      )
    }

    const { data: trade, error } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Not found', message: 'Trade not found' },
          { status: 404 }
        )
      }
      
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trade', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ trade })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to update your journal' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Get existing trade to validate ownership
    const { data: existingTrade, error: fetchError } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Not found', message: 'Trade not found' },
          { status: 404 }
        )
      }
      
      console.error('Database error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch trade', message: fetchError.message },
        { status: 500 }
      )
    }

    // Calculate updated PnL and R-multiple if relevant fields changed
    let updateData: any = { ...body }

    if (body.exit_price !== undefined || body.entry_price !== undefined || body.stop_loss !== undefined) {
      const entryPrice = body.entry_price || existingTrade.entry_price
      const exitPrice = body.exit_price || existingTrade.exit_price
      const stopLoss = body.stop_loss || existingTrade.stop_loss
      const positionSize = body.position_size || existingTrade.position_size
      const direction = (body.direction || existingTrade.direction).toUpperCase()
      const fees = body.fees !== undefined ? body.fees : existingTrade.fees

      if (exitPrice && stopLoss && entryPrice) {
        const risk = Math.abs(entryPrice - stopLoss)
        const reward = direction === 'LONG' 
          ? exitPrice - entryPrice
          : entryPrice - exitPrice
        
        updateData.r_multiple = risk > 0 ? reward / risk : 0
        
        if (positionSize) {
          updateData.pnl = reward * positionSize - (fees || 0)
          updateData.pnl_percent = (reward / entryPrice) * 100
        }
      }

      // Auto-close trade if exit price is set and status is still open
      if (exitPrice && existingTrade.status === 'open') {
        updateData.status = 'closed'
        updateData.exit_date = body.exit_date || new Date().toISOString()
      }
    }

    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData.user_id
    delete updateData.created_at
    
    // Update the trade
    const { data: trade, error } = await supabaseAdmin
      .from('trades')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update trade', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ trade })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to delete your journal entries' },
        { status: 401 }
      )
    }

    const { error } = await supabaseAdmin
      .from('trades')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete trade', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Trade deleted successfully' 
    }, { status: 200 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}