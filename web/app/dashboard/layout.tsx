'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import { ErrorBoundary } from '../../components/error-boundary'

const tabs = [
  { label: 'Signals', href: '/dashboard' },
  { label: 'History', href: '/dashboard/history' },
  { label: 'Settings', href: '/dashboard/settings' },
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
        <header className="h-11 border-b border-[#161616] flex items-center justify-between px-4 bg-[#0c0c0c] sticky top-0 z-50">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.webp" alt="PulseWave" className="h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className="h-4 w-px bg-[#1a1a1a]"></div>

            <nav className="flex items-center gap-0.5">
              {tabs.map(function(tab) {
                var active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
                return (
                  <Link key={tab.href} href={tab.href}
                    className={'relative px-3 py-1 text-[11px] font-medium tracking-wide transition-all duration-200 rounded ' + (active ? 'text-white' : 'text-[#555] hover:text-[#888]')}
                  >
                    {tab.label.toUpperCase()}
                    {active && <span className="absolute bottom-0 left-3 right-3 h-px bg-[#00e5a0]"></span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0a1a14] border border-[#0d2a1e]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5a0] opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00e5a0]"></span>
              </span>
              <span className="text-[10px] text-[#00e5a0] mono font-medium">LIVE</span>
            </div>
            <button onClick={handleSignOut} className="text-[10px] text-[#333] hover:text-[#555] transition-colors mono">
              SIGN OUT
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-[1440px] mx-auto px-3 md:px-5 py-4 md:py-5 pb-20 md:pb-5">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Status bar */}
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-6 bg-[#0c0c0c] border-t border-[#141414] items-center justify-between px-4 text-[9px] mono text-[#333] z-50">
          <div className="flex items-center gap-4">
            <span>PULSEWAVE SIGNALS v1.0</span>
            <span className="text-[#222]">|</span>
            <span>6 PAIRS · MARKET STRUCTURE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>10% RISK · 20× LEV</span>
            <span className="text-[#222]">|</span>
            <span>BITGET USDT-M</span>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-[#161616] bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-around md:hidden z-50 pb-[env(safe-area-inset-bottom)]" style={{ height: 'calc(52px + env(safe-area-inset-bottom, 0px))' }}>
          {tabs.map(function(tab) {
            var active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
            return (
              <Link key={tab.href} href={tab.href}
                className={'flex flex-col items-center justify-center flex-1 h-full transition-colors ' + (active ? 'text-[#00e5a0]' : 'text-[#333]')}
              >
                <span className="text-[10px] font-medium tracking-wider mono">{tab.label.toUpperCase()}</span>
                {active && <span className="w-3 h-0.5 bg-[#00e5a0] rounded-full mt-1"></span>}
              </Link>
            )
          })}
        </nav>
      </body>
    </html>
  )
}
