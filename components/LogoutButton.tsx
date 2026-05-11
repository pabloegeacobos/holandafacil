'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({ label, locale }: { label: string; locale: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-slate-500 hover:text-white text-sm font-medium transition-colors cursor-pointer"
    >
      {label}
    </button>
  )
}
