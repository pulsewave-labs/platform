import { permanentRedirect } from 'next/navigation'

export default function HistoryPage() {
  permanentRedirect('/dashboard/journal/stats?from=history')
}
