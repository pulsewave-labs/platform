import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '../../../../lib/emails/send'
import crypto from 'crypto'

var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  return createClient(supabaseUrl, serviceKey)
}

// Find or create a Supabase user + profile for this email
async function ensureUser(supabase: ReturnType<typeof getAdmin>, email: string, whopData: any) {
  // Check if profile already exists
  var { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) return existing.id

  // No profile — create a Supabase auth user with a random password
  // The user will set their own password via the welcome email link
  var tempPassword = crypto.randomBytes(32).toString('hex')

  var { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: tempPassword,
    email_confirm: true, // auto-confirm so they can log in after setting password
    user_metadata: {
      source: 'whop_checkout',
      whop_user_id: whopData.user_id || null,
    },
  })

  if (authError) {
    // User might exist in auth but not in profiles (edge case)
    console.log('[whop-webhook] auth.createUser error:', authError.message)

    // Try to find by auth
    var { data: users } = await supabase.auth.admin.listUsers()
    var found = users?.users?.find(u => u.email?.toLowerCase() === email)
    if (found) {
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: found.id,
        email: email,
        subscription_status: 'active',
        whop_membership_id: whopData.id || null,
        whop_user_id: whopData.user_id || null,
        subscription_plan: whopData.plan_id || null,
      }, { onConflict: 'id' })
      return found.id
    }

    console.error('[whop-webhook] Could not find or create user for', email)
    return null
  }

  if (!authUser?.user) return null

  // Create profile row
  var { error: profileError } = await supabase.from('profiles').upsert({
    id: authUser.user.id,
    email: email,
    subscription_status: 'active',
    whop_membership_id: whopData.id || null,
    whop_user_id: whopData.user_id || null,
    subscription_plan: whopData.plan_id || null,
    email_signals: true,
  }, { onConflict: 'id' })

  if (profileError) {
    console.error('[whop-webhook] profile upsert error:', profileError.message)
  }

  console.log('[whop-webhook] Created new user + profile for', email, 'id:', authUser.user.id)

  // Send password reset email so user can set their password
  var { error: resetError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: supabaseUrl.replace('.supabase.co', '.supabase.co') + '/auth/v1/callback?redirect_to=' + encodeURIComponent('https://www.pulsewavelabs.io/welcome'),
    },
  })

  if (resetError) {
    console.log('[whop-webhook] magiclink generation note:', resetError.message)
  }

  return authUser.user.id
}

export async function POST(request: NextRequest) {
  try {
    var body = await request.json()
    var eventType = (body.type || body.event || body.action || '').replace(/\./g, '_')
    var data = body.data || body

    // Whop nests email in different places depending on event
    var email = (data.email || data.user_email || body.email || data.customer_email || '').toLowerCase()

    // For membership events, email might be nested deeper
    if (!email && data.user) {
      email = (data.user.email || '').toLowerCase()
    }

    if (!email) {
      console.log('[whop-webhook] No email in payload, event:', eventType)
      return NextResponse.json({ ok: true })
    }

    var supabase = getAdmin()

    if (eventType === 'membership_activated' || eventType === 'membership.went_valid') {
      // This is the main "new subscriber" event
      var userId = await ensureUser(supabase, email, data)

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            whop_membership_id: data.id || null,
            whop_user_id: data.user_id || null,
            subscription_plan: data.plan_id || null,
          })
          .eq('id', userId)
      }

      console.log('[whop-webhook] membership.went_valid for', email)

      // Send welcome email
      sendWelcomeEmail(email).catch((err) => console.error('[whop-webhook] welcome email error:', err))

    } else if (eventType === 'membership_deactivated' || eventType === 'membership.went_invalid') {
      var { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single()
      if (profile) {
        await supabase.from('profiles').update({ subscription_status: 'expired' }).eq('id', profile.id)
      }
      console.log('[whop-webhook] membership.went_invalid for', email)

    } else if (eventType === 'membership_cancelled' || eventType === 'membership.cancelled' || eventType === 'membership_cancel_at_period_end_changed') {
      var { data: profile2 } = await supabase.from('profiles').select('id').eq('email', email).single()
      if (profile2) {
        await supabase.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', profile2.id)
      }
      console.log('[whop-webhook] membership.cancelled for', email)

    } else if (eventType === 'payment_succeeded' || eventType === 'payment.succeeded') {
      // Ensure user exists on payment too (belt + suspenders)
      var payUserId = await ensureUser(supabase, email, data)

      if (payUserId) {
        var plan = data.plan_id || ''
        var days = plan.includes('annual') || plan.includes('yearly') || plan.includes('KXHGlrE70uC9q') ? 365 : 30
        var expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + days)

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_expires_at: expiresAt.toISOString(),
          })
          .eq('id', payUserId)
      }

      console.log('[whop-webhook] payment.succeeded for', email)

    } else if (eventType === 'payment_failed') {
      console.log('[whop-webhook] payment_failed for', email)

    } else {
      console.log('[whop-webhook] Unhandled event:', eventType)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[whop-webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
