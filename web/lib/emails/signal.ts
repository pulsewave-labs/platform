function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function signalEmailHtml({
  action,
  pair,
  entry,
  stopLoss,
  takeProfit,
  timeframe,
  confidence,
  rr,
  positionSizes,
}: {
  action: string
  pair: string
  entry: number
  stopLoss: number
  takeProfit: number
  timeframe: string
  confidence: number
  rr: string
  positionSizes?: { account: string; size: string; risk: string }[]
}): string {
  const normalizedAction = action.toUpperCase()
  const isLong = normalizedAction === 'LONG'
  const dirColor = isLong ? '#00e5a0' : '#ff4d4d'
  const dirIcon = isLong ? '🟢' : '🔴'
  const arrow = isLong ? '↗' : '↘'
  const safePair = escapeHtml(pair)
  const safeTimeframe = escapeHtml(timeframe)
  const safeRr = escapeHtml(rr)

  const fmt = (n: number) => {
    if (!Number.isFinite(n)) return '—'
    if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (n >= 1) return '$' + n.toFixed(2)
    return '$' + n.toFixed(4)
  }

  const pct = (target: number) => {
    if (!Number.isFinite(target) || !Number.isFinite(entry) || entry === 0) return '—'
    const raw = (((target - entry) / entry) * 100).toFixed(1)
    return `${Number(raw) > 0 ? '+' : ''}${raw}%`
  }

  const sizingRows = positionSizes
    ? positionSizes
        .map(
          (s) => `
    <tr>
      <td style="padding:8px 12px;font-size:14px;color:#a0a0a0;border-bottom:1px solid #1a1a1a;">${escapeHtml(s.account)}</td>
      <td style="padding:8px 12px;font-size:14px;color:#ffffff;font-weight:600;border-bottom:1px solid #1a1a1a;">${escapeHtml(s.size)}</td>
      <td style="padding:8px 12px;font-size:14px;color:#a0a0a0;border-bottom:1px solid #1a1a1a;">${escapeHtml(s.risk)}</td>
    </tr>`
        )
        .join('')
    : ''

  const sizingBlock = positionSizes?.length
    ? `
  <tr><td style="padding:0 0 24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:20px 20px 12px 20px;">
    <div style="font-size:13px;font-weight:600;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Position sizing reference</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr style="border-bottom:1px solid #222222;">
      <td style="padding:8px 12px;font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:0.5px;">Account</td>
      <td style="padding:8px 12px;font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:0.5px;">Size</td>
      <td style="padding:8px 12px;font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:0.5px;">Risk</td>
    </tr>
    ${sizingRows}
    </table>
  </td></tr></table>
  </td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${normalizedAction} ${safePair} — PulseWave trade alert</title></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<tr><td style="padding:0 0 24px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td><img src="https://www.pulsewavelabs.io/logo.png" alt="PulseWave" width="140" style="display:block;height:auto;border:0;" /></td>
<td style="text-align:right;vertical-align:middle;">
<span style="display:inline-block;padding:4px 12px;background-color:#0f1f15;border:1px solid #1a3d27;border-radius:20px;font-size:12px;color:#00e5a0;font-weight:600;">● TRADE ALERT</span>
</td>
</tr></table>
</td></tr>

<tr><td style="padding:0 0 24px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">

<tr><td style="padding:24px 24px 16px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;">
<span style="display:inline-block;padding:6px 16px;background-color:${isLong ? '#0f1f15' : '#1f0f0f'};border:1px solid ${isLong ? '#1a3d27' : '#3d1a1a'};border-radius:6px;font-size:14px;font-weight:700;color:${dirColor};letter-spacing:0.5px;">${dirIcon} ${normalizedAction} ${safePair}</span>
</td>
<td style="padding-left:12px;vertical-align:middle;">
<span style="font-size:13px;color:#666666;">${safeTimeframe} · journal reference</span>
</td>
</tr></table>
</td></tr>

<tr><td style="padding:0 24px;"><div style="border-top:1px solid #1a1a1a;"></div></td></tr>

<tr><td style="padding:20px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="padding:10px 0;width:40%;">
<div style="font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Entry</div>
<div style="font-size:22px;font-weight:700;color:#ffffff;">${fmt(entry)}</div>
</td>
<td style="padding:10px 0;width:30%;">
<div style="font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">R:R Ratio</div>
<div style="font-size:22px;font-weight:700;color:#00e5a0;">${safeRr}</div>
</td>
<td style="padding:10px 0;width:30%;text-align:right;">
<div style="font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Confidence</div>
<div style="font-size:22px;font-weight:700;color:#ffffff;">${Number.isFinite(confidence) ? confidence : 0}%</div>
</td>
</tr>
</table>
</td></tr>

<tr><td style="padding:0 24px;"><div style="border-top:1px solid #1a1a1a;"></div></td></tr>

<tr><td style="padding:20px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="width:50%;padding-right:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1f15;border:1px solid #1a3d27;border-radius:8px;">
<tr><td style="padding:16px;">
<div style="font-size:11px;color:#00e5a0;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Target</div>
<div style="font-size:20px;font-weight:700;color:#ffffff;">${fmt(takeProfit)}</div>
<div style="font-size:13px;color:#00e5a0;margin-top:4px;">${pct(takeProfit)}</div>
</td></tr></table>
</td>
<td style="width:50%;padding-left:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1f0f0f;border:1px solid #3d1a1a;border-radius:8px;">
<tr><td style="padding:16px;">
<div style="font-size:11px;color:#ff4d4d;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Invalidation</div>
<div style="font-size:20px;font-weight:700;color:#ffffff;">${fmt(stopLoss)}</div>
<div style="font-size:13px;color:#ff4d4d;margin-top:4px;">${pct(stopLoss)}</div>
</td></tr></table>
</td>
</tr></table>
</td></tr>

</table>
</td></tr>

${sizingBlock}

<tr><td style="padding:0 0 24px 0;" align="center">
<a href="https://www.pulsewavelabs.io/dashboard/journal/new" style="display:inline-block;padding:14px 40px;background-color:#00e5a0;color:#0a0a0a;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">Log / Review in Journal ${arrow}</a>
</td></tr>

<tr><td style="padding:0 0 24px 0;" align="center">
<div style="font-size:12px;color:#444444;line-height:1.5;max-width:480px;">Educational content only. Not financial advice. Trade at your own risk. Always follow your own plan and risk rules.</div>
</td></tr>

<tr><td style="padding:24px 0 0 0;border-top:1px solid #1a1a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="font-size:13px;color:#444444;">PulseWave Labs</td>
<td style="text-align:right;font-size:13px;"><a href="https://www.pulsewavelabs.io/dashboard/settings" style="color:#666666;text-decoration:none;">Email Settings</a></td>
</tr></table>
</td></tr>

</table>
</td></tr></table>
</body>
</html>`
}
