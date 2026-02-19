import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, source = 'playbook', utm_source, utm_medium, utm_campaign } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Get IP from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || null

    // Upsert lead (don't error on duplicate)
    const { data, error } = await supabaseAdmin
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
      console.error('Lead capture error:', error)
      // Still return success to user even if DB fails
      return NextResponse.json({ success: true })
    }

    // Send welcome email via Resend
    try {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Mason <mason@system.pulsewavelabs.io>',
            to: [cleanEmail],
            subject: 'Your playbook is inside (+ the trade I took this morning)',
            html: getPlaybookEmail(),
          }),
        })
      }
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr)
      // Don't fail the lead capture if email fails
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead API error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

function getPlaybookEmail(): string {
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
Your playbook is ready. This is the exact framework we use to trade 5 crypto pairs — the same system that turned $10K into $218K across 624 trades.
</p>

<div style="text-align:center;margin:32px 0;">
  <a href="https://www.pulsewavelabs.io/playbook/read" style="display:inline-block;padding:14px 32px;background:#00e5a0;color:#06060a;font-weight:700;font-size:15px;text-decoration:none;border-radius:8px;">
    Read The 5-Pair Playbook →
  </a>
</div>

<p style="color:#888;font-size:14px;line-height:1.7;margin-bottom:24px;">
Quick taste of what's inside:
</p>

<ul style="color:#888;font-size:14px;line-height:1.8;padding-left:20px;margin-bottom:24px;">
  <li>Why we only trade BTC, ETH, SOL, AVAX, and XRP (and ignore everything else)</li>
  <li>The 3-pillar confluence scoring system — how we score every trade 0-100</li>
  <li>A real winning trade walkthrough with full breakdown</li>
  <li>A real <em>losing</em> trade — and why we're still profitable at 40.7% win rate</li>
  <li>Position sizing table for $1K–$100K accounts</li>
</ul>

<p style="color:#888;font-size:14px;line-height:1.7;margin-bottom:24px;">
One more thing — I took a trade this morning on SOL at the 4H support zone. Confluence score came in at 68, R:R was 2.3:1. Still running. I'll share how it went tomorrow.
</p>

<p style="color:#888;font-size:14px;line-height:1.7;margin-bottom:32px;">
Talk soon,<br/>
<span style="color:#c8c8c8;font-weight:600;">Mason</span><br/>
<span style="color:#444;font-size:12px;">Creator, PulseWave Labs</span>
</p>

<div style="border-top:1px solid #1a1a1a;padding-top:20px;text-align:center;">
  <p style="color:#333;font-size:11px;line-height:1.6;">
    You're receiving this because you downloaded The 5-Pair Playbook.<br/>
    <a href="https://www.pulsewavelabs.io" style="color:#444;text-decoration:underline;">pulsewavelabs.io</a>
  </p>
</div>

</div>
</body></html>`
}
