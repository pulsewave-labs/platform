import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token 
    ? { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

export const api = {
  async get(path: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(path, { headers })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  },
  async post(path: string, body: any) {
    const headers = await getAuthHeaders()
    const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  },
  async patch(path: string, body: any) {
    const headers = await getAuthHeaders()
    const res = await fetch(path, { method: 'PATCH', headers, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  },
  async delete(path: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(path, { method: 'DELETE', headers })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  }
}

// Auth utilities
export { supabase }