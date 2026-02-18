'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  CreditCard,
  User,
  Shield,
  Palette,
  Globe,
  Save,
  Check,
  X,
  AlertTriangle,
  Bot,
  Activity
} from 'lucide-react'

interface NotificationSettings {
  signalAlerts: boolean
  emailNotifications: boolean
  telegramBot: boolean
  pushNotifications: boolean
  dailyReports: boolean
  weeklyReports: boolean
  tradeUpdates: boolean
  systemAlerts: boolean
}

interface AccountInfo {
  email: string
  plan: string
  planExpiry: string
  telegramConnected: boolean
  telegramUsername?: string
}

export default function SettingsClientPage() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    signalAlerts: true,
    emailNotifications: true,
    telegramBot: false,
    pushNotifications: true,
    dailyReports: true,
    weeklyReports: false,
    tradeUpdates: true,
    systemAlerts: true
  })

  const [account, setAccount] = useState<AccountInfo>({
    email: 'trader@example.com',
    plan: 'Annual Plan',
    planExpiry: '2027-02-18',
    telegramConnected: false,
    telegramUsername: ''
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const connectTelegram = () => {
    // Would open Telegram bot connection flow
    alert('Connect to @PulseWaveSignalsBot on Telegram to receive instant trade alerts!')
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Account Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Account Overview</h2>
            <p className="text-zinc-400">Manage your subscription and account details</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400">Email Address</label>
              <div className="mt-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                {account.email}
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400">Current Plan</label>
              <div className="mt-1 flex items-center justify-between px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <span className="font-semibold text-green-400">{account.plan}</span>
                <span className="text-sm text-zinc-400">Renews {new Date(account.planExpiry).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400">Signal Bot Status</label>
              <div className="mt-1 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">Active & Monitoring</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400">Performance</label>
              <div className="mt-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Bot Equity</span>
                  <span className="font-bold text-green-400">$218,418</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Notification Preferences</h2>
            <p className="text-zinc-400">Choose how you want to receive trading alerts</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Telegram Integration */}
          <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-blue-400" />
                <div>
                  <h3 className="font-semibold">Telegram Bot</h3>
                  <p className="text-sm text-zinc-400">Get instant signal alerts on Telegram</p>
                </div>
              </div>
              {account.telegramConnected ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check size={16} />
                  <span>Connected</span>
                </div>
              ) : (
                <button
                  onClick={connectTelegram}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors text-sm font-semibold"
                >
                  Connect Bot
                </button>
              )}
            </div>
            {account.telegramConnected && (
              <div className="text-sm text-zinc-400">
                Connected as @{account.telegramUsername || 'telegram_user'}
              </div>
            )}
          </div>

          {/* Notification Categories */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
                <Activity size={16} />
                Signal Notifications
              </h3>
              
              {[
                { key: 'signalAlerts' as keyof NotificationSettings, label: 'New Trading Signals', desc: 'Get notified when new signals are detected' },
                { key: 'tradeUpdates' as keyof NotificationSettings, label: 'Trade Updates', desc: 'Updates when signals hit TP/SL' },
                { key: 'dailyReports' as keyof NotificationSettings, label: 'Daily Performance', desc: 'Daily P&L and performance summary' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-b-0">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-zinc-400">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications[item.key] ? 'bg-green-500' : 'bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
                <Mail size={16} />
                General Notifications
              </h3>
              
              {[
                { key: 'emailNotifications' as keyof NotificationSettings, label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'pushNotifications' as keyof NotificationSettings, label: 'Browser Push', desc: 'Push notifications in your browser' },
                { key: 'weeklyReports' as keyof NotificationSettings, label: 'Weekly Reports', desc: 'Weekly performance summary' },
                { key: 'systemAlerts' as keyof NotificationSettings, label: 'System Alerts', desc: 'Important system and maintenance updates' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-b-0">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-zinc-400">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications[item.key] ? 'bg-green-500' : 'bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscription Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <CreditCard size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Subscription Management</h2>
            <p className="text-zinc-400">Manage your billing and subscription details</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Check size={16} className="text-green-400" />
                <span className="font-semibold text-green-400">Annual Plan Active</span>
              </div>
              <div className="text-sm text-zinc-400">
                Your subscription renews automatically on {new Date(account.planExpiry).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-left">
                <div className="font-medium">Update Payment Method</div>
                <div className="text-sm text-zinc-400">Change your billing information</div>
              </button>
              
              <button className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-left">
                <div className="font-medium">View Billing History</div>
                <div className="text-sm text-zinc-400">Download invoices and receipts</div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <span className="font-semibold text-amber-400">Need Help?</span>
              </div>
              <div className="text-sm text-zinc-400 mb-3">
                Questions about your subscription or billing?
              </div>
              <button className="px-3 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
                Contact Support
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="font-medium text-red-400 mb-2">Cancel Subscription</div>
              <div className="text-sm text-zinc-400 mb-3">
                You can cancel anytime. Your signals will continue until your billing period ends.
              </div>
              <button className="px-3 py-2 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
                Cancel Plan
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            saved 
              ? 'bg-green-500 text-white' 
              : saving
              ? 'bg-zinc-700 text-zinc-400'
              : 'bg-green-500 hover:bg-green-400 text-white'
          }`}
        >
          {saved ? (
            <span className="flex items-center gap-2">
              <Check size={16} />
              Saved!
            </span>
          ) : saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={16} />
              Save Changes
            </span>
          )}
        </button>
      </motion.div>
    </div>
  )
}