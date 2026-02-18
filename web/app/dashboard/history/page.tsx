import HistoryClientPage from './client-page'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Trade History - PulseWave Signals Dashboard',
  description: 'View your complete trading history and performance analytics.',
}

export default function HistoryPage() {
  return <HistoryClientPage />
}
