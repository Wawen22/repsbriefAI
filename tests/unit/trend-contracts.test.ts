import { normalizedTrendSignalSchema } from '@/lib/trends/contracts'
import { TREND_SOURCE_CONFIG } from '@/config/niches'

const validSignal = {
  source: 'youtube',
  externalId: 'video-123',
  title: 'Progressive overload for beginners',
  canonicalUrl: 'https://www.youtube.com/watch?v=video-123',
  publishedAt: '2026-09-02T09:00:00.000Z',
  observedAt: '2026-09-02T10:00:00.000Z',
  provenance: {
    provider: 'youtube-data-api',
    sourceUrl: 'https://www.youtube.com/watch?v=video-123',
    observedAt: '2026-09-02T10:00:00.000Z',
    adapterVersion: '1',
  },
}

describe('normalized trend signal contract', () => {
  it('accepts a complete signal from an allowed source with an HTTPS URL', () => {
    expect(normalizedTrendSignalSchema.safeParse(validSignal).success).toBe(true)
  })

  it('rejects a signal when a required field is missing', () => {
    const { title: _title, ...withoutTitle } = validSignal

    expect(normalizedTrendSignalSchema.safeParse(withoutTitle).success).toBe(false)
  })

  it('rejects a signal from an unsupported source', () => {
    expect(
      normalizedTrendSignalSchema.safeParse({ ...validSignal, source: 'tiktok' }).success
    ).toBe(false)
  })

  it('rejects a signal whose canonical URL is not HTTPS', () => {
    expect(
      normalizedTrendSignalSchema.safeParse({
        ...validSignal,
        canonicalUrl: 'http://www.youtube.com/watch?v=video-123',
      }).success
    ).toBe(false)
  })
})

describe('trend source configuration', () => {
  it('keeps Apify-backed sources disabled for the fitness niche by default', () => {
    expect(TREND_SOURCE_CONFIG.reddit.niches.fitness.enabled).toBe(false)
    expect(TREND_SOURCE_CONFIG['google-trends'].niches.fitness.enabled).toBe(false)
  })
})
