'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WelcomeClient() {
  var router = useRouter()
  var [step, setStep] = useState(0)
  var [loggedIn, setLoggedIn] = useState(false)
  var [userEmail, setUserEmail] = useState('')
  var [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/subscription')
      .then(r => r.json())
      .then(d => { if (d.email) { setUserEmail(d.email); setLoggedIn(true) } })
      .catch(() => {})
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-[100dvh] bg-[#08080a] text-[#c8c8c8] overflow-x-hidden antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{font-family:'Inter',-apple-system,sans-serif;background:#08080a;-webkit-text-size-adjust:100%}
        .mono{font-family:'JetBrains Mono',monospace}
        .grid-bg{background-image:linear-gradient(rgba(255,255,255,.007) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.007) 1px,transparent 1px);background-size:50px 50px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .7s ease-out forwards}.fu1{animation:fadeUp .7s ease-out .1s forwards;opacity:0}.fu2{animation:fadeUp .7s ease-out .2s forwards;opacity:0}.fu3{animation:fadeUp .7s ease-out .3s forwards;opacity:0}.fu4{animation:fadeUp .7s ease-out .4s forwards;opacity:0}
        .card{background:#0a0a0c;border:1px solid rgba(255,255,255,.04);border-radius:12px;overflow:hidden}
        .card-active{background:#0a0a0c;border:1px solid rgba(0,229,160,.12);border-radius:12px;overflow:hidden}
        .btn-primary{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;padding:14px 0;background:#00e5a0;color:#08080a;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:.03em;border:none;cursor:pointer;transition:background .2s;-webkit-tap-highlight-color:transparent}
        .btn-primary:hover{background:#00cc8e}.btn-primary:active{transform:scale(.985)}
      `}} />

      <nav className="border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-10 h-14 flex items-center">
          <Link href="/"><img src="/logo.webp" alt="PulseWave" className="h-6 sm:h-7" /></Link>
        </div>
      </nav>

      <div className="grid-bg min-h-[calc(100dvh-56px)] flex items-start sm:items-center justify-center px-4 sm:px-5 py-8 sm:py-12 relative">
        <div className="absolute top-1/4 sm:top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,229,160,.03) 0%,transparent 65%)'}}/>

        <div className="w-full max-w-[460px] relative z-10">
          <div className="fu flex items-center gap-1.5 sm:gap-2 mb-8 sm:mb-10">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2" style={{flex: i < 2 ? 1 : undefined}}>
                <button
                  onClick={() => { if (i < step) setStep(i) }}
                  className={'w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] font-bold mono transition-all duration-300 border-none cursor-pointer ' +
                    (step > i ? 'bg-[#00e5a0] text-[#08080a]' :
                     step === i ? 'bg-[#00e5a0]/10 text-[#00e5a0] ring-1 ring-[#00e5a0]/20' :
                     'bg-white/[0.03] text-white/20 ring-1 ring-white/[0.06]')}
                  style={{WebkitTapHighlightColor: 'transparent'}}>
                  {step > i ? '✓' : i + 1}
                </button>
                {i < 2 && <div className={'flex-1 h-px transition-all duration-500 ' + (step > i ? 'bg-[#00e5a0]/30' : 'bg-white/[0.04]')} />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div>
              <div className="fu1 flex items-center gap-2 mb-4">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span></span>
                <span className="mono text-[11px] sm:text-[12px] text-[#00e5a0]/60 tracking-[.15em] font-medium">JOURNAL ACCESS ACTIVE</span>
              </div>

              <h1 className="fu1 text-[26px] sm:text-[32px] font-extrabold tracking-tight text-white leading-[1.1] mb-3">
                Build the habit before the edge.
              </h1>
              <p className="fu2 text-[14px] sm:text-[15px] text-white/45 leading-relaxed mb-6 sm:mb-8">
                PulseWave Journal works when every trade has context: thesis, risk, emotion, execution, debrief, and rule updates.
              </p>

              {!loggedIn ? (
                <div className="fu2 card-active p-4 sm:p-5 mb-3 sm:mb-4">
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[15px] font-semibold text-white mb-1.5">Set your password</h2>
                      <p className="text-[13px] text-white/35 leading-relaxed mb-3 sm:mb-4">Check your email for the account setup link, then come back to start logging trades.</p>
                      <div className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"><span className="text-[11px] sm:text-[12px] text-white/30 truncate">Look for <span className="text-white/50 font-medium">PulseWave Journal</span></span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fu2 card p-4 sm:p-5 mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 sm:gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.1] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[15px] font-semibold text-white mb-0.5">Account ready</h2>
                      <p className="text-[13px] text-white/30 truncate">Signed in as <span className="text-white/50">{userEmail}</span></p>
                    </div>
                    <span className="mono text-[10px] text-[#00e5a0]/50 bg-[#00e5a0]/[0.06] px-2 sm:px-2.5 py-1 rounded-full tracking-wider shrink-0">DONE</span>
                  </div>
                </div>
              )}

              <div className="fu3 card p-4 sm:p-5 mb-6 sm:mb-8">
                <div className="mono text-[10px] text-white/20 tracking-[.15em] mb-3 sm:mb-4 font-medium">THE PRODUCT LOOP</div>
                {[
                  { label: 'Plan', desc: 'Write the trade thesis before entry' },
                  { label: 'Log', desc: 'Capture risk, setup, session, emotion, and screenshots' },
                  { label: 'Debrief', desc: 'Compare plan vs outcome after the trade closes' },
                  { label: 'Improve', desc: 'Turn repeated leaks into trading rules' },
                ].map((item, i) => (
                  <div key={i + '-' + item.label} className={'flex items-start gap-2.5 sm:gap-3 ' + (i < 3 ? 'mb-3' : '')}>
                    <div className="w-1 h-1 rounded-full bg-[#00e5a0]/30 mt-[7px] shrink-0"></div>
                    <div className="min-w-0"><span className="text-[13px] text-white/70 font-medium">{item.label}</span><span className="text-[13px] text-white/25"> — {item.desc}</span></div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(1)} className="fu4 btn-primary">CONTINUE →</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="fu1 mono text-[11px] sm:text-[12px] text-[#00e5a0]/60 tracking-[.15em] font-medium mb-4">STEP 2 OF 3</div>
              <h1 className="fu1 text-[26px] sm:text-[28px] font-extrabold tracking-tight text-white leading-[1.1] mb-3">Log the first trade.</h1>
              <p className="fu2 text-[14px] sm:text-[15px] text-white/45 leading-relaxed mb-6 sm:mb-8">Start with one clean entry. It does not need to be perfect; it needs to be honest and complete.</p>

              <div className="fu2 card-active p-4 sm:p-5 mb-3">
                <div className="mono text-[10px] text-white/20 tracking-[.15em] mb-3 sm:mb-4 font-medium">FIRST ENTRY CHECKLIST</div>
                {[
                  'Pair, direction, entry, stop, and target',
                  'Setup type, timeframe, session, and confluence',
                  'Pre-trade thesis in plain English',
                  'Emotional state before entry',
                ].map((text, i) => (
                  <div key={i + '-' + text} className={'flex items-start gap-2.5 sm:gap-3 ' + (i < 3 ? 'mb-3' : '')}>
                    <span className="mono text-[10px] text-[#00e5a0]/45 mt-0.5">✓</span>
                    <span className="text-[13px] text-white/40 leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => router.push('/dashboard/journal/new')} className="fu3 btn-primary">CREATE FIRST TRADE →</button>
              <button onClick={() => setStep(2)} className="fu4 w-full min-h-[44px] py-2 text-[12px] text-white/25 mono hover:text-white/40 transition-colors bg-transparent border-none cursor-pointer mt-3">SHOW ME THE JOURNAL FIRST →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="fu text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 rounded-full bg-[#00e5a0]/[0.06] border border-[#00e5a0]/[0.12] flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h1 className="text-[26px] sm:text-[28px] font-extrabold tracking-tight text-white mb-3">You're ready.</h1>
                <p className="text-[14px] sm:text-[15px] text-white/40 leading-relaxed">Open the journal, log the first trade, then use debriefs and insights to tighten the next one.</p>
              </div>

              <div className="fu1 card p-4 sm:p-5 mb-6 sm:mb-8">
                <div className="mono text-[10px] text-white/20 tracking-[.15em] mb-3 sm:mb-4 font-medium">WHAT HAPPENS NEXT</div>
                {[
                  'Your dashboard shows trades that need debriefs',
                  'Insights highlight missing thesis, weak setups, and emotional leaks',
                  'Stats track whether your rules are improving expectancy',
                  'The goal is cleaner decisions, not more trades',
                ].map((item, i) => (
                  <div key={i + '-' + item} className={'flex items-start gap-2.5 sm:gap-3 ' + (i < 3 ? 'mb-3' : '')}>
                    <div className="w-1 h-1 rounded-full bg-[#00e5a0]/30 mt-[7px] shrink-0"></div>
                    <span className="text-[13px] text-white/40 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => router.push('/dashboard/journal')} className="fu3 btn-primary">OPEN JOURNAL →</button>
            </div>
          )}

          <div className="fu4 mt-6 sm:mt-8 pb-[env(safe-area-inset-bottom)] text-center">
            <p className="text-[11px] text-white/10">Questions? <a href="mailto:support@pulsewavelabs.io" className="underline hover:text-white/25 transition-colors">support@pulsewavelabs.io</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
