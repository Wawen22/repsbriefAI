// src/app/actions/notion-export.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { exportToNotion } from "@/lib/integrations/notion"
import { revalidatePath } from "next/cache"

export async function exportStrategyToNotionAction(briefContent: string, title: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error("Utente non autenticato")

    // Recuperiamo il team corrente dell'utente
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_team_id')
      .eq('id', user.id)
      .single()

    if (!profile?.current_team_id) throw new Error("Nessun team attivo trovato")

    // Eseguiamo l'export
    const result = await exportToNotion(profile.current_team_id, briefContent, title)

    if (result.object === 'error') {
      throw new Error(result.message || "Errore durante l'export su Notion")
    }

    // Registriamo il log
    const { data: integration } = await supabase
      .from('team_integrations')
      .select('id')
      .eq('team_id', profile.current_team_id)
      .eq('provider', 'notion')
      .single()

    if (integration) {
      await supabase.from('team_integration_logs').insert({
        team_id: profile.current_team_id,
        integration_id: integration.id,
        provider: 'notion',
        action: 'export_success',
        status: 'success',
        event_type: 'export_success',
        details: { page_id: result.id, title }
      })
    }

    return { success: true, url: result.url }
  } catch (error: any) {
    console.error("Export to Notion failed:", error)
    return { success: false, error: error.message }
  }
}
