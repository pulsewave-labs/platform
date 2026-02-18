import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HistoryClientPage from './client-page'

export const metadata = {
  title: 'Trade History - PulseWave Signals Dashboard',
  description: 'View your complete trading history and performance analytics.',
}

export default async function HistoryPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <HistoryClientPage />
}