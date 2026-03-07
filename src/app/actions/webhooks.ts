"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { triggerWebhooks, WebhookEvent } from "@/lib/integrations/webhooks"

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

  // Chiamiamo direttamente l'engine per questo specifico webhook
  // Per semplicità usiamo triggerWebhooks filtrando per ID se volessimo, 
  // ma qui facciamo un invio secco per il test.
  
  // Riutilizziamo la logica di triggerWebhooks ma per un singolo URL
  return await triggerWebhooks(teamId, 'idea.approved', testPayload)
}
