'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveIdeaAction(title: string, niche: string = 'fitness') {
  if (!title || title.trim().length === 0) return { error: 'Title is required' }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Simple base64 encoding for hash simulation (to match existing schema length constraint if any)
  const hash = Buffer.from(title.trim()).toString('base64').substring(0, 64)

  const { error } = await supabase
    .from('idea_history')
    .insert({
      user_id: user.id,
      niche: niche,
      idea_title: title.trim(),
      idea_hash: hash,
      used_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to save idea:', error)
    return { error: 'Failed to save idea' }
  }

  revalidatePath('/dashboard/ideas')
  return { success: true }
}
