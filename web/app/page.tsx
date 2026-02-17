'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
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
  BarChart3
} from 'lucide-react'

// Animation variants for Apple-style subtle animations
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Count-up hook for stats
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)
  const inView = useInView(countRef, { once: true })

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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isNavScrolled, setIsNavScrolled] = useState(false)

  const { scrollY } = useScroll()

  // Fetch waitlist count on mount
  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => setWaitlistCount(data.count || 2847))
      .catch(() => setWaitlistCount(2847))
  }, [])

  // Handle nav scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWaitlistSubmit = async (e: React.FormEvent, source = 'hero') => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source
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
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-[#0a0e17] text-white">
        <style jsx global>{`
          * {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          .text-gradient {
            background: linear-gradient(135deg, #00F0B5, #00C79A);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .dashboard-mockup {
            background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
            border: 1px solid #334155;
            box-shadow: 
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }
          
          .signal-card {
            background: linear-gradient(145deg, #1e293b, #334155);
            border: 1px solid #475569;
          }
          
          .frosted-glass {
            backdrop-filter: blur(20px);
            background: rgba(10, 14, 23, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}</style>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isNavScrolled ? 'frosted-glass' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <img src="/logo.webp" alt="PulseWave" className="h-8 w-auto" />
              
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-12">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-#9ca3af hover:text-white transition-colors duration-200"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-#9ca3af hover:text-white transition-colors duration-200"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className="text-#9ca3af hover:text-white transition-colors duration-200"
                >
                  FAQ
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('hero-cta')}
                  className="px-6 py-2 bg-#00F0B5 text-black rounded-full font-medium transition-colors hover:bg-#00C79A"
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-6 pb-6 border-t border-white/10"
              >
                <div className="flex flex-col gap-6 pt-6">
                  <button onClick={() => scrollToSection('features')} className="text-left text-#9ca3af hover:text-white transition-colors">
                    Features
                  </button>
                  <button onClick={() => scrollToSection('pricing')} className="text-left text-#9ca3af hover:text-white transition-colors">
                    Pricing
                  </button>
                  <button onClick={() => scrollToSection('faq')} className="text-left text-#9ca3af hover:text-white transition-colors">
                    FAQ
                  </button>
                  <button
                    className="text-left px-6 py-2 bg-#00F0B5 text-black rounded-full font-medium w-fit"
                    onClick={() => scrollToSection('hero-cta')}
                  >
                    Join Waitlist
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-8 pt-24">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-#9ca3af mb-12"
            >
              <div className="w-2 h-2 bg-#00F0B5 rounded-full" />
              Now in beta — Join {waitlistCount.toLocaleString()} traders
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              className="text-6xl md:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight mb-8"
            >
              Stop losing money.
              <br />
              <span className="font-medium">Start trading</span>
              <br />
              <span className="text-gradient font-medium">intelligently.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
              className="text-xl md:text-2xl text-#9ca3af font-light leading-relaxed max-w-2xl mx-auto mb-16"
            >
              The complete trading platform that
              <br />
              actually helps you make money.
            </motion.p>

            {/* Email Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.6 }}
              id="hero-cta"
              className="mb-8"
            >
              {!isSubmitted ? (
                <form onSubmit={handleWaitlistSubmit} className="flex gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-#6b7280 focus:outline-none focus:border-#00F0B5 transition-colors"
                  />
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-#00F0B5 text-black rounded-lg font-medium hover:bg-#00C79A transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? '...' : 'Join Waitlist'}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 font-medium max-w-md mx-auto"
                >
                  <Check size={18} />
                  You're on the list!
                </motion.div>
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-sm text-#6b7280"
            >
              Free 14-day trial. No credit card required.
            </motion.p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-light leading-tight mb-6">
                You're paying for 6 tools.
                <br />
                <span className="text-#6b7280">Using none of them well.</span>
              </h2>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto"
            >
              {[
                {
                  icon: Target,
                  title: "Signal Overload",
                  desc: "500 Discord signals. 200 Twitter alerts. Zero context. You miss the good ones and chase the bad ones."
                },
                {
                  icon: Shield,
                  title: "No Risk Control",
                  desc: "Position sizing by gut feeling. No stop losses. Account blown in weeks, not months."
                },
                {
                  icon: BarChart3,
                  title: "Analysis Paralysis",
                  desc: "TradingView + Excel + Discord + Binance. Switching apps kills momentum and profits."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <item.icon size={24} className="text-#9ca3af" />
                  </div>
                  <h3 className="text-xl font-medium mb-4 text-white">
                    {item.title}
                  </h3>
                  <p className="text-#6b7280 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className="py-32 px-8">
          <div className="max-w-6xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-light leading-tight mb-6">
                One platform.
                <br />
                <span className="text-gradient font-medium">Everything you need.</span>
              </h2>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
              className="dashboard-mockup rounded-3xl p-8 mb-12 max-w-5xl mx-auto"
            >
              {/* Browser Bar */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg px-4 py-1 text-sm text-#6b7280">
                  app.pulsewave.ai
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-medium text-white mb-1">Trading Dashboard</h3>
                    <p className="text-#6b7280">Portfolio: $47,832 (+12.4%)</p>
                  </div>
                  <div className="px-4 py-2 bg-#00F0B5 text-black rounded-lg font-medium text-sm">
                    3 Active Signals
                  </div>
                </div>

                {/* Signal Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { pair: 'BTC/USDT', type: 'LONG', confidence: '87%', entry: '$43,250' },
                    { pair: 'ETH/USDT', type: 'SHORT', confidence: '92%', entry: '$2,680' },
                    { pair: 'SOL/USDT', type: 'LONG', confidence: '79%', entry: '$198.50' }
                  ].map((signal, idx) => (
                    <div key={idx} className="signal-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-white">{signal.pair}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          signal.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {signal.type}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-#6b7280">Confidence</span>
                          <span className="text-#00F0B5">{signal.confidence}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-#6b7280">Entry</span>
                          <span className="text-white">{signal.entry}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Area Placeholder */}
                <div className="bg-white/5 rounded-xl h-40 flex items-center justify-center">
                  <div className="text-#6b7280">
                    <TrendingUp size={32} className="mx-auto mb-2" />
                    <span className="text-sm">Advanced Charts & Analytics</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
            >
              {['AI Signal Generation', 'Risk Management', 'Portfolio Analytics', 'One-Click Execution'].map((feature, idx) => (
                <div key={idx} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-#9ca3af">
                  {feature}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32 px-8">
          <div className="max-w-6xl mx-auto space-y-32">
            
            {/* Feature 1 - Confluence Signals */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              <div>
                <h3 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
                  Confluence Signals
                </h3>
                <p className="text-xl text-#9ca3af leading-relaxed mb-8">
                  Every signal combines 12+ technical indicators, market regime analysis, and sentiment data. 
                  Not just lines on a chart.
                </p>
                <div className="text-3xl font-light text-#00F0B5 mb-2">
                  73%
                </div>
                <div className="text-#6b7280">
                  Average win rate across all signals
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-64 flex items-center justify-center">
                <div className="text-center text-#6b7280">
                  <Brain size={48} className="mx-auto mb-4" />
                  <div className="text-sm">AI Signal Engine</div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 - Risk Management */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-64 flex items-center justify-center order-2 md:order-1">
                <div className="text-center text-#6b7280">
                  <Shield size={48} className="mx-auto mb-4" />
                  <div className="text-sm">Risk Guardian</div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
                  Risk Management
                </h3>
                <p className="text-xl text-#9ca3af leading-relaxed mb-8">
                  Automated position sizing, portfolio heat mapping, and stop-loss enforcement. 
                  Never blow your account again.
                </p>
                <div className="text-3xl font-light text-#00F0B5 mb-2">
                  2.1:1
                </div>
                <div className="text-#6b7280">
                  Average risk-to-reward ratio
                </div>
              </div>
            </motion.div>

            {/* Feature 3 - AI Coach */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              <div>
                <h3 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
                  AI Coach
                </h3>
                <p className="text-xl text-#9ca3af leading-relaxed mb-8">
                  Analyzes your trading patterns, identifies mistakes, and provides personalized 
                  recommendations to improve performance.
                </p>
                <div className="text-3xl font-light text-#00F0B5 mb-2">
                  80+
                </div>
                <div className="text-#6b7280">
                  Trading books analyzed by our AI
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-64 flex items-center justify-center">
                <div className="text-center text-#6b7280">
                  <Star size={48} className="mx-auto mb-4" />
                  <div className="text-sm">Personal Trading Coach</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="grid md:grid-cols-3 gap-16 text-center"
            >
              {[
                { number: 80, suffix: '+', label: 'books analyzed' },
                { number: 73, suffix: '%', label: 'signal accuracy' },
                { number: 21, suffix: ':10', label: 'avg R:R ratio' }
              ].map((stat, idx) => {
                const { count, ref } = useCountUp(stat.number, 2000)
                return (
                  <motion.div
                    key={idx}
                    ref={ref}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div className="text-5xl md:text-6xl font-light text-white mb-2">
                      {count}{stat.suffix}
                    </div>
                    <div className="text-#6b7280">
                      {stat.label}
                    </div>
                    {idx < 2 && <div className="hidden md:block absolute right-0 top-1/2 w-px h-16 bg-white/10 transform -translate-y-1/2"></div>}
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-8">
          <div className="max-w-5xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-light leading-tight mb-6">
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-#9ca3af">
                Start free. Upgrade when you're ready.
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  name: 'Pulse',
                  price: '$97',
                  features: ['10 signals/week', 'Basic risk tools', 'Email alerts', 'Community access'],
                  featured: false
                },
                {
                  name: 'Wave',
                  price: '$147',
                  features: ['Unlimited signals', 'Advanced analytics', 'Real-time alerts', 'AI coach', 'Priority support'],
                  featured: true
                },
                {
                  name: 'Tsunami',
                  price: '$197',
                  features: ['Everything in Wave', 'API access', 'Custom strategies', 'White-label options', '1-on-1 support'],
                  featured: false
                }
              ].map((plan, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className={`rounded-2xl p-8 ${
                    plan.featured 
                      ? 'bg-white/5 border-2 border-#00F0B5' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-medium mb-4">{plan.name}</h3>
                    <div className="text-4xl font-light mb-2">{plan.price}</div>
                    <div className="text-sm text-#6b7280">per month</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-3 text-sm">
                        <Check size={16} className="text-#00F0B5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToSection('hero-cta')}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.featured
                        ? 'bg-#00F0B5 text-black hover:bg-#00C79A'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    Join Waitlist
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-32 px-8">
          <div className="max-w-3xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                Questions? Answers.
              </h2>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: "How accurate are your signals?",
                  a: "Our AI signals achieve a 73% win rate through advanced confluence analysis. We combine technical indicators, market regime detection, and sentiment data - not just basic chart patterns."
                },
                {
                  q: "Which exchanges do you support?",
                  a: "All major exchanges including Binance, Coinbase, OKX, Bybit, and KuCoin. We use read-only API keys for safety - your funds never leave your exchange."
                },
                {
                  q: "Do you guarantee profits?",
                  a: "No. Trading always involves risk, and past performance doesn't guarantee future results. We provide high-quality signals and risk management tools, but profitable trading requires discipline and proper risk management."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, cancel with one click. No contracts, no commitments. Plus, we offer a 14-day free trial and 30-day money-back guarantee."
                },
                {
                  q: "What makes PulseWave different?",
                  a: "We replace your entire trading stack with one platform. Real AI (not just repackaged technical analysis), automated risk management, and institutional-grade analytics in a beautiful interface."
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. We use bank-grade encryption, read-only API keys, and never store sensitive information. Your trading data is yours - we just help you analyze it better."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-lg">{item.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-#9ca3af" />
                    </motion.div>
                  </button>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-8 pb-6"
                    >
                      <p className="text-#9ca3af leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-8">
          <div className="max-w-3xl mx-auto text-center">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h2 className="text-5xl md:text-6xl font-light leading-tight mb-8">
                Ready to trade smarter?
              </h2>
              
              <form onSubmit={(e) => handleWaitlistSubmit(e, 'final-cta')} className="flex gap-4 max-w-md mx-auto mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-#6b7280 focus:outline-none focus:border-#00F0B5 transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-#00F0B5 text-black rounded-lg font-medium hover:bg-#00C79A transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Join Waitlist'}
                </motion.button>
              </form>

              <p className="text-sm text-#6b7280 mb-12">
                Join {waitlistCount.toLocaleString()} traders on the waitlist
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <img src="/logo.webp" alt="PulseWave" className="h-8 w-auto mb-4" />
                <p className="text-#6b7280 text-sm leading-relaxed">
                  The complete trading platform for the modern trader.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Product</h4>
                <div className="space-y-2 text-sm text-#6b7280">
                  <div>Features</div>
                  <div>Pricing</div>
                  <div>API</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Company</h4>
                <div className="space-y-2 text-sm text-#6b7280">
                  <div>About</div>
                  <div>Blog</div>
                  <div>Careers</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Legal</h4>
                <div className="space-y-2 text-sm text-#6b7280">
                  <div>Privacy</div>
                  <div>Terms</div>
                  <div>Disclaimer</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-#6b7280 text-sm">
                © 2026 PulseWave Labs. All rights reserved.
              </p>
              <p className="text-#6b7280 text-xs max-w-md text-center md:text-right">
                Trading involves risk. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}