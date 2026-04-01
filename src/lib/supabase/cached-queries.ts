// src/lib/supabase/cached-queries.ts
// Deduplicate common Supabase queries within a request using React cache(),
// and cache stable profile data across requests with unstable_cache.

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from './server'

/**
 * Returns the authenticated user for the current request.
 * React cache() deduplicates calls within a single render pass —
 * layout + page share one network call instead of each making their own.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

/**
 * Returns the profile row for the given userId.
 * unstable_cache persists the result for 30 seconds across navigations,
 * keyed per user. This avoids re-fetching plan/voice/team on every page visit.
 * Call revalidateProfileCache(userId) whenever the profile is updated.
 */
export function getCachedProfile(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('plan, full_name, email, active_niche, has_onboarded, brand_voice, current_team_id, niche_preferences')
        .eq('id', userId)
        .single()
      return data
    },
    ['profile', userId],
    { revalidate: 30, tags: [`profile-${userId}`] }
  )()
}

/**
 * Returns the full profile row (all columns) for settings pages.
 * Shorter TTL since settings page shows everything.
 */
export function getCachedFullProfile(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return data
    },
    ['profile-full', userId],
    { revalidate: 10, tags: [`profile-${userId}`] }
  )()
}
