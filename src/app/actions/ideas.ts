'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { IdeaObject } from '@/types/niche'

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

type IdeaHistoryUpdate = {
  status: string
  published_at?: string
}

async function getCurrentTeamId(supabase: ServerSupabaseClient, userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_team_id, full_name, email')
    .eq('id', userId)
    .single()

  if (profile?.current_team_id) return profile.current_team_id

  // Auto-create personal workspace for users who signed up before the workspace migration
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'My'
  const { data: team } = await supabase
    .from('teams')
    .insert({ name: `${displayName}'s Workspace`, owner_id: userId })
    .select('id')
    .single()

  if (!team) return null

  await supabase.from('team_members').insert({ team_id: team.id, user_id: userId, role: 'owner' })
  await supabase.from('profiles').update({ current_team_id: team.id }).eq('id', userId)

  return team.id
}

export async function saveIdeaAction(
  title: string, 
  niche: string = 'fitness', 
  ideaData?: IdeaObject,
  status: string = 'backlog'
) {
  if (!title || title.trim().length === 0) return { error: 'Title is required' }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getCurrentTeamId(supabase, user.id)
  if (!teamId) return { error: 'No active workspace found' }

  const hash = Buffer.from(title.trim()).toString('base64').substring(0, 64)

  const { data: existing } = await supabase
    .from('idea_history')
    .select('id, status, approval_status')
    .eq('team_id', teamId)
    .eq('idea_hash', hash)
    .maybeSingle()

  let error
  let newId

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const isTeamPlan = profile?.plan === 'team'
  const initialApprovalStatus = isTeamPlan ? 'draft' : 'approved'

  if (existing) {
    const result = await supabase
      .from('idea_history')
      .update({
        saved: true,
        idea_data: ideaData || null,
        idea_title: title.trim(),
        used_at: new Date().toISOString(),
        status: existing.status || status,
        approval_status: isTeamPlan ? (existing.approval_status || 'draft') : 'approved'
      })
      .eq('id', existing.id)
      .eq('team_id', teamId)
      .select('id')
      .single()
    
    error = result.error
    newId = result.data?.id
  } else {
    const result = await supabase
      .from('idea_history')
      .insert({
        user_id: user.id, // Original creator
        team_id: teamId,  // Owned by workspace
        niche: niche,
        idea_title: title.trim(),
        idea_hash: hash,
        idea_data: ideaData || null,
        saved: true,
        used_at: new Date().toISOString(),
        status: status,
        approval_status: initialApprovalStatus
      })
      .select('id')
      .single()
    
    error = result.error
    newId = result.data?.id
  }

  if (error) {
    console.error('Persistence Error:', error)
    return { error: `Failed to persist idea: ${error.message} (${error.code})` }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ideas')
  revalidatePath('/dashboard/history')
  
  return { success: true, id: newId }
}

export async function shareIdeaAction(idea: IdeaObject, niche: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getCurrentTeamId(supabase, user.id)

  const { data, error } = await supabase
    .from('shared_strategies')
    .insert({
      user_id: user.id,
      team_id: teamId,
      idea_data: idea,
      niche: niche,
      creator_name: user.user_metadata?.full_name || user.email?.split('@')[0]
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to share idea:', error)
    return { error: 'Failed to generate share link' }
  }

  return { success: true, shareId: data.id }
}

export async function updateIdeaStatusAction(ideaId: string, status: string) {
  if (!ideaId) return { error: 'Idea ID is required' }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getCurrentTeamId(supabase, user.id)

  const updateData: IdeaHistoryUpdate = { status }
  if (status === 'published') {
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('idea_history')
    .update(updateData)
    .match({ id: ideaId, team_id: teamId })

  if (error) {
    console.error('Failed to update status:', error)
    return { error: 'Failed to update status' }
  }

  revalidatePath('/dashboard/ideas')
  return { success: true }
}

export async function updatePerformanceAction(
  ideaId: string, 
  data: { 
    performance_score?: number, 
    views_count?: number, 
    performance_notes?: string 
  }
) {
  if (!ideaId) return { error: 'Idea ID is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getCurrentTeamId(supabase, user.id)

  const { error } = await supabase
    .from('idea_history')
    .update(data)
    .match({ id: ideaId, team_id: teamId })

  if (error) {
    console.error('Failed to update performance:', error)
    return { error: 'Failed to update performance' }
  }

  revalidatePath('/dashboard/ideas')
  return { success: true }
}

export async function deleteIdeaAction(ideaId: string) {
  if (!ideaId) return { error: 'Idea ID is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getCurrentTeamId(supabase, user.id)

  const { error } = await supabase
    .from('idea_history')
    .delete()
    .match({ id: ideaId, team_id: teamId })

  if (error) {
    console.error('Failed to delete idea:', error)
    return { error: 'Failed to delete idea' }
  }

  revalidatePath('/dashboard/ideas')
  revalidatePath('/dashboard')
  return { success: true }
}
