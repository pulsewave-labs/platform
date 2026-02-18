'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastProvider } from '../../components/ui/toast'
import { ErrorBoundary } from '../../components/error-boundary'
import { 
  LayoutDashboard,
  Activity, 
  History, 
  Settings,
  User,
  Bell,
  Bot,
  LogOut
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Signal Feed', href: '/dashboard', icon: Activity },
  { id: 'history', label: 'Trade History', href: '/dashboard/history', icon: History },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings }
]

// Bottom tab bar shows all items on mobile
const mobileNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Signals', href: '/dashboard', icon: Activity },
  { id: 'history', label: 'History', href: '/dashboard/history', icon: History },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings }
]

function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.nav 
      className="fixed left-0 top-0 bottom-0 z-50 bg-zinc-950 border-r border-zinc-800 hidden md:flex flex-col items-center py-6"
      initial={{ width: 64 }}
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 flex items-center px-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="ml-3"
            >
              <span className="font-bold text-lg text-white">PulseWave</span>
              <div className="text-xs text-green-400 font-semibold">SIGNALS</div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
      
      {/* Navigation Items */}
      <div className="flex flex-col gap-2 flex-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                className={`relative flex items-center h-12 rounded-xl transition-all duration-200 ease-out cursor-pointer ${
                  isActive 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'hover:bg-zinc-800/50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Icon 
                    size={20} 
                    className={`transition-colors ${
                      isActive ? 'text-green-400' : 'text-zinc-400'
                    }`}
                  />
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className={`ml-3 text-sm font-medium whitespace-nowrap ${
                        isActive ? 'text-green-400' : 'text-zinc-300'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 w-1 h-6 bg-green-500 rounded-r-full -translate-y-1/2"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
      
      {/* Bottom Section */}
      <div className="w-full px-4 space-y-4">
        <div className="h-px bg-zinc-800 mx-2" />
        
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="ml-3 flex-1"
              >
                <div className="text-sm font-medium text-white">Trader</div>
                <div className="text-xs text-zinc-400">Pro Plan</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/auth/login">
          <motion.div
            className="flex items-center h-10 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <LogOut size={16} className="text-zinc-400" />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="ml-3 text-sm text-zinc-300"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </div>
    </motion.nav>
  )
}

function MobileNavigation() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 md:hidden">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link key={item.id} href={item.href} className="flex-1">
              <motion.div
                className={`flex flex-col items-center justify-center h-16 min-w-[44px] transition-colors ${
                  isActive ? 'text-green-400' : 'text-zinc-400'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <Icon size={20} />
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -top-2 left-1/2 w-1 h-1 bg-green-400 rounded-full -translate-x-1/2"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function MobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-white">PulseWave</span>
          <div className="text-xs text-green-400 font-semibold">SIGNALS</div>
        </div>
      </div>
      <button className="w-8 h-8 flex items-center justify-center">
        <Bell size={18} className="text-zinc-400" />
      </button>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Extract page title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Signal Feed'
    if (pathname === '/dashboard/history') return 'Trade History'
    if (pathname === '/dashboard/settings') return 'Settings'
    const segment = pathname.split('/').pop()
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard'
  }

  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-zinc-950 text-white font-['Plus_Jakarta_Sans']">
        <ToastProvider>
          <Sidebar />
          <MobileHeader />
          <MobileNavigation />
          
          <main className="md:ml-16 pb-20 md:pb-0 pt-14 md:pt-0 min-h-screen">
            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
              {/* Desktop Top Bar - Hidden on mobile */}
              <motion.div 
                className="hidden md:flex items-center justify-between mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {getPageTitle()}
                  </h1>
                  <p className="text-zinc-400">
                    {pathname === '/dashboard' && 'Live trading signals and active positions'}
                    {pathname === '/dashboard/history' && 'Complete record of all trading signals'}
                    {pathname === '/dashboard/settings' && 'Account and notification preferences'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <Bell size={18} className="text-zinc-400" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                </div>
              </motion.div>
              
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}