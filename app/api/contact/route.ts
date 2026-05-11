import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const VALID_ASUNTOS = ['sugerencia', 'incidencia', 'colaboracion', 'otro']

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }
    const { nombre, email, asunto, mensaje } = await req.json()
    const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : ''
    if (
      !nombre || !cleanEmail || !EMAIL_RE.test(cleanEmail) ||
      !VALID_ASUNTOS.includes(asunto) || !mensaje
    ) {
      return NextResponse.json({ error: 'datos incompletos' }, { status: 400 })
    }
    const supabase = adminSupabase()
    const { error } = await supabase.from('contact_messages').insert({
      nombre: String(nombre).trim().slice(0, 100),
      email: cleanEmail,
      asunto: String(asunto),
      mensaje: String(mensaje).trim().slice(0, 1000),
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
