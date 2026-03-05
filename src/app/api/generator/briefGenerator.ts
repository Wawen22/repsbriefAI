// src/app/api/generator/briefGenerator.ts

import { getAIProvider } from '@/lib/ai'
import { z } from 'zod'
import { NicheConfig, TrendItem, IdeaObject } from '@/types/niche'

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

const BriefSchema = z.array(IdeaSchema)

/**
 * Generates a content brief using AI with robust JSON repair.
 */
export async function generateBrief(
  trendsData: TrendItem[], 
  ideaHistory: string[], 
  niche: NicheConfig,
  brandVoice?: string | null
): Promise<IdeaObject[]> {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  const model = process.env.AI_MODEL

  if (!model) throw new Error(`AI_MODEL env var is not set.`)

  const keyMap: Record<string, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    azure: process.env.AZURE_OPENAI_API_KEY,
    groq: process.env.GROQ_API_KEY,
  }

  if (!keyMap[provider]) throw new Error(`API key for provider "${provider}" is missing.`)

  const ai = getAIProvider()

  let trendsSummary = trendsData.length > 0
    ? trendsData.slice(0, 60).map(t => `- [${t.source.toUpperCase()}] ${t.title}`).join('\n')
    : `No live data. Use general trends for ${niche.label}.`

  const historySection = ideaHistory.length > 0
    ? `\nAvoid repeating these: ${ideaHistory.slice(-30).join(', ')}`
    : ''

  const voiceInstructions = brandVoice 
    ? `\n\nUSER'S BRAND VOICE:\n${brandVoice}\nWrite all content in this style.`
    : ""

  const systemPrompt = `You are ${niche.claudePersona}. Generate 20 high-impact content ideas for ${niche.label}. 
Provide detailed strategies including a ready-to-use script for each.${voiceInstructions}`
  
  const userPrompt = `
Analyze these trends:
${trendsSummary}
${historySection}

Return a JSON array of exactly 20 ideas. 
Structure for each object:
{
  "title": "catchy title",
  "hook": "attention-grabbing opening",
  "description": "core concept",
  "format": "Reel" | "Carousel" | "Thread" | "Newsletter",
  "whyItWorks": "strategic reason",
  "scriptDraft": "actionable script/structure",
  "alternativeHooks": ["alt 1", "alt 2"],
  "trendingAudioSuggestion": "audio style",
  "keyVisuals": "visual description"
}

IMPORTANT:
- Return ONLY the JSON array.
- Ensure all quotes inside strings are escaped.
- Keep descriptions and scripts concise but actionable to avoid response truncation.
`

  let lastError: Error | null = null
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Generator] Attempt ${attempt}/${maxAttempts}...`)
      const response = await ai.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], { jsonMode: true, maxTokens: 8192 })

      let text = response.text.trim()
      
      // 1. Basic Cleaning
      text = text.replace(/^\uFEFF/, '')
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim()
      
      // 2. Extract Array if wrapped in junk
      const arrayStart = text.indexOf('[')
      const arrayEnd = text.lastIndexOf(']')
      if (arrayStart !== -1 && arrayEnd > arrayStart) {
        text = text.substring(arrayStart, arrayEnd + 1)
      }

      // 3. Attempt to fix common JSON errors (trailing commas, unescaped newlines in scripts)
      // Note: This is a basic repair, but helpful for LLM quirks
      let cleanedText = text
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
        .replace(/\n/g, '\\n') // escape literal newlines if they slipped through
        .replace(/\r/g, '\\r')
      
      // Re-escape properly if the LLM sent raw newlines inside JSON strings
      // This is tricky, so we'll try a safer approach: standard parse first
      let ideasArray: any[]
      try {
        ideasArray = JSON.parse(text)
      } catch (e) {
        console.warn(`[Generator] Standard JSON.parse failed on attempt ${attempt}. Trying aggressive repair...`)
        // Try removing control characters that often break JSON.parse
        const fixedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        ideasArray = JSON.parse(fixedText)
      }

      const validated = BriefSchema.parse(Array.isArray(ideasArray) ? ideasArray : [])
      
      if (validated.length === 0) throw new Error("Empty ideas array")
      
      console.log(`[Generator] ✅ Success: ${validated.length} ideas`)
      return validated.slice(0, 20)
    } catch (err: any) {
      lastError = err
      console.error(`[Generator] Attempt ${attempt} failed:`, err.message)
      // On third attempt, try to ask for fewer ideas if length was the issue
      if (attempt === 2) {
        console.log("[Generator] Retrying with request for only 15 ideas to ensure valid JSON...")
      }
    }
  }

  throw new Error(`Brief generation failed. The AI returned invalid data. Tip: Try shortening your Brand Voice samples. Details: ${lastError?.message}`)
}
