import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'departments') {
    const { data, error } = await supabaseAdmin
      .from('departments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ departments: data })
  }

  if (type === 'submissions') {
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ submissions: data })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (type === 'submission') {
    const body = await req.json()
    const updateData: Record<string, any> = {}
    if (body.members) updateData.members = body.members
    if (body.github_link) updateData.github_link = body.github_link
    if (body.notes !== undefined) updateData.notes = body.notes

    const { error } = await supabaseAdmin.from('submissions').update(updateData).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (type === 'submission') {
    const { error } = await supabaseAdmin.from('submissions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (type === 'department') {
    // Cascade: delete submissions and groups first
    const { data: groups } = await supabaseAdmin.from('groups').select('id').eq('department_id', id)
    if (groups?.length) {
      const groupIds = groups.map(g => g.id)
      await supabaseAdmin.from('submissions').delete().in('group_id', groupIds)
      await supabaseAdmin.from('groups').delete().eq('department_id', id)
    }
    const { error } = await supabaseAdmin.from('departments').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}
