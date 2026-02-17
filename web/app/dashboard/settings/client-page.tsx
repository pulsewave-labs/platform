'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ToastProvider, useSuccessToast, useErrorToast } from '../../../components/ui/toast'
import { DemoModeBanner } from '../../../components/ui/empty-state'
import { Skeleton } from '../../../components/ui/skeleton'
import { useSettings } from '../../../lib/hooks'
import { supabase } from '../../../lib/api'
import { Settings as SettingsIcon, User, Bell, Link, Shield, Check, X } from 'lucide-react'

type Tab = 'Account' | 'Notifications' | 'Exchanges' | 'Risk Parameters'

const tabs: Tab[] = ['Account', 'Notifications', 'Exchanges', 'Risk Parameters']

// Mock settings data
const exchangeConnections = [
  {
    name: 'Binance',
    logo: '🟡',
    status: 'connected' as const,
    lastSync: '2 minutes ago',
    permissions: ['Read', 'Trade']
  },
  {
    name: 'Bybit',
    logo: '🟠', 
    status: 'connected' as const,
    lastSync: '5 minutes ago',
    permissions: ['Read', 'Trade']
  },
  {
    name: 'Coinbase Pro',
    logo: '🔵',
    status: 'disconnected' as const,
    lastSync: 'Never',
    permissions: []
  },
  {
    name: 'OKX',
    logo: '⚫',
    status: 'disconnected' as const,
    lastSync: 'Never', 
    permissions: []
  }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Account')
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    timezone: 'UTC-8',
    tradingStyle: 'Swing Trader'
  })
  const [notifications, setNotifications] = useState({
    signals: true,
    trades: true,
    news: false,
    risk: true,
    email: true,
    push: false
  })
  const [riskParams, setRiskParams] = useState({
    maxRiskPerTrade: '2',
    maxDailyLoss: '5',
    maxPositions: '5',
    autoStopTrading: true,
    requireConfirmation: true
  })
  const [saving, setSaving] = useState(false)

  // Fetch settings and user data
  const { data: settings, loading: settingsLoading, error: settingsError, updateSettings } = useSettings()
  const showSuccess = useSuccessToast()
  const showError = useErrorToast()

  // Load user profile from Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserProfile(prev => ({
            ...prev,
            fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            email: user.email || ''
          }))
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    }
    
    loadUserProfile()
  }, [])

  // Load settings data
  useEffect(() => {
    if (settings) {
      if (settings.notifications) {
        setNotifications(prev => ({ ...prev, ...settings.notifications }))
      }
      if (settings.riskParams) {
        setRiskParams(prev => ({ ...prev, ...settings.riskParams }))
      }
      if (settings.profile) {
        setUserProfile(prev => ({ ...prev, ...settings.profile }))
      }
    }
  }, [settings])
  
  const tabIcons = {
    Account: User,
    Notifications: Bell,
    Exchanges: Link,
    'Risk Parameters': Shield
  }
  
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const updateRiskParam = (key: keyof typeof riskParams, value: string | boolean) => {
    setRiskParams(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateSettings({ profile: userProfile })
      showSuccess('Profile saved', 'Your profile information has been updated.')
    } catch (error) {
      showError('Failed to save profile', 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      await updateSettings({ notifications })
      showSuccess('Notifications saved', 'Your notification preferences have been updated.')
    } catch (error) {
      showError('Failed to save notifications', 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRiskParams = async () => {
    setSaving(true)
    try {
      await updateSettings({ riskParams })
      showSuccess('Risk settings saved', 'Your risk parameters have been updated.')
    } catch (error) {
      showError('Failed to save risk settings', 'Please try again.')
    } finally {
      setSaving(false)
    }
  }
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
        {/* Demo Mode Banner */}
        {settingsError && <DemoModeBanner />}
        
        {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#00F0B5]/20 rounded-xl flex items-center justify-center">
            <SettingsIcon size={18} className="text-[#00F0B5]" />
          </div>
          <div>
            <div className="text-sm text-[#6b7280]">Settings</div>
            <div className="text-sm text-[#9ca3af]">Manage your account & preferences</div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex gap-1">
          {tabs.map(tab => {
            const IconComponent = tabIcons[tab]
            const isActive = activeTab === tab
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00F0B5]/20 text-[#00F0B5]'
                    : 'text-[#6b7280] hover:text-[#9ca3af] hover:bg-[#1b2332]/50'
                }`}
              >
                <IconComponent size={16} />
                {tab}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        className="bg-[#0d1117] border border-[#1b2332] rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Account Tab */}
        {activeTab === 'Account' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
              
              {settingsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="w-20 h-4 mb-2" />
                      <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.fullName}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
                      placeholder="your.email@example.com"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
                      Timezone
                    </label>
                    <select 
                      value={userProfile.timezone}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
                    >
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                      <option value="UTC+0">UTC+0 (London)</option>
                      <option value="UTC+1">UTC+1 (Central Europe)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
                      Trading Style
                    </label>
                    <select 
                      value={userProfile.tradingStyle}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, tradingStyle: e.target.value }))}
                      className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
                    >
                      <option value="Swing Trader">Swing Trader</option>
                      <option value="Day Trader">Day Trader</option>
                      <option value="Scalper">Scalper</option>
                      <option value="Position Trader">Position Trader</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveProfile}
                disabled={saving || settingsLoading}
                className="px-6 py-3 bg-[#00F0B5] text-white font-medium rounded-xl hover:bg-[#00F0B5]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'Notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#1b2332]">
                  <div>
                    <div className="text-sm font-medium text-white">Trading Signals</div>
                    <div className="text-xs text-[#6b7280]">Get notified when new signals are generated</div>
                  </div>
                  <button
                    onClick={() => toggleNotification('signals')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.signals ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.signals ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-[#1b2332]">
                  <div>
                    <div className="text-sm font-medium text-white">Trade Executions</div>
                    <div className="text-xs text-[#6b7280]">Notifications for filled orders and position updates</div>
                  </div>
                  <button
                    onClick={() => toggleNotification('trades')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.trades ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.trades ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-[#1b2332]">
                  <div>
                    <div className="text-sm font-medium text-white">Market News</div>
                    <div className="text-xs text-[#6b7280]">High impact news and market events</div>
                  </div>
                  <button
                    onClick={() => toggleNotification('news')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.news ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.news ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-[#1b2332]">
                  <div>
                    <div className="text-sm font-medium text-white">Risk Alerts</div>
                    <div className="text-xs text-[#6b7280]">Warnings when risk limits are approached</div>
                  </div>
                  <button
                    onClick={() => toggleNotification('risk')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.risk ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.risk ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Delivery Methods</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-white">Email Notifications</div>
                    <div className="text-xs text-[#6b7280]">Receive notifications via email</div>
                  </div>
                  <button
                    onClick={() => toggleNotification('email')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.email ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-white">Push Notifications</div>
                    <div className="text-xs text-[#6b7280]">Browser and mobile push notifications</div>
                  </div>
                  <button
                    onClick={() => toggleNotification('push')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.push ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveNotifications}
                disabled={saving || settingsLoading}
                className="px-6 py-3 bg-[#00F0B5] text-white font-medium rounded-xl hover:bg-[#00F0B5]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Notifications'}
              </button>
            </div>
          </div>
        )}

        {/* Exchanges Tab */}
        {activeTab === 'Exchanges' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Exchange Connections</h3>
              <p className="text-sm text-[#6b7280] mb-6">
                Connect your exchange accounts to enable automated trading and portfolio synchronization.
              </p>
              
              <div className="grid gap-4">
                {exchangeConnections.map((exchange, index) => (
                  <div
                    key={exchange.name}
                    className="bg-[#0a0e17] border border-[#1b2332] rounded-xl p-4 hover:border-[#1b2332]/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{exchange.logo}</div>
                        <div>
                          <div className="text-sm font-medium text-white">{exchange.name}</div>
                          <div className="text-xs text-[#6b7280]">
                            Last sync: {exchange.lastSync}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                          exchange.status === 'connected' 
                            ? 'bg-[#4ade80]/20 text-[#4ade80]' 
                            : 'bg-[#6b7280]/20 text-[#6b7280]'
                        }`}>
                          {exchange.status === 'connected' ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}
                          {exchange.status}
                        </div>
                        
                        <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          exchange.status === 'connected'
                            ? 'bg-[#f87171]/20 text-[#f87171] hover:bg-[#f87171]/30'
                            : 'bg-[#00F0B5]/20 text-[#00F0B5] hover:bg-[#00F0B5]/30'
                        }`}>
                          {exchange.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                    
                    {exchange.status === 'connected' && (
                      <div className="mt-3 pt-3 border-t border-[#1b2332]">
                        <div className="text-xs text-[#6b7280] mb-2">Permissions:</div>
                        <div className="flex gap-2">
                          {exchange.permissions.map(permission => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-[#1b2332] text-[#9ca3af] text-xs rounded-md"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Parameters Tab */}
        {activeTab === 'Risk Parameters' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Risk Management Settings</h3>
              <p className="text-sm text-[#6b7280] mb-6">
                Configure automated risk controls to protect your account from excessive losses.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
                    Max Risk Per Trade (%)
                  </label>
                  <input
                    type="number"
                    value={riskParams.maxRiskPerTrade}
                    onChange={(e) => updateRiskParam('maxRiskPerTrade', e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
                    Max Daily Loss (%)
                  </label>
                  <input
                    type="number"
                    value={riskParams.maxDailyLoss}
                    onChange={(e) => updateRiskParam('maxDailyLoss', e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
                    min="1"
                    max="20"
                    step="0.5"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#6b7280] uppercase tracking-wide mb-2 block">
                    Max Open Positions
                  </label>
                  <input
                    type="number"
                    value={riskParams.maxPositions}
                    onChange={(e) => updateRiskParam('maxPositions', e.target.value)}
                    className="w-full bg-[#0a0e17] border border-[#1b2332] rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00F0B5]/50 transition-colors"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Automated Controls</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#1b2332]">
                  <div>
                    <div className="text-sm font-medium text-white">Auto Stop Trading</div>
                    <div className="text-xs text-[#6b7280]">Automatically stop all trading when daily loss limit is reached</div>
                  </div>
                  <button
                    onClick={() => updateRiskParam('autoStopTrading', !riskParams.autoStopTrading)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      riskParams.autoStopTrading ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      riskParams.autoStopTrading ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-white">Require Trade Confirmation</div>
                    <div className="text-xs text-[#6b7280]">Require manual confirmation before executing trades</div>
                  </div>
                  <button
                    onClick={() => updateRiskParam('requireConfirmation', !riskParams.requireConfirmation)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      riskParams.requireConfirmation ? 'bg-[#00F0B5]' : 'bg-[#1b2332]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      riskParams.requireConfirmation ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveRiskParams}
                disabled={saving || settingsLoading}
                className="px-6 py-3 bg-[#00F0B5] text-white font-medium rounded-xl hover:bg-[#00F0B5]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Risk Settings'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}