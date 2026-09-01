// src/app/api/cron/engagement-emails/route.ts
// Runs daily at 10:00 UTC.
// Sends: Day 1/3/7 onboarding + Monday "brief ready" notification.

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendWelcomeSequenceEmail, sendBriefReadyEmail } from '@/lib/mail'
import { NICHES } from '@/config/niches'
import { recordDeliveryResult } from './results'
import { todayStartIso } from '@/lib/engagement'

export const dynamic = 'force-dynamic'

function windowStart(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function windowEnd(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = getSupabaseAdmin('api/cron/engagement-emails')
  const results = { day1: 0, day3: 0, day7: 0, briefReady: 0, errors: 0 }

  // DAY 1 — users who signed up today
  const { data: day1Users } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .gte('created_at', windowStart(0))
    .lte('created_at', windowEnd(0))

  for (const user of day1Users || []) {
    if (!user.email) continue
    const r = await sendWelcomeSequenceEmail(user.email, user.full_name || '', 1)
    recordDeliveryResult(results, 'day1', r.success)
  }

  // DAY 3 — users who signed up 3 days ago with NO brief generated yet
  const { data: day3Users } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .gte('created_at', windowStart(3))
    .lte('created_at', windowEnd(3))

  for (const user of day3Users || []) {
    if (!user.email) continue
    const { data: brief } = await supabase
      .from('briefs')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    if (brief) continue // already generated — skip
    const r = await sendWelcomeSequenceEmail(user.email, user.full_name || '', 3)
    recordDeliveryResult(results, 'day3', r.success)
  }

  // DAY 7 — starter users who signed up 7 days ago
  const { data: day7Users } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan')
    .gte('created_at', windowStart(7))
    .lte('created_at', windowEnd(7))
    .eq('plan', 'starter')

  for (const user of day7Users || []) {
    if (!user.email) continue
    const r = await sendWelcomeSequenceEmail(user.email, user.full_name || '', 7)
    recordDeliveryResult(results, 'day7', r.success)
  }

  // BRIEF READY — Monday: notify all users who have a brief generated this week
  // Pro users get it every day; starter only on Mondays.
  const isMonday = new Date().getDay() === 1

  if (isMonday) {
    // Only a brief created by today's weekly run can notify a Starter user.
    const { data: starterBriefsToday } = await supabase
      .from('briefs')
      .select('user_id, profiles!inner(email, full_name, plan, active_niche)')
      .gte('created_at', todayStartIso())
      .eq('profiles.plan', 'starter')

    for (const row of starterBriefsToday || []) {
      const profile = row.profiles as { email?: string; full_name?: string; active_niche?: string } | null
      if (!profile?.email) continue
      const nicheLabel = NICHES[profile.active_niche as string]?.label || 'content'
      const r = await sendBriefReadyEmail(profile.email, profile.full_name || '', nicheLabel, false)
      recordDeliveryResult(results, 'briefReady', r.success)
    }
  }

  // Pro/Team users: notify every day their brief was generated today
  const { data: proUsersWithBriefToday } = await supabase
    .from('briefs')
    .select('user_id, profiles!inner(email, full_name, plan, active_niche)')
    .gte('created_at', todayStartIso())
    .in('profiles.plan', ['pro', 'team'])

  for (const row of proUsersWithBriefToday || []) {
    const profile = row.profiles as { email?: string; full_name?: string; plan?: string; active_niche?: string } | null
    if (!profile?.email) continue
    const nicheLabel = NICHES[profile.active_niche as string]?.label || 'content'
    const r = await sendBriefReadyEmail(profile.email, profile.full_name || '', nicheLabel, true)
    recordDeliveryResult(results, 'briefReady', r.success)
  }

  console.log('[EngagementEmails] Results:', results)
  return NextResponse.json({ success: true, results })
}
