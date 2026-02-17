'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Newspaper, 
  BookOpen, 
  PieChart, 
  Shield, 
  GraduationCap, 
  Bot, 
  Settings, 
  Zap,
  Home,
  Menu,
  X
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ size?: number }>
  isBottom?: boolean
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { id: 'signals', label: 'Signals', href: '/dashboard/signals', icon: Target },
  { id: 'charts', label: 'Charts', href: '/dashboard/charts', icon: TrendingUp },
  { id: 'news', label: 'News', href: '/dashboard/news', icon: Newspaper },
  { id: 'journal', label: 'Journal', href: '/dashboard/journal', icon: BookOpen },
  { id: 'analytics', label: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
  { id: 'risk', label: 'Risk', href: '/dashboard/risk', icon: Shield },
  { id: 'education', label: 'Education', href: '/dashboard/education', icon: GraduationCap },
  { id: 'ai-assistant', label: 'AI Assistant', href: '/dashboard/ai', icon: Bot, isBottom: true },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings, isBottom: true },
]

function getCurrentTime() {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const timezone = 'PST' // Could be dynamic based on user preference
  
  const hour = now.getHours()
  let greeting = 'Good evening'
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 17) greeting = 'Good afternoon'
  
  return { time, date, timezone, greeting }
}

function RiskBadge() {
  // Mock data - in real app this would come from context/API
  const riskUsed = 45 // percentage
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  
  if (riskUsed > 70) riskLevel = 'high'
  else if (riskUsed > 50) riskLevel = 'medium'
  
  const riskColors = {
    low: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    high: 'bg-red-500/10 border-red-500/20 text-red-400'
  }
  
  return (
    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${riskColors[riskLevel]}`}>
      <Shield size={12} />
      Risk Budget: {riskUsed}% Used
    </div>
  )
}

function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.nav 
        className="fixed left-0 top-0 bottom-0 z-50 bg-gray-950/95 backdrop-blur border-r border-gray-800 hidden md:flex flex-col items-center py-4"
        initial={{ width: 64 }}
        animate={{ width: isExpanded ? 220 : 64 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <Link href="/dashboard" className="mb-8 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/logo.webp" alt="PulseWave" className={isExpanded ? "h-8 w-auto" : "h-8 w-8 object-contain object-left"} />
          </motion.div>
        </Link>
        
        {/* Navigation Items */}
        <div className="flex flex-col gap-2 flex-1">
          {navItems.filter(item => !item.isBottom).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link key={item.id} href={item.href}>
                <motion.div
                  className={`relative flex items-center w-11 h-11 rounded-xl transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-11 h-11 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 w-1 h-6 bg-blue-400 rounded-r-full -translate-y-1/2"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
        
        {/* Bottom Items */}
        <div className="flex flex-col gap-2">
          {navItems.filter(item => item.isBottom).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link key={item.id} href={item.href}>
                <motion.div
                  className={`relative flex items-center w-11 h-11 rounded-xl transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-11 h-11 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicatorBottom"
                      className="absolute left-0 top-1/2 w-1 h-6 bg-blue-400 rounded-r-full -translate-y-1/2"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.nav>
    </>
  )
}

function MobileNavigation() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-t border-gray-800 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'text-blue-400' 
                    : 'text-gray-400'
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

function TopBar() {
  const [timeData, setTimeData] = useState(getCurrentTime())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(getCurrentTime())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <motion.h1 
          className="text-2xl font-bold text-white mb-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {timeData.greeting}, <span className="text-blue-400">Mason</span>
        </motion.h1>
        <motion.p 
          className="text-sm text-gray-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {timeData.date} • {timeData.time} {timeData.timezone}
        </motion.p>
      </div>
      
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <RiskBadge />
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
      </motion.div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <MobileNavigation />
      
      <main className="md:ml-16 mb-20 md:mb-0">
        <div className="p-5 md:p-6 max-w-[1600px] mx-auto">
          <TopBar />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}