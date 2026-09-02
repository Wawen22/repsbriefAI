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

export function adaptYoutube(input: unknown, context: TrendAdapterContext): NormalizedTrendSignal[] {
  return asRecords(input).flatMap((record) => {
    const externalId = asString(record.id) ?? asString(record.videoId)
    const title = asString(record.title)
    const canonicalUrl = record.url === undefined
      ? externalId ? `https://www.youtube.com/watch?v=${encodeURIComponent(externalId)}` : undefined
      : asString(record.url)
    const publishedAt = asIsoDate(record.publishedAt ?? record.timestamp)

    if (!externalId || !title || !canonicalUrl || !publishedAt) return []

    const signal = toNormalizedSignal('youtube', {
      externalId,
      title,
      canonicalUrl,
      publishedAt,
      observedAt: context.observedAt,
      provenance: buildProvenance('youtube-data-api', canonicalUrl, context),
      content: asString(record.description) ?? asString(record.content),
      score: asFiniteNumber(record.viewCount ?? record.score),
      metadata: {
        channelTitle: asString(record.channelTitle),
      },
    })

    return signal ? [signal] : []
  })
}
