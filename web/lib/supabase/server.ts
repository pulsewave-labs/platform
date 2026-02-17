import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// For Server Components and Server Actions
export function createClient() {
  const cookieStore = cookies()
  
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

// For Middleware
export function createMiddlewareClient(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  return { supabase, res }
}
