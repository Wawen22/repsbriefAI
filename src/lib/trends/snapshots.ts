import type { TrendItem } from '@/types/niche'

import type { NormalizedTrendSignal, TrendSnapshot } from './contracts'
import { getUsableTrends, type TrendQualityResult } from './quality'

const MAX_SNAPSHOT_AGE_MS = 14 * 24 * 60 * 60 * 1000

export type SnapshotSignal = NormalizedTrendSignal & { id: string }

export type TrendCacheWrite = {
  source: TrendItem['source']
  niche: string
  weekDate: string
  data: TrendItem[]
}

function toTrendItem(signal: SnapshotSignal): TrendItem {
  return {
    id: signal.externalId,
    source: signal.source,
    title: signal.title,
    url: signal.canonicalUrl,
    content: signal.content,
    score: signal.score,
    timestamp: signal.publishedAt,
    metadata: signal.metadata,
  }
}

export async function materializeSnapshotCache({
  snapshot,
  signals,
  now,
  weekDate,
  allowedSources,
  writeCache,
}: {
  snapshot: TrendSnapshot
  signals: SnapshotSignal[]
  now: Date
  weekDate: string
  allowedSources: readonly TrendItem['source'][]
  writeCache: (row: TrendCacheWrite) => Promise<void>
}): Promise<TrendQualityResult> {
  const asOf = Date.parse(snapshot.asOf)
  if (
    snapshot.quality !== 'valid' ||
    !Number.isFinite(asOf) ||
    Date.parse(snapshot.expiresAt) <= now.getTime() ||
    asOf < now.getTime() - MAX_SNAPSHOT_AGE_MS
  ) {
    return { ok: false, reason: 'invalid_snapshot' }
  }

  const signalIds = new Set(snapshot.signalIds)
  const rowsBySource = new Map<TrendItem['source'], TrendItem[]>()
  for (const signal of signals) {
    if (!signalIds.has(signal.id)) continue
    const row = rowsBySource.get(signal.source) ?? []
    row.push(toTrendItem(signal))
    rowsBySource.set(signal.source, row)
  }

  const quality = getUsableTrends(
    [...rowsBySource.entries()].map(([source, data]) => ({ source, data })),
    { now, allowedSources }
  )
  if (!quality.ok) return quality

  await Promise.all([...rowsBySource.entries()].map(([source, data]) => writeCache({
    source,
    niche: snapshot.niche,
    weekDate,
    data,
  })))

  return quality
}
