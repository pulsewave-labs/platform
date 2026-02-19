import { welcomeEmailHtml } from './welcome'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  try {
    const html = welcomeEmailHtml({ email, name })
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PulseWave Signals <hello@system.pulsewavelabs.io>',
        reply_to: 'hello@pulsewaveindicator.com',
        to: email,
        subject: 'Welcome to PulseWave Signals',
        html,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[welcome-email] Resend error:', res.status, text)
      return false
    }

    console.log('[welcome-email] Sent to', email)
    return true
  } catch (err) {
    console.error('[welcome-email] Failed:', err)
    return false
  }
}
