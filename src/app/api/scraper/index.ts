// src/app/api/scraper/index.ts

import type { NicheConfig, TrendItem } from '@/types/niche'
import { getSupabaseAdmin } from '@/lib/supabase'
import { ENABLED_TREND_SOURCES } from '@/config/niches'
import { scrapeReddit } from './reddit'
import { scrapeYouTube } from './youtube'
import { scrapeGoogleTrends } from './googleTrends'
import { scrapeRSS } from './rss'

type TrendScraper = (niche: NicheConfig) => Promise<TrendItem[]>

const TREND_SCRAPERS: Record<TrendItem['source'], TrendScraper> = {
  reddit: scrapeReddit,
  youtube: scrapeYouTube,
  'google-trends': scrapeGoogleTrends,
  rss: scrapeRSS,
}

export async function scrapeNiche(niche: NicheConfig): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin('api/scraper/index')
  const weekDate = new Date().toISOString().split('T')[0] // current date (YYYY-MM-DD)

  for (const sourceName of ENABLED_TREND_SOURCES) {
    const scraper = TREND_SCRAPERS[sourceName]
    try {
      console.log(`[Scraper] Starting ${sourceName} for ${niche.label}...`)
      const data = await scraper(niche)

      if (data && data.length > 0) {
        const { error } = await supabaseAdmin
          .from('trends_cache')
          .upsert({
            source: sourceName,
            niche: niche.id,
            week_date: weekDate,
            data: data,
          }, { onConflict: 'source, niche, week_date' })

        if (error) {
          console.error(`[Scraper] Error caching ${sourceName}:`, error)
        } else {
          console.log(`[Scraper] Successfully cached ${sourceName} (${data.length} items)`)
        }
      }
    } catch (err) {
      console.error(`[Scraper] Orchestrator failure for ${sourceName}:`, err)
    }
  }
}
