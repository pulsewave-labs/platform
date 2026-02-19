import type { Metadata } from 'next'
import PlaybookRead from './client-page'

export const metadata: Metadata = {
  title: 'The 5-Pair Playbook | PulseWave Labs',
  description: 'How we turned $10K into $218K trading 5 crypto pairs. The exact framework with real trade examples.',
}

export default function PlaybookReadPage() {
  return <PlaybookRead />
}
