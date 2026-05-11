import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

const VALID_CATEGORIES = ['viajes', 'paquetes', 'compraventa', 'pisos', 'servicios'] as const
const CONTACT_RE = /^(\+?[\d\s\-().]{6,30}|[^\s@]+@[^\s@]+\.[^\s@]+)$/
const MAX_PER_CONTACT_24H = 5
const MS_PER_DAY = 86_400_000

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const { category_slug, title, description, city, contact, direction, date_available } = await req.json()

    if (!category_slug || !title?.trim() || !contact?.trim()) {
      return NextResponse.json({ error: 'Campos obligatorios: category_slug, title, contact' }, { status: 400 })
    }
    if (!VALID_CATEGORIES.includes(category_slug)) {
      return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 })
    }
    if (direction != null && !['es_to_nl', 'nl_to_es'].includes(direction)) {
      return NextResponse.json({ error: 'Dirección inválida' }, { status: 400 })
    }

    const cleanContact = contact.trim().slice(0, 200)
    if (!CONTACT_RE.test(cleanContact)) {
      return NextResponse.json({ error: 'Contacto inválido. Usa un email o número de teléfono.' }, { status: 400 })
    }

    const admin = adminSupabase()

    // Rate limit: max 5 posts per unique contact per 24h
    const since = new Date(Date.now() - MS_PER_DAY).toISOString()
    const { count: recentPosts } = await admin
      .from('classifieds')
      .select('id', { count: 'exact', head: true })
      .eq('contact', cleanContact)
      .gte('created_at', since)
    if ((recentPosts ?? 0) >= MAX_PER_CONTACT_24H) {
      return NextResponse.json({ error: 'Límite de anuncios alcanzado. Inténtalo mañana.' }, { status: 429 })
    }

    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión para publicar un anuncio.' }, { status: 401 })

    const { error } = await admin.from('classifieds').insert({
      category_slug,
      title: title.trim().slice(0, 150),
      description: description?.trim().slice(0, 800) || null,
      city: city?.trim().slice(0, 80) || null,
      contact: cleanContact,
      direction: direction || null,
      date_available: date_available || null,
      user_id: user.id,
    })

    if (error) {
      console.error('[classifieds] insert error:', error)
      return NextResponse.json({ error: 'Error al guardar el anuncio' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[classifieds] unexpected error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
