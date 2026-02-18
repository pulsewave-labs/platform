'use client'

import { useState } from 'react'

export default function SettingsClientPage() {
  const [telegramEnabled, setTelegramEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

  return (
    <div className="max-w-lg space-y-4">

      <section>
        <div className="text-[10px] mono text-[#555] tracking-widest font-medium mb-2">NOTIFICATIONS</div>
        <div className="border border-[#161616] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0c]">
            <div>
              <div className="text-sm text-[#ccc] font-medium">Telegram Alerts</div>
              <div className="text-[10px] text-[#444] mono">Instant signal notifications</div>
            </div>
            <button
              onClick={function() { setTelegramEnabled(!telegramEnabled) }}
              className={'w-9 h-5 rounded-full transition-all duration-200 relative ' + (telegramEnabled ? 'bg-[#00e5a0]' : 'bg-[#222]')}
            >
              <span className={'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ' + (telegramEnabled ? 'left-[18px] bg-white' : 'left-0.5 bg-[#555]')}></span>
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#141414]">
            <div>
              <div className="text-sm text-[#ccc] font-medium">Email Digest</div>
              <div className="text-[10px] text-[#444] mono">Daily performance summary</div>
            </div>
            <button
              onClick={function() { setEmailEnabled(!emailEnabled) }}
              className={'w-9 h-5 rounded-full transition-all duration-200 relative ' + (emailEnabled ? 'bg-[#00e5a0]' : 'bg-[#222]')}
            >
              <span className={'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ' + (emailEnabled ? 'left-[18px] bg-white' : 'left-0.5 bg-[#555]')}></span>
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="text-[10px] mono text-[#555] tracking-widest font-medium mb-2">SUBSCRIPTION</div>
        <div className="border border-[#161616] rounded-lg bg-[#0c0c0c] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#ccc] font-medium">Pro Plan</div>
              <div className="text-[10px] text-[#444] mono">$97/month</div>
            </div>
            <span className="text-[9px] mono text-[#00e5a0] px-2 py-0.5 bg-[#00e5a0]/8 border border-[#00e5a0]/15 rounded tracking-wider">ACTIVE</span>
          </div>
        </div>
      </section>

      <section>
        <div className="text-[10px] mono text-[#555] tracking-widest font-medium mb-2">ACCOUNT</div>
        <div className="border border-[#161616] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0c0c0c]">
            <span className="text-[11px] text-[#555]">Email</span>
            <span className="text-[11px] text-[#888] mono">—</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#141414]">
            <span className="text-[11px] text-[#555]">Member since</span>
            <span className="text-[11px] text-[#888] mono">—</span>
          </div>
        </div>
      </section>
    </div>
  )
}
