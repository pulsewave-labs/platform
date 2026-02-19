'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WelcomeClient() {
  var router = useRouter()
  var [loggedIn, setLoggedIn] = useState(false)
  var [userEmail, setUserEmail] = useState('')
  var [telegramLinked, setTelegramLinked] = useState(false)
  var [deepLink, setDeepLink] = useState('')
  var [linkLoading, setLinkLoading] = useState(false)
  var [checking, setChecking] = useState(false)
  var [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Try to load profile (may fail if not logged in — that's fine)
    fetch('/api/subscription')
      .then(r => r.json())
      .then(d => {
        if (d.email) { setUserEmail(d.email); setLoggedIn(true) }
      })
      .catch(() => {})

    fetch('/api/telegram/link')
      .then(r => r.json())
      .then(d => {
        if (d.linked) setTelegramLinked(true)
      })
      .catch(() => {})
  }, [])

  async function handleConnectTelegram() {
    setLinkLoading(true)
    try {
      var res = await fetch('/api/telegram/link', { method: 'POST' })
      if (res.ok) {
        var data = await res.json()
        setDeepLink(data.deep_link)
      }
    } catch {}
    setLinkLoading(false)
  }

  async function checkTelegram() {
    setChecking(true)
    try {
      var res = await fetch('/api/telegram/link')
      if (res.ok) {
        var data = await res.json()
        setTelegramLinked(data.linked)
      }
    } catch {}
    setChecking(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#000] text-white antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#000}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .6s ease-out forwards}
        .fu1{animation:fadeUp .6s ease-out .1s forwards;opacity:0}
        .fu2{animation:fadeUp .6s ease-out .2s forwards;opacity:0}
        .fu3{animation:fadeUp .6s ease-out .3s forwards;opacity:0}
        .fu4{animation:fadeUp .6s ease-out .4s forwards;opacity:0}
      `}} />

      <nav className="border-b border-white/[0.04]">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center">
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-5 opacity-50" /></Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-5 py-12 md:py-16">

        {/* Header */}
        <div className="fu mb-10">
          <div className="w-14 h-14 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-3">You're in.</h1>
          <p className="text-[15px] text-white/35 leading-relaxed">
            Your subscription is active. Three things to do — takes about 60 seconds.
          </p>
        </div>

        {/* ── CARD 1: Set Password ── */}
        <div className="fu1 mb-3">
          <div className="bg-[#0a0a0a] border border-[#00e5a0]/[0.15] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#00e5a0]/[0.08] border border-[#00e5a0]/[0.15] flex items-center justify-center shrink-0 mt-0.5">
                <span className="mono text-[12px] text-[#00e5a0]/60 font-bold">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-[15px] font-semibold text-white/80">Set your password</h2>
                  {loggedIn && (
                    <span className="mono text-[10px] text-[#00e5a0]/50 bg-[#00e5a0]/[0.06] px-2 py-0.5 rounded-full">DONE</span>
                  )}
                </div>
                <p className="text-[13px] text-white/30 leading-relaxed mb-3">
                  We created your account automatically. Check your email for a link to set your password — you'll need it to access your dashboard.
                </p>
                {!loggedIn ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <span className="text-[12px] text-white/25">Check your inbox for <strong className="text-white/40">"Welcome to PulseWave Signals"</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0]"></div>
                    <span className="text-[13px] text-white/40">Signed in as {userEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 2: Connect Telegram ── */}
        <div className="fu2 mb-3">
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                <span className="mono text-[12px] text-white/30 font-bold">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-[15px] font-semibold text-white/80">Connect Telegram</h2>
                  {telegramLinked && (
                    <span className="mono text-[10px] text-[#00e5a0]/50 bg-[#00e5a0]/[0.06] px-2 py-0.5 rounded-full">CONNECTED</span>
                  )}
                </div>
                <p className="text-[13px] text-white/30 leading-relaxed mb-3">
                  Get signal alerts pushed to your phone instantly. This is how most traders receive signals.
                </p>

                {telegramLinked ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0]"></div>
                    <span className="text-[13px] text-white/40">Telegram connected — signals will arrive instantly</span>
                  </div>
                ) : deepLink ? (
                  <div className="space-y-2">
                    <a href={deepLink} target="_blank" rel="noopener noreferrer"
                      className="block w-full py-3 bg-[#0088cc] text-white text-[14px] font-semibold rounded-lg text-center hover:bg-[#0077b5] transition-colors">
                      Open in Telegram
                    </a>
                    <button onClick={checkTelegram} disabled={checking}
                      className="w-full py-2 text-[12px] text-white/20 mono hover:text-white/40 transition-colors bg-transparent border-none cursor-pointer">
                      {checking ? 'Checking...' : "I've connected — verify →"}
                    </button>
                  </div>
                ) : loggedIn ? (
                  <button onClick={handleConnectTelegram} disabled={linkLoading}
                    className="w-full py-3 bg-[#0088cc] text-white text-[14px] font-semibold rounded-lg hover:bg-[#0077b5] transition-colors disabled:opacity-50 border-none cursor-pointer">
                    {linkLoading ? 'Generating...' : 'Connect Telegram'}
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[12px] text-white/20">Set your password first, then connect Telegram from your dashboard</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: Email Signals ── */}
        <div className="fu3 mb-8">
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                <span className="mono text-[12px] text-white/30 font-bold">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-[15px] font-semibold text-white/80">Email signals</h2>
                  <span className="mono text-[10px] text-[#00e5a0]/50 bg-[#00e5a0]/[0.06] px-2 py-0.5 rounded-full">ON</span>
                </div>
                <p className="text-[13px] text-white/30 leading-relaxed">
                  Every signal is also sent to your email with full trade details. Already enabled — no action needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="fu4">
          {loggedIn ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-[#00e5a0] text-black rounded-xl font-bold text-[15px] hover:bg-[#00d492] transition-all border-none cursor-pointer"
            >
              Open Dashboard →
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#00e5a0]/[0.03] border border-[#00e5a0]/[0.06] text-center">
                <p className="text-[14px] text-white/50 mb-1">
                  <strong className="text-white/70">Check your email</strong> to set your password and unlock your dashboard.
                </p>
                <p className="text-[11px] text-white/20">
                  Look for "Welcome to PulseWave Signals" from hello@system.pulsewavelabs.io
                </p>
              </div>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 bg-white/[0.04] border border-white/[0.06] text-white/50 rounded-xl font-semibold text-[14px] text-center hover:bg-white/[0.06] hover:text-white/70 transition-all no-underline"
              >
                Open Gmail →
              </a>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="fu4 mt-6 text-center">
          <p className="text-[11px] text-white/12">
            Questions? Email <a href="mailto:mason@pulsewavelabs.io" className="underline hover:text-white/25 transition-colors">mason@pulsewavelabs.io</a>
          </p>
        </div>

      </div>
    </div>
  )
}
