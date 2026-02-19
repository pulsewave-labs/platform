'use client'

import { useState, useEffect } from 'react'

export default function SettingsClientPage() {
  var [telegramEnabled, setTelegramEnabled] = useState(true)
  var [emailEnabled, setEmailEnabled] = useState(false)
  var [telegramLinked, setTelegramLinked] = useState(false)
  var [telegramLinkedAt, setTelegramLinkedAt] = useState('')
  var [linkLoading, setLinkLoading] = useState(false)
  var [deepLink, setDeepLink] = useState('')
  var [checkingLink, setCheckingLink] = useState(true)
  var [userEmail, setUserEmail] = useState('')
  var [memberSince, setMemberSince] = useState('')
  var [subStatus, setSubStatus] = useState('none')
  var [subPlan, setSubPlan] = useState('')
  var [subExpires, setSubExpires] = useState('')
  var [whopUrl] = useState('https://whop.com/pulsewave-indicator')

  // Fetch user profile + subscription on mount
  useEffect(function() {
    async function loadProfile() {
      try {
        var res = await fetch('/api/subscription')
        if (res.ok) {
          var data = await res.json()
          setSubStatus(data.status || 'none')
          setSubPlan(data.plan || '')
          if (data.expires_at) setSubExpires(data.expires_at)
          if (data.email) setUserEmail(data.email)
          if (data.created_at) setMemberSince(data.created_at)
        }
      } catch (e) {}
    }
    loadProfile()
  }, [])

  // Check Telegram link status on mount
  useEffect(function() {
    async function checkStatus() {
      try {
        var res = await fetch('/api/telegram/link')
        if (res.ok) {
          var data = await res.json()
          setTelegramLinked(data.linked)
          if (data.linked_at) setTelegramLinkedAt(data.linked_at)
        }
      } catch (e) {}
      setCheckingLink(false)
    }
    checkStatus()
  }, [])

  async function handleConnectTelegram() {
    setLinkLoading(true)
    try {
      var res = await fetch('/api/telegram/link', { method: 'POST' })
      if (res.ok) {
        var data = await res.json()
        setDeepLink(data.deep_link)
      }
    } catch (e) {}
    setLinkLoading(false)
  }

  async function handleDisconnectTelegram() {
    try {
      var res = await fetch('/api/telegram/link', { method: 'DELETE' })
      if (res.ok) {
        setTelegramLinked(false)
        setTelegramLinkedAt('')
        setDeepLink('')
      }
    } catch (e) {}
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  var statusColor = subStatus === 'active' ? '#00e5a0' : subStatus === 'cancelled' ? '#c9a227' : '#ff4d4d'
  var statusLabel = subStatus === 'active' ? 'ACTIVE' : subStatus === 'cancelled' ? 'CANCELLED' : subStatus === 'expired' ? 'EXPIRED' : 'INACTIVE'
  var planLabel = subPlan === 'annual' ? 'Annual — $1,490/year' : subPlan === 'monthly' ? 'Monthly — $149/month' : 'No active plan'

  return (
    <div className="max-w-lg space-y-4">

      {/* Account */}
      <section>
        <div className="text-[12px] mono text-[#888] tracking-widest font-medium mb-2">ACCOUNT</div>
        <div className="border border-[#161616] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0c]">
            <span className="text-[14px] text-[#666]">Email</span>
            <span className="text-[14px] text-[#ccc] mono">{userEmail || '—'}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#141414] bg-[#0c0c0c]">
            <span className="text-[14px] text-[#666]">Member since</span>
            <span className="text-[14px] text-[#ccc] mono">{formatDate(memberSince)}</span>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section>
        <div className="text-[12px] mono text-[#888] tracking-widest font-medium mb-2">SUBSCRIPTION</div>
        <div className="border border-[#161616] rounded-lg bg-[#0c0c0c] overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[15px] text-[#ccc] font-medium">{planLabel}</div>
                {subExpires && subStatus === 'active' && (
                  <div className="text-[12px] text-[#666] mono mt-0.5">Renews {formatDate(subExpires)}</div>
                )}
                {subExpires && subStatus === 'cancelled' && (
                  <div className="text-[12px] text-[#c9a227] mono mt-0.5">Access until {formatDate(subExpires)}</div>
                )}
              </div>
              <span className="text-[11px] mono px-2 py-0.5 border rounded tracking-wider" style={{color: statusColor, backgroundColor: statusColor + '14', borderColor: statusColor + '26'}}>{statusLabel}</span>
            </div>
          </div>
          <div className="border-t border-[#141414] px-4 py-3 flex items-center justify-between">
            <span className="text-[13px] text-[#666]">Manage billing, change plan, or cancel</span>
            <a
              href={whopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] mono text-[#00e5a0] hover:text-[#00cc8e] transition-colors"
            >
              MANAGE →
            </a>
          </div>
        </div>
      </section>

      {/* Telegram Connection */}
      <section>
        <div className="text-[12px] mono text-[#888] tracking-widest font-medium mb-2">TELEGRAM</div>
        <div className="border border-[#161616] rounded-lg bg-[#0c0c0c] px-4 py-3">
          {checkingLink ? (
            <div className="text-[14px] text-[#777] mono">Checking...</div>
          ) : telegramLinked ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00e5a0]"></span>
                  <span className="text-sm text-[#ccc] font-medium">Connected</span>
                </div>
                <button
                  onClick={handleDisconnectTelegram}
                  className="text-[13px] mono text-[#ff4d4d] hover:text-[#ff6b6b] transition-colors"
                >
                  DISCONNECT
                </button>
              </div>
              {telegramLinkedAt && (
                <div className="text-[13px] text-[#777] mono">
                  Linked {formatDate(telegramLinkedAt)}
                </div>
              )}
            </div>
          ) : deepLink ? (
            <div>
              <div className="text-sm text-[#ccc] font-medium mb-2">Almost there!</div>
              <div className="text-[14px] text-[#666] mb-3">Click the button below to open the PulseWave bot and link your account:</div>
              <a
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-[#0088cc] hover:bg-[#0099dd] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Open in Telegram
              </a>
              <div className="text-[13px] text-[#666] mono mt-2 text-center">
                Then come back here, it updates automatically
              </div>
              <button
                onClick={function() { setCheckingLink(true); fetch('/api/telegram/link').then(function(r) { return r.json() }).then(function(d) { setTelegramLinked(d.linked); if(d.linked_at) setTelegramLinkedAt(d.linked_at); if(d.linked) setDeepLink(''); setCheckingLink(false); }).catch(function() { setCheckingLink(false) }); }}
                className="block w-full text-center mt-2 text-[13px] mono text-[#888] hover:text-[#ccc] transition-colors"
              >
                CHECK STATUS
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-sm text-[#ccc] font-medium">Telegram Alerts</div>
                  <div className="text-[13px] text-[#777] mono">Get instant signal notifications</div>
                </div>
              </div>
              <button
                onClick={handleConnectTelegram}
                disabled={linkLoading}
                className="mt-2 w-full py-2 bg-[#00e5a0] hover:bg-[#00cc8e] text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {linkLoading ? 'Generating link...' : 'Connect Telegram'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <div className="text-[12px] mono text-[#888] tracking-widest font-medium mb-2">NOTIFICATIONS</div>
        <div className="border border-[#161616] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0c]">
            <div>
              <div className="text-sm text-[#ccc] font-medium">Signal Alerts</div>
              <div className="text-[13px] text-[#777] mono">New signal notifications</div>
            </div>
            <button
              onClick={function() { setTelegramEnabled(!telegramEnabled) }}
              className={'w-9 h-5 rounded-full transition-all duration-200 relative ' + (telegramEnabled ? 'bg-[#00e5a0]' : 'bg-[#222]')}
            >
              <span className={'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ' + (telegramEnabled ? 'left-[18px] bg-white' : 'left-0.5 bg-[#555]')}></span>
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#141414] bg-[#0c0c0c]">
            <div>
              <div className="text-sm text-[#ccc] font-medium">Email Digest</div>
              <div className="text-[13px] text-[#777] mono">Daily performance summary</div>
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

      {/* spacer */}
      <div></div>
    </div>
  )
}
