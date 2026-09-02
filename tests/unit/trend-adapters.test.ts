import { adapt, type TrendAdapterContext } from '@/lib/trends/adapters'

const context: TrendAdapterContext = {
  observedAt: '2026-09-02T10:00:00.000Z',
  providerRunId: 'run_public_123',
}

describe('trend adapters', () => {
  it('normalizes valid YouTube items and discards duplicate, HTTP, and invalid-timestamp items', () => {
    const signals = adapt(
      'youtube',
      [
        {
          id: 'video-123',
          title: 'Progressive overload explained',
          url: 'https://www.youtube.com/watch?v=video-123',
          description: 'A practical guide.',
          publishedAt: '2026-09-02T08:00:00.000Z',
          viewCount: 1200,
          channelTitle: 'Lift Lab',
        },
        {
          id: 'video-123',
          title: 'Duplicate video',
          url: 'https://www.youtube.com/watch?v=video-123',
          publishedAt: '2026-09-02T08:00:00.000Z',
        },
        {
          id: 'http-video',
          title: 'Unsafe URL',
          url: 'http://www.youtube.com/watch?v=http-video',
          publishedAt: '2026-09-02T08:00:00.000Z',
        },
        {
          id: 'invalid-time',
          title: 'Broken timestamp',
          url: 'https://www.youtube.com/watch?v=invalid-time',
          publishedAt: 'not-a-date',
        },
      ],
      context
    )

    expect(signals).toEqual([
      expect.objectContaining({
        source: 'youtube',
        externalId: 'video-123',
        title: 'Progressive overload explained',
        canonicalUrl: 'https://www.youtube.com/watch?v=video-123',
        publishedAt: '2026-09-02T08:00:00.000Z',
        observedAt: context.observedAt,
        score: 1200,
        provenance: {
          provider: 'youtube-data-api',
          providerRunId: 'run_public_123',
          sourceUrl: 'https://www.youtube.com/watch?v=video-123',
          observedAt: context.observedAt,
          adapterVersion: '1',
        },
      }),
    ])
  })

  it('normalizes RSS feed entries with feed provenance', () => {
    const signals = adapt(
      'rss',
      {
        feedUrl: 'https://examine.com/feed/',
        feedTitle: 'Examine',
        items: [
          {
            guid: 'rss-123',
            title: 'New protein research',
            link: 'https://examine.com/articles/protein-research/',
            contentSnippet: 'A short evidence-based summary.',
            isoDate: '2026-09-01T08:00:00.000Z',
            author: 'Examine team',
          },
        ],
      },
      context
    )

    expect(signals).toEqual([
      expect.objectContaining({
        source: 'rss',
        externalId: 'rss-123',
        title: 'New protein research',
        canonicalUrl: 'https://examine.com/articles/protein-research/',
        publishedAt: '2026-09-01T08:00:00.000Z',
        provenance: expect.objectContaining({
          provider: 'rss',
          feedUrl: 'https://examine.com/feed/',
          sourceUrl: 'https://examine.com/articles/protein-research/',
        }),
      }),
    ])
  })

  it('normalizes valid Apify Reddit records and discards malformed output', () => {
    const signals = adapt(
      'reddit',
      [
        {
          id: 'abc123',
          title: 'How do I improve my squat?',
          permalink: '/r/Fitness/comments/abc123/how_do_i_improve_my_squat/',
          selftext: 'I have plateaued for three months.',
          created_utc: 1788336000,
          ups: 842,
          subreddit: 'Fitness',
        },
        { id: 'missing-required-fields' },
      ],
      context
    )

    expect(signals).toEqual([
      expect.objectContaining({
        source: 'reddit',
        externalId: 'abc123',
        canonicalUrl: 'https://www.reddit.com/r/Fitness/comments/abc123/how_do_i_improve_my_squat/',
        publishedAt: '2026-09-02T08:00:00.000Z',
        score: 842,
        provenance: expect.objectContaining({
          provider: 'apify-reddit-task',
          providerRunId: 'run_public_123',
        }),
      }),
    ])
  })

  it('normalizes Google Trends records without exposing private Apify data', () => {
    const signals = adapt(
      'google-trends',
      [
        {
          query: 'creatine for women',
          value: 320,
          geo: 'IT',
          observedAt: '2026-09-02T09:00:00.000Z',
          keyword: 'creatine',
        },
        { query: '', value: 10 },
      ],
      context
    )

    expect(signals).toEqual([
      expect.objectContaining({
        source: 'google-trends',
        externalId: 'creatine for women:IT',
        title: 'creatine for women',
        canonicalUrl: 'https://trends.google.com/trends/explore?geo=IT&q=creatine%20for%20women',
        publishedAt: '2026-09-02T09:00:00.000Z',
        provenance: expect.objectContaining({
          provider: 'apify-google-trends-task',
          providerRunId: 'run_public_123',
          adapterVersion: '1',
        }),
      }),
    ])

    expect(JSON.stringify(signals)).not.toContain('APIFY_TOKEN')
  })
})
