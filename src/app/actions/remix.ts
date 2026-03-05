// src/app/actions/remix.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { getAIProvider } from "@/lib/ai"
import { IdeaObject } from "@/types/niche"
import { jsonrepair } from "jsonrepair"

export async function remixScriptAction(idea: IdeaObject, instruction: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_voice')
    .eq('id', user.id)
    .single()

  const brandPersona = profile?.brand_voice
    ? `\n\nUSER'S UNIQUE CONTENT PERSONA (Tone & Style):\n${profile.brand_voice}\nIMPORTANT: You MUST write the remixed hook and script strictly following this persona. If the persona is "ironic", make the remix ironic. If it's "minimalist", keep it short. Avoid generic corporate language.`
    : ''

  const ai = getAIProvider()
  
  try {
    const prompt = `
Original Strategy:
Title: ${idea.title}
Hook: ${idea.hook}
Script: ${idea.scriptDraft || idea.description}

Remix Instruction: ${instruction}
${brandPersona}

Task: Rewrite the Hook and the Script Draft based on the instruction while maintaining the core concept but adapting it to the User Persona provided above.

Return ONLY a JSON object:
{
  "newHook": "...",
  "newScript": "...",
  "explanation": "Short reason why this remix works"
}
`

    const res = await ai.complete([
      { role: 'system', content: 'You are an expert content strategist and copywriter. Return ONLY pure JSON.' },
      { role: 'user', content: prompt }
    ], { jsonMode: true })

    let cleanText = res.text.replace(/```json|```/gi, '').trim()
    try {
      const data = JSON.parse(jsonrepair(cleanText))
      return { success: true, data }
    } catch (parseErr) {
      console.error('[Remix Action] JSON Parse Error:', parseErr, 'Raw text:', res.text)
      return { success: false, error: 'AI returned invalid format. Please try again.' }
    }
  } catch (err) {
    console.error('[Remix Action] Error:', err)
    return { success: false, error: 'Failed to connect to AI engine.' }
  }
}
