'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WelcomeClient() {
  var router = useRouter()
  var [step, setStep] = useState(0)
  var [loggedIn, setLoggedIn] = useState(false)
  var [userEmail, setUserEmail] = useState('')
  var [telegramLinked, setTelegramLinked] = useState(false)
  var [deepLink, setDeepLink] = useState('')
  var [linkLoading, setLinkLoading] = useState(false)
  var [checking, setChecking] = useState(false)
  var [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/subscription')
      .then(r => r.json())
      .then(d => {
        if (d.email) { setUserEmail(d.email); setLoggedIn(true) }
      })
      .catch(() => {})
    fetch('/api/telegram/link')
      .then(r => r.json())
      .then(d => { if (d.linked) setTelegramLinked(true) })
      .catch(() => {})
  }, [])

  async function handleConnectTelegram() {
    setLinkLoading(true)
    try {
      var res = await fetch('/api/telegram/link', { method: 'POST' })
      if (res.ok) { var data = await res.json(); setDeepLink(data.deep_link) }
    } catch {}
    setLinkLoading(false)
  }

  async function checkTelegram() {
    setChecking(true)
    try {
      var res = await fetch('/api/telegram/link')
      if (res.ok) { var data = await res.json(); setTelegramLinked(data.linked) }
    } catch {}
    setChecking(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#08080a] text-[#c8c8c8] overflow-x-hidden antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#08080a}
        .mono{font-family:'JetBrains Mono',monospace}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.007) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.007) 1px,transparent 1px);background-size:50px 50px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .7s ease-out forwards}.fu1{animation:fadeUp .7s ease-out .1s forwards;opacity:0}.fu2{animation:fadeUp .7s ease-out .2s forwards;opacity:0}.fu3{animation:fadeUp .7s ease-out .3s forwards;opacity:0}.fu4{animation:fadeUp .7s ease-out .4s forwards;opacity:0}
        .card{background:#0a0a0c;border:1px solid rgba(255,255,255,.04);border-radius:10px;overflow:hidden}
        .card-active{background:#0a0a0c;border:1px solid rgba(0,229,160,.12);border-radius:10px;overflow:hidden}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04) 50%,transparent)}
      `}} />

      {/* NAV */}
      <nav className="border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center">
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-7" /></Link>
        </div>
      </nav>

      <div className="grid-bg min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-12 relative">
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-[460px] relative z-10">

          {/* Step indicator */}
          <div className="fu flex items-center gap-2 mb-10">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-2" style={{flex: i < 2 ? 1 : undefined}}>
                <button
                  onClick={() => { if (i < step) setStep(i) }}
                  className={'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mono transition-all duration-300 border-none cursor-pointer ' +
                    (step > i ? 'bg-[#00e5a0] text-[#08080a]' :
                     step === i ? 'bg-[#00e5a0]/10 text-[#00e5a0] ring-1 ring-[#00e5a0]/20' :
                     'bg-white/[0.03] text-white/20 ring-1 ring-white/[0.06]')}
                >
                  {step > i ? '✓' : i + 1}
                </button>
                {i < 2 && <div className={'flex-1 h-px transition-all duration-500 ' + (step > i ? 'bg-[#00e5a0]/30' : 'bg-white/[0.04]')} />}
              </div>
            ))}
          </div>

          {/* ═══ STEP 0: Account Setup ═══ */}
          {step === 0 && (
            <div>
              <div className="fu1 flex items-center gap-2 mb-4">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
                <span className="mono text-[12px] text-[#00e5a0]/60 tracking-[.15em] font-medium">SUBSCRIPTION ACTIVE</span>
              </div>

              <h1 className="fu1 text-[28px] md:text-[32px] font-extrabold tracking-tight text-white leading-[1.1] mb-3">
                You're in.
              </h1>
              <p className="fu2 text-[15px] text-white/45 leading-relaxed mb-8">
                Let's get your account set up. Takes about 60 seconds.
              </p>

              {/* Set Password Card */}
              {!loggedIn ? (
                <div className="fu2 card-active p-5 mb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[15px] font-semibold text-white mb-1.5">Set your password</h2>
                      <p className="text-[13px] text-white/35 leading-relaxed mb-4">
                        We created your account. Check your email for a link to set your password.
                      </p>
                      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                        <span className="text-[12px] text-white/30">Look for <span className="text-white/50 font-medium">"Welcome to PulseWave Signals"</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fu2 card p-5 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[15px] font-semibold text-white mb-0.5">Account ready</h2>
                      <p className="text-[13px] text-white/30">Signed in as <span className="text-white/50">{userEmail}</span></p>
                    </div>
                    <span className="mono text-[10px] text-[#00e5a0]/50 bg-[#00e5a0]/[0.06] px-2.5 py-1 rounded-full tracking-wider">DONE</span>
                  </div>
                </div>
              )}

              {/* What you get */}
              <div className="fu3 card p-5 mb-8">
                <div className="mono text-[10px] text-white/20 tracking-[.15em] mb-4 font-medium">WHAT YOU GET</div>
                {[
                  { label: 'Signal alerts', desc: 'Entry, stop loss, take profit — delivered instantly' },
                  { label: '~25 signals/month', desc: '5 pairs, multiple timeframes, 24/7' },
                  { label: '1.52 profit factor', desc: 'Winners are 2-3× larger than losers' },
                  { label: 'Live dashboard', desc: 'Every trade tracked and verified' },
                ].map((item, i) => (
                  <div key={i} className={'flex items-start gap-3 ' + (i < 3 ? 'mb-3.5' : '')}>
                    <div className="w-1 h-1 rounded-full bg-[#00e5a0]/30 mt-2 shrink-0"></div>
                    <div>
                      <span className="text-[13px] text-white/70 font-medium">{item.label}</span>
                      <span className="text-[13px] text-white/25"> — {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {loggedIn ? (
                <button onClick={() => setStep(1)}
                  className="fu4 w-full py-3 bg-[#00e5a0] text-[#08080a] rounded-lg font-bold text-[14px] tracking-wide hover:bg-[#00cc8e] transition-colors border-none cursor-pointer">
                  SET UP NOTIFICATIONS →
                </button>
              ) : (
                <div className="fu4 space-y-3">
                  <button onClick={() => setStep(1)}
                    className="w-full py-3 bg-[#00e5a0] text-[#08080a] rounded-lg font-bold text-[14px] tracking-wide hover:bg-[#00cc8e] transition-colors border-none cursor-pointer">
                    CONTINUE →
                  </button>
                  <p className="text-[11px] text-white/15 text-center">You can set your password later from the email</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 1: Notifications ═══ */}
          {step === 1 && (
            <div>
              <div className="fu1 mono text-[12px] text-[#00e5a0]/60 tracking-[.15em] font-medium mb-4">STEP 2 OF 3</div>
              <h1 className="fu1 text-[28px] font-extrabold tracking-tight text-white leading-[1.1] mb-3">
                Signal delivery
              </h1>
              <p className="fu2 text-[15px] text-white/45 leading-relaxed mb-8">
                Choose how you receive trade alerts.
              </p>

              {/* Telegram */}
              <div className={'fu2 ' + (telegramLinked ? 'card' : 'card-active') + ' p-5 mb-3'}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#0088cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[15px] font-semibold text-white">Telegram</span>
                  </div>
                  {telegramLinked ? (
                    <span className="mono text-[10px] text-[#00e5a0]/50 bg-[#00e5a0]/[0.06] px-2.5 py-1 rounded-full tracking-wider">CONNECTED</span>
                  ) : (
                    <span className="mono text-[10px] text-[#0088cc]/60 bg-[#0088cc]/[0.06] px-2.5 py-1 rounded-full tracking-wider">RECOMMENDED</span>
                  )}
                </div>
                <p className="text-[13px] text-white/30 leading-relaxed mb-4">
                  Fastest delivery. Push notifications the instant a signal fires.
                </p>

                {telegramLinked ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0]"></div>
                    <span className="text-[13px] text-white/40">Connected — signals arrive instantly</span>
                  </div>
                ) : deepLink ? (
                  <div className="space-y-2">
                    <a href={deepLink} target="_blank" rel="noopener noreferrer"
                      className="block w-full py-2.5 bg-[#0088cc] text-white text-[13px] font-semibold rounded-lg text-center hover:bg-[#0077b5] transition-colors no-underline">
                      Open in Telegram
                    </a>
                    <button onClick={checkTelegram} disabled={checking}
                      className="w-full py-2 text-[11px] text-white/20 mono hover:text-white/40 transition-colors bg-transparent border-none cursor-pointer">
                      {checking ? 'Checking...' : "I've connected — verify →"}
                    </button>
                  </div>
                ) : loggedIn ? (
                  <button onClick={handleConnectTelegram} disabled={linkLoading}
                    className="w-full py-2.5 bg-[#0088cc] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0077b5] transition-colors disabled:opacity-50 border-none cursor-pointer">
                    {linkLoading ? 'Generating...' : 'Connect Telegram'}
                  </button>
                ) : (
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[12px] text-white/20">Set your password first, then connect from your dashboard</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="fu3 card p-5 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <span className="text-[15px] font-semibold text-white">Email</span>
                  </div>
                  <span className="mono text-[10px] text-[#00e5a0]/50 bg-[#00e5a0]/[0.06] px-2.5 py-1 rounded-full tracking-wider">ON</span>
                </div>
                <p className="text-[13px] text-white/30 leading-relaxed">
                  Every signal also sent to {userEmail ? <span className="text-white/50">{userEmail}</span> : 'your email'}. Already enabled.
                </p>
              </div>

              <button onClick={() => setStep(2)}
                className="fu4 w-full py-3 bg-[#00e5a0] text-[#08080a] rounded-lg font-bold text-[14px] tracking-wide hover:bg-[#00cc8e] transition-colors border-none cursor-pointer">
                {telegramLinked ? 'CONTINUE →' : 'SKIP — I\'LL USE EMAIL →'}
              </button>
              {!telegramLinked && (
                <p className="fu4 text-[11px] text-white/15 text-center mt-3">You can connect Telegram later in Settings</p>
              )}
            </div>
          )}

          {/* ═══ STEP 2: Ready ═══ */}
          {step === 2 && (
            <div>
              <div className="fu text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h1 className="text-[28px] font-extrabold tracking-tight text-white mb-3">You're all set.</h1>
                <p className="text-[15px] text-white/40 leading-relaxed">
                  The engine is scanning right now. When a setup forms, you'll know.
                </p>
              </div>

              <div className="fu1 card p-5 mb-4">
                <div className="mono text-[10px] text-white/20 tracking-[.15em] mb-4 font-medium">WHAT HAPPENS NEXT</div>
                {[
                  { text: 'You\'ll get your first signal when the engine spots a setup' },
                  { text: telegramLinked ? 'Signals hit Telegram + email instantly' : 'Signals sent to your email' },
                  { text: 'Every trade tracked on your dashboard in real time' },
                  { text: 'Every signal includes a stop loss — always use it' },
                ].map((item, i) => (
                  <div key={i} className={'flex items-start gap-3 ' + (i < 3 ? 'mb-3' : '')}>
                    <div className="w-1 h-1 rounded-full bg-[#00e5a0]/30 mt-2 shrink-0"></div>
                    <span className="text-[13px] text-white/40 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Pro tip */}
              <div className="fu2 card-active p-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="mono text-[11px] text-[#00e5a0]/40 mt-0.5">TIP</span>
                  <p className="text-[13px] text-white/35 leading-relaxed">
                    Don't risk more than 10% per trade. The edge comes from consistency over dozens of trades, not from any single one.
                  </p>
                </div>
              </div>

              <button onClick={() => router.push('/dashboard')}
                className="fu3 w-full py-3 bg-[#00e5a0] text-[#08080a] rounded-lg font-bold text-[14px] tracking-wide hover:bg-[#00cc8e] transition-colors border-none cursor-pointer">
                OPEN DASHBOARD →
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="fu4 mt-8 text-center">
            <p className="text-[11px] text-white/10">
              Questions? <a href="mailto:support@pulsewavelabs.io" className="underline hover:text-white/25 transition-colors">support@pulsewavelabs.io</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
