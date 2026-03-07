'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { triggerWebhooks } from '@/lib/integrations/webhooks'

async function getActiveTeamId(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_team_id')
    .eq('id', userId)
    .single()
  return profile?.current_team_id
}

export async function scheduleIdeaAction({
  ideaId,
  scheduledDate,
  platform,
  title,
  hook,
  script,
  notes
}: {
  ideaId?: string;
  scheduledDate: string;
  platform: string;
  title: string;
  hook?: string;
  script?: string;
  notes?: string;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getActiveTeamId(supabase, user.id)
  if (!teamId) return { error: 'No active workspace found' }

  const { data, error } = await supabase
    .from('content_calendar')
    .insert({
      team_id: teamId,
      idea_id: ideaId || null,
      scheduled_date: scheduledDate,
      platform,
      title,
      hook,
      script_draft: script,
      notes
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to schedule idea:', error)
    return { error: 'Failed to add to calendar' }
  }

  // TRIGGER WEBHOOK
  await triggerWebhooks(teamId, 'content.scheduled', {
    calendar_id: data.id,
    title,
    platform,
    scheduled_date: scheduledDate,
    idea_id: ideaId || null
  })

  revalidatePath('/dashboard/calendar')
  return { success: true, calendarId: data.id }
}

export async function getCalendarEntriesAction(month?: number, year?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [] }

  const teamId = await getActiveTeamId(supabase, user.id)
  if (!teamId) return { data: [] }

  const { data, error } = await supabase
    .from('content_calendar')
    .select('*')
    .eq('team_id', teamId)
    .order('scheduled_date', { ascending: true })

  if (error) {
    console.error('Failed to fetch calendar:', error)
    return { data: [] }
  }

  return { data }
}

export async function updateCalendarEntryAction(id: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('content_calendar')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Failed to update calendar entry:', error)
    return { error: 'Failed to update entry' }
  }

  revalidatePath('/dashboard/calendar')
  return { success: true }
}

export async function deleteCalendarEntryAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('content_calendar')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete calendar entry:', error)
    return { error: 'Failed to delete' }
  }

  revalidatePath('/dashboard/calendar')
  return { success: true }
}
