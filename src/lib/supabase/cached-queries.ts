// src/lib/supabase/cached-queries.ts
// Deduplicate common Supabase queries within a single render using React cache().
// cache() is request-scoped — layout and page share one DB call per request
// without ever serving stale data across navigations.

import { cache } from 'react'
import { createClient } from './server'

/**
 * Returns the authenticated user for the current request.
 * Deduplicated: layout + page share one getUser() call.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

/**
 * Returns the common profile fields needed by layout and most pages.
 * Deduplicated within a render — zero extra queries when layout + page both call this.
 */
export const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('plan, full_name, email, active_niche, has_onboarded, brand_voice, current_team_id')
    .eq('id', userId)
    .single()
  return data
})

/**
 * Returns all profile columns for the settings page.
 * Separate function so settings can get full data without over-fetching elsewhere.
 */
export const getCachedFullProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
})
