'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import { ErrorBoundary } from '../../components/error-boundary'

const tabs = [
  { label: 'Signals', href: '/dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'History', href: '/dashboard/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
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

        {/* Top bar */}
        <header className="h-12 border-b border-white/[0.04] flex items-center justify-between px-4 md:px-6 bg-[#0c0c0c] sticky top-0 z-50">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.webp" alt="PulseWave" className="h-7 opacity-80 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className="h-4 w-px bg-white/[0.04]"></div>

            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(function(tab) {
                var active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
                return (
                  <Link key={tab.href} href={tab.href}
                    className={'relative px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-200 rounded-md ' + (active ? 'text-white bg-white/[0.04]' : 'text-[#666] hover:text-[#999] hover:bg-white/[0.02]')}
                  >
                    {tab.label.toUpperCase()}
                    {active && <span className="absolute bottom-0 left-3 right-3 h-px bg-[#00e5a0]"></span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00e5a0]/[0.04] border border-[#00e5a0]/[0.08]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span>
              </span>
              <span className="text-[10px] text-[#00e5a0] mono font-medium">LIVE</span>
            </div>
            <button onClick={handleSignOut} className="text-[10px] text-[#555] hover:text-[#888] transition-colors mono tracking-wider">
              SIGN OUT
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-[1440px] mx-auto px-3 md:px-6 py-4 md:py-6 pb-20 md:pb-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Status bar */}
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-7 bg-[#0c0c0c] border-t border-white/[0.03] items-center justify-between px-6 text-[9px] mono text-[#555] z-50">
          <div className="flex items-center gap-4">
            <span>PULSEWAVE SIGNALS v1.0</span>
            <span className="text-white/[0.04]">|</span>
            <span>5 PAIRS · MARKET STRUCTURE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>10% RISK · 20x LEV</span>
            <span className="text-white/[0.04]">|</span>
            <span>BITGET USDT-M</span>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/[0.04] bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-around md:hidden z-50 pb-[env(safe-area-inset-bottom)]" style={{ height: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
          {tabs.map(function(tab) {
            var active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
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
