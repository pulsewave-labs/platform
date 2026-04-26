'use client'

import Link from 'next/link'

export default function DashboardClientPage() {
  return (
    <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.06] bg-[#0c0c0c] p-6 md:p-8">
      <div className="text-[11px] mono tracking-[0.2em] text-[#00e5a0] mb-3">PULSEWAVE JOURNAL</div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Dashboard moved to the journal.</h1>
      <p className="text-sm text-[#888] leading-6 mb-6">The old signal dashboard has been retired. Your primary workspace is now trade logging, debriefs, leak detection, and performance review.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard/journal" className="px-4 py-3 rounded-lg bg-[#00e5a0] text-black text-sm font-bold text-center">Open Journal</Link>
        <Link href="/dashboard/journal/new" className="px-4 py-3 rounded-lg border border-white/[0.08] text-white text-sm font-bold text-center hover:bg-white/[0.04]">Log Trade</Link>
      </div>
    </div>
  )
}
