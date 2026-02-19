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
  const isLong = action === 'LONG'
  const dirColor = isLong ? '#00e5a0' : '#ff4d4d'
  const dirIcon = isLong ? '🟢' : '🔴'
  const arrow = isLong ? '↗' : '↘'

  const fmt = (n: number) => {
    if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (n >= 1) return '$' + n.toFixed(2)
    return '$' + n.toFixed(4)
  }

  const tpPct = (((takeProfit - entry) / entry) * 100).toFixed(1)
  const slPct = (((stopLoss - entry) / entry) * 100).toFixed(1)

  const sizingRows = positionSizes
    ? positionSizes
        .map(
          (s) => `
    <tr>
      <td style="padding:8px 12px;font-size:14px;color:#a0a0a0;border-bottom:1px solid #1a1a1a;">${s.account}</td>
      <td style="padding:8px 12px;font-size:14px;color:#ffffff;font-weight:600;border-bottom:1px solid #1a1a1a;">${s.size}</td>
      <td style="padding:8px 12px;font-size:14px;color:#a0a0a0;border-bottom:1px solid #1a1a1a;">${s.risk}</td>
    </tr>`
        )
        .join('')
    : ''

  const sizingBlock = positionSizes
    ? `
  <!-- Position Sizing -->
  <tr><td style="padding:0 0 24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:20px 20px 12px 20px;">
    <div style="font-size:13px;font-weight:600;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Position Sizing (10% Risk)</div>
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
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${action} ${pair} — PulseWave Signal</title></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

<!-- Header -->
<tr><td style="padding:0 0 24px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td><img src="https://www.pulsewavelabs.io/logo.png" alt="PulseWave" width="140" style="display:block;height:auto;border:0;" /></td>
<td style="text-align:right;vertical-align:middle;">
<span style="display:inline-block;padding:4px 12px;background-color:#0f1f15;border:1px solid #1a3d27;border-radius:20px;font-size:12px;color:#00e5a0;font-weight:600;">● LIVE SIGNAL</span>
</td>
</tr></table>
</td></tr>

<!-- Signal Card -->
<tr><td style="padding:0 0 24px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">

<!-- Direction Banner -->
<tr><td style="padding:24px 24px 16px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;">
<span style="display:inline-block;padding:6px 16px;background-color:${isLong ? '#0f1f15' : '#1f0f0f'};border:1px solid ${isLong ? '#1a3d27' : '#3d1a1a'};border-radius:6px;font-size:14px;font-weight:700;color:${dirColor};letter-spacing:0.5px;">${dirIcon} ${action} ${pair}</span>
</td>
<td style="padding-left:12px;vertical-align:middle;">
<span style="font-size:13px;color:#666666;">${timeframe} · Market Structure</span>
</td>
</tr></table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 24px;"><div style="border-top:1px solid #1a1a1a;"></div></td></tr>

<!-- Trade Details -->
<tr><td style="padding:20px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">

<!-- Entry -->
<tr>
<td style="padding:10px 0;width:40%;">
<div style="font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Entry</div>
<div style="font-size:22px;font-weight:700;color:#ffffff;">${fmt(entry)}</div>
</td>
<td style="padding:10px 0;width:30%;">
<div style="font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">R:R Ratio</div>
<div style="font-size:22px;font-weight:700;color:#00e5a0;">${rr}</div>
</td>
<td style="padding:10px 0;width:30%;text-align:right;">
<div style="font-size:12px;color:#666666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Confidence</div>
<div style="font-size:22px;font-weight:700;color:#ffffff;">${confidence}%</div>
</td>
</tr>

</table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 24px;"><div style="border-top:1px solid #1a1a1a;"></div></td></tr>

<!-- TP / SL -->
<tr><td style="padding:20px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="width:50%;padding-right:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1f15;border:1px solid #1a3d27;border-radius:8px;">
<tr><td style="padding:16px;">
<div style="font-size:11px;color:#00e5a0;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🎯 Take Profit</div>
<div style="font-size:20px;font-weight:700;color:#ffffff;">${fmt(takeProfit)}</div>
<div style="font-size:13px;color:#00e5a0;margin-top:4px;">${Number(tpPct) > 0 ? '+' : ''}${tpPct}%</div>
</td></tr></table>
</td>
<td style="width:50%;padding-left:12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1f0f0f;border:1px solid #3d1a1a;border-radius:8px;">
<tr><td style="padding:16px;">
<div style="font-size:11px;color:#ff4d4d;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🛑 Stop Loss</div>
<div style="font-size:20px;font-weight:700;color:#ffffff;">${fmt(stopLoss)}</div>
<div style="font-size:13px;color:#ff4d4d;margin-top:4px;">${Number(slPct) > 0 ? '+' : ''}${slPct}%</div>
</td></tr></table>
</td>
</tr></table>
</td></tr>

</table>
</td></tr>

${sizingBlock}

<!-- CTA -->
<tr><td style="padding:0 0 24px 0;" align="center">
<a href="https://www.pulsewavelabs.io/dashboard" style="display:inline-block;padding:14px 40px;background-color:#00e5a0;color:#0a0a0a;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">Open Dashboard ${arrow}</a>
</td></tr>

<!-- Disclaimer -->
<tr><td style="padding:0 0 24px 0;" align="center">
<div style="font-size:12px;color:#444444;line-height:1.5;max-width:480px;">This is not financial advice. Trade at your own risk. Past performance does not guarantee future results. Always use the stop loss provided.</div>
</td></tr>

<!-- Footer -->
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
