import {
  getTrendApifyDailyBudgetUsd,
  getTrendSourceConfig,
  NICHES,
} from '@/config/niches'
import { buildTrendIngestionJobs } from '@/lib/trends/ingestionWorker'

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

  it('keeps Apify sources out of ingestion until each source flag is explicitly enabled', () => {
    const defaultJobs = buildTrendIngestionJobs({
      now: new Date('2026-09-02T12:00:00.000Z'),
      sourceConfig: getTrendSourceConfig({}),
    })

    expect(defaultJobs.map((job) => job.source)).toEqual(['youtube', 'rss'])

    const enabledJobs = buildTrendIngestionJobs({
      now: new Date('2026-09-02T12:00:00.000Z'),
      sourceConfig: getTrendSourceConfig({
        TREND_REDDIT_ENABLED: 'true',
        TREND_GOOGLE_TRENDS_ENABLED: 'true',
        TREND_APIFY_DAILY_BUDGET_USD: '5',
      }),
    })

    expect(enabledJobs.map((job) => job.source)).toEqual([
      'youtube', 'rss', 'reddit', 'google-trends',
    ])
  })

  it('accepts only a positive finite Apify daily budget', () => {
    expect(getTrendApifyDailyBudgetUsd({})).toBeNull()
    expect(getTrendApifyDailyBudgetUsd({ TREND_APIFY_DAILY_BUDGET_USD: '3.5' })).toBe(3.5)
    expect(getTrendApifyDailyBudgetUsd({ TREND_APIFY_DAILY_BUDGET_USD: '0' })).toBeNull()
    expect(getTrendApifyDailyBudgetUsd({ TREND_APIFY_DAILY_BUDGET_USD: 'not-a-number' })).toBeNull()
  })

  it('keeps Apify sources disabled when their feature flags lack a valid daily budget', () => {
    const sourceConfig = getTrendSourceConfig({ TREND_REDDIT_ENABLED: 'true' })

    expect(sourceConfig.reddit.enabled).toBe(false)
    expect(sourceConfig.reddit.niches.fitness.enabled).toBe(false)
  })
})
