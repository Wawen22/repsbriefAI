'use server'

import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import { IdeaObject } from '@/types/niche'

export async function remixScriptAction(
  idea: IdeaObject, 
  instruction: string,
  niche: string = 'fitness'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const ai = getAIProvider()
  
  const systemPrompt = `You are a professional content strategist and world-class copywriter for ${niche} creators. 
Your goal is to refine and remix an existing content brief based on specific user instructions while maintaining high-engagement standards.`

  const userPrompt = `
ORIGINAL BRIEF:
Title: ${idea.title}
Current Hook: ${idea.hook}
Current Script: ${idea.scriptDraft || idea.description}

REMIX INSTRUCTION: 
"${instruction}"

Please return a JSON object with the remixed content:
{
  "newHook": "The new attention-grabbing opening",
  "newScript": "The full refined script or structure",
  "explanation": "1 short sentence on what was changed"
}

IMPORTANT: Respond ONLY with valid JSON.
`

  try {
    const response = await ai.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { jsonMode: true })

    let text = response.text.trim()
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim()
    
    const result = JSON.parse(text)
    return { success: true, data: result }
  } catch (err: any) {
    console.error('[Remix Action] Error:', err)
    return { error: 'AI failed to remix the script. Please try again.' }
  }
}
