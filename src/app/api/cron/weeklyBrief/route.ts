// src/app/api/cron/weeklyBrief/route.ts

import { NextResponse } from 'next/server'
import { NICHES } from '@/config/niches'
import { scrapeNiche } from '../../scraper'
import { generateBrief } from '../../generator/briefGenerator'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
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
    failures: [] as any[],
  }

  try {
    // 2. Get active niches
    const activeNiches = Object.values(NICHES).filter(n => n.active)
    results.totalNiches = activeNiches.length

    // 3. For each niche: scrape → cache
    for (const niche of activeNiches) {
      await scrapeNiche(niche)
    }

    // 4. Get all users with active subscriptions
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .not('plan', 'eq', 'free') // Simplified filter — update later for actual subscription status

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
          .select('data')
          .eq('niche', nicheId)
          .eq('week_date', weekDate)

        if (trendsError) throw trendsError

        const allTrends = trends?.flatMap(t => t.data) || []
        
        // Get user's idea history
        const { data: history } = await supabaseAdmin
          .from('idea_history')
          .select('idea_title')
          .eq('user_id', user.id)
        
        const historyTitles = history?.map(h => h.idea_title) || []

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
        const { error: briefError } = await supabaseAdmin
          .from('briefs')
          .insert({
            user_id: user.id,
            niche: nicheId,
            week_date: weekDate,
            ideas: ideas,
            ai_provider: briefData.aiProvider,
            ai_model: briefData.aiModel,
          })

        if (briefError) throw briefError

        // 6. Send email via Resend
        const { sendBrief } = require('../../email/sendBrief')
        await sendBrief(user.email, briefData, niche)

        // Record history
        await supabaseAdmin.from('idea_history').insert(
          ideas.map(i => ({
            user_id: user.id,
            niche: nicheId,
            idea_hash: Buffer.from(i.title).toString('base64'),
            idea_title: i.title,
          }))
        )

        results.success++
      } catch (userErr: any) {
        console.error(`[Cron] Failure for user ${user.id}:`, userErr)
        results.failures.push({ userId: user.id, error: userErr.message })
      }
    }

    return NextResponse.json(results)
  } catch (err: any) {
    console.error(`[Cron] Global failure:`, err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
