import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'PulseWave Journal — Trading Journal & Leak Detection',
  description: 'PulseWave is now focused on AI-assisted trade journaling: log trades, spot leaks, and build rules from your own data.',
  alternates: { canonical: '/' },
}

export default function IndicatorPage() {
  permanentRedirect('/?from=indicator')
}
