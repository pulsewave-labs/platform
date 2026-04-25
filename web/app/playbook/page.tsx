import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'PulseWave Journal — Build Your Trading Playbook',
  description: 'PulseWave Journal helps traders turn logged trades into a practical playbook: review decisions, find leaks, and write rules.',
  openGraph: {
    title: 'PulseWave Journal — Build Your Trading Playbook',
    description: 'Log trades, spot leaks, and build rules from your own data.',
    url: 'https://www.pulsewavelabs.io/',
  },
  alternates: { canonical: '/' },
}

export default function PlaybookPage() {
  permanentRedirect('/?from=playbook')
}
