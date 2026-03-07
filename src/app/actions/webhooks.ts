"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { triggerWebhooks } from "@/lib/integrations/webhooks"

export async function addWebhookAction(teamId: string, url: string, name: string, events: string[]) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('team_webhooks')
    .insert({ team_id: teamId, url, name, events })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/dashboard/settings')
  return { success: true, data }
}

export async function deleteWebhookAction(webhookId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('team_webhooks').delete().eq('id', webhookId)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function toggleWebhookAction(webhookId: string, active: boolean) {
  const supabase = await createClient()
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
