import { publicStudioClasses } from '@/components/layout/PublicStudioShell'

describe('public studio design vocabulary', () => {
  it('uses the landing-aligned studio primitives', () => {
    expect(publicStudioClasses.shell).toContain('bg-[#000000]')
    expect(publicStudioClasses.surface).toContain('border-white/[0.08]')
    expect(publicStudioClasses.primaryAction).toContain('bg-white')
    expect(publicStudioClasses.primaryAction).toContain('text-black')
    expect(publicStudioClasses.metadata).toContain('font-mono')
  })
})

