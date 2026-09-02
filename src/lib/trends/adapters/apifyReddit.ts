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

function redditUrl(record: Record<string, unknown>): string | undefined {
  const url = asString(record.url)
  if (url) return url

  const permalink = asString(record.permalink)
  if (!permalink) return undefined
  return permalink.startsWith('/') ? `https://www.reddit.com${permalink}` : permalink
}

export function adaptApifyReddit(input: unknown, context: TrendAdapterContext): NormalizedTrendSignal[] {
  return asRecords(input).flatMap((record) => {
    const externalId = asString(record.id) ?? asString(record.postId)
    const title = asString(record.title)
    const canonicalUrl = redditUrl(record)
    const publishedAt = asIsoDate(record.createdAt ?? record.created_at ?? record.created_utc)

    if (!externalId || !title || !canonicalUrl || !publishedAt) return []

    const signal = toNormalizedSignal('reddit', {
      externalId,
      title,
      canonicalUrl,
      publishedAt,
      observedAt: context.observedAt,
      provenance: buildProvenance('apify-reddit-task', canonicalUrl, context),
      content: asString(record.selftext) ?? asString(record.body),
      score: asFiniteNumber(record.ups ?? record.score ?? record.upvotes),
      metadata: {
        subreddit: asString(record.subreddit),
        commentCount: asFiniteNumber(record.num_comments ?? record.commentCount),
        flair: asString(record.link_flair_text ?? record.flair),
      },
    })

    return signal ? [signal] : []
  })
}
