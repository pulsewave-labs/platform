'use client'

import { useState } from 'react'

export default function SettingsClientPage() {
  const [telegramEnabled, setTelegramEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

  return (
    <div className="max-w-xl space-y-6 pb-20 md:pb-0">

      <div>
        <div className="text-xs font-mono text-[#555] tracking-wider mb-4">NOTIFICATIONS</div>
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d]">
            <div>
              <div className="text-sm font-medium text-[#ccc]">Telegram Alerts</div>
              <div className="text-[10px] text-[#444] font-mono">Instant signal notifications</div>
            </div>
            <button
              onClick={function() { setTelegramEnabled(!telegramEnabled) }}
              className={'w-10 h-5 rounded-full transition-colors relative ' + (telegramEnabled ? 'bg-green-500' : 'bg-[#333]')}
            >
              <span className={'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ' + (telegramEnabled ? 'left-5' : 'left-0.5')}></span>
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a1a]">
            <div>
              <div className="text-sm font-medium text-[#ccc]">Email Alerts</div>
              <div className="text-[10px] text-[#444] font-mono">Daily signal digest</div>
            </div>
            <button
              onClick={function() { setEmailEnabled(!emailEnabled) }}
              className={'w-10 h-5 rounded-full transition-colors relative ' + (emailEnabled ? 'bg-green-500' : 'bg-[#333]')}
            >
              <span className={'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ' + (emailEnabled ? 'left-5' : 'left-0.5')}></span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-mono text-[#555] tracking-wider mb-4">SUBSCRIPTION</div>
        <div className="border border-[#1a1a1a] rounded-lg bg-[#0d0d0d] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#ccc]">Pro Plan</div>
              <div className="text-[10px] text-[#444] font-mono">$97/month</div>
            </div>
            <span className="text-[10px] font-mono text-green-400 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded">ACTIVE</span>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-mono text-[#555] tracking-wider mb-4">ACCOUNT</div>
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-[#0d0d0d] flex items-center justify-between">
            <div className="text-sm text-[#888]">Email</div>
            <div className="text-sm text-[#ccc] font-mono">—</div>
          </div>
          <div className="px-4 py-3 border-t border-[#1a1a1a] flex items-center justify-between">
            <div className="text-sm text-[#888]">Member since</div>
            <div className="text-sm text-[#ccc] font-mono">—</div>
          </div>
        </div>
      </div>
    </div>
  )
}
