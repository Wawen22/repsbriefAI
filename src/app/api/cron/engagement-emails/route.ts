// src/app/api/cron/engagement-emails/route.ts
// Runs daily at 10:00 UTC. Sends Day 1, Day 3, and Day 7 emails based on signup date.

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendWelcomeSequenceEmail } from '@/lib/mail'

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

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = getSupabaseAdmin('api/cron/engagement-emails')
  const results = { day1: 0, day3: 0, day7: 0, errors: 0 }

  // DAY 1 — users who signed up today
  const { data: day1Users } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .gte('created_at', windowStart(0))
    .lte('created_at', windowEnd(0))

  for (const user of day1Users || []) {
    if (!user.email) continue
    const r = await sendWelcomeSequenceEmail(user.email, user.full_name || '', 1)
    r.success ? results.day1++ : results.errors++
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
    r.success ? results.day3++ : results.errors++
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
    r.success ? results.day7++ : results.errors++
  }

  console.log('[EngagementEmails] Results:', results)
  return NextResponse.json({ success: true, results })
}
