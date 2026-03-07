// src/app/actions/integrations.ts
'use client'

import { getNotionAuthUrl } from "@/lib/integrations/notion-client"
import { getGoogleAuthUrl } from "@/lib/integrations/google-client"
import { getSlackAuthUrl } from "@/lib/integrations/slack-client"
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

  const authUrl = getNotionAuthUrl(profile.current_team_id)
  window.location.href = authUrl
}

/**
 * Inizia il flusso di autenticazione Google Calendar
 */
export async function connectGoogle() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast.error("Devi essere loggato per connettere Google Calendar.")
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

  const authUrl = getGoogleAuthUrl(profile.current_team_id)
  window.location.href = authUrl
}

/**
 * Inizia il flusso di autenticazione Slack OAuth
 */
export async function connectSlack() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast.error("Devi essere loggato per connettere Slack.")
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

  try {
    const authUrl = getSlackAuthUrl(profile.current_team_id)
    window.location.href = authUrl
  } catch (error) {
    console.error("Slack OAuth setup error:", error)
    toast.error("Slack OAuth non configurato correttamente.")
  }
}
