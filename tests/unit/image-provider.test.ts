// tests/unit/image-provider.test.ts

import { generateIdeaImagePrompt } from '@/lib/ai/image-provider'
import type { IdeaObject } from '@/types/niche'

const BASE_IDEA: IdeaObject = {
  title: 'How I Lost 10kg in 30 Days',
  hook: 'The one habit that changed everything',
  description: 'A personal fitness journey breakdown',
  format: 'Reel',
  whyItWorks: 'Relatability + proof',
  keyVisuals: 'Before/after split screen, gym lighting',
}

describe('generateIdeaImagePrompt', () => {
  it('includes the format in lowercase', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('reel')
  })

  it('includes the idea title', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('How I Lost 10kg in 30 Days')
  })

  it('includes keyVisuals when present', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('Before/after split screen, gym lighting')
  })

  it('omits keyVisuals section when field is undefined', () => {
    const idea: IdeaObject = { ...BASE_IDEA, keyVisuals: undefined }
    const prompt = generateIdeaImagePrompt(idea)
    expect(prompt).not.toContain('Visual style:')
  })

  it('omits keyVisuals section when key is not present', () => {
    const ideaWithoutKey = { ...BASE_IDEA }
    delete ideaWithoutKey.keyVisuals
    const prompt = generateIdeaImagePrompt(ideaWithoutKey as IdeaObject)
    expect(prompt).not.toContain('Visual style:')
  })

  it('always ends with quality directives', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('No text overlay')
    expect(prompt).toContain('Photorealistic')
  })
})
