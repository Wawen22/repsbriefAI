import { NextResponse } from 'next/server'

import { buildTrendIngestionJobs } from '@/lib/trends/ingestionWorker'
import { getTrendRepository } from '@/lib/trends/repository'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const repository = await getTrendRepository()
    const jobs = buildTrendIngestionJobs()
    const startedAt = new Date().toISOString()

    await Promise.all(jobs.map((job) => repository.recordSourceRun({
      source: job.source,
      niche: job.niche,
      providerRunId: job.dedupeKey,
      status: 'queued',
      attempt: 1,
      startedAt,
    })))

    return NextResponse.json({ queued: jobs.length, jobs })
  } catch (error) {
    console.error('[TrendIngestionCron] Failed to schedule trend ingestion:', error)
    return NextResponse.json({ error: 'Trend ingestion scheduling failed' }, { status: 500 })
  }
}
