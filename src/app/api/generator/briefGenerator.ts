// src/app/api/generator/briefGenerator.ts

import { getAIProvider } from '@/lib/ai'
import { z } from 'zod'
import { NicheConfig, TrendItem, IdeaObject } from '@/types/niche'

const IdeaSchema = z.object({
  title: z.string(),
  hook: z.string(),
  description: z.string(),
  format: z.enum(['Reel', 'Carousel', 'Thread', 'Newsletter']),
  whyItWorks: z.string()
})

const BriefSchema = z.array(IdeaSchema).length(20)

export async function generateBrief(
  trendsData: TrendItem[], 
  ideaHistory: string[], 
  niche: NicheConfig
): Promise<IdeaObject[]> {
  const ai = getAIProvider()
  
  const trendsSummary = trendsData
    .map(t => `- [${t.source.toUpperCase()}] ${t.title}`)
    .join('\n')

  const systemPrompt = `You are ${niche.claudePersona}. Your goal is to provide 20 fresh, high-impact content ideas for ${niche.label} creators based on current trends.`
  
  const userPrompt = `
    Analyze the following trends from the last 7 days:
    ${trendsSummary}

    Avoid repeating these previous ideas:
    ${ideaHistory.join(', ')}

    Return a JSON array of exactly 20 content ideas. Each idea must follow this structure:
    {
      "title": "Short catchy title",
      "hook": "An attention-grabbing first line/opening",
      "description": "2-3 sentences explaining the core content",
      "format": "Reel | Carousel | Thread | Newsletter",
      "whyItWorks": "1 sentence explanation based on the trend"
    }

    Respond ONLY with the JSON array.
  `

  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    try {
      const response = await ai.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { jsonMode: true, maxTokens: 4096 })

      console.log(`[Generator] RAW AI Response:`, response.text)

      const rawJson = JSON.parse(response.text)
      
      // Some providers might wrap the array in an object (e.g. { "ideas": [...] })
      const ideasArray = Array.isArray(rawJson) ? rawJson : (rawJson.ideas || Object.values(rawJson)[0])
      
      const validatedBrief = BriefSchema.parse(ideasArray)
      
      console.log(`[Generator] Successfully generated brief using ${response.provider} (${response.model})`)
      return validatedBrief
    } catch (err: any) {
      attempts++
      console.error(`[Generator] Attempt ${attempts} failed:`, err.message || err)
      if (attempts === maxAttempts) {
        throw new Error('Failed to generate a valid brief after 2 attempts.')
      }
    }
  }

  throw new Error('Unknown error in brief generator.')
}
