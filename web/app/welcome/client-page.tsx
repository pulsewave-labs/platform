'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomeClient() {
  var router = useRouter()
  var [step, setStep] = useState(0)
  var [telegramLinked, setTelegramLinked] = useState(false)
  var [deepLink, setDeepLink] = useState('')
  var [linkLoading, setLinkLoading] = useState(false)
  var [emailSignals, setEmailSignals] = useState(true)
  var [userEmail, setUserEmail] = useState('')
  var [checking, setChecking] = useState(false)
  var [mounted, setMounted] = useState(false)

  useEffect(function () {
    setMounted(true)
    // Load profile info
    fetch('/api/subscription')
      .then(function (r) { return r.json() })
      .then(function (d) {
        if (d.email) setUserEmail(d.email)
      })
      .catch(function () {})

    // Check telegram status
    fetch('/api/telegram/link')
      .then(function (r) { return r.json() })
      .then(function (d) {
        setTelegramLinked(d.linked)
        if (d.email_signals !== undefined) setEmailSignals(d.email_signals)
      })
      .catch(function () {})
  }, [])

  async function handleConnectTelegram() {
    setLinkLoading(true)
    try {
      var res = await fetch('/api/telegram/link', { method: 'POST' })
      if (res.ok) {
        var data = await res.json()
        setDeepLink(data.deep_link)
      }
    } catch (e) {}
    setLinkLoading(false)
  }

  async function checkTelegramStatus() {
    setChecking(true)
    try {
      var res = await fetch('/api/telegram/link')
      if (res.ok) {
        var data = await res.json()
        setTelegramLinked(data.linked)
      }
    } catch (e) {}
    setChecking(false)
  }

  if (!mounted) return null

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#050505" />
        <title>Welcome to PulseWave Signals</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#050505', fontFamily: 'Inter, system-ui, sans-serif', color: '#e0e0e0', minHeight: '100vh' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .mono { font-family: 'JetBrains Mono', monospace; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(0,229,160,0.1); } 50% { box-shadow: 0 0 40px rgba(0,229,160,0.2); } }
          .fade-up { animation: fadeUp 0.6s ease-out forwards; }
          .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
          .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
          .fade-up-3 { animation-delay: 0.3s; opacity: 0; }
          .fade-up-4 { animation-delay: 0.4s; opacity: 0; }
          .glow-pulse { animation: pulse-glow 3s ease-in-out infinite; }
        `}} />

        <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px 80px' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
            {[0, 1, 2].map(function (i) {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < 2 ? 1 : undefined }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    backgroundColor: step >= i ? '#00e5a0' : '#111',
                    color: step >= i ? '#050505' : '#444',
                    border: step >= i ? 'none' : '1px solid #222',
                    transition: 'all 0.3s ease',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  {i < 2 && (
                    <div style={{ flex: 1, height: 1, backgroundColor: step > i ? '#00e5a0' : '#1a1a1a', transition: 'all 0.3s ease' }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div>
              <div className="fade-up" style={{ marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 12, color: '#00e5a0', letterSpacing: 2, fontWeight: 600 }}>YOU'RE IN</span>
              </div>

              <h1 className="fade-up fade-up-1" style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>
                Welcome to PulseWave
              </h1>

              <p className="fade-up fade-up-2" style={{ fontSize: 15, color: '#777', lineHeight: 1.7, margin: '0 0 32px' }}>
                You now have access to the same engine that turned $10K into $218K across 624 trades. Let's get you set up in 60 seconds.
              </p>

              {/* What you get */}
              <div className="fade-up fade-up-3" style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                <div className="mono" style={{ fontSize: 11, color: '#555', letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>WHAT YOU GET</div>

                {[
                  { icon: '⚡', label: 'Instant signal alerts', desc: 'Entry, stop loss, take profit — delivered in seconds' },
                  { icon: '📊', label: '~25 signals per month', desc: '5 pairs, multiple timeframes, 24/7 scanning' },
                  { icon: '🎯', label: '1.52 profit factor', desc: '40.7% win rate — winners are 2-3x larger than losers' },
                  { icon: '📈', label: 'Live performance dashboard', desc: 'Every trade tracked. Every result verified.' },
                ].map(function (item, i) {
                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 3 ? 16 : 0 }}>
                      <div style={{ fontSize: 18, lineHeight: '24px', flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 14, color: '#ccc', fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.4 }}>{item.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                className="fade-up fade-up-4"
                onClick={function () { setStep(1) }}
                style={{
                  width: '100%', padding: '14px 0',
                  backgroundColor: '#00e5a0', color: '#050505',
                  fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 8,
                  cursor: 'pointer', letterSpacing: 0.3,
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={function (e) { e.currentTarget.style.backgroundColor = '#00cc8e' }}
                onMouseOut={function (e) { e.currentTarget.style.backgroundColor = '#00e5a0' }}
              >
                Set Up Notifications →
              </button>
            </div>
          )}

          {/* STEP 1: Notifications */}
          {step === 1 && (
            <div>
              <div className="fade-up" style={{ marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 12, color: '#00e5a0', letterSpacing: 2, fontWeight: 600 }}>STEP 2 OF 3</span>
              </div>

              <h1 className="fade-up fade-up-1" style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>
                How do you want signals?
              </h1>

              <p className="fade-up fade-up-2" style={{ fontSize: 15, color: '#777', lineHeight: 1.7, margin: '0 0 32px' }}>
                Choose how you receive trade alerts. You can always change this in settings.
              </p>

              {/* Telegram Card */}
              <div className="fade-up fade-up-2" style={{
                backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12,
                padding: 24, marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>💬</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Telegram</span>
                  </div>
                  {telegramLinked && (
                    <span className="mono" style={{ fontSize: 11, color: '#00e5a0', backgroundColor: '#00e5a0' + '14', padding: '3px 10px', borderRadius: 20, border: '1px solid #00e5a0' + '26' }}>CONNECTED</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
                  Fastest delivery. Get push notifications the instant a signal fires.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: '#0088cc' + '10', borderRadius: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 13 }}>⚡</span>
                  <span className="mono" style={{ fontSize: 11, color: '#0088cc' }}>RECOMMENDED — INSTANT DELIVERY</span>
                </div>

                {telegramLinked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00e5a0' }} />
                    <span style={{ fontSize: 14, color: '#ccc' }}>Telegram connected — you'll receive signals instantly</span>
                  </div>
                ) : deepLink ? (
                  <div>
                    <a href={deepLink} target="_blank" rel="noopener noreferrer" style={{
                      display: 'block', width: '100%', textAlign: 'center', padding: '12px 0',
                      backgroundColor: '#0088cc', color: '#fff', fontSize: 14, fontWeight: 600,
                      textDecoration: 'none', borderRadius: 8, marginBottom: 8,
                    }}>
                      Open in Telegram
                    </a>
                    <button onClick={checkTelegramStatus} disabled={checking} style={{
                      display: 'block', width: '100%', textAlign: 'center', padding: '8px 0',
                      backgroundColor: 'transparent', border: 'none', color: '#666', fontSize: 13,
                      cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {checking ? 'Checking...' : 'I\'ve connected — check status'}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleConnectTelegram} disabled={linkLoading} style={{
                    width: '100%', padding: '12px 0',
                    backgroundColor: '#0088cc', color: '#fff',
                    fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8,
                    cursor: 'pointer', opacity: linkLoading ? 0.5 : 1,
                  }}>
                    {linkLoading ? 'Generating link...' : 'Connect Telegram'}
                  </button>
                )}
              </div>

              {/* Email Card */}
              <div className="fade-up fade-up-3" style={{
                backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12,
                padding: 24, marginBottom: 32,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>📧</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Email</span>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: '#00e5a0', backgroundColor: '#00e5a0' + '14', padding: '3px 10px', borderRadius: 20, border: '1px solid #00e5a0' + '26' }}>ON</span>
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                  Signals delivered to <span style={{ color: '#aaa' }}>{userEmail || 'your email'}</span>. Includes entry, TP, SL, and position sizing. Enabled by default.
                </div>
              </div>

              <button
                className="fade-up fade-up-4"
                onClick={function () { setStep(2) }}
                style={{
                  width: '100%', padding: '14px 0',
                  backgroundColor: '#00e5a0', color: '#050505',
                  fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 8,
                  cursor: 'pointer', letterSpacing: 0.3,
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={function (e) { e.currentTarget.style.backgroundColor = '#00cc8e' }}
                onMouseOut={function (e) { e.currentTarget.style.backgroundColor = '#00e5a0' }}
              >
                {telegramLinked ? 'Continue →' : 'Skip for now — I\'ll use email →'}
              </button>

              {!telegramLinked && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: '#444' }}>You can connect Telegram later in Settings</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Ready */}
          {step === 2 && (
            <div>
              <div className="fade-up" style={{ textAlign: 'center', marginBottom: 32 }}>
                <div className="glow-pulse" style={{
                  width: 80, height: 80, borderRadius: '50%',
                  backgroundColor: '#00e5a0' + '10', border: '1px solid #00e5a0' + '30',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', fontSize: 36,
                }}>
                  ✓
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>You're all set</h1>
                <p style={{ fontSize: 15, color: '#777', lineHeight: 1.7, margin: 0 }}>
                  The engine is scanning 5 pairs across multiple timeframes right now. When a setup forms, you'll know.
                </p>
              </div>

              {/* What happens next */}
              <div className="fade-up fade-up-1" style={{
                backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12,
                padding: 24, marginBottom: 24,
              }}>
                <div className="mono" style={{ fontSize: 11, color: '#555', letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>WHAT HAPPENS NEXT</div>

                {[
                  { icon: '🔔', text: 'You\'ll receive your first signal when the engine spots a setup' },
                  { icon: '📱', text: telegramLinked ? 'Signals will hit your Telegram + email instantly' : 'Signals will be sent to your email' },
                  { icon: '📊', text: 'Every trade is tracked on your dashboard in real time' },
                  { icon: '🛑', text: 'Every signal includes a stop loss — always use it' },
                ].map(function (item, i) {
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 14 : 0, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 16, lineHeight: '22px', flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, color: '#999', lineHeight: 1.5 }}>{item.text}</span>
                    </div>
                  )
                })}
              </div>

              {/* Pro tip */}
              <div className="fade-up fade-up-2" style={{
                backgroundColor: '#00e5a0' + '08', border: '1px solid #00e5a0' + '15',
                borderRadius: 12, padding: 20, marginBottom: 32,
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                  <div>
                    <div style={{ fontSize: 14, color: '#00e5a0', fontWeight: 600, marginBottom: 4 }}>Pro tip</div>
                    <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>
                      Don't risk more than 10% per trade. The engine's edge comes from consistency over dozens of trades, not from any single one.
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="fade-up fade-up-3"
                onClick={function () { router.push('/dashboard') }}
                style={{
                  width: '100%', padding: '14px 0',
                  backgroundColor: '#00e5a0', color: '#050505',
                  fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 8,
                  cursor: 'pointer', letterSpacing: 0.3,
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={function (e) { e.currentTarget.style.backgroundColor = '#00cc8e' }}
                onMouseOut={function (e) { e.currentTarget.style.backgroundColor = '#00e5a0' }}
              >
                Open Dashboard →
              </button>
            </div>
          )}

        </div>
      </body>
    </html>
  )
}
