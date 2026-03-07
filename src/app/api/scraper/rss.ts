// src/app/api/scraper/rss.ts

import Parser from 'rss-parser'
import { NicheConfig, TrendItem } from '@/types/niche'

const parser = new Parser()

type RssItem = {
  guid?: string
  link?: string
  title?: string
  contentSnippet?: string
  content?: string
  isoDate?: string
  pubDate?: string
  author?: string
  creator?: string
  categories?: string[]
}

type ParsedFeed = {
  title?: string
  items?: RssItem[]
}

export async function scrapeRSS(niche: NicheConfig): Promise<TrendItem[]> {
  const { rssFeeds } = niche
  let allTrends: TrendItem[] = []

  for (const feed of rssFeeds) {
    try {
      const feedData = (await parser.parseURL(feed)) as ParsedFeed
      
      const trends: TrendItem[] = (feedData.items || [])
        .slice(0, 10) // last 10 items
        .map((item) => ({
          id: item.guid || item.link || `rss-${feedData.title}-${item.title}`,
          source: 'rss',
          title: item.title!,
          url: item.link,
          content: item.contentSnippet || item.content,
          score: 0,
          timestamp: item.isoDate || item.pubDate || new Date().toISOString(),
          metadata: {
            author: item.author || item.creator,
            categories: item.categories,
            feedTitle: feedData.title,
          }
        }))

      allTrends = [...allTrends, ...trends]
    } catch (err) {
      console.error(`[RSS] Failed to scrape feed "${feed}":`, err)
    }
  }

  return allTrends
}
