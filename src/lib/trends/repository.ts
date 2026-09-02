import { createHash } from 'node:crypto'

import { normalizedTrendSignalSchema, type NormalizedTrendSignal, type TrendSnapshot, type TrendSourceRun } from './contracts'

type QueryError = { code?: string; message?: string } | null
type QueryResult = { data: unknown; error: QueryError }

type SelectBuilder = {
  single(): Promise<QueryResult>
  maybeSingle(): Promise<QueryResult>
  eq(column: string, value: unknown): SelectBuilder
  gt(column: string, value: unknown): SelectBuilder
  order(column: string, options: { ascending: boolean }): SelectBuilder
  limit(count: number): SelectBuilder
  in(column: string, values: unknown[]): Promise<QueryResult>
}

type MutationBuilder = {
  select(columns: string): SelectBuilder
}

type TrendRepositoryTable = {
  upsert(values: unknown, options: { onConflict: string }): MutationBuilder
  insert(values: unknown): MutationBuilder
  select(columns: string): SelectBuilder
}

export type TrendRepositoryClient = {
  from(table: string): TrendRepositoryTable
}

type StoredSnapshot = {
  id: string
  niche: string
  as_of: string
  signal_ids: string[]
  source_summary: TrendSnapshot['sourceSummary']
  quality: TrendSnapshot['quality']
  expires_at: string
}

function sanitizePersistenceError(error: QueryError): never {
  const code = error?.code
  if (code === '23505') throw new Error('Trend record already exists.')
  throw new Error('Trend persistence is temporarily unavailable.')
}

function requireId(data: unknown, error: QueryError) {
  if (error || !data || typeof data !== 'object' || !('id' in data) || typeof data.id !== 'string') {
    sanitizePersistenceError(error)
  }

  return data.id
}

function toStoredSnapshot(data: unknown): StoredSnapshot | null {
  if (!data || typeof data !== 'object') return null

  const row = data as Partial<StoredSnapshot>
  if (
    typeof row.id !== 'string' ||
    typeof row.niche !== 'string' ||
    typeof row.as_of !== 'string' ||
    !Array.isArray(row.signal_ids) ||
    typeof row.expires_at !== 'string' ||
    (row.quality !== 'valid' && row.quality !== 'invalid')
  ) {
    return null
  }

  return row as StoredSnapshot
}

export function hashTrendSignal(signal: Pick<NormalizedTrendSignal, 'canonicalUrl' | 'title' | 'content'>) {
  return createHash('sha256')
    .update([signal.canonicalUrl, signal.title, signal.content ?? ''].join('\n'))
    .digest('hex')
}

export function createTrendRepository(client: TrendRepositoryClient) {
  return {
    async recordSourceRun(run: TrendSourceRun) {
      const { data, error } = await client
        .from('trend_source_runs')
        .upsert(
          {
            source: run.source,
            niche: run.niche,
            provider_run_id: run.providerRunId,
            status: run.status,
            attempt: run.attempt,
            started_at: run.startedAt,
            finished_at: run.finishedAt ?? null,
            item_count: run.itemCount ?? null,
            cost_usd: run.costUsd ?? null,
            error_code: run.errorCode ?? null,
          },
          { onConflict: 'source,niche,provider_run_id' }
        )
        .select('id')
        .single()

      return requireId(data, error)
    },

    async upsertSignals(_niche: string, signals: NormalizedTrendSignal[]) {
      if (signals.length === 0) return []

      const rows = signals.map((signal) => ({
        source: signal.source,
        external_id: signal.externalId,
        title: signal.title,
        canonical_url: signal.canonicalUrl,
        published_at: signal.publishedAt,
        observed_at: signal.observedAt,
        provenance: signal.provenance,
        content: signal.content ?? null,
        score: signal.score ?? null,
        metadata: signal.metadata ?? {},
        content_hash: hashTrendSignal(signal),
      }))
      const { data, error } = await client
        .from('trend_signals')
        .upsert(rows, { onConflict: 'source,external_id' })
        .select('id')
        .single()

      return requireId(data, error)
    },

    async createSnapshot(snapshot: TrendSnapshot) {
      const { data, error } = await client
        .from('trend_snapshots')
        .insert({
          niche: snapshot.niche,
          as_of: snapshot.asOf,
          signal_ids: snapshot.signalIds,
          source_summary: snapshot.sourceSummary,
          quality: snapshot.quality,
          expires_at: snapshot.expiresAt,
        })
        .select('id')
        .single()

      return requireId(data, error)
    },

    async getSignals(signalIds: string[]) {
      if (signalIds.length === 0) return []

      const { data, error } = await client
        .from('trend_signals')
        .select('id, source, external_id, title, canonical_url, published_at, observed_at, provenance, content, score, metadata')
        .in('id', signalIds)

      if (error) sanitizePersistenceError(error)
      if (!Array.isArray(data)) return []

      return data.flatMap((row) => {
        if (!row || typeof row !== 'object') return []
        const stored = row as Record<string, unknown>
        if (typeof stored.id !== 'string') return []
        const parsed = normalizedTrendSignalSchema.safeParse({
          source: stored.source,
          externalId: stored.external_id,
          title: stored.title,
          canonicalUrl: stored.canonical_url,
          publishedAt: stored.published_at,
          observedAt: stored.observed_at,
          provenance: stored.provenance,
          content: stored.content ?? undefined,
          score: stored.score ?? undefined,
          metadata: stored.metadata,
        })
        return parsed.success ? [{ id: stored.id, ...parsed.data }] : []
      })
    },

    async getLatestValidSnapshot(niche: string, now: string): Promise<TrendSnapshot | null> {
      const { data, error } = await client
        .from('trend_snapshots')
        .select('id, niche, as_of, signal_ids, source_summary, quality, expires_at')
        .eq('niche', niche)
        .eq('quality', 'valid')
        .gt('expires_at', now)
        .order('as_of', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) sanitizePersistenceError(error)

      const snapshot = toStoredSnapshot(data)
      if (!snapshot || Date.parse(snapshot.expires_at) <= Date.parse(now)) return null

      return {
        niche: snapshot.niche,
        asOf: snapshot.as_of,
        signalIds: snapshot.signal_ids,
        sourceSummary: snapshot.source_summary,
        quality: snapshot.quality,
        expiresAt: snapshot.expires_at,
      }
    },
  }
}

export async function getTrendRepository() {
  const { getSupabaseAdmin } = await import('@/lib/supabase')
  return createTrendRepository(getSupabaseAdmin('lib/trends/repository') as unknown as TrendRepositoryClient)
}
