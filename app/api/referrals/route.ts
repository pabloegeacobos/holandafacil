import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

const FIVE_MINUTES_MS = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const { ref_code, new_user_id } = await req.json()
    if (!ref_code || typeof ref_code !== 'string' || !new_user_id || typeof new_user_id !== 'string') {
      return NextResponse.json({ error: 'ref_code and new_user_id required' }, { status: 400 })
    }

    const admin = adminSupabase()

    // Anti-abuse: only accept registrations within 5-minute window
    const { data: authData } = await admin.auth.admin.getUserById(new_user_id)
    if (!authData.user) return NextResponse.json({ error: 'Invalid user' }, { status: 400 })

    const ageSecs = Math.round((Date.now() - new Date(authData.user.created_at).getTime()) / 1000)
    if (ageSecs > FIVE_MINUTES_MS / 1000) {
      console.error(`[referrals] window expired: user ${new_user_id} created ${ageSecs}s ago`)
      return NextResponse.json({ error: 'Registration window expired' }, { status: 400 })
    }

    // Find referrer by code
    const { data: referrer, error: referrerErr } = await admin
      .from('profiles')
      .select('id')
      .eq('referral_code', ref_code.toUpperCase())
      .maybeSingle()

    if (referrerErr) console.error('[referrals] referrer lookup error:', referrerErr)
    if (!referrer) return NextResponse.json({ error: 'Invalid ref code' }, { status: 400 })
    if (referrer.id === new_user_id) return NextResponse.json({ error: 'Cannot self-refer' }, { status: 400 })

    // Idempotent: skip if already referred
    const { data: existing } = await admin
      .from('referrals')
      .select('id')
      .eq('referred_id', new_user_id)
      .not('referrer_id', 'is', null)
      .maybeSingle()

    if (existing) return NextResponse.json({ ok: true })

    const { error: insertErr } = await admin.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: new_user_id,
      referrer_user_id: referrer.id,
      check_id: crypto.randomUUID(),
      code: crypto.randomUUID().slice(0, 8).toUpperCase(),
    })

    if (insertErr) console.error('[referrals] insert error:', insertErr)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[referrals] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
