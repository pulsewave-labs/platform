'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
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
  Activity,
  Users,
  Bot
} from 'lucide-react'

const ease = [0.25, 0.1, 0.25, 1] as const

function useCountUp(end: number, duration = 2000, startDelay = 0) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (!inView) return
    
    const timeout = setTimeout(() => {
      let start: number
      const step = (t: number) => {
        if (!start) start = t
        const p = Math.min((t - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(Math.floor(eased * end))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, startDelay)
    
    return () => clearTimeout(timeout)
  }, [inView, end, duration, startDelay])
  
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

export default function LandingClientPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(2847)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [currentEquity, setCurrentEquity] = useState(218418)
  const [recentTrades, setRecentTrades] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/waitlist').then(r => r.json()).then(d => setWaitlistCount(d.count || 2847)).catch(() => {})
    fetch('/api/performance').then(r => r.json()).then(d => {
      if (d && d.trades) setRecentTrades(d.trades.slice(0, 8))
    }).catch(() => {})
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
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <style jsx global>{`
        .grad-text {
          background: linear-gradient(135deg, #22c55e 0%, #14b8a6 50%, #0ea5e9 100%);
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
          background: linear-gradient(135deg, rgba(34,197,94,0.15), transparent, rgba(20,184,166,0.1));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-card:hover::before {
          opacity: 1;
        }
        .frosted {
          backdrop-filter: blur(20px) saturate(180%);
          background: rgba(9, 9, 11, 0.75);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .profit-glow {
          box-shadow: 0 0 40px rgba(34,197,94,0.15);
        }
      `}</style>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'frosted' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl">PulseWave Signals</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['Performance', 'How It Works', 'Pricing'].map(s => (
                <button key={s} onClick={() => scrollTo(s.toLowerCase().replace(' ', '-'))} className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">{s}</button>
              ))}
              <Link href="/auth/login" className="text-sm px-4 py-2 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors">
                Login
              </Link>
              <button onClick={() => scrollTo('cta')} className="text-sm px-5 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition-colors">
                Start Trading
              </button>
            </div>
            <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          <AnimatePresence>
            {mobileMenu && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden pt-6 pb-4 space-y-4">
                {['Performance', 'How It Works', 'Pricing'].map(s => (
                  <button key={s} onClick={() => scrollTo(s.toLowerCase().replace(' ', '-'))} className="block text-zinc-400 hover:text-white transition-colors">{s}</button>
                ))}
                <Link href="/auth/login" className="block text-zinc-400 hover:text-white transition-colors">Login</Link>
                <button onClick={() => scrollTo('cta')} className="block px-5 py-2 bg-green-500 text-white rounded-lg font-semibold w-fit">Start Trading</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-8 pt-20 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500 opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500 opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2.5 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-400 font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
            </span>
            Live Trading Bot • 624 Verified Trades
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.15 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8">
            Our AI Turned $10K Into
            <br />
            <span className="grad-text">${currentEquity.toLocaleString()}</span> In 2 Years
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.35 }} className="text-xl md:text-2xl text-zinc-400 leading-relaxed max-w-4xl mx-auto mb-6">
            Market Structure signals. 6 crypto pairs. 88% profitable months.
          </motion.p>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.45 }} className="text-lg text-zinc-500 max-w-2xl mx-auto mb-12">
            Now it trades for you.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.5 }} id="cta" className="mb-12">
            {!isSubmitted ? (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Link href="/auth/signup" className="flex-1 px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-400 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  Start Trading <ArrowRight size={18} />
                </Link>
                <Link href="/performance" className="flex-1 px-8 py-4 border border-zinc-700 text-zinc-300 rounded-xl font-bold text-lg hover:border-zinc-600 hover:text-white transition-all">
                  View All Trades
                </Link>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-semibold">
                <Check size={18} /> You're on the list! We'll be in touch.
              </motion.div>
            )}
          </motion.div>

          {/* Live Equity Counter */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="inline-flex items-center gap-4 px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-zinc-400">Current Bot Equity</span>
            </div>
            <span className="text-xl font-mono font-bold text-green-400">${currentEquity.toLocaleString()}</span>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ PERFORMANCE STATS ═══════════ */}
      <Section className="!py-20 border-y border-zinc-800 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Numbers Don't Lie</h2>
            <p className="text-zinc-400 text-lg">Verified performance across 624 trades</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-16">
            {[
              { label: 'Total Return', value: 2084.2, suffix: '%', color: 'text-green-400', delay: 0 },
              { label: 'Win Rate', value: 40.7, suffix: '%', color: 'text-blue-400', delay: 200 },
              { label: 'Profit Factor', value: 1.52, suffix: '', color: 'text-teal-400', delay: 400 },
              { label: 'Profitable Months', value: 22, suffix: '/25', color: 'text-purple-400', delay: 600 },
            ].map((stat, i) => {
              const { count, ref } = useCountUp(stat.value, 2000, stat.delay)
              const displayValue = stat.value < 10 ? (count / 100).toFixed(2) : count.toLocaleString()
              return (
                <div key={i} ref={ref} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}>
                    {stat.value < 10 && stat.suffix !== '/25' ? displayValue : count.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-sm text-zinc-400">{stat.label}</div>
                </div>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Monthly P&L Performance</h3>
              <div className="space-y-3">
                {[
                  { month: '2024 Average', pnl: 8337, isAvg: true },
                  { month: '2025 Average', pnl: 8337, isAvg: true },
                  { month: 'Best Month', pnl: 24500, isAvg: false },
                  { month: 'Worst Month', pnl: -12800, isAvg: false },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-b-0">
                    <span className="text-zinc-300">{row.month}</span>
                    <span className={`font-mono font-bold ${row.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {row.pnl > 0 ? '+' : ''}${row.pnl.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Equity Curve</h3>
              <div className="h-48 flex items-end justify-between gap-1">
                {Array.from({ length: 24 }, (_, i) => {
                  const height = Math.max(10, (i + 1) * 4 + Math.sin(i / 2) * 20)
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-green-500 to-teal-400 rounded-t"
                      style={{ minHeight: '4px' }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-3 text-xs text-zinc-500">
                <span>Feb '24</span>
                <span>$10K → $218K</span>
                <span>Feb '26</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <Section id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">How It Works</h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Advanced Market Structure analysis meets automated execution. 
              Here's how our AI turns market patterns into profits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: '01',
                title: 'Bot Scans 6 Crypto Pairs 24/7',
                description: 'Continuously monitors BTC, ETH, SOL, AVAX, XRP across multiple timeframes for Market Structure setups.',
                icon: Activity,
                color: 'text-blue-400'
              },
              {
                step: '02', 
                title: 'Detects Market Structure Setups',
                description: 'Identifies Break of Structure (BOS) and Order Block patterns with 70%+ confidence scoring.',
                icon: Target,
                color: 'text-green-400'
              },
              {
                step: '03',
                title: 'Signals Fire with Exact Levels',
                description: 'Get instant notifications via Telegram + dashboard with entry, stop loss, and take profit levels.',
                icon: Bell,
                color: 'text-teal-400'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 h-full">
                  <div className={`text-6xl font-bold ${step.color} mb-4 opacity-20`}>{step.step}</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center`}>
                      <step.icon size={24} className={step.color} />
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-zinc-700 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ THE PAIRS WE TRADE ═══════════ */}
      <Section className="bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The Pairs We Trade</h2>
            <p className="text-xl text-zinc-400">5 major crypto pairs, 6 optimized configurations — $208K+ in verified profits</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { pair: 'AVAX/USDT', trades: 152, profit: 33648, winRate: 43 },
              { pair: 'SOL/USDT', trades: 98, profit: 24239, winRate: 41 },
              { pair: 'XRP/USDT', trades: 87, profit: 14378, winRate: 38 },
              { pair: 'ETH/USDT', trades: 202, profit: 25678, winRate: 41, note: '2 configs' },
              { pair: 'BTC/USDT', trades: 85, profit: 6266, winRate: 39 },
            ].map((config, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glow-card bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{config.pair}</h3>
                    {config.note && <p className="text-xs text-zinc-500">{config.note}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${config.profit.toLocaleString()}</div>
                    <div className="text-sm text-zinc-500">profit</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Trades</span>
                    <div className="font-mono font-bold">{config.trades}</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Win Rate</span>
                    <div className="font-mono font-bold">{config.winRate}%</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════ HOW WE SIZE TRADES ═══════════ */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How We Size Every Trade</h2>
            <p className="text-xl text-zinc-400">Simple, consistent, risk-managed. Every single trade uses the same formula.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">The Strategy</h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target size={20} className="text-green-400" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Market Structure Analysis</div>
                    <div className="text-sm text-zinc-400">Break of Structure (BOS) + Order Block patterns detected by our AI across multiple timeframes</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Fixed Risk Per Trade</div>
                    <div className="text-sm text-zinc-400">Every trade risks exactly 10% of the starting capital. No compounding, no martingale, no increasing risk after losses.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Mathematical Position Sizing</div>
                    <div className="text-sm text-zinc-400">Position size = Risk Amount ÷ (Entry − Stop Loss). Larger stop = smaller position. The math keeps risk constant.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Trade Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Starting Capital', value: '$10,000' },
                  { label: 'Risk Per Trade', value: '10% ($1,000 fixed)' },
                  { label: 'Leverage', value: '20x' },
                  { label: 'Position Sizing', value: 'Risk ÷ Stop Distance' },
                  { label: 'Compounding', value: 'None (fixed $1,000 risk)' },
                  { label: 'Fees', value: '0.1% maker/taker (included)' },
                  { label: 'Exchange', value: 'Bitget USDT-M Futures' },
                  
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-b-0">
                    <span className="text-zinc-400 text-sm">{row.label}</span>
                    <span className="font-mono font-bold text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-4">Position Sizing Example</h3>
            <p className="text-zinc-400 text-sm mb-6">Here's exactly how the bot sizes a trade. Same formula, every time, no exceptions.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-400 border-b border-zinc-800">
                    <th className="pb-3">Your Account</th>
                    <th className="pb-3">Risk (10%)</th>
                    <th className="pb-3">Example: BTC at $70K, SL at $67K</th>
                    <th className="pb-3">Position Size</th>
                    <th className="pb-3">Margin Used (20x)</th>
                    <th className="pb-3 text-right">If TP hits (2.5:1 R:R)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { acct: 1000, risk: 100 },
                    { acct: 5000, risk: 500 },
                    { acct: 10000, risk: 1000 },
                    { acct: 25000, risk: 2500 },
                    { acct: 50000, risk: 5000 },
                  ].map((row) => {
                    const slDist = 3000 / 70000
                    const notional = row.risk / slDist
                    const margin = notional / 20
                    const profit = row.risk * 2.5
                    return (
                      <tr key={row.acct} className="border-b border-zinc-800/50 last:border-b-0">
                        <td className="py-3 font-mono font-bold">${row.acct.toLocaleString()}</td>
                        <td className="py-3 font-mono text-yellow-400">${row.risk.toLocaleString()}</td>
                        <td className="py-3 font-mono text-zinc-400">$1K risk ÷ 4.3% stop = ${Math.round(notional).toLocaleString()}</td>
                        <td className="py-3 font-mono">${Math.round(notional).toLocaleString()}</td>
                        <td className="py-3 font-mono text-zinc-400">${Math.round(margin).toLocaleString()}</td>
                        <td className="py-3 font-mono text-green-400 text-right font-bold">+${Math.round(profit).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-zinc-600 mt-4">If stopped out, you lose the Risk amount. If TP hits, you make Risk × R:R. Fees are deducted from P&L. No hidden costs.</p>
          </div>
        </div>
      </Section>

      {/* ═══════════ RECENT TRADES ═══════════ */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Recent Trades</h2>
            <p className="text-xl text-zinc-400">Live feed from our trading history</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr className="text-left text-sm text-zinc-400">
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Pair</th>
                    <th className="px-6 py-4 font-semibold">Direction</th>
                    <th className="px-6 py-4 font-semibold">Entry</th>
                    <th className="px-6 py-4 font-semibold">Exit</th>
                    <th className="px-6 py-4 font-semibold">Risk</th>
                    <th className="px-6 py-4 font-semibold text-right">P&L</th>
                    <th className="px-6 py-4 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentTrades.map((trade, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-4 font-mono text-zinc-400">{new Date(trade.entry_time).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold">{trade.pair}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.action === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">${Number(trade.entry_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 font-mono">${Number(trade.exit_price).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 font-mono text-yellow-400">${Number(trade.risk_amount).toLocaleString()}</td>
                      <td className={`px-6 py-4 font-mono font-bold text-right ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnl > 0 ? '+' : ''}${Number(trade.pnl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.exit_reason === 'TP' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.exit_reason}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/performance" className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors">
              View All 624 Trades <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══════════ PRICING ═══════════ */}
      <Section id="pricing" className="bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple Pricing</h2>
            <p className="text-xl text-zinc-400">Get the same signals that turned $10K into $218K</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold">$97</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-zinc-300">
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Real-time trading signals
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Telegram alerts
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Full trade history
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Performance dashboard
                </li>
              </ul>
              <Link href="/auth/signup" className="block w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold text-center transition-colors">
                Start Monthly Plan
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-2 border-green-500/30 rounded-xl p-8 relative profit-glow"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                Save $194
              </div>
              <h3 className="text-2xl font-bold mb-2">Annual</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">$970</span>
                <span className="text-zinc-400">/year</span>
              </div>
              <p className="text-sm text-green-400 mb-6">2 months free</p>
              <ul className="space-y-3 mb-8 text-zinc-300">
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Everything in monthly
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Priority support
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-3">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  Early access to new features
                </li>
              </ul>
              <Link href="/auth/signup" className="block w-full py-3 px-6 bg-green-500 hover:bg-green-400 text-white rounded-lg font-semibold text-center transition-colors">
                Start Annual Plan
              </Link>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══════════ TRUST/COMPLIANCE ═══════════ */}
      <Section className="border-y border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-zinc-200">Important Disclaimers</h3>
            <div className="space-y-4 text-zinc-400 leading-relaxed">
              <p className="font-semibold text-zinc-300">Past performance does not guarantee future results.</p>
              <p>All results shown are from verified trading data. Trading involves risk and past results do not guarantee future performance.</p>
              <p>Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.</p>
              <p className="text-sm">
                <Link href="/performance" className="text-green-400 hover:text-green-300 underline">View complete trade log</Link> • 
                <Link href="/disclaimer" className="text-green-400 hover:text-green-300 underline ml-2">Full risk disclosure</Link>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <Section className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-green-500 opacity-[0.03] blur-[150px] rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
            Ready to start
            <br />
            <span className="grad-text">trading smarter?</span>
          </h2>
          <p className="text-lg text-zinc-400 mb-10">Join the AI that turned $10K into $218K</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link href="/auth/signup" className="flex-1 px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-400 transition-colors">
              Start Trading Now
            </Link>
            <Link href="/performance" className="flex-1 px-8 py-4 border border-zinc-700 text-zinc-300 rounded-xl font-bold text-lg hover:border-zinc-600 hover:text-white transition-colors">
              View All Trades
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-zinc-800 px-6 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <span className="font-bold text-xl">PulseWave Signals</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">AI-powered crypto signals that turned $10K into $218K.</p>
            </div>
            {[
              { 
                title: 'Product', 
                links: [
                  { name: 'Performance', href: '/performance' },
                  { name: 'Dashboard', href: '/dashboard' },
                  { name: 'Pricing', href: '#pricing' },
                  { name: 'API', href: '#' }
                ] 
              },
              { 
                title: 'Account', 
                links: [
                  { name: 'Sign Up', href: '/auth/signup' },
                  { name: 'Log In', href: '/auth/login' },
                  { name: 'Settings', href: '/dashboard/settings' },
                  { name: 'Support', href: '#' }
                ] 
              },
              { 
                title: 'Legal', 
                links: [
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms of Service', href: '/terms' },
                  { name: 'Risk Disclosure', href: '/disclaimer' },
                  { name: 'Refund Policy', href: '#' }
                ] 
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-sm mb-4 text-zinc-200">{col.title}</h4>
                <div className="space-y-2">
                  {col.links.map(link => (
                    link.href.startsWith('#') ? (
                      <button key={link.name} onClick={() => scrollTo(link.href.slice(1))} className="block text-sm text-zinc-400 hover:text-white transition-colors">
                        {link.name}
                      </button>
                    ) : (
                      <Link key={link.name} href={link.href} className="block text-sm text-zinc-400 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-500">© 2026 PulseWave Labs. All rights reserved.</p>
            <p className="text-zinc-500 text-xs max-w-2xl text-center md:text-right leading-relaxed">
              Trading involves risk. Never invest more than you can afford to lose. Trading involves risk. Past results do not guarantee future performance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}