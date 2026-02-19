import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

var ADMIN_EMAILS = [
  'hello@pulsewaveindicator.com',
  'masonboroff@gmail.com',
  'masonboroff@yahoo.com',
  'mason@pulsewavelabs.com',
  'mason@pulsewavelabs.io',
]

export async function GET(request: NextRequest) {
  try {
    var supabase = createClient()
    var { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    var email = (user.email || '').toLowerCase()

    var isAdmin = ADMIN_EMAILS.includes(email)

    var { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan, subscription_expires_at, email, created_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ active: isAdmin, status: isAdmin ? 'active' : 'none', plan: isAdmin ? 'admin' : null, email: email, created_at: user.created_at || null })
    }

    var status = isAdmin ? 'active' : (profile.subscription_status || 'none')
    var active = status === 'active'

    return NextResponse.json({
      active: active,
      status: status,
      plan: isAdmin ? 'admin' : (profile.subscription_plan || null),
      expires_at: profile.subscription_expires_at || null,
      email: profile.email || email,
      created_at: profile.created_at || null,
    })
  } catch (err) {
    console.error('[subscription] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
