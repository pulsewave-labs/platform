import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '../../../lib/emails/send'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sent = await sendWelcomeEmail(user.email, user.user_metadata?.name)
    return NextResponse.json({ sent })
  } catch (err) {
    console.error('[welcome-email-route] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
