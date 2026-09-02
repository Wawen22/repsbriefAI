import { z } from 'zod'

export const trendSourceSchema = z.enum(['youtube', 'rss', 'reddit', 'google-trends'])

export type TrendSource = z.infer<typeof trendSourceSchema>

const httpsUrlSchema = z.string().url().refine(
  (value) => new URL(value).protocol === 'https:',
  'Expected an HTTPS URL'
)

export const normalizedTrendSignalSchema = z.object({
  source: trendSourceSchema,
  externalId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  canonicalUrl: httpsUrlSchema,
  publishedAt: z.string().datetime(),
  observedAt: z.string().datetime(),
  provenance: z.record(z.string(), z.string()),
  content: z.string().trim().min(1).optional(),
  score: z.number().finite().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type NormalizedTrendSignal = z.infer<typeof normalizedTrendSignalSchema>

export type TrendSourceRun = {
  source: TrendSource
  niche: string
  providerRunId: string
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'dead-letter'
  attempt: number
  startedAt: string
  finishedAt?: string
  itemCount?: number
  costUsd?: number
  errorCode?: string
}

export type TrendSnapshot = {
  niche: string
  asOf: string
  signalIds: string[]
  sourceSummary: Partial<Record<TrendSource, number>>
  quality: 'valid' | 'invalid'
  expiresAt: string
}
