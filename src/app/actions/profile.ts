'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAIProvider } from '@/lib/ai'

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
    ], { maxTokens: 200 })

    const analysis = response.text.trim()

    const { error } = await supabase
      .from('profiles')
      .update({ 
        writing_samples: samples,
        brand_voice: analysis 
      })
      .eq('id', user.id)

    if (error) throw error

    revalidatePath('/dashboard/settings')
    return { success: true, analysis }
  } catch (err: unknown) {
    console.error('[Brand Voice Action] Error:', err)
    return { error: 'Failed to analyze brand persona.' }
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

  return { success: true, data: result.analysis }
}

export async function resetBrandPersonaAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      writing_samples: null,
      brand_voice: null 
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to reset persona:', error)
    return { error: 'Failed to reset persona' }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
