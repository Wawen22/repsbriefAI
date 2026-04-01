'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { IdeaObject } from '@/types/niche'

export async function createShareAction(
  idea: IdeaObject,
  niche: string
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const supabaseAdmin = getSupabaseAdmin('actions/share')
  const { data, error } = await supabaseAdmin
    .from('shared_strategies')
    .insert({
      user_id: user.id,
      idea_data: idea,
      niche,
      creator_name: profile?.full_name || user.email?.split('@')[0] || 'Creator',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[Share] Insert failed:', error)
    return { error: 'Failed to create share link' }
  }

  return { id: data.id }
}
