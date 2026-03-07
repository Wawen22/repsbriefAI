"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { triggerWebhooks } from "@/lib/integrations/webhooks"

type WebhookChannel = "generic" | "slack"
type TeamRole = "owner" | "admin" | "member"

function normalizeChannel(channel: string): WebhookChannel {
  return channel === "slack" ? "slack" : "generic"
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

async function ensureTeamAdmin(supabase: Awaited<ReturnType<typeof createClient>>, teamId: string, userId: string) {
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle()

  const role = membership?.role as TeamRole | undefined
  return role === "owner" || role === "admin"
}

export async function addWebhookAction(
  teamId: string,
  url: string,
  name: string,
  events: string[],
  channel: WebhookChannel = "generic"
) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { success: false, error: "Unauthorized" }

  const canManage = await ensureTeamAdmin(supabase, teamId, auth.user.id)
  if (!canManage) return { success: false, error: "Solo owner/admin possono gestire webhook" }

  const normalizedChannel = normalizeChannel(channel)
  const normalizedUrl = url.trim()
  const normalizedName = name.trim() || (normalizedChannel === "slack" ? "Slack Notifications" : "Webhook")

  if (!teamId) return { success: false, error: "Team non valido" }
  if (!isValidHttpUrl(normalizedUrl)) return { success: false, error: "URL non valido" }
  if (events.length === 0) return { success: false, error: "Seleziona almeno un evento" }
  if (normalizedChannel === "slack" && !normalizedUrl.startsWith("https://hooks.slack.com/services/")) {
    return { success: false, error: "URL Slack non valido. Usa un Incoming Webhook Slack." }
  }
  
  const { data, error } = await supabase
    .from('team_webhooks')
    .insert({ team_id: teamId, url: normalizedUrl, name: normalizedName, events, channel: normalizedChannel })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/dashboard/settings')
  return { success: true, data }
}

export async function deleteWebhookAction(webhookId: string) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { success: false, error: "Unauthorized" }

  const { data: webhook } = await supabase
    .from("team_webhooks")
    .select("team_id")
    .eq("id", webhookId)
    .maybeSingle()

  if (!webhook?.team_id) return { success: false, error: "Webhook non trovato" }

  const canManage = await ensureTeamAdmin(supabase, webhook.team_id, auth.user.id)
  if (!canManage) return { success: false, error: "Solo owner/admin possono gestire webhook" }

  const { error } = await supabase.from('team_webhooks').delete().eq('id', webhookId)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function toggleWebhookAction(webhookId: string, active: boolean) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { success: false, error: "Unauthorized" }

  const { data: webhook } = await supabase
    .from("team_webhooks")
    .select("team_id")
    .eq("id", webhookId)
    .maybeSingle()

  if (!webhook?.team_id) return { success: false, error: "Webhook non trovato" }

  const canManage = await ensureTeamAdmin(supabase, webhook.team_id, auth.user.id)
  if (!canManage) return { success: false, error: "Solo owner/admin possono gestire webhook" }

  const { error } = await supabase.from('team_webhooks').update({ active }).eq('id', webhookId)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * Invia un evento di test al Webhook
 */
export async function testWebhookAction(teamId: string, webhookId: string) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { success: false, error: "Unauthorized" }

  const canManage = await ensureTeamAdmin(supabase, teamId, auth.user.id)
  if (!canManage) return { success: false, error: "Solo owner/admin possono testare webhook" }

  const { data: webhook } = await supabase.from('team_webhooks').select('*').eq('id', webhookId).single()
  
  if (!webhook) return { success: false, error: "Webhook non trovato" }

  const testPayload = {
    test: true,
    message: "This is a test notification from RepsBrief",
    triggered_at: new Date().toISOString()
  }

  const deliveries = await triggerWebhooks(teamId, 'idea.approved', testPayload, webhookId)
  if (!deliveries.length) return { success: false, error: "Nessun webhook attivo da testare" }

  const hasSuccess = deliveries.some(
    (result) => result.status === 'fulfilled' && result.value === true
  )

  if (!hasSuccess) {
    return { success: false, error: "Test fallito: endpoint non raggiungibile o risposta non valida" }
  }

  return { success: true }
}
