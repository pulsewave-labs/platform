import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/api'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'PulseWave <hello@system.pulsewavelabs.io>'
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@pulsewavelabs.io'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, source = 'journal', utm_source, utm_medium, utm_campaign } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') || null

    const { error } = await supabaseAdmin
      .from('leads')
      .upsert(
        {
          email: cleanEmail,
          source,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          ip_address: ip,
        },
        { onConflict: 'email,source' }
      )
      .select()
      .single()

    if (error) {
      console.error('[lead-capture] Database error:', error.message)
      return NextResponse.json({ success: true })
    }

    if (RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            reply_to: EMAIL_REPLY_TO,
            to: [cleanEmail],
            subject: 'Your PulseWave Journal overview',
            html: getJournalLeadEmail(),
          }),
        })

        if (!res.ok) {
          const text = await res.text()
          console.error('[lead-capture] Resend error:', res.status, text.slice(0, 500))
        }
      } catch (emailErr) {
        console.error('[lead-capture] Welcome email error:', emailErr)
      }
    } else {
      console.warn('[lead-capture] RESEND_API_KEY is not configured; email skipped')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[lead-capture] API error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

function getJournalLeadEmail(): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06060a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">

<div style="text-align:center;margin-bottom:32px;">
  <img src="https://www.pulsewavelabs.io/logo.webp" alt="PulseWave" style="height:28px;" />
</div>

<p style="color:#c8c8c8;font-size:16px;line-height:1.7;margin-bottom:24px;">
Hey — Mason here.
</p>

<p style="color:#c8c8c8;font-size:16px;line-height:1.7;margin-bottom:24px;">
PulseWave Journal is built for one job: turn your trade history into a feedback loop you can actually act on.
</p>

<div style="text-align:center;margin:32px 0;">
  <a href="https://www.pulsewavelabs.io" style="display:inline-block;padding:14px 32px;background:#00e5a0;color:#06060a;font-weight:700;font-size:15px;text-decoration:none;border-radius:8px;">
    Open PulseWave Journal →
  </a>
</div>

<p style="color:#888;font-size:14px;line-height:1.7;margin-bottom:24px;">
The core workflow is simple:
</p>

<ul style="color:#888;font-size:14px;line-height:1.8;padding-left:20px;margin-bottom:24px;">
  <li>Log the thesis before the result can rewrite the story</li>
  <li>Debrief the plan versus the actual execution</li>
  <li>Find leaks by setup, session, emotion, and rules followed</li>
  <li>Turn repeat mistakes into a concrete trading rulebook</li>
</ul>

<p style="color:#888;font-size:14px;line-height:1.7;margin-bottom:32px;">
Talk soon,<br/>
<span style="color:#c8c8c8;font-weight:600;">Mason</span><br/>
<span style="color:#444;font-size:12px;">Creator, PulseWave Labs</span>
</p>

<div style="border-top:1px solid #1a1a1a;padding-top:20px;text-align:center;">
  <p style="color:#333;font-size:11px;line-height:1.6;">
    You're receiving this because you requested PulseWave Journal updates.<br/>
    <a href="https://www.pulsewavelabs.io" style="color:#444;text-decoration:underline;">pulsewavelabs.io</a>
  </p>
</div>

</div>
</body></html>`
}
