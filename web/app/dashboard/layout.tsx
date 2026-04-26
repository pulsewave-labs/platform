'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import { ErrorBoundary } from '../../components/error-boundary'
import { useEffect, useState } from 'react'

const tabs = [
  { label: 'Journal', href: '/dashboard/journal', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { label: 'New Trade', href: '/dashboard/journal/new', icon: 'M12 5v14m-7-7h14' },
  { label: 'Insights', href: '/dashboard/journal/insights', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { label: 'Stats', href: '/dashboard/journal/stats', icon: 'M3 3v18h18M7 16l4-4 3 3 5-7' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

const journalChildTabs = new Set(['/dashboard/journal/new', '/dashboard/journal/insights', '/dashboard/journal/stats'])

function isActiveTab(pathname: string, href: string) {
  if (pathname === href) return true
  if (href === '/dashboard/journal') {
    if (journalChildTabs.has(pathname)) return false
    return /^\/dashboard\/journal\/[^/]+$/.test(pathname)
  }
  return pathname.startsWith(href + '/')
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  var [subBanner, setSubBanner] = useState(false)

  useEffect(function() {
    fetch('/api/subscription')
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (!data.active) {
          setSubBanner(true)
          setTimeout(function() { router.push('https://whop.com/checkout/plan_kaL9L5TvxU8Bg') }, 3000)
        }
      })
      .catch(function() {})
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (subBanner) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full border border-[#ff4d4d]/15 bg-[#ff4d4d]/[0.03] flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Journal Access Required</h1>
            <p className="text-sm text-white/40 mb-4">Your access is inactive. Redirecting to checkout...</p>
            <a href="https://whop.com/checkout/plan_kaL9L5TvxU8Bg" className="inline-block px-6 py-2.5 bg-[#00e5a0] text-black text-sm font-bold rounded-lg">Restore Access</a>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .mono { font-family: 'JetBrains Mono', monospace; }
          .scrollbar-none::-webkit-scrollbar { display: none; }
          .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .scan-line { animation: scan 3s ease-in-out infinite; }
        `}} />

        <header className="h-14 border-b border-white/[0.04] flex items-center justify-between px-4 md:px-6 bg-[#0c0c0c] sticky top-0 z-50">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.webp" alt="PulseWave" className="h-7" />
            </Link>

            <div className="h-4 w-px bg-white/[0.04]"></div>

            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(function(tab) {
                var active = isActiveTab(pathname, tab.href)
                return (
                  <Link key={tab.href} href={tab.href}
                    className={'relative px-3 py-1.5 text-[11px] font-medium tracking-wider transition-all duration-200 rounded-md ' + (active ? 'text-white bg-white/[0.04]' : 'text-[#666] hover:text-[#999] hover:bg-white/[0.02]')}
                  >
                    {tab.label.toUpperCase()}
                    {active && <span className="absolute bottom-0 left-3 right-3 h-px bg-[#00e5a0]"></span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span>
              <span className="text-[10px] text-[#00e5a0] mono font-medium">JOURNAL</span>
            </div>
            <button onClick={handleSignOut} className="text-[10px] text-[#555] hover:text-[#888] transition-colors mono tracking-wider">
              SIGN OUT
            </button>
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-3 md:px-6 py-4 md:py-6 pb-20 md:pb-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-7 bg-[#0c0c0c] border-t border-white/[0.03] items-center justify-between px-6 text-[9px] mono text-[#555] z-50">
          <div className="flex items-center gap-4">
            <span>PULSEWAVE JOURNAL v1.0</span>
            <span className="text-white/[0.04]">|</span>
            <span>LOG · DEBRIEF · IMPROVE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>THESIS-FIRST JOURNALING</span>
            <span className="text-white/[0.04]">|</span>
            <span>RULES ENGINE</span>
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/[0.04] bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-around md:hidden z-50 pb-[env(safe-area-inset-bottom)]" style={{ height: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
          {tabs.map(function(tab) {
            var active = isActiveTab(pathname, tab.href)
            return (
              <Link key={tab.href} href={tab.href}
                className={'flex flex-col items-center justify-center flex-1 h-full transition-colors gap-1 ' + (active ? 'text-[#00e5a0]' : 'text-[#555]')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={tab.icon}/></svg>
                <span className="text-[9px] font-medium tracking-wider mono">{tab.label.toUpperCase()}</span>
              </Link>
            )
          })}
        </nav>
      </body>
    </html>
  )
}
