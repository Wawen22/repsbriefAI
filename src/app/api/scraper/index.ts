// Trend cache materialization is deliberately cache-only. Network ingestion is
// owned by the asynchronous trend worker; request handlers must never scrape.

import { ENABLED_TREND_SOURCES } from '@/config/niches'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { TrendQualityResult } from '@/lib/trends/quality'
import { getTrendRepository } from '@/lib/trends/repository'
import { materializeSnapshotCache } from '@/lib/trends/snapshots'

export async function refreshTrendCacheFromSnapshot(
  niche: string,
  now = new Date()
): Promise<TrendQualityResult> {
  const repository = await getTrendRepository()
  const snapshot = await repository.getLatestValidSnapshot(niche, now.toISOString())
  if (!snapshot) return { ok: false, reason: 'invalid_snapshot' }

  const signals = await repository.getSignals(snapshot.signalIds)
  const supabaseAdmin = getSupabaseAdmin('api/scraper/index')
  const weekDate = now.toISOString().split('T')[0]

  return materializeSnapshotCache({
    snapshot,
    signals,
    now,
    weekDate,
    allowedSources: ENABLED_TREND_SOURCES,
    writeCache: async ({ source, niche: snapshotNiche, weekDate: snapshotWeekDate, data }) => {
      const { error } = await supabaseAdmin
        .from('trends_cache')
        .upsert({ source, niche: snapshotNiche, week_date: snapshotWeekDate, data }, {
          onConflict: 'source, niche, week_date',
        })
      if (error) throw new Error('Trend cache materialization failed')
    },
  })
}
