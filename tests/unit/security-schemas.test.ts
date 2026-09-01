import { parseActiveNiche, parseBrandVoiceSamples, parseRemixInput } from '@/lib/security/schemas'
import { requirePaidPlan } from '@/lib/security/entitlements'
import type { IdeaObject } from '@/types/niche'

const idea: IdeaObject = {
  title: 'A title',
  hook: 'A hook',
  description: 'A description',
  format: 'Reel',
  whyItWorks: 'It works',
  keyVisuals: 'Gym',
}

describe('security schemas', () => {
  it('accepts only configured active niches', () => {
    expect(parseActiveNiche('fitness')).toBe('fitness')
    expect(() => parseActiveNiche('unknown')).toThrow('Invalid niche')
  })

  it('rejects oversized remix instructions before an AI request', () => {
    expect(() => parseRemixInput({ idea, instruction: 'a'.repeat(2001) })).toThrow('Instruction')
  })

  it('bounds the number and combined size of Brand Voice samples', () => {
    expect(() => parseBrandVoiceSamples(Array.from({ length: 6 }, () => 'sample'))).toThrow('5')
    expect(() => parseBrandVoiceSamples(['a'.repeat(2001)])).toThrow('2000')
  })
})

describe('paid plan entitlement', () => {
  it.each(['starter', 'enterprise', null, undefined])('denies %s', (plan) => {
    expect(requirePaidPlan(plan)).toEqual({ allowed: false })
  })

  it.each(['pro', 'team'])('allows %s', (plan) => {
    expect(requirePaidPlan(plan)).toEqual({ allowed: true })
  })
})
