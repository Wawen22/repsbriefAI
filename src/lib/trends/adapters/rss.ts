import type { NormalizedTrendSignal } from '../contracts'
import {
  asIsoDate,
  asRecords,
  asString,
  buildProvenance,
  toNormalizedSignal,
  type TrendAdapterContext,
} from './types'

function toFeedInput(input: unknown): { feedUrl?: string; feedTitle?: string; items: Record<string, unknown>[] } {
  if (Array.isArray(input)) return { items: asRecords(input) }
  if (!input || typeof input !== 'object') return { items: [] }

  const record = input as Record<string, unknown>
  return {
    feedUrl: asString(record.feedUrl),
    feedTitle: asString(record.feedTitle),
    items: asRecords(record.items),
  }
}

export function adaptRss(input: unknown, context: TrendAdapterContext): NormalizedTrendSignal[] {
  const { feedUrl, feedTitle, items } = toFeedInput(input)

  return items.flatMap((record) => {
    const canonicalUrl = asString(record.link) ?? asString(record.url)
    const externalId = asString(record.guid) ?? asString(record.id) ?? canonicalUrl
    const title = asString(record.title)
    const publishedAt = asIsoDate(record.isoDate ?? record.pubDate ?? record.timestamp)

    if (!externalId || !title || !canonicalUrl || !publishedAt) return []

    const signal = toNormalizedSignal('rss', {
      externalId,
      title,
      canonicalUrl,
      publishedAt,
      observedAt: context.observedAt,
      provenance: buildProvenance('rss', canonicalUrl, context, { feedUrl }),
      content: asString(record.contentSnippet) ?? asString(record.content),
      metadata: {
        author: asString(record.author) ?? asString(record.creator),
        feedTitle,
      },
    })

    return signal ? [signal] : []
  })
}
