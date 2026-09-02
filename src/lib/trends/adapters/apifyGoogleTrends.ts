import type { NormalizedTrendSignal } from '../contracts'
import {
  asFiniteNumber,
  asIsoDate,
  asRecords,
  asString,
  buildProvenance,
  toNormalizedSignal,
  type TrendAdapterContext,
} from './types'

function trendsUrl(query: string, geo: string): string {
  return `https://trends.google.com/trends/explore?geo=${encodeURIComponent(geo)}&q=${encodeURIComponent(query)}`
}

export function adaptApifyGoogleTrends(input: unknown, context: TrendAdapterContext): NormalizedTrendSignal[] {
  return asRecords(input).flatMap((record) => {
    const title = asString(record.query) ?? asString(record.title)
    const geo = asString(record.geo) ?? 'IT'
    const canonicalUrl = asString(record.url) ?? (title ? trendsUrl(title, geo) : undefined)
    const externalId = asString(record.id) ?? (title ? `${title}:${geo}` : undefined)
    const publishedAt = asIsoDate(record.observedAt ?? record.timestamp) ?? asIsoDate(context.observedAt)

    if (!externalId || !title || !canonicalUrl || !publishedAt) return []

    const signal = toNormalizedSignal('google-trends', {
      externalId,
      title,
      canonicalUrl,
      publishedAt,
      observedAt: context.observedAt,
      provenance: buildProvenance('apify-google-trends-task', canonicalUrl, context),
      content: `Google Trends query: ${title}`,
      score: asFiniteNumber(record.value ?? record.score),
      metadata: {
        geo,
        keyword: asString(record.keyword),
        formattedValue: asString(record.formattedValue),
      },
    })

    return signal ? [signal] : []
  })
}
