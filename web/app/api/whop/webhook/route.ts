import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  return createClient(supabaseUrl, serviceKey)
}

export async function POST(request: NextRequest) {
  try {
    var body = await request.json()
    var eventType = body.type
    var data = body.data

    if (!data || !data.email) {
      console.log('[whop-webhook] No email in payload, skipping', eventType)
      return NextResponse.json({ ok: true })
    }

    var email = data.email.toLowerCase()
    var supabase = getAdmin()

    // Find profile by email
    var { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      console.log('[whop-webhook] No profile found for email:', email)
      return NextResponse.json({ ok: true })
    }

    if (eventType === 'membership.went_valid') {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          whop_membership_id: data.id || null,
          whop_user_id: data.user_id || null,
          subscription_plan: data.plan_id || null,
        })
        .eq('id', profile.id)

      console.log('[whop-webhook] membership.went_valid for', email)
    } else if (eventType === 'membership.went_invalid') {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'expired' })
        .eq('id', profile.id)

      console.log('[whop-webhook] membership.went_invalid for', email)
    } else if (eventType === 'membership.cancelled') {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'cancelled' })
        .eq('id', profile.id)

      console.log('[whop-webhook] membership.cancelled for', email)
    } else if (eventType === 'payment.succeeded') {
      var plan = data.plan_id || ''
      var days = plan.includes('annual') || plan.includes('yearly') ? 365 : 30
      var expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + days)

      await supabase
        .from('profiles')
        .update({ subscription_expires_at: expiresAt.toISOString() })
        .eq('id', profile.id)

      console.log('[whop-webhook] payment.succeeded for', email, 'expires', expiresAt.toISOString())
    } else {
      console.log('[whop-webhook] Unhandled event type:', eventType)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[whop-webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
