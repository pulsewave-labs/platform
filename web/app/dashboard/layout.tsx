'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ErrorBoundary } from '../../components/error-boundary'

const tabs = [
  { label: 'Signals', href: '/dashboard' },
  { label: 'History', href: '/dashboard/history' },
  { label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Top bar */}
        <header className="h-12 border-b border-[#1a1a1a] flex items-center justify-between px-4 bg-[#0d0d0d] sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.webp" alt="PulseWave" className="h-5" />
              <span className="text-sm font-semibold tracking-tight hidden sm:inline">PulseWave</span>
            </Link>

            <nav className="flex items-center">
              {tabs.map(function(tab) {
                var active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
                return (
                  <Link key={tab.href} href={tab.href}
                    className={'px-3 py-1.5 text-xs font-medium rounded transition-colors ' + (active ? 'text-white bg-[#1a1a1a]' : 'text-[#666] hover:text-[#999]')}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-[#666] font-mono">LIVE</span>
            </div>
            <Link href="/auth/login" className="text-[10px] text-[#444] hover:text-[#666] transition-colors">
              SIGN OUT
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-[1400px] mx-auto px-4 py-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 h-14 border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-around md:hidden z-50">
          {tabs.map(function(tab) {
            var active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href))
            return (
              <Link key={tab.href} href={tab.href}
                className={'flex flex-col items-center gap-1 px-4 py-2 ' + (active ? 'text-white' : 'text-[#444]')}
              >
                <span className="text-xs font-medium">{tab.label}</span>
                {active && <span className="w-4 h-0.5 bg-green-500 rounded-full"></span>}
              </Link>
            )
          })}
        </nav>
      </body>
    </html>
  )
}
