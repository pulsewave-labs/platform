import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'PulseWave Journal — Trade Debriefs & Rules Engine',
  description: 'PulseWave is now focused on trade journaling, debriefs, leak detection, and trader-specific rules.',
  alternates: { canonical: '/' },
}

export default function PlaybookReadPage() {
  permanentRedirect('/?from=playbook-read')
}
