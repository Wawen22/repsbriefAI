// src/app/api/scraper/googleTrends.ts

const googleTrends = require('google-trends-api')
import { NicheConfig, TrendItem } from '@/types/niche'

export async function scrapeGoogleTrends(niche: NicheConfig): Promise<TrendItem[]> {
  const { googleTrendsKeywords } = niche
  let allTrends: TrendItem[] = []

  for (const keyword of googleTrendsKeywords.slice(0, 3)) { // Limit to 3 keywords
    try {
      const result = await googleTrends.relatedQueries({
        keyword: keyword,
        geo: 'IT', // Context says IT region
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
      })

      const data = JSON.parse(result)
      const rankedList = data.default?.rankedList || []
      
      const risingQueries = rankedList.find((rl: any) => rl.rankedKeyword?.[0]?.formattedValue === 'Rising')?.rankedKeyword || []

      const trends: TrendItem[] = risingQueries.map((q: any) => ({
        id: `gt-${keyword}-${q.query}`,
        source: 'google-trends',
        title: q.query,
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(q.query)}&geo=IT`,
        content: `Google Trends rising query for "${keyword}": ${q.query}`,
        score: parseInt(q.value) || 0,
        timestamp: new Date().toISOString(),
        metadata: {
          keyword: keyword,
          value: q.value,
          formattedValue: q.formattedValue,
        }
      }))

      allTrends = [...allTrends, ...trends]
    } catch (err) {
      console.error(`[Google Trends] Failed to scrape keyword "${keyword}":`, err)
    }
  }

  return allTrends
}
