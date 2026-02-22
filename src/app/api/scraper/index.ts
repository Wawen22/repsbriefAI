// src/app/api/scraper/index.ts

import { NicheConfig, TrendItem } from '@/types/niche'
import { supabaseAdmin } from '@/lib/supabase'
import { scrapeReddit } from './reddit'
import { scrapeYouTube } from './youtube'
import { scrapeGoogleTrends } from './googleTrends'
import { scrapeRSS } from './rss'

export async function scrapeNiche(niche: NicheConfig): Promise<void> {
  const weekDate = new Date().toISOString().split('T')[0] // current date (YYYY-MM-DD)

  const sources = [
    { name: 'reddit', scraper: scrapeReddit },
    { name: 'youtube', scraper: scrapeYouTube },
    { name: 'google-trends', scraper: scrapeGoogleTrends },
    { name: 'rss', scraper: scrapeRSS },
  ]

  for (const source of sources) {
    try {
      console.log(`[Scraper] Starting ${source.name} for ${niche.label}...`)
      const data = await source.scraper(niche)

      if (data && data.length > 0) {
        const { error } = await supabaseAdmin
          .from('trends_cache')
          .upsert({
            source: source.name,
            niche: niche.id,
            week_date: weekDate,
            data: data,
          }, { onConflict: 'source, niche, week_date' })

        if (error) {
          console.error(`[Scraper] Error caching ${source.name}:`, error)
        } else {
          console.log(`[Scraper] Successfully cached ${source.name} (${data.length} items)`)
        }
      }
    } catch (err) {
      console.error(`[Scraper] Orchestrator failure for ${source.name}:`, err)
    }
  }
}
