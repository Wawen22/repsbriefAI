import { describe, expect, it } from 'vitest'
import {
  createTrendRepository,
  hashTrendSignal,
  type TrendRepositoryClient,
} from '@/lib/trends/repository'

const signal = {
  source: 'youtube' as const,
  externalId: 'video-123',
  title: 'Progressive overload for beginners',
  canonicalUrl: 'https://www.youtube.com/watch?v=video-123',
  publishedAt: '2026-09-02T09:00:00.000Z',
  observedAt: '2026-09-02T10:00:00.000Z',
  provenance: { provider: 'youtube-data-api' },
  content: 'Use progressive overload safely.',
}

type Call = { table: string; method: string; values?: unknown; options?: unknown; filters: Array<[string, unknown]> }

function createFakeClient(rows: Record<string, unknown> = {}) {
  const calls: Call[] = []

  const client: TrendRepositoryClient = {
    from(table) {
      const call: Call = { table, method: '', filters: [] }
      calls.push(call)
      const result = { data: rows[table] ?? { id: `${table}-id` }, error: null }
      const terminal = { single: async () => result, maybeSingle: async () => result }
      const select = () => ({ ...terminal, eq, gt, gte, lt, order, limit, in: inFilter })
      const eq = (column: string, value: unknown) => {
        call.filters.push([column, value])
        return { ...terminal, eq, gt, gte, lt, order, limit, in: inFilter }
      }
      const gt = (column: string, value: unknown) => {
        call.filters.push([column, value])
        return { ...terminal, eq, gt, gte, lt, order, limit, in: inFilter }
      }
      const gte = (column: string, value: unknown) => {
        call.filters.push([`${column}_gte`, value])
        return { ...terminal, eq, gt, gte, lt, order, limit, in: inFilter }
      }
      const lt = (column: string, value: unknown) => {
        call.filters.push([`${column}_lt`, value])
        return { ...terminal, eq, gt, gte, lt, order, limit, in: inFilter }
      }
      const inFilter = (column: string, value: unknown) => {
        call.filters.push([column, value])
        return Promise.resolve(result)
      }
      const order = () => ({ ...terminal, eq, gt, order, limit, in: inFilter })
      const limit = () => ({ ...terminal, eq, gt, order, limit, in: inFilter })

      return {
        upsert(values: unknown, options: { onConflict: string }) {
          call.method = 'upsert'
          call.values = values
          call.options = options
          return { select }
        },
        insert(values: unknown) {
          call.method = 'insert'
          call.values = values
          return { select }
        },
        select,
      }
    },
  }

  return { client, calls }
}

describe('trend repository', () => {
  it('uses source and external id as the signal idempotency key', async () => {
    const fake = createFakeClient()
    const repository = createTrendRepository(fake.client)

    await repository.upsertSignals('fitness', [signal])

    expect(fake.calls[0]).toMatchObject({
      table: 'trend_signals',
      method: 'upsert',
      options: { onConflict: 'source,external_id' },
      values: [
        expect.objectContaining({
          source: 'youtube',
          external_id: 'video-123',
          canonical_url: signal.canonicalUrl,
        }),
      ],
    })
  })

  it('persists a stable content hash derived from a signal URL and content', async () => {
    const fake = createFakeClient()
    const repository = createTrendRepository(fake.client)

    await repository.upsertSignals('fitness', [signal])

    const values = fake.calls[0].values as Array<{ content_hash: string }>
    expect(values[0].content_hash).toBe(hashTrendSignal(signal))
    expect(values[0].content_hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('uses source, niche and provider run id to make source runs idempotent', async () => {
    const fake = createFakeClient()
    const repository = createTrendRepository(fake.client)

    await repository.recordSourceRun({
      source: 'reddit',
      niche: 'fitness',
      providerRunId: 'apify-run-1',
      status: 'running',
      attempt: 1,
      startedAt: '2026-09-02T10:00:00.000Z',
    })

    expect(fake.calls[0]).toMatchObject({
      table: 'trend_source_runs',
      method: 'upsert',
      options: { onConflict: 'source,niche,provider_run_id' },
    })
  })

  it('does not return an expired snapshot', async () => {
    const fake = createFakeClient({ trend_snapshots: null })
    const repository = createTrendRepository(fake.client)

    const snapshot = await repository.getLatestValidSnapshot('fitness', '2026-09-02T12:00:00.000Z')

    expect(snapshot).toBeNull()
    expect(fake.calls[0]).toMatchObject({
      table: 'trend_snapshots',
      filters: [
        ['niche', 'fitness'],
        ['quality', 'valid'],
        ['expires_at', '2026-09-02T12:00:00.000Z'],
      ],
    })
  })

  it('loads the persisted signals referenced by a snapshot', async () => {
    const fake = createFakeClient({
      trend_signals: [{
        id: 'signal-1', source: 'rss', external_id: 'rss-1', title: 'Fresh evidence',
        canonical_url: 'https://example.com/rss-1', published_at: '2026-09-02T10:00:00.000Z',
        observed_at: '2026-09-02T11:00:00.000Z', provenance: { provider: 'rss' },
        content: null, score: null, metadata: {},
      }],
    })
    const repository = createTrendRepository(fake.client)

    const signals = await repository.getSignals(['signal-1'])

    expect(signals).toEqual([expect.objectContaining({ id: 'signal-1', source: 'rss' })])
    expect(fake.calls[0]).toMatchObject({
      table: 'trend_signals',
      filters: [['id', ['signal-1']]],
    })
  })

  it('records each distinct verified snapshot signal as brief evidence', async () => {
    const fake = createFakeClient()
    const repository = createTrendRepository(fake.client)

    await repository.recordBriefEvidence({
      teamId: 'team-1',
      briefId: 'brief-1',
      snapshotId: 'snapshot-1',
      signalIds: ['signal-1', 'signal-2', 'signal-1'],
    })

    const evidenceWrites = fake.calls.filter((call) => call.table === 'brief_trend_evidence')
    expect(evidenceWrites).toHaveLength(2)
    expect(evidenceWrites.map((call) => call.values)).toEqual([
      {
        team_id: 'team-1',
        brief_id: 'brief-1',
        trend_snapshot_id: 'snapshot-1',
        trend_signal_id: 'signal-1',
      },
      {
        team_id: 'team-1',
        brief_id: 'brief-1',
        trend_snapshot_id: 'snapshot-1',
        trend_signal_id: 'signal-2',
      },
    ])
  })

  it('totals only known Apify run costs from the current UTC day', async () => {
    const fake = createFakeClient({
      trend_source_runs: [{ cost_usd: '1.25' }, { cost_usd: 0.75 }, { cost_usd: null }],
    })
    const repository = createTrendRepository(fake.client)

    await expect(repository.getDailyApifySpendUsd(new Date('2026-09-02T10:00:00.000Z'))).resolves.toBe(2)
    expect(fake.calls[0]).toMatchObject({
      table: 'trend_source_runs',
      filters: [
        ['started_at_gte', '2026-09-02T00:00:00.000Z'],
        ['started_at_lt', '2026-09-03T00:00:00.000Z'],
        ['source', ['reddit', 'google-trends']],
      ],
    })
  })
})
