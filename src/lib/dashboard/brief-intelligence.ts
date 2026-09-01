import type { IdeaObject } from '@/types/niche'

const sourceLabels: Record<NonNullable<IdeaObject['sources']>[number], string> = {
  reddit: 'Reddit',
  youtube: 'YouTube',
  'google-trends': 'Google Trends',
  rss: 'RSS',
}

export function getBriefIntelligence(ideas: IdeaObject[]) {
  const sources = new Set<IdeaObject['sources'] extends (infer Source)[] | undefined ? Source : never>()
  const formats = new Map<string, number>()

  for (const idea of ideas) {
    idea.sources?.forEach((source) => sources.add(source))
    formats.set(idea.format, (formats.get(idea.format) || 0) + 1)
  }

  const topFormat = [...formats.entries()].sort(([, left], [, right]) => right - left)[0]?.[0]

  return {
    sourceLabels: [...sources].map((source) => sourceLabels[source]),
    topFormat,
    formatCounts: Object.fromEntries(formats),
  }
}
