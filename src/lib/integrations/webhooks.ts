import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { isSafeWebhookUrl } from "@/lib/integrations/webhook-security"
import crypto from "crypto"

/**
 * Tipi di eventi supportati per i Webhooks
 */
export type WebhookEvent = 'brief.ready' | 'idea.approved' | 'content.scheduled'

type WebhookChannel = 'generic' | 'slack' | 'discord'

type WebhookRow = {
  id: string
  url: string
  secret: string | null
  name: string | null
  channel: string | null
}

type SlackField = {
  type: 'mrkdwn'
  text: string
}

type SlackPayload = {
  text: string
  blocks: Array<Record<string, unknown>>
}

type DiscordPayload = {
  content: string
  embeds: Array<Record<string, unknown>>
}

type IntegrationLogPayload = {
  team_id: string
  provider: string
  action: string
  status: 'success' | 'error'
  event_type: string
  details: Record<string, unknown>
}

let serviceRoleWarningShown = false

async function getWebhookDbClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getSupabaseAdmin('lib/integrations/webhooks')
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      "[Webhooks] SUPABASE_SERVICE_ROLE_KEY is missing. Refusing request-scoped fallback in production."
    )
  }

  if (!serviceRoleWarningShown) {
    console.warn(
      "[Webhooks] SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to request-scoped client; automation delivery may be limited by RLS."
    )
    serviceRoleWarningShown = true
  }

  return createClient()
}

async function insertIntegrationLog(
  supabase: Awaited<ReturnType<typeof getWebhookDbClient>>,
  payload: IntegrationLogPayload
) {
  const { error } = await supabase.from('team_integration_logs').insert(payload)
  if (error) {
    console.error('[Webhooks] Failed to persist integration log:', error)
  }
}

function normalizeChannel(channel: string | null | undefined): WebhookChannel {
  if (channel === 'slack') return 'slack'
  if (channel === 'discord') return 'discord'
  return 'generic'
}

function asRecord(payload: unknown): Record<string, unknown> {
  if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
    return payload as Record<string, unknown>
  }
  return {}
}

function readString(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

function eventLabel(event: WebhookEvent): string {
  if (event === 'brief.ready') return 'Brief Ready'
  if (event === 'idea.approved') return 'Idea Approved'
  return 'Content Scheduled'
}

function buildSlackPayload(
  event: WebhookEvent,
  teamId: string,
  payload: unknown,
  timestamp: string
): SlackPayload {
  const data = asRecord(payload)
  const fields: SlackField[] = []
  let summary = `Nuovo evento automation: *${eventLabel(event)}*.`

  if (event === 'brief.ready') {
    const niche = readString(data.niche) ?? 'N/A'
    const weekDate = readString(data.week_date) ?? 'N/A'
    const ideasCount = readString(data.ideas_count) ?? 'N/A'
    summary = `Il brief settimanale e' pronto per la nicchia *${niche}*.`
    fields.push({ type: 'mrkdwn', text: `*Niche*\n${niche}` })
    fields.push({ type: 'mrkdwn', text: `*Week Date*\n${weekDate}` })
    fields.push({ type: 'mrkdwn', text: `*Ideas*\n${ideasCount}` })
  } else if (event === 'idea.approved') {
    const title = readString(data.title) ?? 'Untitled idea'
    const approvedAt = readString(data.approved_at) ?? 'N/A'
    summary = `Un contenuto e' stato approvato: *${title}*.`
    fields.push({ type: 'mrkdwn', text: `*Title*\n${title}` })
    fields.push({ type: 'mrkdwn', text: `*Approved At*\n${approvedAt}` })
  } else if (event === 'content.scheduled') {
    const title = readString(data.title) ?? 'Untitled content'
    const platform = readString(data.platform) ?? 'N/A'
    const scheduledDate = readString(data.scheduled_date) ?? 'N/A'
    summary = `Nuovo contenuto schedulato: *${title}*.`
    fields.push({ type: 'mrkdwn', text: `*Platform*\n${platform}` })
    fields.push({ type: 'mrkdwn', text: `*Scheduled For*\n${scheduledDate}` })
  }

  const sentAt = Number(timestamp)
  const sentAtLabel = Number.isFinite(sentAt)
    ? new Date(sentAt).toLocaleString('it-IT')
    : new Date().toLocaleString('it-IT')

  return {
    text: `[RepsBrief] ${eventLabel(event)} · team ${teamId}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `RepsBrief · ${eventLabel(event)}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: summary,
        },
      },
      ...(fields.length > 0
        ? [
            {
              type: 'section',
              fields,
            },
          ]
        : []),
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `*Event:* \`${event}\`` },
          { type: 'mrkdwn', text: `*Team:* \`${teamId}\`` },
          { type: 'mrkdwn', text: `*Sent:* ${sentAtLabel}` },
        ],
      },
    ],
  }
}

function buildDiscordPayload(
  event: WebhookEvent,
  teamId: string,
  payload: unknown,
  timestamp: string
): DiscordPayload {
  const data = asRecord(payload)
  let title = eventLabel(event)
  let description = `Nuovo evento automation: **${eventLabel(event)}**.`

  const fields: Array<{ name: string; value: string; inline?: boolean }> = []

  if (event === 'brief.ready') {
    const niche = readString(data.niche) ?? 'N/A'
    const weekDate = readString(data.week_date) ?? 'N/A'
    const ideasCount = readString(data.ideas_count) ?? 'N/A'
    title = 'Brief Ready'
    description = `Il brief settimanale e' pronto per la nicchia **${niche}**.`
    fields.push({ name: 'Niche', value: niche, inline: true })
    fields.push({ name: 'Week Date', value: weekDate, inline: true })
    fields.push({ name: 'Ideas', value: ideasCount, inline: true })
  } else if (event === 'idea.approved') {
    const ideaTitle = readString(data.title) ?? 'Untitled idea'
    const approvedAt = readString(data.approved_at) ?? 'N/A'
    title = 'Idea Approved'
    description = `Un contenuto e' stato approvato: **${ideaTitle}**.`
    fields.push({ name: 'Title', value: ideaTitle })
    fields.push({ name: 'Approved At', value: approvedAt, inline: true })
  } else if (event === 'content.scheduled') {
    const contentTitle = readString(data.title) ?? 'Untitled content'
    const platform = readString(data.platform) ?? 'N/A'
    const scheduledDate = readString(data.scheduled_date) ?? 'N/A'
    title = 'Content Scheduled'
    description = `Nuovo contenuto schedulato: **${contentTitle}**.`
    fields.push({ name: 'Platform', value: platform, inline: true })
    fields.push({ name: 'Scheduled For', value: scheduledDate, inline: true })
  }

  const sentAt = Number(timestamp)
  const sentAtLabel = Number.isFinite(sentAt)
    ? new Date(sentAt).toLocaleString('it-IT')
    : new Date().toLocaleString('it-IT')

  return {
    content: `[RepsBrief] ${title}`,
    embeds: [
      {
        title: `RepsBrief · ${title}`,
        description,
        color: 5793266,
        fields: [
          ...fields,
          { name: 'Event', value: `\`${event}\``, inline: true },
          { name: 'Team', value: `\`${teamId}\``, inline: true },
          { name: 'Sent', value: sentAtLabel, inline: false },
        ],
      },
    ],
  }
}

/**
 * Funzione core per scatenare i Webhooks di un team per un determinato evento
 */
export const triggerWebhooks = async (
  teamId: string,
  event: WebhookEvent,
  payload: unknown,
  webhookId?: string
) => {
  const supabase = await getWebhookDbClient()

  // 1. Recupero i webhooks attivi per questo team che ascoltano questo evento
  let query = supabase
    .from('team_webhooks')
    .select('*')
    .eq('team_id', teamId)
    .eq('active', true)
    .contains('events', [event])

  if (webhookId) {
    query = query.eq('id', webhookId)
  }

  const { data: webhooks, error } = await query

  if (error) {
    console.error(`[Webhooks] Failed to load active webhooks for team ${teamId}:`, error)
    return []
  }

  if (!webhooks || webhooks.length === 0) return []

  // 2. Invio asincrono a tutti gli endpoint
  const results = await Promise.allSettled((webhooks as WebhookRow[]).map(async (webhook) => {
    const channel = normalizeChannel(webhook.channel)
    const provider = channel === 'slack' ? 'slack' : channel === 'discord' ? 'discord' : 'webhook'
    const timestamp = Date.now().toString()
    const formattedPayload =
      channel === 'slack'
        ? buildSlackPayload(event, teamId, payload, timestamp)
        : channel === 'discord'
          ? buildDiscordPayload(event, teamId, payload, timestamp)
          : {
              event,
              team_id: teamId,
              timestamp,
              payload,
            }
    const body = JSON.stringify(formattedPayload)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'RepsBrief-Webhooks/1.0',
    }

    if (channel === 'generic') {
      const signature = crypto
        .createHmac('sha256', webhook.secret ?? '')
        .update(`${timestamp}.${body}`)
        .digest('hex')

      headers['X-RepsBrief-Signature'] = signature
      headers['X-RepsBrief-Timestamp'] = timestamp
    }

    try {
      if (!(await isSafeWebhookUrl(webhook.url))) {
        throw new Error('Webhook URL is not reachable in a safe way')
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      })

      // Log dell'invio (opzionale, ma utile per debug)
      await insertIntegrationLog(supabase, {
        team_id: teamId,
        provider,
        action: event,
        status: response.ok ? 'success' : 'error',
        event_type: event,
        details: {
          url: webhook.url,
          status_code: response.status,
          webhook_id: webhook.id,
          webhook_name: webhook.name,
          channel,
        },
      })

      return response.ok
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown webhook delivery error'
      console.error(`Webhook delivery failed for ${webhook.url}:`, err)
      await insertIntegrationLog(supabase, {
        team_id: teamId,
        provider,
        action: event,
        status: 'error',
        event_type: event,
        details: {
          url: webhook.url,
          error: message,
          webhook_id: webhook.id,
          webhook_name: webhook.name,
          channel,
        },
      })
      return false
    }
  }))

  return results
}
