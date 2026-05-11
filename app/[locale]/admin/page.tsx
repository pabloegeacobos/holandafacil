import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import AdminClient from './AdminClient'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const admin = adminSupabase()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin, name')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) redirect(`/${locale}/dashboard`)

  return <AdminClient locale={locale} adminName={profile.name ?? user.email ?? 'Admin'} />
}
