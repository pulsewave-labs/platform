'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard,
  Target, 
  LineChart, 
  Newspaper, 
  BookOpen, 
  Shield, 
  Settings,
  User
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'signals', label: 'Signals', href: '/dashboard/signals', icon: Target },
  { id: 'charts', label: 'Charts', href: '/dashboard/charts', icon: LineChart },
  { id: 'news', label: 'News', href: '/dashboard/news', icon: Newspaper },
  { id: 'journal', label: 'Journal', href: '/dashboard/journal', icon: BookOpen },
  { id: 'risk', label: 'Risk', href: '/dashboard/risk', icon: Shield },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings }
]

const mobileNavItems = navItems.slice(0, 5) // Show first 5 items on mobile

function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.nav 
      className="fixed left-0 top-0 bottom-0 z-50 bg-[#0a0e17] border-r border-[#1b2332] hidden md:flex flex-col items-center py-6"
      initial={{ width: 64 }}
      animate={{ width: isExpanded ? 220 : 64 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 flex items-center px-4">
        <img src="/logo.webp" alt="PulseWave" className="h-7 w-auto" />
      </Link>
      
      {/* Navigation Items */}
      <div className="flex flex-col gap-1 flex-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                className={`relative flex items-center h-11 rounded-xl transition-all duration-200 ease-out cursor-pointer ${
                  isActive 
                    ? 'bg-white/5' 
                    : 'hover:bg-white/3'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-11 h-11 flex items-center justify-center">
                  <Icon 
                    size={20} 
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-[#6b7280]'
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
                        isActive ? 'text-white' : 'text-[#9ca3af]'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 w-1 h-4 bg-[#00F0B5] rounded-r-full -translate-y-1/2"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
      
      {/* Bottom Section */}
      <div className="w-full px-4 space-y-3">
        <div className="h-px bg-[#1b2332] mx-2" />
        
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00F0B5] to-[#00a882] rounded-full flex items-center justify-center">
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
                <div className="text-sm font-medium text-white">Mason</div>
                <div className="text-xs text-[#6b7280]">Pro Trader</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  )
}

function MobileNavigation() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e17]/95 backdrop-blur border-t border-[#1b2332] md:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                  isActive ? 'text-white' : 'text-[#6b7280]'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
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
    const segment = pathname.split('/').pop()
    if (segment === 'dashboard') return 'Dashboard'
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
      <body className="min-h-screen bg-[#0a0e17] text-white font-['Plus_Jakarta_Sans']">
        <Sidebar />
        <MobileNavigation />
        
        <main className="md:ml-16 mb-20 md:mb-0 min-h-screen">
          <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
            {/* Top Bar */}
            <motion.div 
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-2xl font-semibold text-white">
                {getPageTitle()}
              </h1>
              
              <div className="w-8 h-8 bg-gradient-to-br from-[#00F0B5] to-[#00a882] rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            </motion.div>
            
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}