import { z } from 'zod'
import { NICHES } from '@/config/niches'

const activeNicheIds = new Set(
  Object.values(NICHES)
    .filter((niche) => niche.active)
    .map((niche) => niche.id)
)

const remixIdeaSchema = z.object({
  title: z.string().max(500, 'Title must be at most 500 characters'),
  hook: z.string().max(500, 'Hook must be at most 500 characters'),
  description: z.string().max(4000, 'Description must be at most 4000 characters'),
  scriptDraft: z.string().max(8000, 'Script must be at most 8000 characters').optional(),
  keyVisuals: z.string().max(1000, 'Key visuals must be at most 1000 characters').optional(),
  format: z.string().max(100, 'Format must be at most 100 characters'),
  whyItWorks: z.string().max(1000, 'Why it works must be at most 1000 characters'),
}).passthrough()

const remixInputSchema = z.object({
  idea: remixIdeaSchema,
  instruction: z.string().trim().min(1, 'Instruction is required').max(2000, 'Instruction must be at most 2000 characters'),
})

const brandVoiceSamplesSchema = z.array(
  z.string().trim().min(1, 'Samples cannot be empty').max(2000, 'Each sample must be at most 2000 characters')
).min(1, 'At least one sample is required').max(5, 'At most 5 samples are allowed').superRefine((samples, ctx) => {
  if (samples.reduce((total, sample) => total + sample.length, 0) > 8000) {
    ctx.addIssue({ code: 'custom', message: 'Samples must be at most 8000 characters in total' })
  }
})

const activeNicheSchema = z.string().refine((nicheId) => activeNicheIds.has(nicheId), 'Invalid niche')

export const ideaHistoryIdSchema = z.uuid('Invalid idea ID')

export function parseActiveNiche(input: unknown): string {
  return activeNicheSchema.parse(input)
}

export function parseRemixInput(input: unknown) {
  return remixInputSchema.parse(input)
}

export function parseBrandVoiceSamples(input: unknown): string[] {
  return brandVoiceSamplesSchema.parse(input)
}
