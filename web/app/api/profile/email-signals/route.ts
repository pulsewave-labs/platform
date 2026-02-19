import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../../lib/supabase/api'

export async function PATCH(request: NextRequest) {
  try {
    var user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    var body = await request.json()
    var emailSignals = body.email_signals === true

    var { error } = await supabaseAdmin
      .from('profiles')
      .update({ email_signals: emailSignals })
      .eq('id', user.id)

    if (error) {
      console.error('Failed to update email_signals:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ email_signals: emailSignals })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
