'use client'

import Link from 'next/link'

export default function IntelligenceDashboard() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 md:p-8 text-center">
      <div className="text-[11px] mono tracking-[0.2em] text-[#888] mb-3">RETIRED VIEW</div>
      <h1 className="text-2xl font-bold text-white mb-3">Intel moved to insights.</h1>
      <p className="text-sm text-[#888] leading-6 mb-6">Use the journal insights page for leak detection, rule building, and feedback.</p>
      <Link href="/dashboard/journal/insights" className="inline-block px-4 py-3 rounded-lg bg-[#00e5a0] text-black text-sm font-bold">Open Insights</Link>
    </div>
  )
}
