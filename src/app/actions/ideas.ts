'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { IdeaObject } from '@/types/niche'

export async function saveIdeaAction(title: string, niche: string = 'fitness', ideaData?: IdeaObject) {
  if (!title || title.trim().length === 0) return { error: 'Title is required' }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const hash = Buffer.from(title.trim()).toString('base64').substring(0, 64)

  const { data: existing } = await supabase
    .from('idea_history')
    .select('id')
    .eq('user_id', user.id)
    .eq('idea_hash', hash)
    .maybeSingle()

  let error

  if (existing) {
    const result = await supabase
      .from('idea_history')
      .update({
        saved: true,
        idea_data: ideaData || null,
        idea_title: title.trim(),
        used_at: new Date().toISOString(),
        status: 'backlog'
      })
      .eq('id', existing.id)
      .eq('user_id', user.id)
    error = result.error
  } else {
    const result = await supabase
      .from('idea_history')
      .insert({
        user_id: user.id,
        niche: niche,
        idea_title: title.trim(),
        idea_hash: hash,
        idea_data: ideaData || null,
        saved: true,
        used_at: new Date().toISOString(),
        status: 'backlog'
      })
    error = result.error
  }

  if (error) {
    console.error('Failed to save idea:', error)
    return { error: 'Failed to save idea' }
  }

  revalidatePath('/dashboard/ideas')
  return { success: true }
}

export async function updateIdeaStatusAction(ideaId: string, status: string) {
  if (!ideaId) return { error: 'Idea ID is required' }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('idea_history')
    .update({ status })
    .match({ id: ideaId, user_id: user.id })

  if (error) {
    console.error('Failed to update status:', error)
    return { error: 'Failed to update status' }
  }

  revalidatePath('/dashboard/ideas')
  return { success: true }
}

export async function deleteIdeaAction(ideaId: string) {
  if (!ideaId) return { error: 'Idea ID is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('idea_history')
    .delete()
    .match({ id: ideaId, user_id: user.id })

  if (error) {
    console.error('Failed to delete idea:', error)
    return { error: 'Failed to delete idea' }
  }

  revalidatePath('/dashboard/ideas')
  return { success: true }
}
