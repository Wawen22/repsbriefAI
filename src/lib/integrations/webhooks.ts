import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

/**
 * Tipi di eventi supportati per i Webhooks
 */
export type WebhookEvent = 'brief.ready' | 'idea.approved' | 'content.scheduled'

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
  const results = await Promise.allSettled(webhooks.map(async (webhook) => {
    const timestamp = Date.now().toString()
    const body = JSON.stringify({
      event,
      team_id: teamId,
      timestamp,
      payload
    })

    // Creazione firma HMAC per sicurezza
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(`${timestamp}.${body}`)
      .digest('hex')

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RepsBrief-Signature': signature,
          'X-RepsBrief-Timestamp': timestamp,
          'User-Agent': 'RepsBrief-Webhooks/1.0'
        },
        body
      })

      // Log dell'invio (opzionale, ma utile per debug)
      await supabase.from('team_integration_logs').insert({
        team_id: teamId,
        provider: 'webhook',
        action: event,
        status: response.ok ? 'success' : 'error',
        event_type: event,
        details: {
          url: webhook.url,
          status_code: response.status,
          webhook_id: webhook.id
        }
      })

      return response.ok
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown webhook delivery error'
      console.error(`Webhook delivery failed for ${webhook.url}:`, err)
      await supabase.from('team_integration_logs').insert({
        team_id: teamId,
        provider: 'webhook',
        action: event,
        status: 'error',
        event_type: event,
        details: { url: webhook.url, error: message, webhook_id: webhook.id }
      })
      return false
    }
  }))

  return results
}
