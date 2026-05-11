import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })

    const { content } = await req.json()
    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json({ error: 'La sugerencia debe tener al menos 10 caracteres.' }, { status: 400 })
    }

    const admin = adminSupabase()
    const { error } = await admin.from('suggestions').insert({
      user_id: user.id,
      content: content.trim().slice(0, 500),
    })

    if (error) {
      console.error('[suggestions] insert error:', error)
      return NextResponse.json({ error: 'Error al guardar.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[suggestions] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
