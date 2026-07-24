import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import DashboardClient from './DashboardClient'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const admin = adminSupabase()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('name, city, nationality, created_at, avatar_url, bio, whatsapp, lives_in_nl, years_in_nl, job_sector, is_admin, ett_names, working_with_ett, bsn')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[dashboard] profile error:', JSON.stringify(profileError))
  }

  return (
    <DashboardClient
      locale={locale}
      userId={user.id}
      email={user.email ?? ''}
      profile={profile ?? null}
      isAdmin={profile?.is_admin === true}
    />
  )
}
