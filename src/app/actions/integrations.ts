// src/app/actions/integrations.ts
'use client'

import { getNotionAuthUrl } from "@/lib/integrations/notion-client"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

/**
 * Inizia il flusso di autenticazione Notion
 */
export async function connectNotion() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast.error("Devi essere loggato per connettere Notion.")
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_team_id')
    .eq('id', user.id)
    .single()

  if (!profile?.current_team_id) {
    toast.error("Nessun team attivo trovato.")
    return
  }

  // Il teamId viene passato come 'state' a Notion per riconnettere l'utente nel callback
  const authUrl = getNotionAuthUrl(profile.current_team_id)
  
  // Redirect alla pagina di autorizzazione Notion
  window.location.href = authUrl
}
