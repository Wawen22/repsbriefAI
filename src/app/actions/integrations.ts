// src/app/actions/integrations.ts
'use client'

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

  const startUrl = `/api/auth/notion/start?team_id=${encodeURIComponent(profile.current_team_id)}`
  window.location.href = startUrl
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

  const startUrl = `/api/auth/google/start?team_id=${encodeURIComponent(profile.current_team_id)}`
  window.location.href = startUrl
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

  const startUrl = `/api/auth/slack/start?team_id=${encodeURIComponent(profile.current_team_id)}`
  window.location.href = startUrl
}

/**
 * Inizia il flusso di autenticazione Discord OAuth
 */
export async function connectDiscord() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast.error("Devi essere loggato per connettere Discord.")
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

  const startUrl = `/api/auth/discord/start?team_id=${encodeURIComponent(profile.current_team_id)}`
  window.location.href = startUrl
}

/**
 * Inizia il flusso di autenticazione ClickUp OAuth
 */
export async function connectClickUp() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast.error("Devi essere loggato per connettere ClickUp.")
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

  const startUrl = `/api/auth/clickup/start?team_id=${encodeURIComponent(profile.current_team_id)}`
  window.location.href = startUrl
}
