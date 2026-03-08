import { NICHES } from '@/config/niches'

describe('niches configuration', () => {
  it('contains at least one active niche', () => {
    const activeNiches = Object.values(NICHES).filter((niche) => niche.active)
    expect(activeNiches.length).toBeGreaterThan(0)
  })

  it('keeps key/id alignment and minimum data for active niches', () => {
    for (const [key, niche] of Object.entries(NICHES)) {
      expect(niche.id).toBe(key)

      if (!niche.active) continue

      expect(niche.subreddits.length).toBeGreaterThan(0)
      expect(niche.googleTrendsKeywords.length).toBeGreaterThan(0)
      expect(niche.rssFeeds.length).toBeGreaterThan(0)
      expect(niche.claudePersona.length).toBeGreaterThan(0)
    }
  })
})
