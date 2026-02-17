'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CheckIcon, ArrowRightIcon, StarIcon } from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Submit to waitlist API
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        setIsSubmitted(true)
        setEmail('')
      }
    } catch (error) {
      console.error('Waitlist submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 lg:px-10 py-4 flex justify-between items-center z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border/50">
        <div className="font-bold text-xl tracking-tight">
          <span className="text-primary-600">Pulse</span>Wave
        </div>
        <Link
          href="/signup"
          className="btn-primary px-6 py-2 text-sm font-semibold hover:scale-105 transition-transform"
        >
          Start Free Trial
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 pb-16 relative">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-600/8 via-transparent to-transparent pointer-events-none" />
        
        {/* Hero badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/15 border border-primary-600/30 rounded-full text-sm text-primary-400 font-semibold mb-6">
          <div className="w-2 h-2 bg-trending rounded-full animate-pulse-slow" />
          Live Beta • Join 2,847 Traders
        </div>

        {/* Hero headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight max-w-5xl mb-6">
          Your Complete
          <br />
          <span className="text-gradient bg-gradient-to-r from-primary-600 via-purple-400 to-pink-400">
            Trading Command Center
          </span>
        </h1>

        <p className="text-lg md:text-xl text-dark-accent max-w-2xl mb-8 leading-relaxed">
          Stop juggling 5 trading apps. PulseWave combines AI-powered signals, 
          auto-journaling, risk management, and real-time news in one platform.
        </p>

        {/* Waitlist form */}
        {!isSubmitted ? (
          <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md w-full mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-5 py-4 bg-dark-surface border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-4 bg-gradient-to-r from-primary-600 to-purple-500 text-white rounded-xl font-bold text-base hover:from-primary-700 hover:to-purple-600 hover:scale-105 transform transition-all duration-200 shadow-lg disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Join Waitlist</>
              )}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3 px-6 py-4 bg-long-500/20 border border-long-500/30 rounded-xl text-long-400 font-semibold">
            <CheckIcon size={20} />
            <span>Thanks! You'll be notified when we launch.</span>
          </div>
        )}

        <p className="text-sm text-dark-muted mt-3">
          <strong className="text-yellow-400">Free 14-day trial.</strong> No credit card required.
        </p>
      </section>

      {/* Social Proof Bar */}
      <section className="flex justify-center gap-8 md:gap-12 py-8 border-t border-b border-dark-border/50 bg-dark-surface/50">
        {[
          { num: '2,847', label: 'Waitlist Signups' },
          { num: '94%', label: 'Beta User Satisfaction' },
          { num: '$2.1M+', label: 'Paper Trading Volume' },
          { num: '156', label: 'Profitable Signals' }
        ].map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.num}</div>
            <div className="text-xs md:text-sm text-dark-muted uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Problem Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="text-sm font-bold uppercase tracking-wide text-primary-600 mb-3">
            The Problem
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Trading Shouldn't Be <span className="text-short-400">This Chaotic</span>
          </h2>
          <p className="text-lg text-dark-accent max-w-3xl mx-auto">
            Most traders lose money because they're drowning in information, 
            switching between 5+ apps, and making emotional decisions without proper risk management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '📱',
              title: 'App Overload',
              desc: 'TradingView + Discord + Twitter + Binance + Excel. Sound familiar? Managing 5+ apps kills focus and causes missed opportunities.'
            },
            {
              icon: '😵‍💫',
              title: 'Information Chaos',
              desc: '500 Discord signals, 200 Twitter "gurus", endless news. 90% is noise, but you can\'t tell which 10% matters.'
            },
            {
              icon: '💸',
              title: 'No Risk Management',
              desc: 'Most traders risk 10-20% per trade (insane), have no stop losses, and blow accounts. Emotions > logic every time.'
            },
            {
              icon: '📊',
              title: 'Zero Trade Tracking',
              desc: 'No journal, no performance metrics, no learning. You repeat the same mistakes forever because you don\'t measure anything.'
            },
            {
              icon: '⏰',
              title: 'Always Behind',
              desc: 'By the time you analyze a setup, copy-paste to Excel, and place orders... the opportunity is gone. Speed kills.'
            },
            {
              icon: '🎰',
              title: 'Pure Gambling',
              desc: 'No strategy, no backtesting, no confluence. Just YOLO trades based on "vibes" and hope. That\'s not trading—it\'s gambling.'
            }
          ].map((problem, idx) => (
            <div
              key={idx}
              className="card p-7 hover:border-short-500/40 hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                {problem.icon}
              </div>
              <h3 className="font-bold text-lg mb-3 text-dark-text">
                {problem.title}
              </h3>
              <p className="text-dark-accent leading-relaxed text-sm">
                {problem.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution/Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="text-sm font-bold uppercase tracking-wide text-primary-600 mb-3">
            The Solution
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Everything You Need in <span className="text-primary-600">One Platform</span>
          </h2>
          <p className="text-lg text-dark-accent max-w-3xl mx-auto">
            PulseWave replaces 5+ trading apps with one intelligent command center. 
            AI-powered, risk-managed, fully automated.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '🎯',
              title: 'AI-Powered Signals',
              desc: 'High-confidence setups with 80%+ win rates. Every signal includes entry, SL, TP, and confluence reasoning.',
              tag: 'Core',
              tagColor: 'bg-long-500/20 text-long-400'
            },
            {
              icon: '📓',
              title: 'Auto Trade Journal',
              desc: 'Connects to exchanges, logs every trade automatically. Track P&L, win rate, R-multiples, and mistakes.',
              tag: 'Core',
              tagColor: 'bg-long-500/20 text-long-400'
            },
            {
              icon: '🛡️',
              title: 'Risk Manager',
              desc: 'Never blow your account. Real-time portfolio heat, position sizing, stop-loss enforcement, tilt detection.',
              tag: 'Core',
              tagColor: 'bg-long-500/20 text-long-400'
            },
            {
              icon: '📰',
              title: 'AI News Filter',
              desc: 'Cut through the noise. AI filters 1000+ news sources for high-impact events that actually move markets.',
              tag: 'AI',
              tagColor: 'bg-primary-600/20 text-primary-400'
            },
            {
              icon: '📈',
              title: 'Advanced Charts',
              desc: 'TradingView integration with S/R levels, signal overlays, regime detection, and multi-timeframe analysis.',
              tag: 'New',
              tagColor: 'bg-purple-500/20 text-purple-400'
            },
            {
              icon: '⚡',
              title: 'Real-Time Alerts',
              desc: 'Instant signals via WebSocket, Discord, Telegram, SMS. Never miss a setup. Customizable filters.',
              tag: 'Core',
              tagColor: 'bg-long-500/20 text-long-400'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="card p-7 hover:border-primary-600/30 hover:-translate-y-2 transition-all duration-300 group hover:shadow-xl hover:shadow-primary-600/10"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-3 text-dark-text">
                {feature.title}
              </h3>
              <p className="text-dark-accent leading-relaxed text-sm mb-4">
                {feature.desc}
              </p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${feature.tagColor}`}>
                {feature.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            PulseWave vs. Traditional Setup
          </h2>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left p-4 text-dark-muted font-semibold text-sm uppercase tracking-wide">
                    Feature
                  </th>
                  <th className="text-left p-4 text-dark-muted font-semibold text-sm uppercase tracking-wide">
                    Traditional Setup
                  </th>
                  <th className="text-left p-4 text-primary-600 font-semibold text-sm uppercase tracking-wide">
                    PulseWave
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Signal Quality', '❌ Random Discord alerts', '✅ AI-verified 80%+ win rate'],
                  ['Risk Management', '❌ Manual stop losses', '✅ Automated risk controls'],
                  ['Trade Tracking', '❌ Excel spreadsheets', '✅ Auto-journaling + analytics'],
                  ['News Analysis', '❌ Twitter scroll', '✅ AI-filtered market events'],
                  ['Chart Analysis', '❌ Basic TradingView', '✅ S/R levels + regime detection'],
                  ['Setup Time', '❌ 30+ minutes daily', '✅ 30 seconds'],
                  ['Monthly Cost', '❌ $200+ (multiple apps)', '✅ $49-199'],
                  ['Win Rate', '❌ 30-50% (typical)', '✅ 70-85% (backtested)']
                ].map(([feature, traditional, pulsewave], idx) => (
                  <tr key={idx} className={idx !== 7 ? 'border-b border-dark-border/50' : ''}>
                    <td className="p-4 font-medium text-sm">{feature}</td>
                    <td className="p-4 text-sm text-dark-accent">{traditional}</td>
                    <td className="p-4 text-sm text-long-400 font-medium">{pulsewave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-dark-accent">
            Choose your plan. Upgrade or downgrade anytime. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: 'Pulse',
              price: 49,
              description: 'Perfect for beginners',
              features: [
                '5 AI signals per day',
                'Basic risk management',
                'Auto trade journal',
                'Email alerts',
                'Discord community'
              ],
              button: 'Start Free Trial',
              popular: false
            },
            {
              name: 'Wave',
              price: 99,
              description: 'Most popular for active traders',
              features: [
                'Unlimited AI signals',
                'Advanced risk controls',
                'Full auto-journaling',
                'Real-time WebSocket alerts',
                'Premium Discord + Telegram',
                'Advanced charting',
                'News filtering'
              ],
              button: 'Start Free Trial',
              popular: true
            },
            {
              name: 'Tsunami',
              price: 199,
              description: 'For serious traders & funds',
              features: [
                'Everything in Wave',
                'API access',
                'Custom integrations',
                'Backtesting engine',
                'Portfolio analytics',
                'Priority support',
                'White-label options'
              ],
              button: 'Start Free Trial',
              popular: false
            }
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`card p-8 text-center relative ${
                plan.popular
                  ? 'border-primary-600/50 bg-gradient-to-b from-primary-600/5 to-transparent'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-600 to-purple-500 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="text-4xl font-extrabold mb-1">
                ${plan.price}
                <span className="text-base text-dark-muted font-normal">/month</span>
              </div>
              <p className="text-sm text-dark-muted mb-6">
                ${Math.round(plan.price * 10)} annually (save 17%)
              </p>
              
              <ul className="text-left mb-6 space-y-2">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-center gap-2 text-sm">
                    <CheckIcon size={16} className="text-long-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/signup"
                className={`block w-full py-3 rounded-lg font-bold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-600 to-purple-500 text-white hover:from-primary-700 hover:to-purple-600 hover:scale-105'
                    : 'bg-dark-border text-dark-text hover:bg-dark-border/80'
                }`}
              >
                {plan.button}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center px-6 py-20 bg-gradient-to-b from-transparent to-primary-600/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Stop Losing Money?
          </h2>
          <p className="text-lg text-dark-accent mb-8 leading-relaxed">
            Join 2,847 traders who've already signed up for early access. 
            Free 14-day trial, no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-primary px-8 py-4 text-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Start Free Trial
              <ArrowRightIcon size={20} className="ml-2" />
            </Link>
            <Link
              href="/demo"
              className="btn-ghost px-8 py-4 text-lg font-medium"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border bg-dark-surface/50 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-xl mb-4">
                <span className="text-primary-600">Pulse</span>Wave
              </div>
              <p className="text-sm text-dark-muted leading-relaxed">
                Your complete trading command center. Built by traders, for traders.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Product</h4>
              <div className="space-y-2">
                <Link href="/features" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Features</Link>
                <Link href="/pricing" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Pricing</Link>
                <Link href="/demo" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Demo</Link>
                <Link href="/api" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">API</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">About</Link>
                <Link href="/blog" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Blog</Link>
                <Link href="/careers" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Careers</Link>
                <Link href="/contact" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Contact</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Privacy</Link>
                <Link href="/terms" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Terms</Link>
                <Link href="/disclaimer" className="block text-sm text-dark-muted hover:text-primary-600 transition-colors">Disclaimer</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-dark-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-dark-muted">
              © 2026 PulseWave Labs. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-sm text-dark-muted">Follow us:</span>
              <div className="flex gap-3">
                {['Twitter', 'Discord', 'YouTube'].map((social) => (
                  <Link
                    key={social}
                    href={`/${social.toLowerCase()}`}
                    className="text-dark-muted hover:text-primary-600 transition-colors"
                  >
                    {social}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}