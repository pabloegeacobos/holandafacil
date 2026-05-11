import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

const DELETABLE = ['reviews', 'suggestions', 'waitlist', 'b2b_leads'] as const
const PATCHABLE = ['b2b_leads'] as const

async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const admin = adminSupabase()
    const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
    return !!profile?.is_admin
  } catch {
    return false
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { resource, id } = await params
  if (!DELETABLE.includes(resource as typeof DELETABLE[number])) {
    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  }
  const admin = adminSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from(resource as any) as any).delete().eq('id', id)
  if (error) {
    console.error(`[admin] delete ${resource}/${id}:`, error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { resource, id } = await params
  if (!PATCHABLE.includes(resource as typeof PATCHABLE[number])) {
    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  }
  const body = await req.json()
  const admin = adminSupabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from(resource as any) as any).update(body).eq('id', id)
  if (error) {
    console.error(`[admin] patch ${resource}/${id}:`, error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
