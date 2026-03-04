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
})

// Accept 15-25 ideas (AI doesn't always nail exactly 20) — we trim or keep as-is
const BriefSchema = z.array(IdeaSchema).min(10).max(25)

export async function generateBrief(
  trendsData: TrendItem[], 
  ideaHistory: string[], 
  niche: NicheConfig
): Promise<IdeaObject[]> {
  // ── Pre-flight checks ───────────────────────────────────────────────────
  const provider = process.env.AI_PROVIDER ?? 'openai'
  const model = process.env.AI_MODEL

  if (!model) {
    throw new Error(`AI_MODEL env var is not set. Set it to a model supported by "${provider}" (e.g. gpt-4o-mini, gemini-1.5-flash).`)
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
    throw new Error(`API key for provider "${provider}" is missing. Set the corresponding env var (e.g. OPENAI_API_KEY, GEMINI_API_KEY).`)
  }

  const ai = getAIProvider()

  // ── Build prompt ────────────────────────────────────────────────────────
  let trendsSummary: string

  if (trendsData.length > 0) {
    trendsSummary = trendsData
      .slice(0, 80) // cap to avoid token overflow
      .map(t => `- [${t.source.toUpperCase()}] ${t.title}${t.score ? ` (score: ${t.score})` : ''}`)
      .join('\n')
  } else {
    // Fallback: no scraped data available — instruct AI to use its own knowledge
    trendsSummary = `No live scraped data is available right now. Use your knowledge of the latest trends in ${niche.label} to generate timely, relevant ideas. Focus on topics that are currently popular among ${niche.label} creators on social media.`
  }

  const historySection = ideaHistory.length > 0
    ? `\nAvoid repeating these previous ideas:\n${ideaHistory.slice(-50).join('\n')}`
    : ''

  const systemPrompt = `You are ${niche.claudePersona}. Your goal is to provide 20 fresh, high-impact content ideas for ${niche.label} creators based on current trends.`
  
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
  "whyItWorks": "1 sentence explanation based on the trend"
}

IMPORTANT:
- The "format" field MUST be one of exactly: "Reel", "Carousel", "Thread", "Newsletter"
- Respond ONLY with the JSON array. No markdown, no explanation, no wrapping object.
- The response must be valid parseable JSON starting with [ and ending with ]
`

  // ── Generate with retry ─────────────────────────────────────────────────
  let lastError: Error | null = null
  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Generator] Attempt ${attempt} — calling AI provider (${provider} / ${model})...`)
      const response = await ai.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], { jsonMode: true, maxTokens: 8192 })

      console.log(`[Generator] Attempt ${attempt} — provider: ${response.provider}, model: ${response.model}, tokens: ${response.tokensUsed ?? 'n/a'}`)
      console.log(`[Generator] Raw response (first 500 chars): ${response.text.substring(0, 500)}`)

      // Clean AI response — strip markdown fences, BOM, extra whitespace
      let text = response.text.trim()
      // Remove BOM
      text = text.replace(/^\uFEFF/, '')
      // Strip markdown code fences
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim()
      // If the response starts with a preamble before the array, extract the array
      const arrayStart = text.indexOf('[')
      const arrayEnd = text.lastIndexOf(']')
      if (arrayStart !== -1 && arrayEnd > arrayStart && !text.startsWith('[') && !text.startsWith('{')) {
        text = text.substring(arrayStart, arrayEnd + 1)
      }
      // Fix common JSON issues: trailing commas before ] or }
      text = text.replace(/,\s*([}\]])/g, '$1')

      let rawJson: unknown
      try {
        rawJson = JSON.parse(text)
      } catch (parseErr) {
        console.error(`[Generator] JSON parse failed. Cleaned text (first 500):\n${text.substring(0, 500)}`)
        throw new Error(`AI returned invalid JSON: ${text.substring(0, 300)}...`)
      }

      // Unwrap: some providers wrap in { "ideas": [...] } or similar
      let ideasArray: unknown
      if (Array.isArray(rawJson)) {
        ideasArray = rawJson
      } else if (typeof rawJson === 'object' && rawJson !== null) {
        const values = Object.values(rawJson as Record<string, unknown>)
        ideasArray = values.find(v => Array.isArray(v))
        if (!ideasArray) {
          throw new Error(`AI returned an object but no array field found. Keys: ${Object.keys(rawJson as Record<string, unknown>).join(', ')}`)
        }
      } else {
        throw new Error(`AI returned unexpected type: ${typeof rawJson}`)
      }

      const validated = BriefSchema.parse(ideasArray)

      // Trim to 20 if the AI gave more
      const final = validated.slice(0, 20)

      console.log(`[Generator] ✅ Brief validated: ${final.length} ideas via ${response.provider} (${response.model})`)
      return final
    } catch (err: any) {
      lastError = err
      console.error(`[Generator] Attempt ${attempt}/${maxAttempts} failed:`, err.message || err)

      // If it's a config error, don't retry
      if (err.message?.includes('API key') || err.message?.includes('env var')) {
        throw err
      }
    }
  }

  throw new Error(`Brief generation failed after ${maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown'}`)
}
