'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Link as LinkIcon, 
  CreditCard, 
  Star,
  Check,
  Settings as SettingsIcon,
  Zap,
  AlertTriangle,
  DollarSign
} from 'lucide-react'

interface SettingsSection {
  id: string
  title: string
  icon: React.ComponentType<{ size?: number }>
  description: string
}

const settingSections: SettingsSection[] = [
  { id: 'account', title: 'Account', icon: User, description: 'Personal information and avatar' },
  { id: 'subscription', title: 'Subscription', icon: CreditCard, description: 'Plan details and billing' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Email, Telegram, and push settings' },
  { id: 'exchanges', title: 'Exchange APIs', icon: LinkIcon, description: 'Connected trading accounts' },
  { id: 'risk', title: 'Risk Parameters', icon: Shield, description: 'Trading limits and safety settings' },
  { id: 'appearance', title: 'Appearance', icon: Palette, description: 'Theme and display preferences' }
]

function SubscriptionTierBadge({ tier }: { tier: string }) {
  const tierConfig = {
    pulse: { name: 'Pulse', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    wave: { name: 'Wave', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    tsunami: { name: 'Tsunami', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
  }
  
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.pulse
  
  return (
    <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${config.color}`}>
      {config.name}
    </span>
  )
}

function AccountSection() {
  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <User className="text-blue-400" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-white">Account Information</h3>
          <p className="text-sm text-gray-400">Manage your personal details</p>
        </div>
      </div>
      
      <div className="flex items-start gap-6 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
          M
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Mason Rodriguez"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                defaultValue="mason@pulsewave.com"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
            Update Profile
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Security</h4>
        <div className="space-y-3">
          <button className="flex items-center justify-between w-full text-left p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
            <div>
              <div className="text-sm font-medium text-white">Change Password</div>
              <div className="text-xs text-gray-400">Last changed 30 days ago</div>
            </div>
            <div className="text-blue-400">→</div>
          </button>
          <button className="flex items-center justify-between w-full text-left p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
            <div>
              <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
              <div className="text-xs text-emerald-400">Enabled</div>
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function SubscriptionSection() {
  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="text-purple-400" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-white">Subscription</h3>
          <p className="text-sm text-gray-400">Manage your plan and billing</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Star className="text-purple-400" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">Wave Plan</span>
              <SubscriptionTierBadge tier="wave" />
            </div>
            <div className="text-sm text-gray-400">$99/month • Renews March 17, 2026</div>
          </div>
        </div>
        <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors">
          Upgrade
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="text-2xl font-bold text-white mb-1">Unlimited</div>
          <div className="text-sm text-gray-400">Signals per month</div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="text-2xl font-bold text-white mb-1">50</div>
          <div className="text-sm text-gray-400">Pairs supported</div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="text-2xl font-bold text-white mb-1">24/7</div>
          <div className="text-sm text-gray-400">Priority support</div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Billing</h4>
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
              <CreditCard size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">•••• •••• •••• 4242</div>
              <div className="text-xs text-gray-400">Expires 12/27</div>
            </div>
          </div>
          <button className="text-blue-400 text-sm">Update</button>
        </div>
      </div>
    </motion.div>
  )
}

function NotificationsSection() {
  const [emailNotifications, setEmailNotifications] = useState({
    signals: true,
    trades: true,
    news: false,
    riskAlerts: true
  })
  
  const [telegramNotifications, setTelegramNotifications] = useState({
    signals: true,
    trades: false,
    news: false,
    riskAlerts: true
  })
  
  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-emerald-400" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <p className="text-sm text-gray-400">Choose how you want to be notified</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Mail size={16} />
            Email Notifications
          </h4>
          <div className="space-y-3">
            {Object.entries(emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {key === 'signals' && 'New trading signals and alerts'}
                    {key === 'trades' && 'Trade executions and fills'}
                    {key === 'news' && 'Market news and updates'}
                    {key === 'riskAlerts' && 'Risk management warnings'}
                  </div>
                </div>
                <button
                  onClick={() => setEmailNotifications(prev => ({ ...prev, [key]: !value }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    value ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Telegram Notifications */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Zap size={16} />
            Telegram Bot
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">Connected</span>
          </h4>
          <div className="space-y-3">
            {Object.entries(telegramNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
                <button
                  onClick={() => setTelegramNotifications(prev => ({ ...prev, [key]: !value }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    value ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ExchangeAPIsSection() {
  const exchanges = [
    { name: 'Binance', connected: true, permissions: ['Read', 'Trade'], status: 'active' },
    { name: 'Coinbase Pro', connected: false, permissions: [], status: 'disconnected' },
    { name: 'Bybit', connected: false, permissions: [], status: 'disconnected' }
  ]
  
  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <LinkIcon className="text-amber-400" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-white">Exchange APIs</h3>
          <p className="text-sm text-gray-400">Connect your trading accounts</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {exchanges.map((exchange, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                exchange.connected ? 'bg-emerald-500/20' : 'bg-gray-600/20'
              }`}>
                <LinkIcon size={20} className={exchange.connected ? 'text-emerald-400' : 'text-gray-400'} />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{exchange.name}</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    exchange.status === 'active' ? 'bg-emerald-400' : 'bg-gray-500'
                  }`} />
                  <span className="text-xs text-gray-400 capitalize">{exchange.status}</span>
                  {exchange.permissions.length > 0 && (
                    <span className="text-xs text-gray-400">
                      • {exchange.permissions.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              exchange.connected
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            }`}>
              {exchange.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <AlertTriangle size={16} />
          <span className="font-medium">Security Notice</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          API keys are encrypted and stored securely. Only "Read" and "Trade" permissions are required.
        </div>
      </div>
    </motion.div>
  )
}

function RiskParametersSection() {
  const [riskSettings, setRiskSettings] = useState({
    maxDailyLoss: 500,
    maxPositions: 5,
    defaultRisk: 2
  })
  
  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-red-400" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-white">Risk Parameters</h3>
          <p className="text-sm text-gray-400">Configure your trading limits</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Maximum Daily Loss ($)
          </label>
          <input
            type="number"
            value={riskSettings.maxDailyLoss}
            onChange={(e) => setRiskSettings(prev => ({ ...prev, maxDailyLoss: Number(e.target.value) }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            Trading will be disabled if this limit is reached
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Maximum Open Positions
          </label>
          <input
            type="number"
            value={riskSettings.maxPositions}
            onChange={(e) => setRiskSettings(prev => ({ ...prev, maxPositions: Number(e.target.value) }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
            min="1"
            max="10"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Default Risk Per Trade (%)
          </label>
          <input
            type="number"
            value={riskSettings.defaultRisk}
            onChange={(e) => setRiskSettings(prev => ({ ...prev, defaultRisk: Number(e.target.value) }))}
            step="0.1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-800">
        <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
    </motion.div>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account')
  
  const renderSection = () => {
    switch (activeSection) {
      case 'account': return <AccountSection />
      case 'subscription': return <SubscriptionSection />
      case 'notifications': return <NotificationsSection />
      case 'exchanges': return <ExchangeAPIsSection />
      case 'risk': return <RiskParametersSection />
      case 'appearance': return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="text-center py-12">
            <Palette className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Theme Settings</h3>
            <p className="text-gray-500">Appearance customization coming soon</p>
          </div>
        </div>
      )
      default: return <AccountSection />
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-blue-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <nav className="space-y-1">
              {settingSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{section.title}</div>
                        <div className="text-xs opacity-75 truncate">{section.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </motion.div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}