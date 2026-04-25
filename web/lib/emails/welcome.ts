function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeUrl(value: string): string {
  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.toString()
  } catch (_) {}
  return 'https://www.pulsewavelabs.io/auth/forgot-password'
}

export function welcomeEmailHtml({ email, name, setPasswordUrl }: { email: string; name?: string; setPasswordUrl?: string }): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi there,'
  const escapedEmail = escapeHtml(email)
  const passwordUrl = setPasswordUrl ? safeUrl(setPasswordUrl) : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to PulseWave Journal</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<tr><td style="padding:0 0 32px 0;">
<img src="https://www.pulsewavelabs.io/logo.png" alt="PulseWave" width="180" style="display:block;height:auto;border:0;" />
</td></tr>

<tr><td style="padding:0 0 24px 0;">
<h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;">Welcome to PulseWave Journal</h1>
</td></tr>

<tr><td style="padding:0 0 24px 0;color:#a0a0a0;font-size:16px;line-height:1.6;">
${greeting}<br><br>
Your account is ready. PulseWave Journal helps you log trades, debrief outcomes, spot leaks, and turn repeat mistakes into trading rules.
</td></tr>

${passwordUrl ? `
<tr><td style="padding:0 0 16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #00e5a0;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">✦</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Set Your Password</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;margin-bottom:16px;">Choose a password so you can log into your journal from any device.</div>
<a href="${passwordUrl}" style="display:inline-block;padding:12px 24px;background-color:#00e5a0;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;">Set Password →</a>
</td></tr></table>
</td></tr></table>
</td></tr>
` : ''}

<tr><td style="padding:0 0 16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">1</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Log your first trade</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;margin-bottom:16px;">Start with the setup, thesis, risk, session, and mindset before the outcome gets emotional.</div>
<a href="https://www.pulsewavelabs.io/dashboard/journal/new" style="display:inline-block;padding:10px 20px;background-color:#00e5a0;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">Log First Trade</a>
</td></tr></table>
</td></tr></table>
</td></tr>

<tr><td style="padding:0 0 16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">2</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Debrief the outcome</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;margin-bottom:16px;">Compare the plan to the result, grade execution, and capture what went right or wrong while it is still fresh.</div>
<a href="https://www.pulsewavelabs.io/dashboard/journal" style="display:inline-block;padding:10px 20px;background-color:#00e5a0;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">Open Journal</a>
</td></tr></table>
</td></tr></table>
</td></tr>

<tr><td style="padding:0 0 32px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">3</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Turn leaks into rules</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;">After a few closed trades, PulseWave surfaces patterns across setups, sessions, emotions, and execution quality so you can build rules from your own data.</div>
</td></tr></table>
</td></tr></table>
</td></tr>

<tr><td style="padding:0 0 32px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:16px;">What to expect</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;">Thesis-first trade logging</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;">Plan-vs-outcome debriefs</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;">Leak detection across your own trades</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;">A rules engine for repeat mistakes and protected edges</td></tr>
</table>
</td></tr></table>
</td></tr>

<tr><td style="padding:24px 0 0 0;border-top:1px solid #222222;">
<div style="font-size:14px;color:#a0a0a0;line-height:1.6;margin-bottom:16px;">Questions? Reply to this email.</div>
<div style="font-size:13px;color:#666666;line-height:1.5;">PulseWave Labs<br>You received this because ${escapedEmail} signed up at pulsewavelabs.io.<br>Manage access from your dashboard settings.</div>
</td></tr>

</table>
</td></tr></table>
</body>
</html>`
}
