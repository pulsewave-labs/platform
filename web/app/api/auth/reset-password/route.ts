import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    var body = await request.json()
    var email = body.email

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    var supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    var { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.pulsewavelabs.io/auth/update-password',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ sent: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
