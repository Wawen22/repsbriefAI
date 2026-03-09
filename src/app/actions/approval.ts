'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { dispatchWebhookEvent } from '@/lib/jobs/webhookQueue'

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

async function getUserRole(supabase: ServerSupabaseClient, userId: string, teamId: string) {
  const { data } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .single()
  return data?.role // 'owner', 'admin', 'member'
}

export async function submitForApprovalAction(ideaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('idea_history')
    .update({ 
      approval_status: 'pending',
      updated_at: new Date().toISOString() 
    })
    .eq('id', ideaId)

  if (error) return { error: 'Failed to submit for approval' }
  
  revalidatePath(`/dashboard/strategy/${ideaId}`)
  return { success: true }
}

export async function approveIdeaAction(ideaId: string, teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const role = await getUserRole(supabase, user.id, teamId)
  if (role !== 'owner' && role !== 'admin') {
    return { error: 'Only owners or admins can approve content' }
  }

  const { data: idea, error } = await supabase
    .from('idea_history')
    .update({ 
      approval_status: 'approved',
      reviewer_id: user.id,
      updated_at: new Date().toISOString() 
    })
    .eq('id', ideaId)
    .select('*')
    .single()

  if (error) return { error: 'Failed to approve idea' }

  // TRIGGER WEBHOOK
  await dispatchWebhookEvent({
    teamId,
    event: 'idea.approved',
    dedupeKey: `idea-approved:${idea.id}:${idea.updated_at}`,
    payload: {
    idea_id: idea.id,
    title: idea.idea_title,
    data: idea.idea_data,
    approved_by: user.id,
    approved_at: idea.updated_at
    },
  })

  revalidatePath(`/dashboard/strategy/${ideaId}`)
  revalidatePath('/dashboard/ideas')
  return { success: true }
}

export async function rejectIdeaAction(ideaId: string, teamId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const role = await getUserRole(supabase, user.id, teamId)
  if (role !== 'owner' && role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('idea_history')
    .update({ 
      approval_status: 'rejected',
      feedback_notes: notes,
      reviewer_id: user.id,
      updated_at: new Date().toISOString() 
    })
    .eq('id', ideaId)

  if (error) return { error: 'Failed to reject idea' }

  revalidatePath(`/dashboard/strategy/${ideaId}`)
  return { success: true }
}
