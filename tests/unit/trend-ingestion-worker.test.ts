import { describe, expect, it } from 'vitest'

import {
  buildTrendIngestionJobs,
  calculateTrendRetryDelayMs,
  executeTrendIngestionJob,
  isTerminalIngestionFailure,
  pollApifyDataset,
  shouldOpenTrendCircuit,
  startApifyTask,
  verifyApifyWebhookSignature,
} from '@/lib/trends/ingestionWorker'

describe('trend ingestion worker', () => {
  it('schedules one idempotent job per enabled source and active niche in the UTC hour', () => {
    const jobs = buildTrendIngestionJobs({
      now: new Date('2026-09-02T10:37:12.000Z'),
      niches: [
        { id: 'fitness', active: true },
        { id: 'finance', active: false },
      ],
      sourceConfig: {
        youtube: { enabled: true, niches: { fitness: { enabled: true } } },
        rss: { enabled: true, niches: { fitness: { enabled: true } } },
        reddit: { enabled: false, niches: { fitness: { enabled: false } } },
        'google-trends': { enabled: false, niches: { fitness: { enabled: false } } },
      },
    })

    expect(jobs).toEqual([
      { source: 'youtube', niche: 'fitness', dedupeKey: 'trend-ingest:youtube:fitness:2026-09-02T10' },
      { source: 'rss', niche: 'fitness', dedupeKey: 'trend-ingest:rss:fitness:2026-09-02T10' },
    ])
  })

  it('uses 5, 15, and 45 minute retry delays before subsequent attempts', () => {
    expect(calculateTrendRetryDelayMs(1)).toBe(5 * 60_000)
    expect(calculateTrendRetryDelayMs(2)).toBe(15 * 60_000)
    expect(calculateTrendRetryDelayMs(3)).toBe(45 * 60_000)
    expect(calculateTrendRetryDelayMs(4)).toBe(45 * 60_000)
  })

  it('dead-letters authorization and schema failures instead of retrying them', () => {
    expect(isTerminalIngestionFailure(new Error('HTTP 401 unauthorized'))).toBe(true)
    expect(isTerminalIngestionFailure(new Error('HTTP 403 forbidden'))).toBe(true)
    expect(isTerminalIngestionFailure(new Error('Invalid Apify dataset schema'))).toBe(true)
    expect(isTerminalIngestionFailure(new Error('HTTP 429 rate limited'))).toBe(false)
  })

  it('opens a source circuit after three failures in the preceding 24 hours', () => {
    const now = new Date('2026-09-02T12:00:00.000Z')
    expect(
      shouldOpenTrendCircuit([
        '2026-09-02T11:59:00.000Z',
        '2026-09-02T06:00:00.000Z',
        '2026-09-01T12:01:00.000Z',
      ], now)
    ).toBe(true)
    expect(
      shouldOpenTrendCircuit([
        '2026-09-02T11:59:00.000Z',
        '2026-09-02T06:00:00.000Z',
        '2026-09-01T11:59:00.000Z',
      ], now)
    ).toBe(false)
  })

  it('accepts only a constant-time valid Apify webhook signature', () => {
    const body = '{"resource":{"id":"run_123"}}'
    const secret = 'test-webhook-secret'
    const signature = 'fba404562e22f5962ca7f829b5a50d3cee7e2a41900e15a11808d83b28ca34af'

    expect(verifyApifyWebhookSignature(body, signature, secret)).toBe(true)
    expect(verifyApifyWebhookSignature(body, `${signature}0`, secret)).toBe(false)
    expect(verifyApifyWebhookSignature(body, signature, 'wrong-secret')).toBe(false)
  })

  it('starts an Apify task asynchronously and polls its dataset only through server credentials', async () => {
    const requests: Request[] = []
    const fetchImpl: typeof fetch = async (input, init) => {
      requests.push(new Request(input, init))
      if (requests.length === 1) return new Response(JSON.stringify({ data: { id: 'run_public_123' } }))
      return new Response(JSON.stringify([{ id: 'item-1' }]))
    }

    await expect(startApifyTask({
      taskId: 'task_123',
      token: 'test-token',
      input: { keyword: 'creatine' },
      fetchImpl,
    })).resolves.toEqual({ id: 'run_public_123' })
    await expect(pollApifyDataset({ datasetId: 'dataset_123', token: 'test-token', fetchImpl }))
      .resolves.toEqual([{ id: 'item-1' }])

    expect(requests.map((request) => request.url)).toEqual([
      'https://api.apify.com/v2/actor-tasks/task_123/runs',
      'https://api.apify.com/v2/datasets/dataset_123/items',
    ])
    expect(requests.every((request) => request.headers.get('authorization') === 'Bearer test-token')).toBe(true)
  })

  it('records a terminal ingestion failure as a dead letter without retrying', async () => {
    const recorded: Array<Record<string, unknown>> = []

    const result = await executeTrendIngestionJob(
      { source: 'reddit', niche: 'fitness', dedupeKey: 'trend-ingest:reddit:fitness:2026-09-02T10' },
      {
        now: new Date('2026-09-02T10:00:00.000Z'),
        recentFailures: [],
        apifyDailyBudgetUsd: 5,
        getDailyApifySpendUsd: async () => 0,
        recordRun: async (run) => { recorded.push(run); return 'run-row-1' },
        ingest: async () => { throw new Error('HTTP 401 unauthorized') },
      }
    )

    expect(result).toEqual({ status: 'dead-letter' })
    expect(recorded.at(-1)).toMatchObject({ status: 'dead-letter', errorCode: 'terminal_failure' })
  })

  it('does not start an Apify ingestion when known daily spend has reached its budget', async () => {
    const recorded: Array<Record<string, unknown>> = []
    let ingestions = 0

    const result = await executeTrendIngestionJob(
      { source: 'reddit', niche: 'fitness', dedupeKey: 'trend-ingest:reddit:fitness:2026-09-02T10' },
      {
        now: new Date('2026-09-02T10:00:00.000Z'),
        recentFailures: [],
        apifyDailyBudgetUsd: 5,
        getDailyApifySpendUsd: async () => 5,
        recordRun: async (run) => { recorded.push(run); return 'run-row-1' },
        ingest: async () => { ingestions += 1; return { costUsd: 0.5 } },
      }
    )

    expect(result).toEqual({ status: 'dead-letter' })
    expect(ingestions).toBe(0)
    expect(recorded).toEqual([expect.objectContaining({
      status: 'dead-letter',
      errorCode: 'budget_exceeded',
    })])
  })
})
