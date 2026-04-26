export var dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

export default function HistoryPage() {
  redirect('/dashboard/journal/stats?from=history')
}
