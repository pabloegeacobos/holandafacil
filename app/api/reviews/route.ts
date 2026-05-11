import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

const VALID_FLAGS = ['whatsapp', 'salary_diff', 'housing', 'overtime', 'fake_contract']
const VALID_SECTORS = ['logistics', 'food', 'cleaning', 'construction', 'other']
const VALID_NATIONALITIES = ['ES', 'MX', 'CO', 'VE', 'AR', 'PE', 'EC', 'CU', 'DO', 'CL', 'GT', 'BO', 'HN', 'SV', 'NI', 'PY', 'UY', 'CR', 'PA', 'PL', 'other']
const VALID_WOULD_WORK_AGAIN = ['yes', 'no', 'maybe']
const VALID_DURATIONS = ['less_6m', '6m_2y', 'more_2y', 'less_1m', '1_3m', '3_6m', 'more_6m']
const MS_PER_DAY = 86_400_000

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión para publicar una review.' }, { status: 401 })

    const admin = adminSupabase()

    // Rate limit: max 5 reviews per user per 24h
    const since = new Date(Date.now() - MS_PER_DAY).toISOString()
    const { count: recentReviews } = await admin
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('submitted_by', user.id)
      .gte('created_at', since)
    if ((recentReviews ?? 0) >= 5) {
      return NextResponse.json({ error: 'Límite de reviews alcanzado. Inténtalo mañana.' }, { status: 429 })
    }

    const { agency_name, rating, flags, comment, nationality, sector, sector_detail, would_work_again, duration, improvement } = await req.json()

    if (!agency_name || typeof agency_name !== 'string' || agency_name.trim().length < 2) {
      return NextResponse.json({ error: 'agency_name required' }, { status: 400 })
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating 1-5 required' }, { status: 400 })
    }

    const cleanName = agency_name.trim().slice(0, 100)
    const cleanFlags = Array.isArray(flags) ? flags.filter((f: unknown) => VALID_FLAGS.includes(f as string)) : []
    const cleanComment = typeof comment === 'string' && comment.trim() ? comment.trim().slice(0, 500) : null
    const cleanNationality = VALID_NATIONALITIES.includes(nationality) ? nationality : null
    const cleanSector = VALID_SECTORS.includes(sector) ? sector : null
    const cleanSectorDetail = cleanSector === 'other' && typeof sector_detail === 'string' ? sector_detail.trim().slice(0, 60) || null : null
    const cleanWouldWorkAgain = VALID_WOULD_WORK_AGAIN.includes(would_work_again) ? would_work_again : null
    const cleanDuration = VALID_DURATIONS.includes(duration) ? duration : null
    const cleanImprovement = typeof improvement === 'string' && improvement.trim() ? improvement.trim().slice(0, 300) : null

    // Find or create agency
    let { data: agency } = await admin.from('agencies').select('id').ilike('name', cleanName).maybeSingle()
    let isNewAgency = false
    if (!agency) {
      const { data: inserted, error: insertErr } = await admin.from('agencies').insert({ name: cleanName }).select('id').maybeSingle()
      if (insertErr) console.error('[reviews] agency insert error:', insertErr)
      agency = inserted
      isNewAgency = true
    }
    if (!agency) return NextResponse.json({ error: 'Failed to create agency' }, { status: 500 })

    // Notify admin when a new ETT is added
    if (isNewAgency) {
      await admin.from('suggestions').insert({
        user_id: user.id,
        content: `[NUEVA ETT] "${cleanName}" — añadida al directorio desde una review. Verificar y completar perfil.`,
      })
    }

    const { error: reviewError } = await admin.from('reviews').insert({
      agency_id: agency.id,
      agency_name: cleanName,
      rating,
      flags: cleanFlags,
      comment: cleanComment,
      nationality: cleanNationality,
      sector: cleanSector,
      submitted_by: user.id,
      ...(cleanWouldWorkAgain !== null ? { would_work_again: cleanWouldWorkAgain } : {}),
      ...(cleanDuration !== null ? { duration: cleanDuration } : {}),
      ...(cleanSectorDetail !== null ? { sector_detail: cleanSectorDetail } : {}),
      ...(cleanImprovement !== null ? { improvement_condition: cleanImprovement } : {}),
    })

    if (reviewError) {
      console.error('[reviews] insert error:', reviewError)
      return NextResponse.json({ error: 'Error al guardar la review' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reviews] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
