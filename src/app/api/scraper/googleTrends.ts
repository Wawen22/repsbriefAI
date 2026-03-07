// src/app/api/scraper/googleTrends.ts

import googleTrends from 'google-trends-api'
import { NicheConfig, TrendItem } from '@/types/niche'

type RankedKeyword = {
  query: string
  value: string
  formattedValue: string
}

type RankedListItem = {
  rankedKeyword?: RankedKeyword[]
}

type RelatedQueriesResponse = {
  default?: {
    rankedList?: RankedListItem[]
  }
}

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

      const data = JSON.parse(result) as RelatedQueriesResponse
      const rankedList = data.default?.rankedList || []
      
      const risingQueries =
        rankedList.find((rankedItem) => rankedItem.rankedKeyword?.[0]?.formattedValue === 'Rising')
          ?.rankedKeyword || []

      const trends: TrendItem[] = risingQueries.map((query) => ({
        id: `gt-${keyword}-${query.query}`,
        source: 'google-trends',
        title: query.query,
        url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(query.query)}&geo=IT`,
        content: `Google Trends rising query for "${keyword}": ${query.query}`,
        score: parseInt(query.value) || 0,
        timestamp: new Date().toISOString(),
        metadata: {
          keyword: keyword,
          value: query.value,
          formattedValue: query.formattedValue,
        }
      }))

      allTrends = [...allTrends, ...trends]
    } catch (err) {
      console.error(`[Google Trends] Failed to scrape keyword "${keyword}":`, err)
    }
  }

  return allTrends
}
