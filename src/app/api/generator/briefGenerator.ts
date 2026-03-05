// src/app/api/generator/briefGenerator.ts

import { getAIProvider } from '@/lib/ai'
import type { AIProvider } from '@/lib/ai/types'
import { jsonrepair } from 'jsonrepair'
import { z } from 'zod'
import { NicheConfig, TrendItem, IdeaObject } from '@/types/niche'

const VALID_FORMATS = ['Reel', 'Carousel', 'Thread', 'Newsletter'] as const

const IdeaSchema = z.object({
  title: z.string().min(1).max(140),
  hook: z.string().min(1).max(220),
  description: z.string().min(1).max(700),
  format: z.enum(VALID_FORMATS),
  whyItWorks: z.string().min(1).max(700),
  scriptDraft: z.string().min(1).max(1200).optional(),
  alternativeHooks: z.array(z.string().min(1).max(220)).max(5).optional(),
  trendingAudioSuggestion: z.string().min(1).max(220).optional(),
  keyVisuals: z.string().min(1).max(260).optional(),
})

const BriefSchema = z.array(IdeaSchema).min(1).max(30)

const DEFAULT_TOTAL_IDEAS = 20
const MAX_BATCH_ATTEMPTS = 4
const SINGLE_SHOT_ATTEMPTS = 2

type IdeaRecord = Record<string, unknown>
type GenerationProfile = {
  skipSingleShot: boolean
  singleShotAttempts: number
  chunkBatchSize: number
  chunkMaxAttempts: number
  maxOutputTokensCap: number
}
type BatchResult = {
  ideas: IdeaObject[]
  attemptsUsed: number
  elapsedMs: number
}

function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/\r/g, '')
    .trim()
    .slice(0, maxLength)
}

function readString(record: IdeaRecord, keys: string[], maxLength = 1200): string | undefined {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') {
      const clean = sanitizeText(value, maxLength)
      if (clean) return clean
    }
  }
  return undefined
}

function normalizeFormat(raw: string | undefined): (typeof VALID_FORMATS)[number] | undefined {
  if (!raw) return undefined
  const value = raw.toLowerCase()
  if (value.includes('reel') || value.includes('short')) return 'Reel'
  if (value.includes('carou') || value.includes('slide')) return 'Carousel'
  if (value.includes('thread') || value.includes('tweet') || value.includes('x ')) return 'Thread'
  if (value.includes('news') || value.includes('email')) return 'Newsletter'
  return undefined
}

function normalizeAltHooks(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const hooks = value
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => sanitizeText(entry, 220))
      .filter(Boolean)
      .slice(0, 5)
    return hooks.length ? hooks : undefined
  }

  if (typeof value === 'string') {
    const hooks = value
      .split(/\n|;|\|/)
      .map((entry) => sanitizeText(entry, 220))
      .filter(Boolean)
      .slice(0, 5)
    return hooks.length ? hooks : undefined
  }

  return undefined
}

function normalizeIdeaCandidate(candidate: unknown): IdeaObject | null {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null
  const record = candidate as IdeaRecord

  const title = readString(record, ['title', 'ideaTitle', 'headline'], 140)
  const hook = readString(record, ['hook', 'openingHook', 'introHook'], 220)
  const description = readString(record, ['description', 'angle', 'concept'], 700)
  const whyItWorks = readString(record, ['whyItWorks', 'why_it_works', 'reason'], 700)
  const formatRaw = readString(record, ['format', 'contentFormat', 'type'], 60)
  const format = normalizeFormat(formatRaw)

  if (!title || !hook || !description || !whyItWorks || !format) return null

  const scriptDraft = readString(record, ['scriptDraft', 'script_draft', 'script', 'outline'], 1200)
  const trendingAudioSuggestion = readString(
    record,
    ['trendingAudioSuggestion', 'audioSuggestion', 'audio_style'],
    220
  )
  const keyVisuals = readString(record, ['keyVisuals', 'visuals', 'key_visuals'], 260)
  const alternativeHooks = normalizeAltHooks(record.alternativeHooks ?? record.alternative_hooks)

  return {
    title,
    hook,
    description,
    format,
    whyItWorks,
    scriptDraft,
    alternativeHooks,
    trendingAudioSuggestion,
    keyVisuals,
  }
}

function extractBalancedJson(source: string, openChar: '{' | '[', closeChar: '}' | ']'): string | null {
  const start = source.indexOf(openChar)
  if (start === -1) return null

  let depth = 0
  let quote: '"' | "'" | null = null
  let escaped = false

  for (let index = start; index < source.length; index += 1) {
    const char = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === openChar) depth += 1
    if (char === closeChar) depth -= 1

    if (depth === 0) {
      return source.slice(start, index + 1)
    }
  }

  return null
}

function getCandidateJsonStrings(rawText: string): string[] {
  const cleaned = rawText
    .replace(/^\uFEFF/, '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const candidates = new Set<string>()
  if (cleaned) candidates.add(cleaned)

  const balancedArray = extractBalancedJson(cleaned, '[', ']')
  if (balancedArray) candidates.add(balancedArray)

  const balancedObject = extractBalancedJson(cleaned, '{', '}')
  if (balancedObject) candidates.add(balancedObject)

  const firstArray = cleaned.indexOf('[')
  const lastArray = cleaned.lastIndexOf(']')
  if (firstArray !== -1 && lastArray > firstArray) {
    candidates.add(cleaned.slice(firstArray, lastArray + 1))
  }

  const firstObject = cleaned.indexOf('{')
  const lastObject = cleaned.lastIndexOf('}')
  if (firstObject !== -1 && lastObject > firstObject) {
    candidates.add(cleaned.slice(firstObject, lastObject + 1))
  }

  return Array.from(candidates)
}

function extractIdeaArray(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return null

  const record = payload as Record<string, unknown>
  const knownKeys = ['ideas', 'items', 'brief', 'results', 'data']
  for (const key of knownKeys) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }

  return null
}

function parseIdeasFromRawText(rawText: string): IdeaObject[] {
  const candidates = getCandidateJsonStrings(rawText)
  const parseErrors: string[] = []

  for (const candidate of candidates) {
    const parseVariants = [candidate]
    try {
      parseVariants.push(jsonrepair(candidate))
    } catch {
      // Ignore and continue with raw candidate.
    }

    for (const variant of parseVariants) {
      try {
        const parsed = JSON.parse(variant) as unknown
        const ideaArray = extractIdeaArray(parsed)
        if (!ideaArray) continue

        const normalized = ideaArray
          .map((entry) => normalizeIdeaCandidate(entry))
          .filter((entry): entry is IdeaObject => entry !== null)

        const validated = BriefSchema.parse(normalized)
        if (validated.length > 0) return validated
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown parse error'
        parseErrors.push(message)
      }
    }
  }

  const reason = parseErrors[parseErrors.length - 1] || 'Unable to parse AI response'
  throw new Error(reason)
}

function titleKey(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim()
}

function getRetryDelayMs(errorMessage: string): number | null {
  const match = errorMessage.match(/retry in ([\d.]+)s/i)
  if (!match) return null
  const seconds = Number(match[1])
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  return Math.min(Math.ceil(seconds * 1000), 15000)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isGpt5Model(modelName: string): boolean {
  return /^gpt-5(\.|-|$)/i.test(modelName)
}

function getGenerationProfile(provider: string, model: string): GenerationProfile {
  const gpt5OnAzure = provider === 'azure' && isGpt5Model(model)

  if (gpt5OnAzure) {
    return {
      skipSingleShot: true,
      singleShotAttempts: 0,
      chunkBatchSize: 10,
      chunkMaxAttempts: 3,
      maxOutputTokensCap: 3400,
    }
  }

  return {
    skipSingleShot: false,
    singleShotAttempts: SINGLE_SHOT_ATTEMPTS,
    chunkBatchSize: 8,
    chunkMaxAttempts: MAX_BATCH_ATTEMPTS,
    maxOutputTokensCap: 4096,
  }
}

function estimateMaxTokens(count: number, cap: number): number {
  const estimated = 420 + count * 230
  return Math.max(1100, Math.min(cap, estimated))
}

function buildSystemPrompt(niche: NicheConfig, brandPersona?: string | null, highPerformers: string[] = []): string {
  const personaInstructions = brandPersona
    ? `\n\nUSER'S UNIQUE CONTENT PERSONA (Tone & Style):\n${sanitizeText(brandPersona, 2000)}\nIMPORTANT: Every Hook, Script, and Description MUST be written in this exact style. If the persona is technical, use technical language. If it is informal and ironic, use that tone. Avoid generic AI corporate speech.`
    : ''

  const topPerformers = highPerformers
    .slice(0, 4)
    .map((item) => sanitizeText(item, 300))
    .filter(Boolean)

  const performerInstructions = topPerformers.length
    ? `\n\nTOP PAST WINNERS TO LEARN FROM:\n${topPerformers.join('\n')}`
    : ''

  return `You are ${niche.claudePersona}. Create high-converting content ideas for ${niche.label}.${personaInstructions}${performerInstructions}`
}

function buildUserPrompt(params: {
  count: number
  trendsSummary: string
  excludedTitles: string[]
  attempt: number
}): string {
  const { count, trendsSummary, excludedTitles, attempt } = params
  const exclusionList = excludedTitles
    .slice(-40)
    .map((title) => `- ${sanitizeText(title, 110)}`)
    .join('\n')

  const strictMode = attempt >= 2
    ? '\nSTRICT MODE: keep every text compact. Do not exceed the character limits.'
    : ''

  return `
Trends to use:
${trendsSummary}

${exclusionList ? `Do not repeat these titles:\n${exclusionList}` : 'No exclusion list for this batch.'}

Generate exactly ${count} unique ideas.
Return ONLY valid JSON in this shape:
{"ideas":[{...}]}

Each idea object must contain:
- "title" (max 90 chars)
- "hook" (max 140 chars)
- "description" (max 260 chars)
- "format" ("Reel" | "Carousel" | "Thread" | "Newsletter")
- "whyItWorks" (max 260 chars)
- "scriptDraft" (max 500 chars)
- "alternativeHooks" (array with max 2 hooks, each max 120 chars)
- "trendingAudioSuggestion" (max 120 chars)
- "keyVisuals" (max 140 chars)

Rules:
- JSON must be syntactically valid.
- Use double quotes for keys and strings.
- Escape internal double quotes in string values.
- Do not include markdown fences or extra text.${strictMode}
`
}

async function generateBatch(params: {
  ai: AIProvider
  systemPrompt: string
  trendsSummary: string
  excludedTitles: string[]
  count: number
  maxAttempts?: number
  maxTokensCap?: number
}): Promise<BatchResult> {
  const {
    ai,
    systemPrompt,
    trendsSummary,
    excludedTitles,
    count,
    maxAttempts = MAX_BATCH_ATTEMPTS,
    maxTokensCap = 4096,
  } = params

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`[Generator] Batch ${count} ideas - attempt ${attempt}/${maxAttempts}`)
      const start = Date.now()

      const response = await ai.complete(
        [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: buildUserPrompt({ count, trendsSummary, excludedTitles, attempt }),
          },
        ],
        {
          jsonMode: true,
          maxTokens: estimateMaxTokens(count, maxTokensCap),
          temperature: attempt >= 3 ? 0.2 : 0.4,
        }
      )

      const parsedIdeas = parseIdeasFromRawText(response.text)
      const excludedSet = new Set(excludedTitles.map((title) => titleKey(title)))
      const unique = parsedIdeas.filter((idea) => !excludedSet.has(titleKey(idea.title)))

      if (unique.length === 0) {
        throw new Error('No unique ideas parsed from model response')
      }

      return {
        ideas: unique.slice(0, count),
        attemptsUsed: attempt,
        elapsedMs: Date.now() - start,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown generation error'
      lastError = new Error(message)
      console.error(`[Generator] Batch attempt ${attempt} failed: ${message}`)

      const retryDelay = getRetryDelayMs(message)
      if (retryDelay && attempt < maxAttempts) {
        await sleep(retryDelay)
      }
    }
  }

  throw new Error(lastError?.message || 'Batch generation failed')
}

export async function generateBrief(
  trendsData: TrendItem[],
  ideaHistory: string[],
  niche: NicheConfig,
  brandPersona?: string | null,
  highPerformers: string[] = []
): Promise<IdeaObject[]> {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  const model = process.env.AI_MODEL

  if (!model) throw new Error('AI_MODEL env var is not set.')

  const ai = getAIProvider()
  const profile = getGenerationProfile(provider, model)
  const systemPrompt = buildSystemPrompt(niche, brandPersona, highPerformers)

  const trendsSummary = trendsData.length
    ? trendsData
        .slice(0, 35)
        .map((item) => `- [${item.source.toUpperCase()}] ${sanitizeText(item.title, 130)}`)
        .join('\n')
    : `- No live trends available. Use broad, current patterns for ${niche.label}.`

  const collected: IdeaObject[] = []
  const historicalTitles = ideaHistory
    .map((title) => sanitizeText(title, 140))
    .filter(Boolean)

  if (!profile.skipSingleShot) {
    try {
      const singleShot = await generateBatch({
        ai,
        systemPrompt,
        trendsSummary,
        excludedTitles: historicalTitles,
        count: DEFAULT_TOTAL_IDEAS,
        maxAttempts: profile.singleShotAttempts,
        maxTokensCap: profile.maxOutputTokensCap,
      })

      const seen = new Set<string>()
      for (const idea of singleShot.ideas) {
        const key = titleKey(idea.title)
        if (!seen.has(key)) {
          collected.push(idea)
          seen.add(key)
        }
        if (collected.length >= DEFAULT_TOTAL_IDEAS) break
      }

      if (collected.length >= DEFAULT_TOTAL_IDEAS) {
        console.log(
          `[Generator] ✅ Success (single-shot): ${collected.length} ideas in ${(singleShot.elapsedMs / 1000).toFixed(1)}s (attempt ${singleShot.attemptsUsed})`
        )
        return collected.slice(0, DEFAULT_TOTAL_IDEAS)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown single-shot error'
      console.warn(`[Generator] Single-shot generation failed, switching to chunk mode: ${message}`)
    }
  }

  let safetyCounter = 0
  let rounds = 0
  let adaptiveChunkAttempts = profile.chunkMaxAttempts
  while (collected.length < DEFAULT_TOTAL_IDEAS) {
    rounds += 1
    if (rounds > 12) {
      throw new Error(`Generation incomplete: collected ${collected.length}/${DEFAULT_TOTAL_IDEAS} ideas`)
    }

    const remaining = DEFAULT_TOTAL_IDEAS - collected.length
    const batchSize = remaining > profile.chunkBatchSize ? profile.chunkBatchSize : remaining

    const batch = await generateBatch({
      ai,
      systemPrompt,
      trendsSummary,
      excludedTitles: [...historicalTitles, ...collected.map((idea) => idea.title)],
      count: batchSize,
      maxAttempts: adaptiveChunkAttempts,
      maxTokensCap: profile.maxOutputTokensCap,
    })

    let added = 0
    const existingKeys = new Set(collected.map((idea) => titleKey(idea.title)))
    for (const idea of batch.ideas) {
      const key = titleKey(idea.title)
      if (!existingKeys.has(key)) {
        collected.push(idea)
        existingKeys.add(key)
        added += 1
      }
      if (collected.length >= DEFAULT_TOTAL_IDEAS) break
    }

    if (batch.attemptsUsed === 1 && adaptiveChunkAttempts > 2) {
      adaptiveChunkAttempts = 2
    } else if (batch.attemptsUsed >= 2 && adaptiveChunkAttempts < profile.chunkMaxAttempts) {
      adaptiveChunkAttempts = profile.chunkMaxAttempts
    }

    if (added === 0) {
      safetyCounter += 1
      if (safetyCounter >= 4) {
        throw new Error('Generation produced duplicate ideas repeatedly. Please retry.')
      }
    }
  }

  console.log(`[Generator] ✅ Success: ${collected.length} ideas`)
  return collected.slice(0, DEFAULT_TOTAL_IDEAS)
}
