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

    // Admin bypass
    if (ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ active: true, status: 'active', plan: 'admin' })
    }

    var { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ active: false, status: 'none', plan: null })
    }

    var status = profile.subscription_status || 'none'
    var active = status === 'active'

    return NextResponse.json({
      active: active,
      status: status,
      plan: profile.subscription_plan || null,
    })
  } catch (err) {
    console.error('[subscription] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
