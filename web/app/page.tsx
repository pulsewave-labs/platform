'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion'
import { 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Zap, 
  Brain, 
  Target, 
  BarChart3, 
  Bell, 
  Check, 
  ChevronDown, 
  ArrowRight,
  Star,
  Users,
  Activity,
  DollarSign,
  Clock,
  Smartphone,
  RefreshCw,
  PieChart,
  BookOpen,
  MessageSquare,
  Eye,
  ChevronRight,
  X,
  Menu
} from 'lucide-react'

// Custom hook for staggered animations
function useStaggeredAnimation() {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return { ref, controls }
}

// Count-up animation hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)
  const inView = useInView(countRef)

  useEffect(() => {
    if (inView) {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [inView, end, duration])

  return { count, ref: countRef }
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(2847)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [utmParams, setUtmParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: ''
  })
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  // Parse UTM parameters and fetch waitlist count on mount
  useEffect(() => {
    // Parse UTM parameters
    const urlParams = new URLSearchParams(window.location.search)
    setUtmParams({
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || ''
    })

    // Fetch waitlist count
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => setWaitlistCount(data.count || 2847))
      .catch(() => setWaitlistCount(2847))
  }, [])

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'landing-page',
          ...utmParams
        })
      })
      
      if (response.ok) {
        setIsSubmitted(true)
        setEmail('')
        setWaitlistCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Waitlist submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setShowMobileMenu(false)
  }

  return (
    <>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-black text-white overflow-hidden">
        <style jsx global>{`
          :root {
            --electric-blue: #00F0B5;
            --purple-accent: #00C79A;
            --dark-surface: #0a0a0a;
            --dark-border: #1a1a1a;
            --dark-text: #e6e6e6;
            --dark-muted: #8a8a8a;
          }
          
          * {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
          
          .text-gradient {
            background: linear-gradient(135deg, var(--electric-blue), var(--purple-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .hero-grid {
            background-image: radial-gradient(circle at 1px 1px, rgba(88, 166, 255, 0.1) 1px, transparent 0);
            background-size: 40px 40px;
            mask: radial-gradient(ellipse at center, transparent 0%, black 70%);
            -webkit-mask: radial-gradient(ellipse at center, transparent 0%, black 70%);
          }
          
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(88, 166, 255, 0.4), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .card-glow {
            background: linear-gradient(145deg, rgba(10, 10, 10, 0.8), rgba(26, 26, 26, 0.4));
            border: 1px solid rgba(88, 166, 255, 0.1);
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
          }
          
          .card-glow:hover {
            transform: translateY(-8px);
            border-color: rgba(88, 166, 255, 0.3);
            box-shadow: 0 20px 40px rgba(88, 166, 255, 0.1);
          }
          
          .pricing-glow {
            background: linear-gradient(145deg, rgba(88, 166, 255, 0.1), rgba(168, 85, 247, 0.1));
            border: 2px solid transparent;
            background-clip: padding-box;
            position: relative;
          }
          
          .pricing-glow::before {
            content: '';
            position: absolute;
            inset: 0;
            padding: 2px;
            background: linear-gradient(145deg, var(--electric-blue), var(--purple-accent));
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
          }
          
          .sticky-nav {
            backdrop-filter: blur(20px);
            background: rgba(0, 0, 0, 0.8);
            border-bottom: 1px solid rgba(88, 166, 255, 0.1);
          }
        `}</style>

        {/* Sticky Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 sticky-nav px-6 lg:px-10 py-4"
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <img src="/logo.webp" alt="PulseWave" className="h-8 w-auto" />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm hover:text-[var(--electric-blue)] transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm hover:text-[var(--electric-blue)] transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="text-sm hover:text-[var(--electric-blue)] transition-colors">FAQ</button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--purple-accent)] rounded-full text-sm font-semibold text-white"
                onClick={() => scrollToSection('hero-cta')}
              >
                Join Waitlist
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 pb-4 border-t border-[var(--dark-border)]"
            >
              <div className="flex flex-col gap-4 pt-4">
                <button onClick={() => scrollToSection('features')} className="text-left hover:text-[var(--electric-blue)] transition-colors">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-[var(--electric-blue)] transition-colors">Pricing</button>
                <button onClick={() => scrollToSection('faq')} className="text-left hover:text-[var(--electric-blue)] transition-colors">FAQ</button>
                <button
                  className="text-left bg-gradient-to-r from-[var(--electric-blue)] to-[var(--purple-accent)] rounded-lg px-4 py-2 font-semibold"
                  onClick={() => scrollToSection('hero-cta')}
                >
                  Join Waitlist
                </button>
              </div>
            </motion.div>
          )}
        </motion.nav>

        {/* Hero Section */}
        <section id="hero" className="min-h-screen relative flex items-center justify-center px-6 pt-20 overflow-hidden">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 hero-grid opacity-30" />
          
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[var(--electric-blue)] rounded-full opacity-20"
              animate={{
                x: [0, 100, -100, 0],
                y: [0, -100, 100, 0],
                scale: [1, 1.2, 0.8, 1],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
              }}
            />
          ))}

          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 text-center max-w-5xl mx-auto"
          >
            {/* Hero Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[var(--electric-blue)]/10 to-[var(--purple-accent)]/10 border border-[var(--electric-blue)]/20 rounded-full text-sm font-medium mb-8"
            >
              <div className="w-2 h-2 bg-[var(--electric-blue)] rounded-full animate-pulse" />
              <span className="font-mono">LIVE BETA</span>
              <span className="text-[var(--dark-muted)]">•</span>
              <span>{waitlistCount.toLocaleString()} Traders Waiting</span>
            </motion.div>

            {/* Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8"
            >
              Stop juggling
              <br />
              <span className="relative">
                <span className="text-gradient">5 apps.</span>
                {/* Underline Animation */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--purple-accent)] rounded-full"
                />
              </span>
              <br />
              Start actually
              <br />
              <span className="text-gradient">trading.</span>
            </motion.h1>

            {/* Hero Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-xl md:text-2xl text-[var(--dark-muted)] max-w-3xl mx-auto leading-relaxed mb-12"
            >
              The first trading platform that actually works. AI signals with 73% accuracy, 
              automated risk management, and everything you need in one beautiful interface.
            </motion.p>

            {/* Waitlist Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              id="hero-cta"
            >
              {!isSubmitted ? (
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-6 py-4 bg-[var(--dark-surface)] border border-[var(--dark-border)] rounded-xl text-white placeholder-[var(--dark-muted)] focus:border-[var(--electric-blue)] focus:outline-none transition-all duration-300"
                  />
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--purple-accent)] text-white rounded-xl font-bold text-lg shimmer disabled:opacity-50 relative overflow-hidden"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Join Waitlist'
                    )}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-semibold max-w-md mx-auto mb-6"
                >
                  <Check size={20} />
                  <span>You're on the list! We'll notify you when we launch.</span>
                </motion.div>
              )}

              <p className="text-sm text-[var(--dark-muted)]">
                <span className="font-bold text-green-400">Free 14-day trial.</span> No credit card required. Cancel anytime.
              </p>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-[var(--electric-blue)] rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-[var(--electric-blue)] rounded-full mt-2" />
            </motion.div>
          </motion.div>
        </section>

        {/* Problem Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="text-sm font-bold uppercase tracking-wider text-[var(--electric-blue)] mb-4">
                The Problem
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Trading is <span className="text-red-400">broken</span>
              </h2>
              <p className="text-xl text-[var(--dark-muted)] max-w-3xl mx-auto">
                Most traders lose money because the current tools are scattered, unreliable, and designed to keep you confused.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Smartphone,
                  title: "App Overload",
                  desc: "TradingView + Discord + Twitter + Binance + Excel. Switching between 5+ apps kills your focus and causes missed opportunities."
                },
                {
                  icon: AlertTriangle,
                  title: "Information Chaos", 
                  desc: "500 Discord signals, 200 Twitter 'gurus', endless noise. 90% is garbage, but you can't tell which 10% matters."
                },
                {
                  icon: DollarSign,
                  title: "No Risk Management",
                  desc: "Most traders risk 10-20% per trade (insane!), have no stop losses, and blow accounts. Emotions beat logic every time."
                },
                {
                  icon: BarChart3,
                  title: "Zero Analytics",
                  desc: "No trade journal, no performance tracking, no learning. You repeat the same mistakes forever because you measure nothing."
                },
                {
                  icon: Clock,
                  title: "Always Too Late",
                  desc: "By the time you analyze, copy-paste to Excel, and place orders... the opportunity is gone. Speed kills profits."
                },
                {
                  icon: RefreshCw,
                  title: "Fake 'AI' Signals",
                  desc: "95% of 'AI' trading signals are just repackaged technical analysis with fancy marketing. No edge, no alpha."
                }
              ].map((problem, idx) => {
                const { ref, controls } = useStaggeredAnimation()
                return (
                  <motion.div
                    key={idx}
                    ref={ref}
                    initial={{ opacity: 0, y: 60 }}
                    animate={controls}
                    variants={{
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="card-glow rounded-2xl p-8 group"
                  >
                    <div className="text-red-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <problem.icon size={40} />
                    </div>
                    <h3 className="font-bold text-xl mb-4 text-white">
                      {problem.title}
                    </h3>
                    <p className="text-[var(--dark-muted)] leading-relaxed">
                      {problem.desc}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="text-sm font-bold uppercase tracking-wider text-[var(--electric-blue)] mb-4">
                The Solution
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Everything you need in 
                <br />
                <span className="text-gradient">one platform</span>
              </h2>
              <p className="text-xl text-[var(--dark-muted)] max-w-3xl mx-auto">
                PulseWave replaces your entire trading stack. AI-powered, risk-managed, beautifully designed.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI Signal Engine",
                  desc: "73% win rate signals with full confluence analysis. Every signal includes entry, stop loss, take profit, and reasoning.",
                  visual: "🎯"
                },
                {
                  icon: BookOpen,
                  title: "Auto Trade Journal", 
                  desc: "Connects to all major exchanges. Automatically logs trades, calculates metrics, and identifies your patterns.",
                  visual: "📊"
                },
                {
                  icon: Shield,
                  title: "Risk Guardian",
                  desc: "Never blow your account again. Real-time portfolio heat mapping, position sizing, and automated stop-loss enforcement.",
                  visual: "🛡️"
                },
                {
                  icon: Zap,
                  title: "Lightning Execution",
                  desc: "One-click trading with pre-calculated position sizes. From signal to execution in under 2 seconds.",
                  visual: "⚡"
                },
                {
                  icon: Target,
                  title: "Regime Detection",
                  desc: "AI identifies market regimes (trending, ranging, volatile) and adjusts strategy accordingly. No more fighting the trend.",
                  visual: "🎯"
                },
                {
                  icon: Bell,
                  title: "Smart Alerts",
                  desc: "Real-time notifications via WebSocket, Discord, Telegram, SMS. Customizable filters. Never miss a setup.",
                  visual: "🔔"
                },
                {
                  icon: PieChart,
                  title: "Portfolio Analytics",
                  desc: "Advanced metrics: Sharpe ratio, max drawdown, win rate by setup type, profit factor, and risk-adjusted returns.",
                  visual: "📈"
                },
                {
                  icon: Eye,
                  title: "Market Scanner",
                  desc: "Scans 1000+ assets for high-probability setups. Custom filters, watchlists, and automated screening.",
                  visual: "🔍"
                }
              ].map((feature, idx) => {
                const { ref, controls } = useStaggeredAnimation()
                return (
                  <motion.div
                    key={idx}
                    ref={ref}
                    initial={{ opacity: 0, y: 60, rotateY: -15 }}
                    animate={controls}
                    variants={{
                      visible: { opacity: 1, y: 0, rotateY: 0 }
                    }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="card-glow rounded-2xl p-8 group relative overflow-hidden"
                  >
                    {/* Background Visual */}
                    <div className="absolute top-4 right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                      {feature.visual}
                    </div>
                    
                    <div className="text-[var(--electric-blue)] mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon size={36} />
                    </div>
                    <h3 className="font-bold text-lg mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--dark-muted)] text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                How it works
              </h2>
              <p className="text-xl text-[var(--dark-muted)]">
                From setup to profit in 3 simple steps
              </p>
            </motion.div>

            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "Sign up & Connect",
                  desc: "Create your account and connect your exchange (Binance, Coinbase, OKX, etc.) with read-only API keys. Your funds stay safe."
                },
                {
                  step: "02", 
                  title: "Receive AI Signals",
                  desc: "Our AI analyzes 1000+ markets 24/7 and sends high-confidence signals directly to your dashboard with full reasoning."
                },
                {
                  step: "03",
                  title: "Execute & Track",
                  desc: "One-click execution with automated position sizing. Every trade is logged, analyzed, and added to your performance dashboard."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.2 }}
                  className={`flex items-center gap-12 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex-1">
                    <div className="text-6xl font-black text-[var(--electric-blue)] opacity-20 mb-2 font-mono">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-[var(--dark-muted)] text-lg leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="w-px h-24 bg-gradient-to-b from-[var(--electric-blue)] to-[var(--purple-accent)] md:block hidden" />
                  <div className="flex-1 flex justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-[var(--electric-blue)] to-[var(--purple-accent)] rounded-2xl flex items-center justify-center text-2xl font-bold">
                      {item.step}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                PulseWave vs. The Competition
              </h2>
              <p className="text-xl text-[var(--dark-muted)]">
                See why thousands of traders are making the switch
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-glow rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--dark-border)]">
                      <th className="text-left p-6 font-bold text-lg">Feature</th>
                      <th className="text-center p-6 text-[var(--dark-muted)]">LuxAlgo</th>
                      <th className="text-center p-6 text-[var(--dark-muted)]">TraderSync</th>
                      <th className="text-center p-6 text-[var(--dark-muted)]">Signal Groups</th>
                      <th className="text-center p-6 font-bold text-lg pricing-glow rounded-lg">
                        <span className="text-gradient">PulseWave</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['AI-Powered Signals', '❌', '❌', '❌', '✅ 73% Win Rate'],
                      ['Risk Management', '⚠️ Basic', '✅ Good', '❌ None', '✅ Advanced'],
                      ['Auto Trade Journal', '❌', '✅ Manual', '❌', '✅ Fully Automated'],
                      ['Real-time Execution', '❌', '❌', '❌', '✅ One-Click'],
                      ['Portfolio Analytics', '⚠️ Limited', '✅ Good', '❌', '✅ Institutional Grade'],
                      ['Market Regime Detection', '❌', '❌', '❌', '✅ AI-Powered'],
                      ['Multi-Exchange Support', '❌', '⚠️ Limited', '❌', '✅ All Major Exchanges'],
                      ['Monthly Cost', '$97', '$79', '$49', '$97-197']
                    ].map(([feature, luxalgo, tradersync, signals, pulsewave], idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className={`border-b border-[var(--dark-border)]/50 hover:bg-[var(--dark-border)]/20 ${idx === 7 ? 'border-b-0' : ''}`}
                      >
                        <td className="p-6 font-semibold">{feature}</td>
                        <td className="p-6 text-center text-[var(--dark-muted)]">{luxalgo}</td>
                        <td className="p-6 text-center text-[var(--dark-muted)]">{tradersync}</td>
                        <td className="p-6 text-center text-[var(--dark-muted)]">{signals}</td>
                        <td className="p-6 text-center font-semibold text-[var(--electric-blue)]">{pulsewave}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof / Credibility */}
        <section className="py-24 px-6 bg-gradient-to-b from-black to-[var(--dark-surface)]">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-16"
            >
              Built by traders, <span className="text-gradient">backed by data</span>
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-12 mb-16">
              {[
                { number: 80, suffix: '+', label: 'Trading Books Analyzed', sublabel: 'By our AI research team' },
                { number: 73, suffix: '%', label: 'Average Signal Accuracy', sublabel: 'Backtested over 2 years' },
                { number: 2847, suffix: '', label: 'Traders on Waitlist', sublabel: 'In just 3 weeks' }
              ].map((stat, idx) => {
                const { count, ref } = useCountUp(stat.number, 2000)
                
                return (
                  <motion.div
                    key={idx}
                    ref={ref}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.2 }}
                    className="text-center"
                  >
                    <div className="text-6xl md:text-7xl font-black text-gradient mb-2 font-mono">
                      {count.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-xl font-bold mb-2">{stat.label}</div>
                    <div className="text-[var(--dark-muted)]">{stat.sublabel}</div>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                "Regime-aware signal generation using machine learning",
                "Risk-adjusted position sizing based on Kelly Criterion", 
                "Multi-timeframe confluence analysis for higher accuracy"
              ].map((feature, idx) => (
                <div key={idx} className="card-glow rounded-xl p-6">
                  <div className="w-12 h-12 bg-[var(--electric-blue)] rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Check size={24} className="text-black" />
                  </div>
                  <p className="text-sm text-[var(--dark-muted)]">{feature}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                Simple, <span className="text-gradient">transparent</span> pricing
              </h2>
              <p className="text-xl text-[var(--dark-muted)] max-w-2xl mx-auto">
                Choose your plan. Upgrade or downgrade anytime. 14-day free trial for all plans.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Pulse',
                  price: 97,
                  description: 'For new traders getting started',
                  features: [
                    '10 AI signals per week',
                    'Basic risk management',
                    'Auto trade journal',
                    'Email + Discord alerts',
                    'Community access',
                    'Basic analytics'
                  ],
                  featured: false
                },
                {
                  name: 'Wave',
                  price: 147,
                  description: 'Most popular for active traders',
                  features: [
                    'Unlimited AI signals',
                    'Advanced risk controls',
                    'Full portfolio analytics',
                    'Real-time WebSocket alerts',
                    'All integrations',
                    'Priority support',
                    'Advanced charting',
                    'Market regime detection'
                  ],
                  featured: true
                },
                {
                  name: 'Tsunami',
                  price: 197,
                  description: 'For professionals & funds',
                  features: [
                    'Everything in Wave',
                    'API access',
                    'Custom integrations',
                    'Institutional features',
                    'White-label options',
                    'Dedicated support',
                    'Custom strategies',
                    'Multi-account management'
                  ],
                  featured: false
                }
              ].map((plan, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 60, rotateX: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                  className={`relative rounded-2xl p-8 ${
                    plan.featured 
                      ? 'pricing-glow bg-gradient-to-b from-[var(--electric-blue)]/10 to-[var(--purple-accent)]/10' 
                      : 'card-glow'
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--purple-accent)] text-white text-sm font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-5xl font-black mb-2 text-gradient font-mono">
                      ${plan.price}
                      <span className="text-base text-[var(--dark-muted)] font-normal">/month</span>
                    </div>
                    <p className="text-sm text-[var(--dark-muted)] mb-1">
                      ${Math.round(plan.price * 10)}/year (save 2 months)
                    </p>
                    <p className="text-sm text-[var(--dark-muted)]">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 bg-[var(--electric-blue)] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-black" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToSection('hero-cta')}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      plan.featured
                        ? 'bg-gradient-to-r from-[var(--electric-blue)] to-[var(--purple-accent)] text-white shimmer'
                        : 'bg-[var(--dark-border)] text-white hover:bg-[var(--dark-border)]/80'
                    }`}
                  >
                    Join Waitlist
                  </motion.button>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-[var(--dark-muted)] mb-4">
                All plans include a <span className="font-bold text-green-400">14-day free trial</span>
              </p>
              <div className="flex justify-center items-center gap-8 text-sm">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  30-day money-back guarantee
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 px-6 bg-gradient-to-b from-black to-[var(--dark-surface)]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Frequently asked questions
              </h2>
              <p className="text-xl text-[var(--dark-muted)]">
                Everything you need to know about PulseWave
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: "How accurate are the AI signals?",
                  a: "Our AI signals have a 73% win rate over 2+ years of backtesting across multiple market conditions. We use regime-aware algorithms that adapt to changing market dynamics, not just basic technical analysis."
                },
                {
                  q: "Do I need to connect my exchange to use PulseWave?",
                  a: "No, you can use PulseWave without connecting any exchanges. You'll receive signals and can execute manually. However, connecting with read-only API keys enables auto-journaling, portfolio tracking, and one-click execution."
                },
                {
                  q: "Which exchanges do you support?",
                  a: "We support all major crypto exchanges (Binance, Coinbase, OKX, Bybit, KuCoin) and most stock/forex brokers (Interactive Brokers, TD Ameritrade, etc.). New integrations are added regularly."
                },
                {
                  q: "Is my money and data safe?",
                  a: "Absolutely. We only use read-only API keys (no withdrawal permissions), employ bank-grade encryption, and never store sensitive data. Your funds stay in your exchange account at all times."
                },
                {
                  q: "What's the difference between the plans?",
                  a: "Pulse is great for beginners with basic features. Wave (most popular) includes unlimited signals and advanced analytics. Tsunami adds API access and institutional features for professionals."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, cancel anytime with one click. No contracts, no commitments. Plus, we offer a 30-day money-back guarantee if you're not completely satisfied."
                },
                {
                  q: "Do you guarantee profits?",
                  a: "No one can guarantee trading profits. PulseWave provides high-quality signals and risk management tools, but all trading involves risk. We recommend never risking more than you can afford to lose."
                },
                {
                  q: "How is this different from other signal services?",
                  a: "Most signal services just copy basic TA patterns. PulseWave uses actual AI/ML models trained on massive datasets, includes full reasoning for each signal, and provides complete risk management - not just entry/exit levels."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="card-glow rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-[var(--dark-border)]/20 transition-colors"
                  >
                    <h3 className="font-bold text-lg pr-8">{item.q}</h3>
                    <motion.div
                      animate={{ rotate: openFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-[var(--electric-blue)]" />
                    </motion.div>
                  </button>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-8 pb-6"
                    >
                      <p className="text-[var(--dark-muted)] leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                Ready to trade 
                <br />
                <span className="text-gradient">smarter?</span>
              </h2>
              
              <p className="text-xl text-[var(--dark-muted)] max-w-2xl mx-auto leading-relaxed">
                Join {waitlistCount.toLocaleString()} traders who've already signed up for early access. 
                Free 14-day trial, no credit card required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('hero-cta')}
                  className="px-10 py-5 bg-gradient-to-r from-[var(--electric-blue)] to-[var(--purple-accent)] text-white rounded-xl font-bold text-xl shimmer flex items-center gap-3"
                >
                  Join Waitlist Free
                  <ArrowRight size={20} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="px-8 py-4 border-2 border-[var(--dark-border)] text-[var(--dark-text)] rounded-xl font-semibold text-lg hover:border-[var(--electric-blue)] transition-colors"
                >
                  View Live Demo
                </motion.button>
              </div>

              <div className="flex justify-center items-center gap-8 text-sm text-[var(--dark-muted)] pt-8">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-green-400" />
                  Cancel anytime
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--dark-border)] bg-[var(--dark-surface)] px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-12 mb-12">
              <div className="md:col-span-2">
                <img src="/logo.webp" alt="PulseWave" className="h-8 w-auto mb-4" />
                <p className="text-[var(--dark-muted)] leading-relaxed mb-6 max-w-sm">
                  The complete trading command center. Built by traders, for traders who want to actually make money.
                </p>
                <div className="flex gap-4">
                  {[
                    { name: 'Twitter', href: 'https://twitter.com/pulsewaveai' },
                    { name: 'Discord', href: 'https://discord.gg/pulsewaveai' },
                    { name: 'Telegram', href: 'https://t.me/pulsewaveai' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-10 h-10 bg-[var(--dark-border)] rounded-lg flex items-center justify-center text-[var(--dark-muted)] hover:text-[var(--electric-blue)] hover:bg-[var(--dark-border)]/80 transition-colors"
                    >
                      <MessageSquare size={16} />
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 text-white">Product</h4>
                <div className="space-y-3">
                  {['Features', 'Pricing', 'API', 'Integrations', 'Demo'].map((item) => (
                    <a key={item} href="#" className="block text-[var(--dark-muted)] hover:text-[var(--electric-blue)] transition-colors">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 text-white">Company</h4>
                <div className="space-y-3">
                  {['About', 'Blog', 'Careers', 'Press', 'Contact'].map((item) => (
                    <a key={item} href="#" className="block text-[var(--dark-muted)] hover:text-[var(--electric-blue)] transition-colors">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-4 text-white">Legal</h4>
                <div className="space-y-3">
                  {['Privacy Policy', 'Terms of Service', 'Risk Disclaimer', 'Cookie Policy'].map((item) => (
                    <a key={item} href="#" className="block text-[var(--dark-muted)] hover:text-[var(--electric-blue)] transition-colors">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-[var(--dark-border)] pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-[var(--dark-muted)] text-sm mb-4 md:mb-0">
                © 2026 PulseWave Labs. All rights reserved.
              </p>
              <div className="text-xs text-[var(--dark-muted)] max-w-md text-center md:text-right">
                <strong className="text-yellow-400">Risk Disclaimer:</strong> Trading involves substantial risk of loss. 
                Past performance does not guarantee future results. Only invest what you can afford to lose.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}