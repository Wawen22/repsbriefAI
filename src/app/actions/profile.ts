'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateActiveNicheAction(nicheId: string) {
  if (!nicheId) return { error: 'Niche ID is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ active_niche: nicheId })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update niche:', error)
    return { error: 'Failed to update niche' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}
