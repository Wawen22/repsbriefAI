// src/lib/supabase/cached-queries.ts
// Deduplicate common Supabase queries within a request using React cache(),
// and cache stable profile data across requests with unstable_cache.
//
// IMPORTANT: unstable_cache cannot access cookies() — the cache boundary
// is serialization-safe and cookies are a dynamic data source. We use the
// service role client (no cookies) inside cached functions, passing userId
// as a plain argument. Auth is always resolved outside the cache.

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from './server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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
 * Invalidated via revalidateTag(`profile-${userId}`, { expire: 0 }) in actions.
 */
export function getCachedProfile(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = getServiceClient()
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
 */
export function getCachedFullProfile(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = getServiceClient()
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
