// src/app/api/cron/weeklyBrief/route.ts

import { NextResponse } from 'next/server'
import { ENABLED_TREND_SOURCES, NICHES } from '@/config/niches'
import { refreshTrendCacheFromSnapshot } from '../../scraper'
import { generateBrief } from '../../generator/briefGenerator'
import { getSupabaseAdmin } from '@/lib/supabase'
import { persistBriefTrendEvidence } from '@/lib/trends/evidence'
import { getUsableTrends } from '@/lib/trends/quality'
import { getTrendRepository } from '@/lib/trends/repository'
import { dispatchWebhookEvent } from '@/lib/jobs/webhookQueue'
import { sendBrief } from '../../email/sendBrief'
import { ACTIVE_PAID_PLANS } from '@/lib/billing'
import type { NicheConfig } from '@/types/niche'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // 1. Verify CRON_SECRET
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const weekDate = new Date().toISOString().split('T')[0]
  const results = {
    totalNiches: 0,
    totalUsers: 0,
    success: 0,
    failures: [] as Array<{ userId: string; error: string }>,
  }

  try {
    const supabaseAdmin = getSupabaseAdmin('api/cron/weeklyBrief')
    const trendRepository = await getTrendRepository()

    // 2. Get active niches
    const activeNiches = Object.values(NICHES).filter((niche): niche is NicheConfig => niche.active)
    results.totalNiches = activeNiches.length

    // 3. For each niche: materialize the last verified ingestion snapshot.
    for (const niche of activeNiches) {
      const quality = await refreshTrendCacheFromSnapshot(niche.id)
      if (!quality.ok) {
        console.warn(`[Cron] No verified trend snapshot for ${niche.id}: ${quality.reason}`)
      }
    }

    // 4. Get all users with active paid plans
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*, id')
      .in('plan', ACTIVE_PAID_PLANS)

    if (usersError) throw usersError
    results.totalUsers = users?.length || 0

    // 5. For each user: Generate and save brief
    for (const user of (users || [])) {
      try {
        const nicheId = user.active_niche || 'fitness'
        const niche = NICHES[nicheId]
        
        // Load trends from cache
        const { data: trends, error: trendsError } = await supabaseAdmin
          .from('trends_cache')
          .select('data, source')
          .eq('niche', nicheId)
          .eq('week_date', weekDate)

        if (trendsError) throw trendsError

        const trendQuality = getUsableTrends(trends, {
          now: new Date(),
          allowedSources: ENABLED_TREND_SOURCES,
        })
        if (!trendQuality.ok) {
          throw new Error(`Fresh trend data unavailable (${trendQuality.reason})`)
        }

        const allTrends = trendQuality.trends
        const trendSnapshot = await trendRepository.getLatestValidSnapshot(nicheId, new Date().toISOString())
        if (!trendSnapshot) throw new Error('Fresh trend data unavailable (invalid_snapshot)')
        
        // Get user's idea history
        const { data: history } = await supabaseAdmin
          .from('idea_history')
          .select('idea_title')
          .eq('user_id', user.id)
        
        const historyTitles = history?.map((h: { idea_title: string | null }) => h.idea_title) || []

        // Generate Brief
        const ideas = await generateBrief(allTrends, historyTitles as string[], niche)

        const briefData = {
          weekDate,
          niche: nicheId,
          ideas,
          aiProvider: process.env.AI_PROVIDER || 'openai',
          aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
        }

        // Save Brief to Supabase
        const { data: brief, error: briefError } = await supabaseAdmin
          .from('briefs')
          .insert({
            user_id: user.id,
            niche: nicheId,
            week_date: weekDate,
            ideas: ideas,
            ai_provider: briefData.aiProvider,
            ai_model: briefData.aiModel,
          })
          .select('id')
          .single()

        if (briefError || !brief?.id) throw briefError ?? new Error('Failed to save brief')

        await persistBriefTrendEvidence({
          repository: trendRepository,
          teamId: user.current_team_id,
          briefId: brief.id,
          snapshot: trendSnapshot,
        })

        // TRIGGER WEBHOOK
        if (user.current_team_id) {
          await dispatchWebhookEvent({
            teamId: user.current_team_id,
            event: 'brief.ready',
            dedupeKey: `brief-ready:${user.current_team_id}:${user.id}:${weekDate}:${nicheId}`,
            payload: {
              week_date: weekDate,
              niche: nicheId,
              ideas_count: ideas.length,
            },
          })
        }

        // 6. Send email via Resend
        if (process.env.RESEND_API_KEY) {
          // Recuperiamo il nome utente se disponibile (metadata di auth o tabella profiles)
          const userName = user.full_name || 'Creator'
          await sendBrief(user.email, briefData, niche, userName)
        } else {
          console.warn(`[Cron] Skipping email for user ${user.id} - RESEND_API_KEY not configured`)
        }

        // Record history for deduplication
        await supabaseAdmin.from('idea_history').insert(
          ideas.map(i => ({
            user_id: user.id,
            niche: nicheId,
            idea_hash: Buffer.from(i.title).toString('base64'),
            idea_title: i.title,
            saved: false,
          }))
        )

        results.success++
      } catch (userErr: unknown) {
        const message = userErr instanceof Error ? userErr.message : 'Unknown user processing error'
        console.error(`[Cron] Failure for user ${user.id}:`, userErr)
        results.failures.push({ userId: user.id, error: message })
      }
    }

    return NextResponse.json(results)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown cron error'
    console.error(`[Cron] Global failure:`, err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
