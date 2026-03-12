import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUser } from '../../../../lib/supabase/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: rules, error } = await supabaseAdmin
      .from('trading_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rules: rules || [] })
  } catch { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { rule_text } = await request.json()
    if (!rule_text) return NextResponse.json({ error: 'rule_text required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('trading_rules')
      .insert({ user_id: user.id, rule_text })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rule: data }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, rule_text, active } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const update: any = {}
    if (rule_text !== undefined) update.rule_text = rule_text
    if (active !== undefined) update.active = active

    const { data, error } = await supabaseAdmin
      .from('trading_rules')
      .update(update)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rule: data })
  } catch { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('trading_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
