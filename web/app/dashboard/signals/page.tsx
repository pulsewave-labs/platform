export var dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/dashboard/journal/new?from=signals')
}
