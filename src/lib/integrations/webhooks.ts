import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

/**
 * Tipi di eventi supportati per i Webhooks
 */
export type WebhookEvent = 'brief.ready' | 'idea.approved' | 'content.scheduled'

type WebhookChannel = 'generic' | 'slack'

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

function normalizeChannel(channel: string | null | undefined): WebhookChannel {
  return channel === 'slack' ? 'slack' : 'generic'
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

/**
 * Funzione core per scatenare i Webhooks di un team per un determinato evento
 */
export const triggerWebhooks = async (
  teamId: string,
  event: WebhookEvent,
  payload: unknown,
  webhookId?: string
) => {
  const supabase = await createClient()

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

  if (error || !webhooks || webhooks.length === 0) return []

  // 2. Invio asincrono a tutti gli endpoint
  const results = await Promise.allSettled((webhooks as WebhookRow[]).map(async (webhook) => {
    const channel = normalizeChannel(webhook.channel)
    const provider = channel === 'slack' ? 'slack' : 'webhook'
    const timestamp = Date.now().toString()
    const formattedPayload = channel === 'slack'
      ? buildSlackPayload(event, teamId, payload, timestamp)
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
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
      })

      // Log dell'invio (opzionale, ma utile per debug)
      await supabase.from('team_integration_logs').insert({
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
      await supabase.from('team_integration_logs').insert({
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
