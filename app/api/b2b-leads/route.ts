import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }
    const { nombre, empresa, email, tipo_interes } = await req.json()
    const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : ''
    if (!nombre || !empresa || !cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ error: 'datos incompletos' }, { status: 400 })
    }
    const supabase = await createClient()
    const { error } = await supabase.from('b2b_leads').insert({
      nombre: String(nombre).trim().slice(0, 100),
      empresa: String(empresa).trim().slice(0, 100),
      email: cleanEmail,
      tipo_interes: tipo_interes ?? null,
      estado: 'nuevo',
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
