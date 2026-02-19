import type { Metadata } from 'next'
import PlaybookOptIn from './client-page'

export const metadata: Metadata = {
  title: 'The 5-Pair Playbook — Free Download | PulseWave Labs',
  description: 'The exact framework that turned $10K into $218K trading 5 crypto pairs. 624 trades, full transparency, including the losses.',
  openGraph: {
    title: 'The 5-Pair Crypto Framework That Turned $10K Into $218K',
    description: 'Free playbook — the exact pairs, rules, and position sizing we use. Including the losses.',
    url: 'https://www.pulsewavelabs.io/playbook',
  },
}

export default function PlaybookPage() {
  return <PlaybookOptIn />
}
