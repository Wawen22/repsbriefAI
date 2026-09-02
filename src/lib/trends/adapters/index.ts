import type { NormalizedTrendSignal, TrendSource } from '../contracts'
import { adaptApifyGoogleTrends } from './apifyGoogleTrends'
import { adaptApifyReddit } from './apifyReddit'
import { adaptRss } from './rss'
import { dedupeSignals, type TrendAdapterContext } from './types'
import { adaptYoutube } from './youtube'

export type { TrendAdapterContext } from './types'

export function adapt(
  source: TrendSource,
  input: unknown,
  context: TrendAdapterContext
): NormalizedTrendSignal[] {
  const adapterBySource = {
    youtube: adaptYoutube,
    rss: adaptRss,
    reddit: adaptApifyReddit,
    'google-trends': adaptApifyGoogleTrends,
  } satisfies Record<TrendSource, (raw: unknown, adapterContext: TrendAdapterContext) => NormalizedTrendSignal[]>

  return dedupeSignals(adapterBySource[source](input, context))
}

export { adaptApifyGoogleTrends, adaptApifyReddit, adaptRss, adaptYoutube }
