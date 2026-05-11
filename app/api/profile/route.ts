import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

const VALID_SECTORS = ['logistics', 'food', 'cleaning', 'construction', 'services', 'office', 'other']
const VALID_YEARS = ['menos1', '1a2', '2a5', 'mas5']
const VALID_LIVES_IN_NL = ['yes', 'no', 'soon']
const VALID_WORKING_ETT = ['yes', 'no', 'never']

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { full_name, city, country_origin, bio, whatsapp, lives_in_nl, years_in_nl, job_sector, avatar_url, ett_names, working_with_ett } = await req.json()

    const payload: Record<string, unknown> = { id: user.id }
    if (typeof full_name === 'string') payload.name = full_name.trim().slice(0, 100) || null
    if (typeof city === 'string') payload.city = city.trim().slice(0, 80) || null
    if (typeof country_origin === 'string') payload.nationality = country_origin.trim().slice(0, 80) || null
    if (typeof bio === 'string') payload.bio = bio.trim().slice(0, 200) || null
    if (typeof whatsapp === 'string') payload.whatsapp = whatsapp.trim().slice(0, 30) || null
    payload.lives_in_nl = VALID_LIVES_IN_NL.includes(lives_in_nl) ? lives_in_nl : null
    payload.years_in_nl = VALID_YEARS.includes(years_in_nl) ? years_in_nl : null
    payload.job_sector = VALID_SECTORS.includes(job_sector) ? job_sector : null
    if (typeof avatar_url === 'string' && avatar_url) payload.avatar_url = avatar_url
    if (typeof ett_names === 'string') payload.ett_names = ett_names.trim().slice(0, 300) || null
    payload.working_with_ett = VALID_WORKING_ETT.includes(working_with_ett) ? working_with_ett : null

    const admin = adminSupabase()
    const { error } = await admin.from('profiles').upsert(payload, { onConflict: 'id' })

    if (error) {
      console.error('[profile] upsert error:', error)
      return NextResponse.json({ error: 'Error al guardar.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profile] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
