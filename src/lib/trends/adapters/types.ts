import { z } from 'zod'

import {
  normalizedTrendSignalSchema,
  trendSourceSchema,
  type NormalizedTrendSignal,
  type TrendSource,
} from '../contracts'

export type TrendAdapterContext = {
  observedAt: string
  providerRunId?: string
  taskId?: string
}

export type TrendAdapter = (input: unknown, context: TrendAdapterContext) => NormalizedTrendSignal[]

export const rawRecordSchema = z.object({}).passthrough()

export function asRecords(input: unknown): Record<string, unknown>[] {
  const records = Array.isArray(input) ? input : []
  return records.flatMap((record) => {
    const parsed = rawRecordSchema.safeParse(record)
    return parsed.success ? [parsed.data] : []
  })
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

export function asIsoDate(value: unknown): string | undefined {
  const parsed = typeof value === 'number'
    ? new Date(value * 1000)
    : typeof value === 'string'
      ? new Date(value)
      : null

  if (!parsed || Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

export function buildProvenance(
  provider: string,
  sourceUrl: string,
  context: TrendAdapterContext,
  additional: Record<string, string | undefined> = {}
) {
  return Object.fromEntries(
    Object.entries({
      provider,
      providerRunId: context.providerRunId,
      taskId: context.taskId,
      sourceUrl,
      observedAt: context.observedAt,
      adapterVersion: '1',
      ...additional,
    }).filter(([, value]) => value !== undefined)
  ) as Record<string, string>
}

export function toNormalizedSignal(
  source: TrendSource,
  values: Omit<NormalizedTrendSignal, 'source'>
): NormalizedTrendSignal | null {
  const parsed = normalizedTrendSignalSchema.safeParse({ source, ...values })
  return parsed.success ? parsed.data : null
}

export function dedupeSignals(signals: NormalizedTrendSignal[]): NormalizedTrendSignal[] {
  const seen = new Set<string>()
  return signals.filter((signal) => {
    const key = `${signal.source}:${signal.externalId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export { trendSourceSchema }
