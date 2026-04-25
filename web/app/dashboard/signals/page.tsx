export var dynamic = 'force-dynamic'

import { permanentRedirect } from 'next/navigation'

export default function Page() {
  permanentRedirect('/dashboard/journal/new?from=signals')
}
