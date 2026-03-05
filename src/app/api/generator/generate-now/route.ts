// src/app/api/generator/generate-now/route.ts
// On-demand brief generation — rate limited to 1 per calendar day per user.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NICHES } from '@/config/niches'
import { scrapeNiche } from '../../scraper'
import { generateBrief } from '../briefGenerator'
import { TrendItem } from '@/types/niche'

// Allow up to 60s for scraping + generation on Vercel Pro
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // 1. Auth — get current user via server client (respects RLS)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Load user profile including brand voice
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('active_niche, plan, brand_voice')
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

    // 3. Rate limit — 1 generation per calendar day
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: existingToday } = await supabaseAdmin
      .from('briefs')
      .select('id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .limit(1)
      .maybeSingle()

    if (existingToday) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'You already generated a brief today. Your next generation is available tomorrow.' },
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

    let allTrends: TrendItem[] = []

    if (cachedTrends && cachedTrends.length > 0) {
      // Use cached data — fast path
      console.log(`[GenerateNow] Using cached trends for ${nicheId} (${cachedTrends.length} sources)`)
      allTrends = cachedTrends.flatMap((t: { data: TrendItem[] }) => t.data)
    } else {
      // No cache — scrape fresh (slower path)
      console.log(`[GenerateNow] No cache found, running fresh scrape for ${nicheId}...`)
      try {
        await scrapeNiche(niche)
      } catch (scrapeErr) {
        console.error('[GenerateNow] Scrape failed, but will try to generate with base knowledge:', scrapeErr)
      }

      const { data: freshTrends } = await supabaseAdmin
        .from('trends_cache')
        .select('data')
        .eq('niche', nicheId)
        .eq('week_date', weekDate)

      allTrends = freshTrends?.flatMap((t: { data: TrendItem[] }) => t.data) || []
    }

    // 5. Load user's idea history for deduplication
    const { data: history } = await supabaseAdmin
      .from('idea_history')
      .select('idea_title')
      .eq('user_id', user.id)
      .eq('niche', nicheId)

    const historyTitles = (history || [])
      .map((h: { idea_title: string | null }) => h.idea_title)
      .filter(Boolean) as string[]

    // 6. Generate brief via AI abstraction layer
    console.log(`[GenerateNow] Generating brief for user ${user.id} (${nicheId}), trends: ${allTrends.length}...`)

    let ideas
    try {
      // Pass the brand_voice from profile directly to briefGenerator
      ideas = await generateBrief(allTrends, historyTitles, niche, profile.brand_voice)
    } catch (genErr: any) {
      console.error('[GenerateNow] Generation failed:', genErr.message)
      console.error('[GenerateNow] Full error stack:', genErr.stack || genErr)
      const msg = genErr.message || 'Brief generation failed. Please try again.'
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

    // 8. Save idea titles for future deduplication (saved=false, not visible in My Ideas)
    await supabaseAdmin.from('idea_history').insert(
      ideas.map(i => ({
        user_id: user.id,
        niche: nicheId,
        idea_hash: Buffer.from(i.title).toString('base64').substring(0, 64),
        idea_title: i.title,
        saved: false,
      }))
    )

    console.log(`[GenerateNow] ✅ Done for user ${user.id}: ${ideas.length} ideas`)
    return NextResponse.json({ success: true, count: ideas.length })
  } catch (err: any) {
    console.error('[GenerateNow] Critical Error:', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
