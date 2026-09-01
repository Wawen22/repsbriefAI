// src/app/api/generator/generate-now/route.ts
// On-demand brief generation — rate limited to 1 per calendar day per user.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { dispatchWebhookEvent } from '@/lib/jobs/webhookQueue'
import { ENABLED_TREND_SOURCES, NICHES } from '@/config/niches'
import { getUsableTrends } from '@/lib/trends/quality'
import { scrapeNiche } from '../../scraper'
import { generateBrief } from '../briefGenerator'

// Allow up to 60s for scraping + generation on Vercel Pro
export const maxDuration = 60
export const dynamic = 'force-dynamic'

interface HistoryRow {
  idea_title: string | null
  performance_score: number | null
  idea_data: {
    description?: string
  } | null
}

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin('api/generator/generate-now')

    // 1. Auth — get current user via server client (respects RLS)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Load user profile including brand voice
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('active_niche, plan, brand_voice, current_team_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const nicheId = profile.active_niche || 'fitness'
    const niche = NICHES[nicheId]

    if (!niche) {
      return NextResponse.json({ error: `Unknown niche: ${nicheId}` }, { status: 400 })
    }

    // 3. Rate limit — Pro/Team: 1/day | Starter: 1/week (Monday reset)
    const isPaidPlan = profile.plan === 'pro' || profile.plan === 'team'

    let rateLimitSince: Date
    let rateLimitMessage: string

    if (isPaidPlan) {
      rateLimitSince = new Date()
      rateLimitSince.setHours(0, 0, 0, 0)
      rateLimitMessage = 'You already generated a brief today. Your next generation is available tomorrow.'
    } else {
      // Starter: 1 per week, resets on Monday 00:00
      const now = new Date()
      const dayOfWeek = now.getDay() // 0=Sun, 1=Mon
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      rateLimitSince = new Date(now)
      rateLimitSince.setDate(now.getDate() - daysSinceMonday)
      rateLimitSince.setHours(0, 0, 0, 0)
      rateLimitMessage = 'Starter plan includes 1 manual brief per week. Upgrade to Pro for daily manual generation.'
    }

    const { data: existingInWindow } = await supabaseAdmin
      .from('briefs')
      .select('id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', rateLimitSince.toISOString())
      .limit(1)
      .maybeSingle()

    if (existingInWindow) {
      return NextResponse.json(
        { error: 'rate_limited', message: rateLimitMessage },
        { status: 429 }
      )
    }

    // 4. Load trends from cache (this week's data)
    const weekDate = new Date().toISOString().split('T')[0]

    const { data: cachedTrends } = await supabaseAdmin
      .from('trends_cache')
      .select('data, source')
      .eq('niche', nicheId)
      .eq('week_date', weekDate)

    let trendQuality = getUsableTrends(cachedTrends, {
      now: new Date(),
      allowedSources: ENABLED_TREND_SOURCES,
    })

    if (trendQuality.ok) {
      // Use cached data — fast path
      console.log(`[GenerateNow] Using cached trends for ${nicheId} (${trendQuality.sources.join(', ')})`)
    } else {
      // Missing or degraded cache — scrape fresh before rejecting generation.
      console.log(`[GenerateNow] Trend cache unavailable (${trendQuality.reason}), running fresh scrape for ${nicheId}...`)
      try {
        await scrapeNiche(niche)
      } catch (scrapeErr) {
        console.error('[GenerateNow] Fresh scrape failed:', scrapeErr)
      }

      const { data: freshTrends } = await supabaseAdmin
        .from('trends_cache')
        .select('data, source')
        .eq('niche', nicheId)
        .eq('week_date', weekDate)

      trendQuality = getUsableTrends(freshTrends, {
        now: new Date(),
        allowedSources: ENABLED_TREND_SOURCES,
      })
    }

    if (!trendQuality.ok) {
      console.error(`[GenerateNow] No usable trends for ${nicheId}: ${trendQuality.reason}`)
      return NextResponse.json(
        {
          error: 'trends_unavailable',
          message: 'Fresh trend data is temporarily unavailable. Please try again shortly.',
          reason: trendQuality.reason,
          retryable: true,
        },
        { status: 503, headers: { 'Retry-After': '300' } }
      )
    }

    const allTrends = trendQuality.trends

    // 5. Load user's idea history for deduplication and performance learning
    const { data: history } = await supabaseAdmin
      .from('idea_history')
      .select('idea_title, performance_score, idea_data')
      .eq('user_id', user.id)
      .eq('niche', nicheId)

    const historyTitles = (history || [])
      .map((h: { idea_title: string | null }) => h.idea_title)
      .filter(Boolean) as string[]

    // Extract high-performers (score 4 or 5)
    const highPerformers = ((history || []) as HistoryRow[])
      .filter((h) => typeof h.performance_score === 'number' && h.performance_score >= 4)
      .map((h) => `- [PERFORMER] ${h.idea_title || 'Untitled'}: ${h.idea_data?.description || ''}`)
      .slice(0, 5) // Send top 5 to keep prompt clean

    // 6. Generate brief via AI abstraction layer
    console.log(`[GenerateNow] Generating brief for user ${user.id} (${nicheId}), trends: ${allTrends.length}, sources: ${trendQuality.sources.join(', ')}, performers: ${highPerformers.length}...`)

    let ideas
    try {
      // Pass the high-performers to enable the feedback loop
      ideas = await generateBrief(allTrends, historyTitles, niche, profile.brand_voice, highPerformers)
    } catch (genErr: unknown) {
      const message = genErr instanceof Error ? genErr.message : 'Brief generation failed. Please try again.'
      const stack = genErr instanceof Error ? genErr.stack : String(genErr)
      console.error('[GenerateNow] Generation failed:', message)
      console.error('[GenerateNow] Full error stack:', stack)
      const msg = message
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // 7. Save brief to Supabase
    const { error: briefError } = await supabaseAdmin
      .from('briefs')
      .insert({
        user_id: user.id,
        niche: nicheId,
        week_date: weekDate,
        ideas,
        ai_provider: process.env.AI_PROVIDER || 'openai',
        ai_model: process.env.AI_MODEL || 'gpt-4o-mini',
      })

    if (briefError) {
      console.error('[GenerateNow] Failed to save brief:', briefError)
      return NextResponse.json({ error: 'Failed to save brief' }, { status: 500 })
    }

    if (profile.current_team_id) {
      await dispatchWebhookEvent({
        teamId: profile.current_team_id,
        event: 'brief.ready',
        dedupeKey: `brief-ready:${profile.current_team_id}:${user.id}:${weekDate}:${nicheId}`,
        payload: {
          week_date: weekDate,
          niche: nicheId,
          ideas_count: ideas.length,
        },
      })
    }

    // 8. Save idea titles for future deduplication (saved=false, not visible in My Ideas)
    await supabaseAdmin.from('idea_history').insert(
      ideas.map((i) => ({
        user_id: user.id,
        niche: nicheId,
        idea_hash: Buffer.from(i.title).toString('base64').substring(0, 64),
        idea_title: i.title,
        saved: false,
      }))
    )

    console.log(`[GenerateNow] ✅ Done for user ${user.id}: ${ideas.length} ideas`)
    return NextResponse.json({ success: true, count: ideas.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    console.error('[GenerateNow] Critical Error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
