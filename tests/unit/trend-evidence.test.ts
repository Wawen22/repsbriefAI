import { describe, expect, it } from 'vitest'
import type { PersistedTrendSnapshot } from '@/lib/trends/repository'
import { persistBriefTrendEvidence } from '@/lib/trends/evidence'

const snapshot: PersistedTrendSnapshot = {
  id: 'snapshot-1',
  niche: 'fitness',
  asOf: '2026-09-02T11:00:00.000Z',
  signalIds: ['signal-1', 'signal-2'],
  sourceSummary: { rss: 2 },
  quality: 'valid',
  expiresAt: '2026-09-16T11:00:00.000Z',
}

describe('persistBriefTrendEvidence', () => {
  it('links a saved team brief to every signal in its verified snapshot', async () => {
    const writes: unknown[] = []
    const persisted = await persistBriefTrendEvidence({
      repository: {
        recordBriefEvidence: async (evidence) => { writes.push(evidence) },
      },
      teamId: 'team-1',
      briefId: 'brief-1',
      snapshot,
    })

    expect(persisted).toBe(true)
    expect(writes).toEqual([{
      teamId: 'team-1',
      briefId: 'brief-1',
      snapshotId: 'snapshot-1',
      signalIds: ['signal-1', 'signal-2'],
    }])
  })

  it('does not create partial provenance for a brief without a team', async () => {
    const writes: unknown[] = []
    const persisted = await persistBriefTrendEvidence({
      repository: {
        recordBriefEvidence: async (evidence) => { writes.push(evidence) },
      },
      teamId: null,
      briefId: 'brief-1',
      snapshot,
    })

    expect(persisted).toBe(false)
    expect(writes).toEqual([])
  })
})
