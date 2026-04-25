import { welcomeEmailHtml } from './welcome'
import { signalEmailHtml } from './signal'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'PulseWave <hello@system.pulsewavelabs.io>'
const SIGNAL_EMAIL_FROM = process.env.SIGNAL_EMAIL_FROM || EMAIL_FROM
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@pulsewavelabs.io'
const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export type SignalEmailData = {
  action: string
  pair: string
  entry: number
  stopLoss: number
  takeProfit: number
  timeframe: string
  confidence: number
  rr: string
  positionSizes?: { account: string; size: string; risk: string }[]
}

type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
  logPrefix: string
}

async function sendResendEmail({ to, subject, html, from = EMAIL_FROM, replyTo = EMAIL_REPLY_TO, logPrefix }: SendEmailInput): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn(`[${logPrefix}] RESEND_API_KEY is not configured; email skipped`)
    return false
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        reply_to: replyTo,
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[${logPrefix}] Resend error:`, res.status, text.slice(0, 500))
      return false
    }

    console.log(`[${logPrefix}] Sent`)
    return true
  } catch (err) {
    console.error(`[${logPrefix}] Failed:`, err)
    return false
  }
}

export async function sendSignalEmail(email: string, signal: SignalEmailData): Promise<boolean> {
  const action = signal.action.toUpperCase()
  const icon = action === 'LONG' ? '🟢' : '🔴'
  const html = signalEmailHtml(signal)

  return sendResendEmail({
    to: email,
    from: SIGNAL_EMAIL_FROM,
    subject: `${icon} PulseWave trade alert: ${action} ${signal.pair} @ $${signal.entry.toLocaleString()}`,
    html,
    logPrefix: 'trade-alert-email',
  })
}

export async function sendWelcomeEmail(email: string, name?: string, setPasswordUrl?: string): Promise<boolean> {
  const html = welcomeEmailHtml({ email, name, setPasswordUrl })

  return sendResendEmail({
    to: email,
    subject: 'Welcome to PulseWave Journal',
    html,
    logPrefix: 'welcome-email',
  })
}
