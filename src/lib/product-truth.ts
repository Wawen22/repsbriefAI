import { ENABLED_TREND_SOURCES } from '@/config/niches'
import type { TrendItem } from '@/types/niche'

const SOURCE_LABELS: Record<TrendItem['source'], string> = {
  reddit: 'Reddit',
  youtube: 'YouTube',
  'google-trends': 'Google Trends',
  rss: 'RSS feeds',
}

export function isActiveSource(source: TrendItem['source']): boolean {
  return (ENABLED_TREND_SOURCES as readonly TrendItem['source'][]).includes(source)
}

export function activeSourceLabels(): string[] {
  return ENABLED_TREND_SOURCES.map((source) => SOURCE_LABELS[source])
}

export const ACTIVE_SOURCE_COPY = 'fresh YouTube and RSS signals'
