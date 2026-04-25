import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'PulseWave Journal — Performance Analytics for Traders',
  description: 'PulseWave is now a trading journal command center for P&L analytics, leak detection, debriefs, and rule building.',
  alternates: { canonical: '/' },
}

export default function PerformancePage() {
  permanentRedirect('/?from=performance')
}
