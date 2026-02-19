export function welcomeEmailHtml({ email, name, setPasswordUrl }: { email: string; name?: string; setPasswordUrl?: string }): string {
  const greeting = name ? `Hi ${name},` : 'Hi there,'
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to PulseWave Signals</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Logo -->
<tr><td style="padding:0 0 32px 0;">
<img src="https://www.pulsewavelabs.io/logo.png" alt="PulseWave" width="180" style="display:block;height:auto;border:0;" />
</td></tr>

<!-- Headline -->
<tr><td style="padding:0 0 24px 0;">
<h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;">Welcome to PulseWave Signals</h1>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:0 0 24px 0;color:#a0a0a0;font-size:16px;line-height:1.6;">
${greeting}<br><br>
You now have access to the same signal engine that turned $10K into $218K over 624 verified trades.
</td></tr>

<!-- Step 0: Set Password -->
${setPasswordUrl ? `
<tr><td style="padding:0 0 16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #00e5a0;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">✦</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Set Your Password</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;margin-bottom:16px;">We created your account automatically. Click below to choose a password so you can log into your dashboard anytime.</div>
<a href="${setPasswordUrl}" style="display:inline-block;padding:12px 24px;background-color:#00e5a0;color:#0a0a0a;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;">Set Password →</a>
</td></tr></table>
</td></tr></table>
</td></tr>
` : ''}

<!-- Step 1 -->
<tr><td style="padding:0 0 16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">1</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Connect Telegram</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;margin-bottom:16px;">Open your dashboard settings and link your Telegram account. This is how you will receive instant signal alerts.</div>
<a href="https://www.pulsewavelabs.io/dashboard/settings" style="display:inline-block;padding:10px 20px;background-color:#00e5a0;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">Connect Telegram</a>
</td></tr></table>
</td></tr></table>
</td></tr>

<!-- Step 2 -->
<tr><td style="padding:0 0 16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">2</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Open Your Dashboard</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;margin-bottom:16px;">Your dashboard shows live signals, performance data, and your complete trade history.</div>
<a href="https://www.pulsewavelabs.io/dashboard" style="display:inline-block;padding:10px 20px;background-color:#00e5a0;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">Open Dashboard</a>
</td></tr></table>
</td></tr></table>
</td></tr>

<!-- Step 3 -->
<tr><td style="padding:0 0 32px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background-color:#00e5a0;color:#0a0a0a;font-weight:bold;font-size:14px;">3</span></td>
<td style="padding-left:12px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:8px;">Wait for the Next Signal</div>
<div style="font-size:14px;color:#a0a0a0;line-height:1.5;">Our engine scans 5 pairs across multiple timeframes 24/7. When a Market Structure setup forms, you will get a Telegram alert with the exact entry, stop loss, and take profit.</div>
</td></tr></table>
</td></tr></table>
</td></tr>

<!-- What to expect -->
<tr><td style="padding:0 0 32px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;">
<tr><td style="padding:24px;">
<div style="font-size:18px;font-weight:600;color:#ffffff;margin-bottom:16px;">What to expect</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;"><span style="color:#00e5a0;font-family:'Courier New',monospace;">~25</span> signals per month</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;">Each signal includes entry, SL, TP, and position sizing</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;"><span style="font-family:'Courier New',monospace;color:#00e5a0;">40.7%</span> win rate, <span style="font-family:'Courier New',monospace;color:#00e5a0;">1.52</span> profit factor. Winners are 2-3x larger than losers.</td></tr>
<tr><td style="padding:6px 0;font-size:14px;color:#a0a0a0;line-height:1.5;">Results update automatically on your dashboard</td></tr>
</table>
</td></tr></table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 0 0 0;border-top:1px solid #222222;">
<div style="font-size:14px;color:#a0a0a0;line-height:1.6;margin-bottom:16px;">Questions? Reply to this email.</div>
<div style="font-size:13px;color:#666666;line-height:1.5;">PulseWave Labs<br>You received this because you signed up at pulsewavelabs.io.<br>To unsubscribe, cancel your subscription from your dashboard.</div>
</td></tr>

</table>
</td></tr></table>
</body>
</html>`
}
