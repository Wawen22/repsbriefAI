'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAIProvider } from '@/lib/ai'

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

async function getCurrentTeamId(supabase: ServerSupabaseClient, userId: string) {
  const { data } = await supabase.from('profiles').select('current_team_id').eq('id', userId).single()
  return data?.current_team_id
}

async function persistTeamBrandVoice(
  supabase: ServerSupabaseClient,
  userId: string,
  teamId: string,
  writingSamples: string[] | null,
  brandVoice: string | null
) {
  const rpcResult = await supabase.rpc('update_team_brand_voice', {
    p_team_id: teamId,
    p_writing_samples: writingSamples,
    p_brand_voice: brandVoice,
  })

  if (!rpcResult.error) {
    return { success: true as const }
  }

  const isMissingFunction =
    rpcResult.error.code === '42883' ||
    rpcResult.error.message?.toLowerCase().includes('update_team_brand_voice')

  if (!isMissingFunction) {
    const isMissingColumn = rpcResult.error.code === '42703'
    if (!isMissingColumn) {
      return { success: false as const, error: rpcResult.error }
    }
  }

  const teamFallback = await supabase
    .from('teams')
    .update({
      brand_voice: brandVoice,
    })
    .eq('id', teamId)

  if (!teamFallback.error) {
    return { success: true as const }
  }

  // Legacy fallback for environments where team persona columns/policies are not aligned yet.
  const profilePayload: { brand_voice: string | null; writing_samples?: string[] | null } = {
    brand_voice: brandVoice,
  }
  profilePayload.writing_samples = writingSamples

  const profileFallback = await supabase
    .from('profiles')
    .update(profilePayload)
    .eq('id', userId)

  if (!profileFallback.error) {
    return { success: true as const }
  }

  return {
    success: false as const,
    error: {
      code: profileFallback.error.code,
      message: `Team fallback failed: ${teamFallback.error.message}. Profile fallback failed: ${profileFallback.error.message}`,
    },
  }
}

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

export async function analyzeBrandVoiceAction(samples: string[]) {
  if (!samples || samples.length === 0) return { error: 'At least one sample is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getCurrentTeamId(supabase, user.id)
  if (!teamId) return { error: 'No active workspace' }

  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (membershipError || !membership) {
    console.error('[Brand Voice Action] Membership check failed:', membershipError)
    return { error: 'You do not have access to this workspace' }
  }

  if (!['owner', 'admin'].includes(membership.role)) {
    return { error: 'Only workspace owners/admins can update Brand Voice' }
  }

  const ai = getAIProvider()
  
  const systemPrompt = `You are a world-class linguistic analyst and content strategist. 
Your goal is to analyze a set of writing samples from a creator and extract their unique "Brand Persona Profile".`

  const userPrompt = `
SAMPLES:
${samples.map((s, i) => `Sample ${i+1}:\n${s}`).join('\n\n')}

Analyze these samples and provide a concise "Style Profile" (max 3 sentences). 
Focus on:
- Sentence structure (short/punchy vs long/descriptive)
- Tone (aggressive, friendly, academic, ironic)
- Vocabulary & Emoji usage
- Formatting preferences (use of bullet points, caps, etc.)

Return ONLY the plain text analysis.
`

  try {
    const response = await ai.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { maxTokens: 240 })

    const analysis = response.text
      .replace(/\s+/g, ' ')
      .trim()

    if (!analysis) {
      return { error: 'AI returned an empty style profile. Please try with longer samples.' }
    }

    const persistResult = await persistTeamBrandVoice(supabase, user.id, teamId, samples, analysis)
    if (!persistResult.success) {
      console.error('[Brand Voice Action] Persist failed:', persistResult.error)
      return { error: 'Unable to save Brand Voice. Check workspace permissions and try again.' }
    }

    revalidatePath('/dashboard/settings')
    return { success: true, analysis }
  } catch (err: unknown) {
    console.error('[Brand Voice Action] Error:', err)
    return { error: 'Failed to analyze brand persona. Please retry in a moment.' }
  }
}

export async function updateBrandVoiceAction(rawSamples: string) {
  const samples = rawSamples
    .split(/\n\s*\n/)
    .map((sample) => sample.trim())
    .filter(Boolean)

  const result = await analyzeBrandVoiceAction(samples)
  if ('error' in result && result.error) {
    return { success: false, error: result.error }
  }

  return { success: true, data: result.analysis ?? '' }
}

export async function resetBrandPersonaAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const teamId = await getCurrentTeamId(supabase, user.id)
  if (!teamId) return { error: 'No active workspace' }

  const persistResult = await persistTeamBrandVoice(supabase, user.id, teamId, null, null)
  if (!persistResult.success) {
    console.error('Failed to reset persona:', persistResult.error)
    return { error: 'Failed to reset persona' }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function completeOnboardingAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ has_onboarded: true })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to complete onboarding:', error)
    return { error: 'Failed to update onboarding status' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
