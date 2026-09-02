import { createHmac, timingSafeEqual } from 'node:crypto'

import { NICHES, TREND_SOURCE_CONFIG } from '@/config/niches'
import type { TrendSource, TrendSourceRun } from './contracts'

const RETRY_DELAYS_MS = [5 * 60_000, 15 * 60_000, 45 * 60_000] as const
const CIRCUIT_FAILURE_THRESHOLD = 3
const CIRCUIT_WINDOW_MS = 24 * 60 * 60_000
const APIFY_TREND_SOURCES = new Set<TrendSource>(['reddit', 'google-trends'])

type SourceConfig = {
  enabled: boolean
  niches: Record<string, { enabled: boolean }>
}

export type TrendIngestionJob = {
  source: TrendSource
  niche: string
  dedupeKey: string
}

type ExecuteTrendIngestionDependencies = {
  now?: Date
  recentFailures: string[]
  apifyDailyBudgetUsd?: number | null
  getDailyApifySpendUsd?: (now: Date) => Promise<number>
  recordRun: (run: TrendSourceRun) => Promise<string>
  ingest: () => Promise<{ itemCount?: number; costUsd?: number; providerRunId?: string }>
}

export async function executeTrendIngestionJob(
  job: TrendIngestionJob,
  {
    now = new Date(),
    recentFailures,
    apifyDailyBudgetUsd,
    getDailyApifySpendUsd,
    recordRun,
    ingest,
  }: ExecuteTrendIngestionDependencies
): Promise<{ status: TrendSourceRun['status'] }> {
  const startedAt = now.toISOString()
  if (APIFY_TREND_SOURCES.has(job.source)) {
    const budget = apifyDailyBudgetUsd
    if (!Number.isFinite(budget) || !budget || budget <= 0 || !getDailyApifySpendUsd) {
      await recordRun({
        source: job.source, niche: job.niche, providerRunId: job.dedupeKey,
        status: 'dead-letter', attempt: 1, startedAt, finishedAt: startedAt, errorCode: 'budget_not_configured',
      })
      return { status: 'dead-letter' }
    }

    try {
      const spent = await getDailyApifySpendUsd(now)
      if (!Number.isFinite(spent) || spent < 0 || spent >= budget) {
        await recordRun({
          source: job.source, niche: job.niche, providerRunId: job.dedupeKey,
          status: 'dead-letter', attempt: 1, startedAt, finishedAt: startedAt, errorCode: 'budget_exceeded',
        })
        return { status: 'dead-letter' }
      }
    } catch {
      await recordRun({
        source: job.source, niche: job.niche, providerRunId: job.dedupeKey,
        status: 'dead-letter', attempt: 1, startedAt, finishedAt: startedAt, errorCode: 'budget_unavailable',
      })
      return { status: 'dead-letter' }
    }
  }

  if (shouldOpenTrendCircuit(recentFailures, now)) {
    await recordRun({
      source: job.source, niche: job.niche, providerRunId: job.dedupeKey,
      status: 'dead-letter', attempt: 1, startedAt, finishedAt: startedAt, errorCode: 'circuit_open',
    })
    return { status: 'dead-letter' }
  }

  await recordRun({
    source: job.source, niche: job.niche, providerRunId: job.dedupeKey,
    status: 'running', attempt: 1, startedAt,
  })

  try {
    const outcome = await ingest()
    await recordRun({
      source: job.source, niche: job.niche, providerRunId: outcome.providerRunId ?? job.dedupeKey,
      status: 'succeeded', attempt: 1, startedAt, finishedAt: new Date().toISOString(),
      itemCount: outcome.itemCount, costUsd: outcome.costUsd,
    })
    return { status: 'succeeded' }
  } catch (error) {
    const terminal = isTerminalIngestionFailure(error)
    await recordRun({
      source: job.source, niche: job.niche, providerRunId: job.dedupeKey,
      status: terminal ? 'dead-letter' : 'failed', attempt: 1, startedAt,
      finishedAt: new Date().toISOString(), errorCode: terminal ? 'terminal_failure' : 'retry_scheduled',
    })
    return { status: terminal ? 'dead-letter' : 'failed' }
  }
}

export function buildTrendIngestionJobs({
  now = new Date(),
  niches = Object.values(NICHES),
  sourceConfig = TREND_SOURCE_CONFIG,
}: {
  now?: Date
  niches?: Array<{ id: string; active: boolean }>
  sourceConfig?: Record<TrendSource, SourceConfig>
} = {}): TrendIngestionJob[] {
  const utcHour = now.toISOString().slice(0, 13)

  return (Object.entries(sourceConfig) as Array<[TrendSource, SourceConfig]>).flatMap(
    ([source, config]) => {
      if (!config.enabled) return []

      return niches.flatMap((niche) => {
        if (!niche.active || !config.niches[niche.id]?.enabled) return []
        return [{ source, niche: niche.id, dedupeKey: `trend-ingest:${source}:${niche.id}:${utcHour}` }]
      })
    }
  )
}

export function calculateTrendRetryDelayMs(attempt: number) {
  return RETRY_DELAYS_MS[Math.min(Math.max(Math.trunc(attempt), 1), RETRY_DELAYS_MS.length) - 1]
}

export function isTerminalIngestionFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /\b(401|403)\b|unauthori[sz]ed|forbidden|schema/i.test(message)
}

export function shouldOpenTrendCircuit(failureTimes: string[], now = new Date()) {
  const windowStart = now.getTime() - CIRCUIT_WINDOW_MS
  return failureTimes.filter((occurredAt) => {
    const timestamp = Date.parse(occurredAt)
    return Number.isFinite(timestamp) && timestamp >= windowStart && timestamp <= now.getTime()
  }).length >= CIRCUIT_FAILURE_THRESHOLD
}

export function verifyApifyWebhookSignature(body: string, signature: string | null, secret: string | undefined) {
  if (!signature || !secret) return false

  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const actualBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

export type ApifyRunStart = { id: string }

export async function startApifyTask({
  taskId,
  input,
  token = process.env.APIFY_TOKEN,
  fetchImpl = fetch,
}: {
  taskId: string
  input: Record<string, unknown>
  token?: string
  fetchImpl?: typeof fetch
}): Promise<ApifyRunStart> {
  if (!token) throw new Error('Apify token is not configured')

  const response = await fetchImpl(`https://api.apify.com/v2/actor-tasks/${encodeURIComponent(taskId)}/runs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) throw new Error(`Apify task start failed (HTTP ${response.status})`)
  const payload = await response.json() as { data?: { id?: unknown } }
  if (typeof payload.data?.id !== 'string') throw new Error('Invalid Apify task start schema')
  return { id: payload.data.id }
}

export async function pollApifyDataset({
  datasetId,
  token = process.env.APIFY_TOKEN,
  fetchImpl = fetch,
}: {
  datasetId: string
  token?: string
  fetchImpl?: typeof fetch
}): Promise<unknown[]> {
  if (!token) throw new Error('Apify token is not configured')

  const response = await fetchImpl(`https://api.apify.com/v2/datasets/${encodeURIComponent(datasetId)}/items`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`Apify dataset poll failed (HTTP ${response.status})`)
  const payload = await response.json()
  if (!Array.isArray(payload)) throw new Error('Invalid Apify dataset schema')
  return payload
}
