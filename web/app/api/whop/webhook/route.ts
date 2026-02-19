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
// Returns { id, setPasswordUrl? }
async function ensureUser(supabase: ReturnType<typeof getAdmin>, email: string, whopData: any): Promise<{ id: string | null, setPasswordUrl?: string }> {
  // Check if profile already exists
  var { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) return { id: existing.id }

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
      await supabase.from('profiles').upsert({
        id: found.id,
        email: email,
        subscription_status: 'active',
        whop_membership_id: whopData.id || null,
        whop_user_id: whopData.user_id || null,
        subscription_plan: whopData.plan_id || null,
      }, { onConflict: 'id' })
      return { id: found.id }
    }

    console.error('[whop-webhook] Could not find or create user for', email)
    return { id: null }
  }

  if (!authUser?.user) return { id: null }

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

  // Generate a password reset link so the user can set their password
  // This sends them to /auth/set-password with auth tokens
  var { data: linkData, error: resetError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: {
      redirectTo: 'https://www.pulsewavelabs.io/auth/set-password',
    },
  })

  if (resetError) {
    console.log('[whop-webhook] recovery link error:', resetError.message)
  }

  var setPasswordUrl = linkData?.properties?.action_link || undefined
  if (setPasswordUrl) {
    console.log('[whop-webhook] Recovery link generated for', email)
  }

  return { id: authUser.user.id, setPasswordUrl }
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
      var result = await ensureUser(supabase, email, data)

      if (result.id) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            whop_membership_id: data.id || null,
            whop_user_id: data.user_id || null,
            subscription_plan: data.plan_id || null,
          })
          .eq('id', result.id)
      }

      console.log('[whop-webhook] membership_activated for', email)

      // Send welcome email with set-password link if new user
      sendWelcomeEmail(email, undefined, result.setPasswordUrl).catch((err) => console.error('[whop-webhook] welcome email error:', err))

    } else if (eventType === 'membership_deactivated' || eventType === 'membership.went_invalid') {
      var { data: prof1 } = await supabase.from('profiles').select('id').eq('email', email).single()
      if (prof1) {
        await supabase.from('profiles').update({ subscription_status: 'expired' }).eq('id', prof1.id)
      }
      console.log('[whop-webhook] membership_deactivated for', email)

    } else if (eventType === 'membership_cancelled' || eventType === 'membership.cancelled' || eventType === 'membership_cancel_at_period_end_changed') {
      var { data: prof2 } = await supabase.from('profiles').select('id').eq('email', email).single()
      if (prof2) {
        await supabase.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', prof2.id)
      }
      console.log('[whop-webhook] membership_cancelled for', email)

    } else if (eventType === 'payment_succeeded' || eventType === 'payment.succeeded') {
      var payResult = await ensureUser(supabase, email, data)

      if (payResult.id) {
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
          .eq('id', payResult.id)
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
