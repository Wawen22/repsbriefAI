import { getUsableTrends } from '@/lib/trends/quality'

const NOW = new Date('2026-08-30T10:00:00.000Z')
const QUALITY_OPTIONS = {
  now: NOW,
  allowedSources: ['rss', 'youtube'] as const,
}

describe('getUsableTrends', () => {
  it('accepts and normalizes fresh RSS and YouTube trends', () => {
    const result = getUsableTrends(
      [
        {
          source: 'rss',
          data: [
            {
              id: ' rss-1 ',
              source: 'rss',
              title: '  Evidence-based hypertrophy update  ',
              url: ' https://example.com/hypertrophy ',
              timestamp: '2026-08-29T08:00:00.000Z',
            },
          ],
        },
        {
          source: 'youtube',
          data: [
            {
              id: 'video-1',
              source: 'youtube',
              title: 'New strength-training study',
              content: '  A useful summary  ',
              score: 12500,
              timestamp: '2026-08-28T12:00:00.000Z',
            },
          ],
        },
      ],
      QUALITY_OPTIONS
    )

    expect(result).toEqual({
      ok: true,
      trends: [
        {
          id: 'rss-1',
          source: 'rss',
          title: 'Evidence-based hypertrophy update',
          url: 'https://example.com/hypertrophy',
          timestamp: '2026-08-29T08:00:00.000Z',
        },
        {
          id: 'video-1',
          source: 'youtube',
          title: 'New strength-training study',
          content: 'A useful summary',
          score: 12500,
          timestamp: '2026-08-28T12:00:00.000Z',
        },
      ],
      sources: ['rss', 'youtube'],
    })
  })

  it('rejects empty trend input', () => {
    expect(getUsableTrends([], QUALITY_OPTIONS)).toEqual({
      ok: false,
      reason: 'empty_input',
    })
  })

  it('rejects input when every otherwise-valid trend is stale', () => {
    const result = getUsableTrends(
      [
        {
          source: 'rss',
          data: [
            {
              id: 'old-rss-item',
              source: 'rss',
              title: 'Old training article',
              timestamp: '2026-08-15T09:59:59.000Z',
            },
          ],
        },
      ],
      QUALITY_OPTIONS
    )

    expect(result).toEqual({ ok: false, reason: 'stale_trends' })
  })

  it('rejects malformed trend input', () => {
    const result = getUsableTrends(
      [
        {
          source: 'youtube',
          data: [
            {
              id: 'video-without-title',
              source: 'youtube',
              timestamp: 'not-a-date',
            },
          ],
        },
      ],
      QUALITY_OPTIONS
    )

    expect(result).toEqual({ ok: false, reason: 'malformed_trends' })
  })

  it('rejects input when every configured source reports a failure', () => {
    const result = getUsableTrends(
      [
        { source: 'rss', error: 'feed unavailable' },
        { source: 'youtube', error: 'quota exhausted' },
      ],
      QUALITY_OPTIONS
    )

    expect(result).toEqual({ ok: false, reason: 'all_sources_failed' })
  })
})
