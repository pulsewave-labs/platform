import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email, source, utm_source, utm_medium, utm_campaign } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('waitlist')
      .upsert(
        { email: email.toLowerCase().trim(), source, utm_source, utm_medium, utm_campaign },
        { onConflict: 'email' }
      )
      .select()

    if (error) {
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    // Get total count for social proof
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ success: true, count: count || 0 })
  } catch (err) {
    console.error('Waitlist API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
