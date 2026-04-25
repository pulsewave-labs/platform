'use client'

import { useState } from 'react'
import Link from 'next/link'

const features = [
  {
    eyebrow: 'LOG',
    title: 'Capture the full trade, not just the P&L',
    body: 'Entry, exit, stop, target, size, thesis, setup, timeframe, session, screenshots, emotion, and post-trade notes in one clean flow.',
  },
  {
    eyebrow: 'REVIEW',
    title: 'AI reviews that sound like a trading coach',
    body: 'Turn raw trade data into plain-English feedback: what worked, what failed, what rule was broken, and what to do next time.',
  },
  {
    eyebrow: 'DETECT',
    title: 'Find the leaks your memory hides',
    body: 'See when FOMO, revenge trades, weak setups, bad sessions, and broken rules are quietly dragging down your expectancy.',
  },
  {
    eyebrow: 'IMPROVE',
    title: 'Build rules from evidence',
    body: 'Convert repeated mistakes into rules, then track whether following those rules actually changes your results.',
  },
]

const metrics = [
  { label: 'Win Rate', value: '42%', sub: 'but +0.38R expectancy' },
  { label: 'Best Setup', value: '4H Rejection', sub: '+1.21R avg' },
  { label: 'Main Leak', value: 'FOMO Longs', sub: '-0.74R avg' },
  { label: 'Rules Followed', value: '68%', sub: '+$1,240 impact' },
]

const reviewItems = [
  ['Primary mistake', 'Entered before confirmation after two missed moves.'],
  ['What worked', 'Stop was defined before entry and position size stayed inside risk limit.'],
  ['What to repeat', 'Keep the 4H rejection setup. It is your best-performing playbook.'],
  ['Rule suggestion', 'No NY-session long unless setup grade is A and stop is placed first.'],
]

const leaks = [
  { name: 'FOMO trades', stat: '-0.74R', tone: 'bad' },
  { name: 'Rules followed', stat: '+0.51R', tone: 'good' },
  { name: 'London session', stat: '+0.82R', tone: 'good' },
  { name: 'No thesis logged', stat: '-1.08R', tone: 'bad' },
]

function PulseLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8 rounded-xl border border-[#00e5a0]/30 bg-[#00e5a0]/10 shadow-[0_0_35px_rgba(0,229,160,0.18)]">
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00e5a0] shadow-[0_0_22px_rgba(0,229,160,0.65)]" />
      </div>
      <div>
        <p className="text-sm font-bold tracking-tight text-white">PulseWave</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Journal</p>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00e5a0]/15 bg-[#00e5a0]/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0] shadow-[0_0_12px_rgba(0,229,160,0.8)]" />
      {children}
    </div>
  )
}

function JournalPreview() {
  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#08090c] shadow-2xl shadow-black/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,229,160,0.14),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">Product preview · sample data</p>
            <h3 className="mt-1 text-lg font-semibold text-white">AI Journal Overview</h3>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#00e5a0]/20 bg-[#00e5a0]/10 px-3 py-1.5 font-mono text-[10px] text-[#00e5a0] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0]" />
            LIVE REVIEW
          </div>
        </div>
      </div>

      <div className="relative grid gap-px bg-white/[0.05] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[#08090c]/95 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{m.label}</p>
                <p className="mt-2 font-mono text-xl font-bold text-white">{m.value}</p>
                <p className="mt-1 text-xs text-white/40">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="grid grid-cols-12 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              <div className="col-span-3">Pair</div>
              <div className="col-span-2 text-right">R</div>
              <div className="col-span-3 text-right">Setup</div>
              <div className="col-span-4 text-right">AI Flag</div>
            </div>
            {[
              ['BTC/USDT', '+2.1R', '4H rejection', 'repeat'],
              ['ETH/USDT', '-1.0R', 'FOMO long', 'leak'],
              ['SOL/USDT', '+0.7R', 'range reclaim', 'clean'],
              ['BTC/USDT', '-0.6R', 'no thesis', 'review'],
            ].map((row) => (
              <div key={row.join('-')} className="grid grid-cols-12 items-center border-b border-white/[0.04] px-4 py-3 text-sm last:border-b-0">
                <div className="col-span-3 font-medium text-white">{row[0]}</div>
                <div className={`col-span-2 text-right font-mono ${row[1].startsWith('+') ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>{row[1]}</div>
                <div className="col-span-3 text-right text-white/55">{row[2]}</div>
                <div className="col-span-4 text-right">
                  <span className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${row[3] === 'leak' ? 'bg-[#ff4976]/10 text-[#ff4976]' : row[3] === 'repeat' ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'bg-white/[0.05] text-white/45'}`}>{row[3]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#06070a]/95 p-4 sm:p-6">
          <div className="rounded-2xl border border-[#00e5a0]/15 bg-[#00e5a0]/[0.035] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00e5a0]">AI Debrief</p>
                <h4 className="mt-1 font-semibold text-white">Trade #184 Review</h4>
              </div>
              <div className="rounded-lg border border-[#00e5a0]/20 bg-black/20 px-2.5 py-1 font-mono text-sm font-bold text-[#00e5a0]">B-</div>
            </div>
            <div className="space-y-3">
              {reviewItems.map(([label, body]) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-white/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingClientPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = [
    { label: 'Product', href: '#product' },
    { label: 'AI Review', href: '#ai-review' },
    { label: 'Insights', href: '#insights' },
  ]

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,229,160,0.16),transparent_35%),radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(0,229,160,0.08),transparent_28%)]" />

      <nav className="relative z-20 border-b border-white/[0.06] bg-[#05060a]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <PulseLogo />
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-white/60 transition hover:text-white">
                {item.label}
              </a>
            ))}
            <Link href="/auth/login" className="text-sm text-white/60 transition hover:text-white">
              Log in
            </Link>
            <Link href="/auth/signup" className="rounded-xl bg-[#00e5a0] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#00c98c]">
              Start Journaling
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-white/70 md:hidden"
          >
            Menu
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/[0.06] bg-[#05060a] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {nav.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm text-white/65">
                  {item.label}
                </a>
              ))}
              <Link href="/auth/login" className="text-sm text-white/65">Log in</Link>
              <Link href="/auth/signup" className="rounded-xl bg-[#00e5a0] px-4 py-2 text-center text-sm font-bold text-black">
                Start Journaling
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative z-10 px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0] shadow-[0_0_16px_rgba(0,229,160,0.9)]" />
              AI Trading Journal
            </div>
            <h1 className="text-balance text-5xl font-black tracking-[-0.025em] text-white sm:text-7xl lg:text-8xl" style={{ wordSpacing: '0.04em' }}>
              Your trading journal should tell you why you keep losing.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/58 sm:text-xl">
              PulseWave turns every trade into patterns, rules, and AI feedback — so every entry becomes data you can actually improve from.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/signup" className="w-full rounded-2xl bg-[#00e5a0] px-7 py-4 text-center text-sm font-black text-black shadow-[0_0_40px_rgba(0,229,160,0.22)] transition hover:bg-[#00c98c] sm:w-auto">
                Start Journaling
              </Link>
              <a href="#product" className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.03] px-7 py-4 text-center text-sm font-bold text-white/80 transition hover:border-white/[0.18] hover:bg-white/[0.06] sm:w-auto">
                View Journal Demo
              </a>
            </div>
          </div>

          <div className="mt-14 sm:mt-20">
            <JournalPreview />
          </div>
        </div>
      </section>

      <section id="product" className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <SectionLabel>What it does</SectionLabel>
            <h2 className="text-3xl font-black tracking-[-0.02em] text-white sm:text-5xl">Not another spreadsheet. A feedback loop.</h2>
            <p className="mt-4 text-lg leading-8 text-white/55">
              Most traders log trades after the damage is done — then never look at them again. PulseWave is built to extract signal from your own behavior.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/[0.07] bg-[#08090c]/80 p-6 transition hover:-translate-y-1 hover:border-[#00e5a0]/20 hover:bg-[#0a0c10]">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">{feature.eyebrow}</p>
                <h3 className="mt-4 text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/48">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-review" className="relative z-10 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>AI review</SectionLabel>
            <h2 className="text-3xl font-black tracking-[-0.02em] text-white sm:text-5xl">Every trade becomes a case file.</h2>
            <p className="mt-5 text-lg leading-8 text-white/55">
              A good journal should not just store what happened. It should explain what mattered. PulseWave reviews your thesis, execution, emotion, setup, and result — then turns it into a clear next action.
            </p>
            <div className="mt-8 space-y-3">
              {['What should I repeat?', 'What mistake cost me?', 'What rule would prevent this?', 'Is this setup actually worth taking?'].map((q) => (
                <div key={q} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="h-2 w-2 rounded-full bg-[#00e5a0]" />
                  <p className="text-sm text-white/65">{q}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#08090c] p-5 shadow-2xl shadow-black/35">
            <div className="rounded-2xl border border-[#00e5a0]/15 bg-[#00e5a0]/[0.035] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00e5a0]">Weekly AI Debrief</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">Your biggest leak is not the strategy.</h3>
                </div>
                <div className="rounded-xl border border-[#ff4976]/20 bg-[#ff4976]/10 px-3 py-2 font-mono text-sm font-bold text-[#ff4976]">LEAK</div>
              </div>
              <p className="mt-5 leading-8 text-white/62">
                You are profitable when your trade has a pre-written thesis. Trades without a thesis are averaging <span className="font-mono text-[#ff4976]">-1.08R</span>. Your best results come from 4H rejection setups during London session.
              </p>
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Next rule</p>
                <p className="mt-2 text-sm leading-7 text-white/75">No trade can be opened unless the thesis, invalidation, and target are written before entry.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="insights" className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="rounded-3xl border border-white/[0.08] bg-[#08090c] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {leaks.map((leak) => (
                <div key={leak.name} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{leak.name}</p>
                  <p className={`mt-3 font-mono text-3xl font-black ${leak.tone === 'good' ? 'text-[#00e5a0]' : 'text-[#ff4976]'}`}>{leak.stat}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Leak detection</SectionLabel>
            <h2 className="text-3xl font-black tracking-[-0.02em] text-white sm:text-5xl">Your edge is hiding in your own data.</h2>
            <p className="mt-5 text-lg leading-8 text-white/55">
              PulseWave compares your trades by setup, session, emotion, timeframe, rule adherence, and R-multiple — then surfaces the few patterns that actually matter.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#00e5a0]/15 bg-[#00e5a0]/[0.045] p-8 text-center shadow-[0_0_80px_rgba(0,229,160,0.08)] sm:p-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00e5a0]">Clean data. Clear feedback. Better rules.</p>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.025em] text-white sm:text-6xl">Turn your next trade into a lesson.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/55">
            Start logging now. The first meaningful insight usually appears after a handful of honest trades.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth/signup" className="rounded-2xl bg-[#00e5a0] px-7 py-4 text-sm font-black text-black transition hover:bg-[#00c98c]">
              Start Journaling
            </Link>
            <Link href="/auth/login" className="rounded-2xl border border-white/[0.1] bg-black/20 px-7 py-4 text-sm font-bold text-white/75 transition hover:bg-white/[0.05]">
              Existing Member Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-white/35 sm:flex-row sm:items-center">
          <PulseLogo />
          <div className="flex gap-5">
            <Link href="/privacy" className="transition hover:text-white/60">Privacy</Link>
            <Link href="/terms" className="transition hover:text-white/60">Terms</Link>
            <Link href="/disclaimer" className="transition hover:text-white/60">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
