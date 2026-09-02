import type { TrendSnapshot } from '@/lib/trends/contracts'
import { materializeSnapshotCache } from '@/lib/trends/snapshots'

const NOW = new Date('2026-09-02T12:00:00.000Z')

function signal(source: 'rss' | 'youtube', index: number) {
  return {
    id: `${source}-signal-${index}`,
    source,
    externalId: `${source}-${index}`,
    title: `${source} signal ${index}`,
    canonicalUrl: `https://example.com/${source}/${index}`,
    publishedAt: '2026-09-01T12:00:00.000Z',
    observedAt: '2026-09-02T11:00:00.000Z',
    provenance: { source: 'fixture' },
  }
}

const validSnapshot: TrendSnapshot = {
  niche: 'fitness',
  asOf: '2026-09-02T11:00:00.000Z',
  signalIds: [
    ...Array.from({ length: 6 }, (_, index) => `rss-signal-${index}`),
    ...Array.from({ length: 6 }, (_, index) => `youtube-signal-${index}`),
  ],
  sourceSummary: { rss: 6, youtube: 6 },
  quality: 'valid',
  expiresAt: '2026-09-16T11:00:00.000Z',
}

describe('materializeSnapshotCache', () => {
  it('writes cache rows only after a verified snapshot passes the quality gate', async () => {
    const writes: Array<{ source: string; niche: string; weekDate: string; data: unknown[] }> = []

    const result = await materializeSnapshotCache({
      snapshot: validSnapshot,
      signals: [
        ...Array.from({ length: 6 }, (_, index) => signal('rss', index)),
        ...Array.from({ length: 6 }, (_, index) => signal('youtube', index)),
      ],
      now: NOW,
      weekDate: '2026-09-02',
      allowedSources: ['rss', 'youtube'],
      writeCache: async (row) => { writes.push(row) },
    })

    expect(result).toMatchObject({ ok: true, sources: ['rss', 'youtube'] })
    expect(writes).toHaveLength(2)
    expect(writes.map((write) => write.source)).toEqual(['rss', 'youtube'])
    expect(writes.every((write) => write.data.length === 6)).toBe(true)
  })

  it('does not write cache rows from an expired snapshot', async () => {
    const writeCache = vi.fn()

    const result = await materializeSnapshotCache({
      snapshot: { ...validSnapshot, expiresAt: '2026-09-02T11:59:59.000Z' },
      signals: [],
      now: NOW,
      weekDate: '2026-09-02',
      allowedSources: ['rss', 'youtube'],
      writeCache,
    })

    expect(result).toEqual({ ok: false, reason: 'invalid_snapshot' })
    expect(writeCache).not.toHaveBeenCalled()
  })

  it('does not write cache rows from a snapshot older than fourteen days', async () => {
    const writeCache = vi.fn()

    const result = await materializeSnapshotCache({
      snapshot: {
        ...validSnapshot,
        asOf: '2026-08-19T11:00:00.000Z',
        expiresAt: '2026-09-16T11:00:00.000Z',
      },
      signals: [],
      now: NOW,
      weekDate: '2026-09-02',
      allowedSources: ['rss', 'youtube'],
      writeCache,
    })

    expect(result).toEqual({ ok: false, reason: 'invalid_snapshot' })
    expect(writeCache).not.toHaveBeenCalled()
  })
})
