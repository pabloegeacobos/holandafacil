import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

function genReferralCode() {
  return crypto.randomUUID().slice(0, 8).toUpperCase()
}

export async function GET() {
  try {
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = adminSupabase()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [reviewRes, suggestionRes, referralsRes, profileRes] = await Promise.all([
      admin.from('reviews').select('id', { count: 'exact', head: true }).eq('submitted_by', user.id),
      admin.from('suggestions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      admin.from('referrals').select('id, referred_id, created_at').eq('referrer_id', user.id).order('created_at', { ascending: false }),
      admin.from('profiles').select('referral_code').eq('id', user.id).maybeSingle(),
    ])

    let referralCode = profileRes.data?.referral_code ?? null
    if (!referralCode) {
      const newCode = genReferralCode()
      await admin.from('profiles').update({ referral_code: newCode }).eq('id', user.id)
      referralCode = newCode
    }

    const allReferrals = referralsRes.data ?? []
    const referredIds = allReferrals.map((r) => r.referred_id)

    const referredProfiles = referredIds.length > 0
      ? (await admin.from('profiles').select('id, name').in('id', referredIds)).data ?? []
      : []

    const nameById: Record<string, string> = {}
    for (const p of referredProfiles) nameById[p.id] = p.name ?? 'Usuario'

    const referralList = allReferrals.map((r) => ({
      id: r.id,
      name: nameById[r.referred_id] ?? 'Usuario',
      created_at: r.created_at,
      confirmed: r.created_at <= sevenDaysAgo,
    }))

    const reviewCount = reviewRes.count ?? 0
    const suggestionCount = suggestionRes.count ?? 0
    const referralCount = referralList.filter((r) => r.confirmed).length
    const referralPending = referralList.filter((r) => !r.confirmed).length

    const missionReview = reviewCount >= 1
    const missionSuggestion = suggestionCount >= 1
    const missionReferrals = referralCount >= 3
    const allComplete = missionReview && missionSuggestion && missionReferrals

    if (allComplete) {
      await admin
        .from('premium_rewards')
        .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })
    }

    const { data: reward } = await admin
      .from('premium_rewards')
      .select('earned_at')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      missions: {
        review: { complete: missionReview, count: reviewCount },
        suggestion: { complete: missionSuggestion, count: suggestionCount },
        referrals: { complete: missionReferrals, count: Math.min(referralCount, 3), pending: referralPending, target: 3, list: referralList },
      },
      allComplete,
      reward: reward ? { earned_at: reward.earned_at } : null,
      referralCode,
    })
  } catch (err) {
    console.error('[missions] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
