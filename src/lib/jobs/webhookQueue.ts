import { getSupabaseAdmin } from "@/lib/supabase"
import { createClient } from "@/lib/supabase/server"
import { triggerWebhooks, type WebhookEvent } from "@/lib/integrations/webhooks"

const WEBHOOK_DELIVERY_JOB_TYPE = "webhook_delivery"
const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_RETRY_BASE_DELAY_MS = 30_000
const DEFAULT_RETRY_MAX_DELAY_MS = 15 * 60_000

type QueueJobStatus = "pending" | "processing" | "completed" | "dead"

type QueueJobRow = {
  id: string
  team_id: string
  job_type: string
  payload: unknown
  dedupe_key: string | null
  status: QueueJobStatus
  attempts: number
  max_attempts: number
  available_at: string
  locked_at: string | null
  locked_by: string | null
  last_error: string | null
  completed_at: string | null
}

type WebhookDeliveryJobPayload = {
  team_id: string
  event: WebhookEvent
  payload: unknown
  webhook_id: string | null
}

type EnqueueWebhookJobInput = {
  teamId: string
  event: WebhookEvent
  payload: unknown
  webhookId?: string
  dedupeKey?: string
  maxAttempts?: number
}

type DispatchWebhookInput = {
  teamId: string
  event: WebhookEvent
  payload: unknown
  webhookId?: string
  dedupeKey?: string
  forceInline?: boolean
}

type ProcessWebhookQueueInput = {
  limit?: number
  workerId?: string
}

type ProcessWebhookQueueSummary = {
  mode: "queue"
  claimed: number
  completed: number
  retried: number
  dead: number
  failures: Array<{ jobId: string; error: string }>
}

let serviceRoleWarningShown = false

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isWebhookEvent(value: unknown): value is WebhookEvent {
  return value === "brief.ready" || value === "idea.approved" || value === "content.scheduled"
}

function parseWebhookDeliveryPayload(rawPayload: unknown): WebhookDeliveryJobPayload | null {
  if (!isObject(rawPayload)) return null

  const teamId = typeof rawPayload.team_id === "string" ? rawPayload.team_id : null
  const event = rawPayload.event
  const webhookId =
    typeof rawPayload.webhook_id === "string" && rawPayload.webhook_id.length > 0
      ? rawPayload.webhook_id
      : null

  if (!teamId || !isWebhookEvent(event)) return null

  return {
    team_id: teamId,
    event,
    payload: rawPayload.payload ?? {},
    webhook_id: webhookId,
  }
}

async function getQueueDbClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getSupabaseAdmin("lib/jobs/webhookQueue")
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[Queue] SUPABASE_SERVICE_ROLE_KEY is missing. Refusing request-scoped fallback in production."
    )
  }

  if (!serviceRoleWarningShown) {
    console.warn(
      "[Queue] SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to request-scoped client in non-production."
    )
    serviceRoleWarningShown = true
  }

  return createClient()
}

export function isWebhookQueueModeEnabled() {
  return (process.env.WEBHOOK_DELIVERY_MODE || "inline").toLowerCase() === "queue"
}

export function calculateRetryDelayMs(attempt: number) {
  const safeAttempt = Math.max(1, attempt)
  const rawDelay = DEFAULT_RETRY_BASE_DELAY_MS * 2 ** (safeAttempt - 1)
  return Math.min(rawDelay, DEFAULT_RETRY_MAX_DELAY_MS)
}

export function allWebhookDeliveriesSucceeded(results: PromiseSettledResult<boolean>[]) {
  if (results.length === 0) return true
  return results.every((result) => result.status === "fulfilled" && result.value === true)
}

async function enqueueWebhookDeliveryJob({
  teamId,
  event,
  payload,
  webhookId,
  dedupeKey,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: EnqueueWebhookJobInput) {
  const supabase = await getQueueDbClient()
  const normalizedDedupeKey = dedupeKey?.trim() || null

  if (normalizedDedupeKey) {
    const { data: existing } = await supabase
      .from("job_queue")
      .select("id, status")
      .eq("team_id", teamId)
      .eq("dedupe_key", normalizedDedupeKey)
      .in("status", ["pending", "processing"])
      .maybeSingle()

    if (existing?.id) {
      return {
        queued: false as const,
        duplicated: true as const,
        jobId: existing.id as string,
      }
    }
  }

  const { data, error } = await supabase
    .from("job_queue")
    .insert({
      team_id: teamId,
      job_type: WEBHOOK_DELIVERY_JOB_TYPE,
      payload: {
        team_id: teamId,
        event,
        payload,
        webhook_id: webhookId || null,
      },
      dedupe_key: normalizedDedupeKey,
      max_attempts: Math.max(1, maxAttempts),
      status: "pending",
      available_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") {
      const { data: duplicate } = await supabase
        .from("job_queue")
        .select("id")
        .eq("team_id", teamId)
        .eq("dedupe_key", normalizedDedupeKey)
        .in("status", ["pending", "processing"])
        .maybeSingle()

      return {
        queued: false as const,
        duplicated: true as const,
        jobId: (duplicate?.id as string | undefined) ?? null,
      }
    }
    throw error
  }

  return {
    queued: true as const,
    duplicated: false as const,
    jobId: data.id as string,
  }
}

async function markJobCompleted(
  supabase: Awaited<ReturnType<typeof getQueueDbClient>>,
  jobId: string
) {
  const { error } = await supabase
    .from("job_queue")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null,
      last_error: null,
    })
    .eq("id", jobId)

  if (error) {
    console.error(`[Queue] Failed to mark job ${jobId} as completed:`, error)
  }
}

async function moveJobToDeadLetter(
  supabase: Awaited<ReturnType<typeof getQueueDbClient>>,
  job: QueueJobRow,
  errorMessage: string
) {
  const { error: deadLetterError } = await supabase.from("job_dead_letters").insert({
    job_id: job.id,
    team_id: job.team_id,
    job_type: job.job_type,
    payload: job.payload,
    attempts: job.attempts,
    last_error: errorMessage,
    failed_at: new Date().toISOString(),
  })

  if (deadLetterError) {
    console.error(`[Queue] Failed to insert dead letter for job ${job.id}:`, deadLetterError)
  }

  const { error: updateError } = await supabase
    .from("job_queue")
    .update({
      status: "dead",
      last_error: errorMessage,
      locked_at: null,
      locked_by: null,
    })
    .eq("id", job.id)

  if (updateError) {
    console.error(`[Queue] Failed to mark job ${job.id} as dead:`, updateError)
  }
}

async function scheduleJobRetry(
  supabase: Awaited<ReturnType<typeof getQueueDbClient>>,
  job: QueueJobRow,
  errorMessage: string
) {
  const delayMs = calculateRetryDelayMs(job.attempts)
  const nextAttemptAt = new Date(Date.now() + delayMs).toISOString()

  const { error } = await supabase
    .from("job_queue")
    .update({
      status: "pending",
      available_at: nextAttemptAt,
      locked_at: null,
      locked_by: null,
      last_error: errorMessage,
    })
    .eq("id", job.id)

  if (error) {
    console.error(`[Queue] Failed to schedule retry for job ${job.id}:`, error)
    await moveJobToDeadLetter(supabase, job, `[retry_update_failed] ${errorMessage}`)
    return { retried: false as const, dead: true as const }
  }

  return { retried: true as const, dead: false as const }
}

export async function dispatchWebhookEvent({
  teamId,
  event,
  payload,
  webhookId,
  dedupeKey,
  forceInline = false,
}: DispatchWebhookInput) {
  const shouldQueue = isWebhookQueueModeEnabled() && !forceInline

  if (!shouldQueue) {
    return triggerWebhooks(teamId, event, payload, webhookId)
  }

  try {
    await enqueueWebhookDeliveryJob({
      teamId,
      event,
      payload,
      webhookId,
      dedupeKey,
    })

    // Keep contract compatible with triggerWebhooks callers.
    return [{ status: "fulfilled", value: true } satisfies PromiseFulfilledResult<boolean>]
  } catch (error: unknown) {
    console.error("[Queue] Enqueue failed, falling back to inline delivery:", error)
    return triggerWebhooks(teamId, event, payload, webhookId)
  }
}

export async function processWebhookDeliveryQueue({
  limit = Number(process.env.QUEUE_WORKER_BATCH_SIZE || 20),
  workerId = `webhook-worker-${process.pid}`,
}: ProcessWebhookQueueInput = {}): Promise<ProcessWebhookQueueSummary> {
  const supabase = await getQueueDbClient()

  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.trunc(limit))) : 20
  const summary: ProcessWebhookQueueSummary = {
    mode: "queue",
    claimed: 0,
    completed: 0,
    retried: 0,
    dead: 0,
    failures: [],
  }

  const { data: claimed, error: claimError } = await supabase.rpc("claim_queue_jobs", {
    p_worker: workerId,
    p_limit: safeLimit,
    p_job_type: WEBHOOK_DELIVERY_JOB_TYPE,
  })

  if (claimError) {
    throw new Error(`[Queue] Failed to claim jobs: ${claimError.message}`)
  }

  const jobs = (claimed || []) as QueueJobRow[]
  summary.claimed = jobs.length

  for (const job of jobs) {
    try {
      const parsedPayload = parseWebhookDeliveryPayload(job.payload)
      if (!parsedPayload) {
        throw new Error("Invalid webhook job payload")
      }

      const deliveries = await triggerWebhooks(
        parsedPayload.team_id,
        parsedPayload.event,
        parsedPayload.payload,
        parsedPayload.webhook_id || undefined
      )

      if (!allWebhookDeliveriesSucceeded(deliveries)) {
        throw new Error("One or more webhook deliveries failed")
      }

      await markJobCompleted(supabase, job.id)
      summary.completed++
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown worker error"
      summary.failures.push({ jobId: job.id, error: message })

      if (job.attempts >= job.max_attempts) {
        await moveJobToDeadLetter(supabase, job, message)
        summary.dead++
        continue
      }

      const retryOutcome = await scheduleJobRetry(supabase, job, message)
      if (retryOutcome.dead) {
        summary.dead++
      } else if (retryOutcome.retried) {
        summary.retried++
      }
    }
  }

  return summary
}
