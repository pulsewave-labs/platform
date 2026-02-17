import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Server-side admin client (for API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Client with user context (for authenticated API routes)
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )
}

// Get user from request (for authenticated routes)
export async function getUser(request: Request) {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
      if (!error && user) return user
    }

    // Fallback to cookie-based auth
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    // Parse cookies manually since we can't use cookies() in this context
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [name, ...rest] = cookie.split('=')
        return [name, rest.join('=')]
      })
    )

    // Look for Supabase session token
    const tokenCookie = Object.keys(cookies).find(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    )
    
    if (tokenCookie) {
      const tokenData = JSON.parse(decodeURIComponent(cookies[tokenCookie] || '{}'))
      if (tokenData.access_token) {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(tokenData.access_token)
        if (!error && user) return user
      }
    }

    return null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Type definitions
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          tier: 'free' | 'pulse' | 'wave' | 'tsunami'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          onboarded: boolean
          created_at: string
          updated_at: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          signal_id: string | null
          pair: string
          direction: 'LONG' | 'SHORT'
          entry_price: number
          exit_price: number | null
          stop_loss: number | null
          take_profit: number | null
          position_size: number | null
          pnl: number | null
          pnl_percent: number | null
          r_multiple: number | null
          fees: number
          status: 'open' | 'closed' | 'cancelled'
          source: 'manual' | 'signal' | 'exchange_import'
          exchange: string | null
          exchange_order_id: string | null
          notes: string | null
          tags: string[]
          timeframe: string | null
          strategy: string | null
          setup_type: string | null
          screenshots: string[] | null
          entry_date: string
          exit_date: string | null
          created_at: string
          updated_at: string
        }
      }
      signals: {
        Row: {
          id: string
          pair: string
          direction: 'LONG' | 'SHORT'
          timeframe: string
          entry_price: number
          stop_loss: number
          take_profit: number
          confidence: number
          regime: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'VOLATILE' | null
          reasoning: string | null
          factors: any
          status: 'active' | 'pending' | 'hit_tp' | 'hit_sl' | 'expired' | 'cancelled'
          min_tier: 'pulse' | 'wave' | 'tsunami'
          risk_percent: number | null
          r_multiple: number | null
          created_at: string
          updated_at: string
          expires_at: string | null
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          risk_per_trade: number
          max_daily_loss: number
          max_positions: number
          default_timeframe: string
          preferred_pairs: string[]
          notifications: any
          exchanges: any
          theme: string
          created_at: string
          updated_at: string
        }
      }
      user_signals: {
        Row: {
          id: string
          user_id: string
          signal_id: string
          status: 'watching' | 'followed' | 'ignored'
          notes: string | null
          created_at: string
        }
      }
      portfolio_snapshots: {
        Row: {
          id: string
          user_id: string
          date: string
          balance: number
          pnl: number
          trades_count: number
          win_count: number
          created_at: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          source: string | null
          url: string | null
          summary: string | null
          impact: 'low' | 'medium' | 'high' | null
          category: string | null
          related_pairs: string[]
          published_at: string | null
          created_at: string
        }
      }
    }
  }
}