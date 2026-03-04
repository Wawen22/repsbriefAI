// src/app/api/generator/briefGenerator.ts

import { getAIProvider } from '@/lib/ai'
import { z } from 'zod'
import { NicheConfig, TrendItem, IdeaObject } from '@/types/niche'
import { createClient } from '@/lib/supabase/server'

const IdeaSchema = z.object({
  title: z.string().min(1),
  hook: z.string().min(1),
  description: z.string().min(1),
  format: z.enum(['Reel', 'Carousel', 'Thread', 'Newsletter']),
  whyItWorks: z.string().min(1),
  scriptDraft: z.string().optional(),
  alternativeHooks: z.array(z.string()).optional(),
  trendingAudioSuggestion: z.string().optional(),
  keyVisuals: z.string().optional(),
})

const BriefSchema = z.array(IdeaSchema).min(10).max(25)

export async function generateBrief(
  trendsData: TrendItem[], 
  ideaHistory: string[], 
  niche: NicheConfig,
  userId?: string
): Promise<IdeaObject[]> {
  // ── Pre-flight checks ───────────────────────────────────────────────────
  const provider = process.env.AI_PROVIDER ?? 'openai'
  const model = process.env.AI_MODEL

  if (!model) {
    throw new Error(`AI_MODEL env var is not set. Set it to a model supported by "${provider}" (e.g. gpt-4o-mini, gemini-1.5-flash).`)
  }

  // Fetch user brand voice if available
  let brandVoice = ""
  if (userId) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_voice')
      .eq('id', userId)
      .single()
    
    if (profile?.brand_voice) {
      brandVoice = `\n\nUSER'S UNIQUE BRAND VOICE PROFILE:\n${profile.brand_voice}\nIMPORTANT: You MUST write all hooks and scripts in this exact style and tone. This is the most critical requirement.`
    }
  }

  // Validate that the required API key exists for the chosen provider
  const keyMap: Record<string, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    azure: process.env.AZURE_OPENAI_API_KEY,
    groq: process.env.GROQ_API_KEY,
  }

  if (!keyMap[provider]) {
    throw new Error(`API key for provider "${provider}" is missing.`)
  }

  const ai = getAIProvider()

  // ── Build prompt ────────────────────────────────────────────────────────
  let trendsSummary: string

  if (trendsData.length > 0) {
    trendsSummary = trendsData
      .slice(0, 80)
      .map(t => `- [${t.source.toUpperCase()}] ${t.title}${t.score ? ` (score: ${t.score})` : ''}`)
      .join('\n')
  } else {
    trendsSummary = `No live scraped data is available right now. Use your knowledge of the latest trends in ${niche.label} to generate timely ideas.`
  }

  const historySection = ideaHistory.length > 0
    ? `\nAvoid repeating these previous ideas:\n${ideaHistory.slice(-50).join('\n')}`
    : ''

  const systemPrompt = `You are ${niche.claudePersona}. Your goal is to provide 20 fresh, high-impact content ideas for ${niche.label} creators based on current trends. 
You provide extremely detailed strategies for every idea to help creators execute immediately.${brandVoice}`
  
  const userPrompt = `
Analyze the following trends from the last 7 days:
${trendsSummary}
${historySection}

Return a JSON array of exactly 20 content ideas. Each idea MUST follow this exact structure:
{
  "title": "Short catchy title",
  "hook": "An attention-grabbing first line/opening",
  "description": "2-3 sentences explaining the core content",
  "format": "Reel" | "Carousel" | "Thread" | "Newsletter",
  "whyItWorks": "1 sentence explanation based on the trend",
  "scriptDraft": "A brief script or bullet-point structure for the content",
  "alternativeHooks": ["Alternative 1", "Alternative 2"],
  "trendingAudioSuggestion": "Description of the type of music or specific trending sound style",
  "keyVisuals": "Description of what should be shown on screen"
}

IMPORTANT:
- Respond ONLY with the JSON array.
`

  // ── Generate with retry ─────────────────────────────────────────────────
  let lastError: Error | null = null
  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], { jsonMode: true, maxTokens: 8192 })

      let text = response.text.trim()
      text = text.replace(/^\uFEFF/, '')
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim()
      const arrayStart = text.indexOf('[')
      const arrayEnd = text.lastIndexOf(']')
      if (arrayStart !== -1 && arrayEnd > arrayStart) {
        text = text.substring(arrayStart, arrayEnd + 1)
      }

      const ideasArray = JSON.parse(text)
      const validated = BriefSchema.parse(Array.isArray(ideasArray) ? ideasArray : [])
      return validated.slice(0, 20)
    } catch (err: any) {
      lastError = err
      if (err.message?.includes('API key')) throw err
    }
  }

  throw new Error(`Brief generation failed after ${maxAttempts} attempts.`)
}
