import type { TrendItem } from '@/types/niche'

export type TrendQualityFailureReason =
  | 'empty_input'
  | 'all_sources_failed'
  | 'malformed_trends'
  | 'stale_trends'
  | 'insufficient_trends'
  | 'insufficient_sources'
  | 'missing_native_source'
  | 'invalid_snapshot'

export type TrendQualityResult =
  | { ok: true; trends: TrendItem[]; sources: TrendItem['source'][] }
  | { ok: false; reason: TrendQualityFailureReason }

interface TrendQualityOptions {
  now: Date
  allowedSources: readonly TrendItem['source'][]
  maxAgeMs?: number
  minimumSignalCount?: number
  minimumSourceCount?: number
  nativeSources?: readonly TrendItem['source'][]
}

const DEFAULT_MAX_AGE_MS = 72 * 60 * 60 * 1000
const DEFAULT_MINIMUM_SIGNAL_COUNT = 12
const DEFAULT_MINIMUM_SOURCE_COUNT = 2
const DEFAULT_NATIVE_SOURCES = ['youtube', 'rss'] as const satisfies readonly TrendItem['source'][]
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized || undefined
}

export function getUsableTrends(
  input: unknown,
  options: TrendQualityOptions
): TrendQualityResult {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, reason: 'empty_input' }
  }

  const allowedSources = new Set<TrendItem['source']>(options.allowedSources)
  const configuredRows = input.filter(
    (row): row is Record<string, unknown> =>
      isRecord(row) && allowedSources.has(row.source as TrendItem['source'])
  )

  if (configuredRows.length === 0) {
    return { ok: false, reason: 'empty_input' }
  }

  const allSourcesFailed = configuredRows.every(
    (row) => row.error !== undefined && !Array.isArray(row.data)
  )
  if (allSourcesFailed) {
    return { ok: false, reason: 'all_sources_failed' }
  }

  const nowMs = options.now.getTime()
  const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS
  const trends: TrendItem[] = []
  const sources = new Set<TrendItem['source']>()
  const seenTrends = new Set<string>()
  let sawMalformedTrend = false
  let sawStaleTrend = false

  for (const row of configuredRows) {
    if (!Array.isArray(row.data)) {
      if (row.error === undefined) sawMalformedTrend = true
      continue
    }

    const rowSource = row.source as TrendItem['source']

    for (const candidate of row.data) {
      if (!isRecord(candidate)) {
        sawMalformedTrend = true
        continue
      }

      const id = normalizeOptionalText(candidate.id)
      const title = normalizeOptionalText(candidate.title)
      const timestamp = normalizeOptionalText(candidate.timestamp)
      const timestampMs = timestamp ? Date.parse(timestamp) : Number.NaN

      if (
        !id ||
        !title ||
        candidate.source !== rowSource ||
        !Number.isFinite(timestampMs) ||
        timestampMs > nowMs + MAX_FUTURE_SKEW_MS
      ) {
        sawMalformedTrend = true
        continue
      }

      if (timestampMs < nowMs - maxAgeMs) {
        sawStaleTrend = true
        continue
      }

      const dedupeKey = `${rowSource}:${id}`
      if (seenTrends.has(dedupeKey)) continue
      seenTrends.add(dedupeKey)

      const trend: TrendItem = {
        id,
        source: rowSource,
        title,
        timestamp: new Date(timestampMs).toISOString(),
      }
      const url = normalizeOptionalText(candidate.url)
      const content = normalizeOptionalText(candidate.content)

      if (url) trend.url = url
      if (content) trend.content = content
      if (typeof candidate.score === 'number' && Number.isFinite(candidate.score)) {
        trend.score = candidate.score
      }
      if (isRecord(candidate.metadata)) trend.metadata = candidate.metadata

      trends.push(trend)
      sources.add(rowSource)
    }
  }

  if (trends.length > 0) {
    const uniqueSources = [...sources]
    const minimumSignalCount = options.minimumSignalCount ?? DEFAULT_MINIMUM_SIGNAL_COUNT
    const minimumSourceCount = options.minimumSourceCount ?? DEFAULT_MINIMUM_SOURCE_COUNT
    const nativeSources = new Set(options.nativeSources ?? DEFAULT_NATIVE_SOURCES)

    if (trends.length < minimumSignalCount) {
      return { ok: false, reason: 'insufficient_trends' }
    }
    if (uniqueSources.length < minimumSourceCount) {
      return { ok: false, reason: 'insufficient_sources' }
    }
    if (!uniqueSources.some((source) => nativeSources.has(source))) {
      return { ok: false, reason: 'missing_native_source' }
    }

    return { ok: true, trends, sources: uniqueSources }
  }
  if (sawMalformedTrend) {
    return { ok: false, reason: 'malformed_trends' }
  }
  if (sawStaleTrend) {
    return { ok: false, reason: 'stale_trends' }
  }
  return { ok: false, reason: 'empty_input' }
}
