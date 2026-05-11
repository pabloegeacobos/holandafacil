import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

async function getAdminUser() {
  try {
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const admin = adminSupabase()
    const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
    return profile?.is_admin ? user : null
  } catch {
    return null
  }
}

export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = adminSupabase()

  const [reviews, suggestions, waitlist, b2bLeads, referrals, profiles, authUsers, allReviews] = await Promise.all([
    admin
      .from('reviews')
      .select('id, agency_name, rating, comment, flags, nationality, sector, created_at, submitted_by')
      .order('created_at', { ascending: false })
      .limit(300),
    admin
      .from('suggestions')
      .select('id, content, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(300),
    admin
      .from('waitlist')
      .select('id, email, fuente, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    admin
      .from('b2b_leads')
      .select('id, nombre, empresa, email, tipo_interes, estado, created_at')
      .order('created_at', { ascending: false })
      .limit(300),
    admin
      .from('referrals')
      .select('id, referrer_id, referred_id, created_at')
      .order('created_at', { ascending: false })
      .limit(300),
    admin
      .from('profiles')
      .select('id, name, city, nationality, created_at, ett_names, working_with_ett')
      .order('created_at', { ascending: false })
      .limit(1000),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from('reviews')
      .select('submitted_by, agency_name, created_at')
      .not('submitted_by', 'is', null)
      .order('created_at', { ascending: false })
      .limit(2000),
  ])

  // Build latest ETT per user from reviews
  const latestEtt: Record<string, string> = {}
  for (const r of (allReviews.data ?? [])) {
    if (r.submitted_by && !latestEtt[r.submitted_by]) {
      latestEtt[r.submitted_by] = r.agency_name
    }
  }

  // Merge profiles with auth emails
  const emailMap: Record<string, string> = {}
  for (const u of (authUsers.data?.users ?? [])) {
    if (u.email) emailMap[u.id] = u.email
  }

  const users = (profiles.data ?? []).map(p => ({
    id: p.id,
    email: emailMap[p.id] ?? null,
    name: p.name,
    city: p.city,
    nationality: p.nationality,
    created_at: p.created_at,
    last_ett: latestEtt[p.id] ?? null,
    ett_names: p.ett_names ?? null,
    working_with_ett: p.working_with_ett ?? null,
  }))

  return NextResponse.json({
    reviews: reviews.data ?? [],
    suggestions: suggestions.data ?? [],
    waitlist: waitlist.data ?? [],
    b2b_leads: b2bLeads.data ?? [],
    referrals: referrals.data ?? [],
    users,
  })
}
