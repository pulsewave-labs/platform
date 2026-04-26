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

    const missingUpdateColumn = (message: string) => /pre_thesis|post_right|post_wrong|lesson|grade|emotional_state|confluence|screenshot_entry|screenshot_exit|session|risk_amount|auto_imported|position_size|entry_date|exit_date|timeframe|setup_type/i.test(message || '')

    const buildLegacyNotes = () => {
      if (body.pre_thesis !== undefined) return body.pre_thesis || null
      if (body.notes !== undefined) return body.notes || null

      const reviewParts = [
        body.post_right ? `Right: ${body.post_right}` : '',
        body.post_wrong ? `Wrong: ${body.post_wrong}` : '',
        body.lesson ? `Lesson: ${body.lesson}` : '',
      ].filter(Boolean)

      return reviewParts.length > 0 ? reviewParts.join('\n\n') : undefined
    }

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
      const positionSize = body.position_size || body.quantity || existingTrade.position_size || existingTrade.quantity
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
    let { data: trade, error } = await supabaseAdmin
      .from('trades')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    // Some production databases are still on the original trade schema. Keep
    // the UI fields canonical, but retry updates with the legacy column names
    // when Supabase reports newer journal fields are missing.
    if (error && missingUpdateColumn(error.message || '')) {
      const compatibleUpdateData: any = { ...updateData }
      const legacyNotes = buildLegacyNotes()

      if (compatibleUpdateData.position_size !== undefined) {
        compatibleUpdateData.quantity = compatibleUpdateData.position_size
      }
      if (compatibleUpdateData.entry_date !== undefined) {
        compatibleUpdateData.opened_at = compatibleUpdateData.entry_date
      }
      if (compatibleUpdateData.exit_date !== undefined) {
        compatibleUpdateData.closed_at = compatibleUpdateData.exit_date
      }
      if (legacyNotes !== undefined) {
        compatibleUpdateData.notes = legacyNotes
      }

      for (const unsupportedColumn of [
        'position_size', 'entry_date', 'exit_date', 'pre_thesis', 'post_right',
        'post_wrong', 'lesson', 'grade', 'emotional_state', 'confluence',
        'screenshot_entry', 'screenshot_exit', 'session', 'risk_amount',
        'auto_imported', 'timeframe', 'setup_type', 'screenshots', 'strategy',
      ]) {
        delete compatibleUpdateData[unsupportedColumn]
      }

      const retry = await supabaseAdmin
        .from('trades')
        .update(compatibleUpdateData)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
        .single()

      trade = retry.data
      error = retry.error
    }

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