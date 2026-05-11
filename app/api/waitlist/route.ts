import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }
    const { email, fuente } = await req.json()
    const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : ''
    if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ error: 'email inválido' }, { status: 400 })
    }
    const admin = adminSupabase()
    const { error } = await admin
      .from('waitlist')
      .upsert(
        { email: cleanEmail, fuente: fuente ?? 'directa' },
        { onConflict: 'email', ignoreDuplicates: true }
      )
    if (error) {
      console.error('[waitlist] upsert error:', error)
      throw error
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[waitlist] unexpected error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
