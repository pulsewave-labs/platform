'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  ChevronDown, 
  ArrowRight,
  Menu,
  X,
  Target,
  Shield,
  Brain,
  Star,
  TrendingUp,
  BarChart3,
  Zap,
  Lock,
  LineChart,
  Bell,
  BookOpen,
  Activity
} from 'lucide-react'

const ease = [0.25, 0.1, 0.25, 1] as const

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start: number
    const step = (t: number) => {
      if (!start) start = t
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(eased * end))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration])
  return { count, ref }
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease }}
      className={`py-28 md:py-36 px-6 md:px-8 ${className}`}
    >
      {children}
    </motion.section>
  )
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(2847)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [annual, setAnnual] = useState(true)

  useEffect(() => {
    fetch('/api/waitlist').then(r => r.json()).then(d => setWaitlistCount(d.count || 2847)).catch(() => {})
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const submit = async (e: React.FormEvent, src = 'hero') => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    try {
      const r = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: src })
      })
      if (r.ok) { setIsSubmitted(true); setEmail(''); setWaitlistCount(c => c + 1) }
    } catch {} finally { setIsSubmitting(false) }
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white overflow-x-hidden">
      <style jsx global>{`
        .grad-text {
          background: linear-gradient(135deg, #00F0B5 0%, #00C79A 50%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .grad-text-warm {
          background: linear-gradient(135deg, #00F0B5, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glow-card {
          position: relative;
        }
        .glow-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(0,240,181,0.15), transparent, rgba(14,165,233,0.1));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-card:hover::before {
          opacity: 1;
        }
        .frosted {
          backdrop-filter: blur(20px) saturate(180%);
          background: rgba(10, 14, 23, 0.75);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mockup-shadow {
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05),
            0 25px 50px -12px rgba(0,0,0,0.5),
            0 0 80px -20px rgba(0,240,181,0.15);
        }
      `}</style>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'frosted' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-5">
          <div className="flex items-center justify-between">
            <img src="/logo.webp" alt="PulseWave" className="h-7 w-auto" />
            <div className="hidden md:flex items-center gap-10">
              {['Features', 'Pricing', 'FAQ'].map(s => (
                <button key={s} onClick={() => scrollTo(s.toLowerCase())} className="text-sm text-[#8b95a5] hover:text-white transition-colors duration-200">{s}</button>
              ))}
              <button onClick={() => scrollTo('cta')} className="text-sm px-5 py-2 bg-[#00F0B5] text-[#0a0e17] rounded-full font-semibold hover:bg-[#4DFFD0] transition-colors">
                Get Early Access
              </button>
            </div>
            <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          <AnimatePresence>
            {mobileMenu && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden pt-6 pb-4 space-y-4">
                {['Features', 'Pricing', 'FAQ'].map(s => (
                  <button key={s} onClick={() => scrollTo(s.toLowerCase())} className="block text-[#8b95a5] hover:text-white transition-colors">{s}</button>
                ))}
                <button onClick={() => scrollTo('cta')} className="block px-5 py-2 bg-[#00F0B5] text-[#0a0e17] rounded-full font-semibold w-fit">Get Early Access</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-8 pt-20 relative">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00F0B5] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#0ea5e9] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#00F0B5]/10 border border-[#00F0B5]/20 rounded-full text-sm text-[#00F0B5] font-medium mb-10">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0B5] opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-[#00F0B5]"></span></span>
            Now in beta — {waitlistCount.toLocaleString()} traders on the waitlist
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.15 }} className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-8">
            Stop Guessing.
            <br />
            Start Trading With
            <br />
            <span className="grad-text">Real Intelligence.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.35 }} className="text-lg md:text-xl text-[#8b95a5] leading-relaxed max-w-2xl mx-auto mb-12">
            AI-powered signals, automated risk management, and a trading journal — all in one platform. Replace 6 subscriptions with one.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.5 }} id="cta" className="mb-6">
            {!isSubmitted ? (
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1 px-5 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#00F0B5]/50 focus:ring-1 focus:ring-[#00F0B5]/30 transition-all" />
                <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-[#00F0B5] text-[#0a0e17] rounded-xl font-bold text-sm hover:bg-[#4DFFD0] hover:shadow-[0_0_30px_rgba(0,240,181,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? 'Joining...' : <><span>Get Early Access</span><ArrowRight size={16} /></>}
                </button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#00F0B5]/10 border border-[#00F0B5]/20 rounded-xl text-[#00F0B5] font-semibold">
                <Check size={18} /> You're on the list! We'll be in touch.
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center justify-center gap-6 text-xs text-[#6b7280]">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[#00F0B5]" />14-day free trial</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[#00F0B5]" />No credit card</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-[#00F0B5]" />Cancel anytime</span>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ LOGOS / TRUST BAR ═══════════ */}
      <Section className="!py-16 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-[#4b5563] mb-8">Built for traders on</p>
          <div className="flex items-center justify-center gap-12 md:gap-20 text-[#4b5563]">
            {['Binance', 'Coinbase', 'Bybit', 'OKX', 'KuCoin'].map(name => (
              <span key={name} className="text-sm font-semibold tracking-wide">{name}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ PROBLEM ═══════════ */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#00F0B5] mb-4">The Problem</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
              You're paying for 6 tools.
              <br />
              <span className="text-[#4b5563]">Using none of them well.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Target, title: 'Signal Overload', desc: '500 Discord alerts. Zero context. You miss the winners and chase the losers.', color: '#f87171' },
              { icon: Shield, title: 'No Risk Control', desc: 'Position sizing by gut feeling. One bad trade wipes out a month of gains.', color: '#fbbf24' },
              { icon: BarChart3, title: 'Tool Chaos', desc: 'TradingView + Excel + Discord + Binance. Switching apps kills momentum.', color: '#0ea5e9' }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: i * 0.1 }} className="glow-card bg-[#0d1117] border border-[#1b2332] rounded-2xl p-8 hover:border-[#2a3444] transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${item.color}15` }}>
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-[#8b95a5] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ PRODUCT SHOWCASE ═══════════ */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#00F0B5] mb-4">The Solution</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
              One platform.
              <br />
              <span className="grad-text">Everything you need.</span>
            </h2>
            <p className="text-lg text-[#8b95a5] max-w-xl mx-auto">Replace $300/month in separate tools with one intelligent trading command center.</p>
          </div>

          {/* Dashboard Mockup */}
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }} className="mockup-shadow rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-b from-[#111827] to-[#0d1117] border border-white/[0.08] max-w-5xl mx-auto mb-12">
            {/* Browser Chrome */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#28ca42]" />
              </div>
              <div className="flex-1 bg-white/[0.04] rounded-lg px-4 py-1.5 text-xs text-[#6b7280] font-mono">app.pulsewave.ai/dashboard</div>
            </div>
            {/* Dashboard Content */}
            <div className="p-5 md:p-8">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Portfolio', value: '$47,832', change: '+12.4%', up: true },
                  { label: 'Win Rate', value: '73.2%', change: '+5.1%', up: true },
                  { label: 'Profit Factor', value: '2.14', change: '+0.3', up: true },
                  { label: 'Active Signals', value: '3', change: 'Live', up: true },
                ].map((s, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-[11px] uppercase tracking-wider text-[#6b7280] mb-1">{s.label}</p>
                    <p className="text-xl font-bold font-mono">{s.value}</p>
                    <p className={`text-xs font-medium mt-1 ${s.up ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>{s.change}</p>
                  </div>
                ))}
              </div>
              {/* Signal Cards */}
              <div className="grid md:grid-cols-3 gap-3 mb-5">
                {[
                  { pair: 'BTC/USDT', dir: 'LONG', conf: 92, entry: '$68,450', tp: '$72,100', sl: '$66,800' },
                  { pair: 'ETH/USDT', dir: 'LONG', conf: 87, entry: '$2,680', tp: '$2,890', sl: '$2,580' },
                  { pair: 'SOL/USDT', dir: 'SHORT', conf: 79, entry: '$198.50', tp: '$182.00', sl: '$206.00' },
                ].map((s, i) => (
                  <div key={i} className={`bg-white/[0.03] border rounded-xl p-4 ${s.dir === 'LONG' ? 'border-[#4ade80]/20' : 'border-[#f87171]/20'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm">{s.pair}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.dir === 'LONG' ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'bg-[#f87171]/15 text-[#f87171]'}`}>{s.dir}</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-[#6b7280]">Entry</span><span className="font-mono">{s.entry}</span></div>
                      <div className="flex justify-between"><span className="text-[#6b7280]">Target</span><span className="font-mono text-[#4ade80]">{s.tp}</span></div>
                      <div className="flex justify-between"><span className="text-[#6b7280]">Stop</span><span className="font-mono text-[#f87171]">{s.sl}</span></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6b7280]">Confidence</span>
                        <span className="text-[#00F0B5] font-bold">{s.conf}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00F0B5] to-[#0ea5e9] rounded-full" style={{ width: `${s.conf}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 flex items-center justify-center h-32">
                <div className="flex items-center gap-3 text-[#4b5563]">
                  <Activity size={20} />
                  <span className="text-sm">Real-time charts • Multi-timeframe analysis • Custom indicators</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Zap, label: 'AI Signal Engine' },
              { icon: Shield, label: 'Risk Guardian' },
              { icon: BookOpen, label: 'Auto Journal' },
              { icon: Bell, label: 'Smart Alerts' },
              { icon: LineChart, label: 'Advanced Charts' },
              { icon: Brain, label: 'AI Coach' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease, delay: i * 0.05 }} className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-[#8b95a5] hover:border-[#00F0B5]/30 hover:text-[#00F0B5] transition-all cursor-default">
                <f.icon size={14} />
                {f.label}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ FEATURES (3 deep dives) ═══════════ */}
      <Section id="features">
        <div className="max-w-6xl mx-auto space-y-32">
          {[
            {
              tag: '01', title: 'Confluence Signals', subtitle: 'Not just lines on a chart.',
              desc: 'Every signal combines 12+ technical indicators, market regime analysis, volume profiling, and cross-timeframe confirmation. You get the full picture — entry, stop, target, and reasoning.',
              stat: '73%', statLabel: 'Average win rate',
              icon: Target, color: '#00F0B5',
              features: ['Multi-timeframe confluence', 'AI-powered reasoning', 'Risk-adjusted entries', 'Real-time alerts']
            },
            {
              tag: '02', title: 'Risk Management', subtitle: 'Never blow your account again.',
              desc: 'Automated position sizing, portfolio heat mapping, correlation tracking, and emotional tilt detection. The platform enforces discipline so you don\'t have to rely on willpower.',
              stat: '2.1:1', statLabel: 'Avg risk-to-reward',
              icon: Shield, color: '#0ea5e9',
              features: ['Auto position sizing', 'Portfolio heat map', 'Tilt detector', 'Daily loss limits']
            },
            {
              tag: '03', title: 'AI Trading Coach', subtitle: 'Like having a mentor 24/7.',
              desc: 'Trained on 80+ trading books, your AI coach analyzes your journal, spots patterns in your mistakes, and gives personalized advice to level up your trading.',
              stat: '80+', statLabel: 'Books analyzed',
              icon: Brain, color: '#a78bfa',
              features: ['Pattern recognition', 'Personalized tips', 'Performance reports', 'Behavioral alerts']
            }
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center ${i % 2 === 1 ? 'md:direction-rtl' : ''}`}>
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <p className="text-sm font-bold uppercase tracking-[0.15em] mb-3" style={{ color: f.color }}>{f.tag} — {f.subtitle}</p>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] mb-6">{f.title}</h3>
                <p className="text-[#8b95a5] leading-relaxed mb-8">{f.desc}</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {f.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-[#8b95a5]">
                      <Check size={14} style={{ color: f.color }} />
                      {feat}
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold" style={{ color: f.color }}>{f.stat}</span>
                  <span className="text-sm text-[#6b7280]">{f.statLabel}</span>
                </div>
              </div>
              <div className={`${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="bg-[#0d1117] border border-[#1b2332] rounded-2xl p-10 h-72 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at 50% 50%, ${f.color}, transparent 70%)` }} />
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${f.color}15` }}>
                      <f.icon size={36} style={{ color: f.color }} />
                    </div>
                    <p className="text-sm text-[#6b7280] font-medium">{f.title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ═══════════ SOCIAL PROOF / NUMBERS ═══════════ */}
      <Section className="!py-20 border-y border-white/[0.04] bg-[#0d1117]/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { end: 80, suffix: '+', label: 'Books analyzed', color: '#a78bfa' },
              { end: 73, suffix: '%', label: 'Signal accuracy', color: '#00F0B5' },
              { end: 2847, suffix: '+', label: 'Waitlist traders', color: '#0ea5e9' },
              { end: 6, suffix: '', label: 'Tools replaced', color: '#fbbf24' },
            ].map((s, i) => {
              const { count, ref } = useCountUp(s.end, 2000)
              return (
                <div key={i} ref={ref}>
                  <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: s.color }}>
                    {s.end > 100 ? count.toLocaleString() : count}{s.suffix}
                  </div>
                  <div className="text-sm text-[#6b7280]">{s.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════ PRICING ═══════════ */}
      <Section id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#00F0B5] mb-4">Pricing</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6">Simple, transparent pricing</h2>
            <p className="text-lg text-[#8b95a5] mb-8">Start free. Upgrade when you're ready.</p>

            {/* Annual/Monthly Toggle */}
            <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
              <button onClick={() => setAnnual(false)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-white/10 text-white' : 'text-[#6b7280]'}`}>Monthly</button>
              <button onClick={() => setAnnual(true)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${annual ? 'bg-[#00F0B5]/15 text-[#00F0B5]' : 'text-[#6b7280]'}`}>Annual <span className="text-[#00F0B5] text-xs">Save 20%</span></button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Pulse', monthly: 97, features: ['10 signals/week', 'Basic risk tools', 'Email alerts', 'Community access', 'Trade journal'], featured: false },
              { name: 'Wave', monthly: 147, features: ['Unlimited signals', 'Advanced analytics', 'Real-time alerts', 'AI trading coach', 'Priority support'], featured: true },
              { name: 'Tsunami', monthly: 197, features: ['Everything in Wave', 'API access', 'Custom strategies', 'White-label ready', '1-on-1 support'], featured: false },
            ].map((p, i) => {
              const price = annual ? Math.round(p.monthly * 0.8) : p.monthly
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: i * 0.1 }} className={`rounded-2xl p-8 relative ${p.featured ? 'bg-gradient-to-b from-[#00F0B5]/[0.08] to-transparent border-2 border-[#00F0B5]/30' : 'bg-[#0d1117] border border-[#1b2332] hover:border-[#2a3444]'} transition-colors`}>
                  {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#00F0B5] text-[#0a0e17] rounded-full text-xs font-bold">Most Popular</div>}
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-bold mb-4">{p.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">${price}</span>
                      <span className="text-[#6b7280]">/mo</span>
                    </div>
                    {annual && <p className="text-xs text-[#00F0B5] mt-2">Billed ${price * 12}/year</p>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-[#8b95a5]">
                        <Check size={15} className={p.featured ? 'text-[#00F0B5]' : 'text-[#4b5563]'} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => scrollTo('cta')} className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${p.featured ? 'bg-[#00F0B5] text-[#0a0e17] hover:bg-[#4DFFD0] hover:shadow-[0_0_30px_rgba(0,240,181,0.2)]' : 'bg-white/[0.06] text-white hover:bg-white/10'}`}>
                    Get Early Access
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════ FAQ ═══════════ */}
      <Section id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-4">Questions? Answers.</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'How accurate are your signals?', a: 'Our AI signals achieve a 73% win rate through advanced confluence analysis combining 12+ indicators, market regime detection, volume profiling, and cross-timeframe confirmation.' },
              { q: 'Which exchanges do you support?', a: 'All major exchanges: Binance, Coinbase, OKX, Bybit, KuCoin. We use read-only API keys — your funds never leave your exchange.' },
              { q: 'Do you guarantee profits?', a: 'No. Trading always involves risk. We provide institutional-grade tools and signals, but profitable trading requires discipline and risk management. Past performance doesn\'t guarantee future results.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click, no questions asked. 14-day free trial, 30-day money-back guarantee.' },
              { q: 'What makes PulseWave different?', a: 'We replace your entire trading stack. Real AI (not repackaged TA), automated risk management, and institutional-grade analytics in one beautiful platform — not 6 separate subscriptions.' },
              { q: 'Is my data secure?', a: 'Bank-grade encryption, read-only API keys, SOC2-compliant infrastructure. Your trading data is yours. We just help you analyze it.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#0d1117] border border-[#1b2332] rounded-xl overflow-hidden hover:border-[#2a3444] transition-colors">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 text-left flex items-center justify-between gap-4">
                  <span className="font-semibold">{item.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} className="text-[#6b7280] flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <p className="px-6 pb-5 text-[#8b95a5] leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <Section className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00F0B5] opacity-[0.04] blur-[150px] rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
            Ready to trade
            <br />
            <span className="grad-text">smarter?</span>
          </h2>
          <p className="text-lg text-[#8b95a5] mb-10">Join {waitlistCount.toLocaleString()} traders building the future of intelligent trading.</p>
          <form onSubmit={e => submit(e, 'bottom')} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1 px-5 py-3.5 bg-white/[0.06] border border-white/10 rounded-xl text-white text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#00F0B5]/50 focus:ring-1 focus:ring-[#00F0B5]/30 transition-all" />
            <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-[#00F0B5] text-[#0a0e17] rounded-xl font-bold text-sm hover:bg-[#4DFFD0] hover:shadow-[0_0_30px_rgba(0,240,181,0.3)] transition-all disabled:opacity-50">
              {isSubmitting ? 'Joining...' : 'Get Early Access'}
            </button>
          </form>
        </div>
      </Section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.06] px-6 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <img src="/logo.webp" alt="PulseWave" className="h-7 w-auto mb-4" />
              <p className="text-sm text-[#6b7280] leading-relaxed">The complete trading platform for the modern trader.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Disclaimer', 'Risk Notice'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
                <div className="space-y-2">{col.links.map(l => <div key={l} className="text-sm text-[#6b7280] hover:text-white cursor-pointer transition-colors">{l}</div>)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#4b5563]">© 2026 PulseWave Labs. All rights reserved.</p>
            <p className="text-xs text-[#4b5563]">Trading involves risk. Past performance ≠ future results.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
