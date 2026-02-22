// src/app/api/scraper/youtube.ts

import { google } from 'googleapis'
import { NicheConfig, TrendItem } from '@/types/niche'

const youtube = google.youtube('v3')

export async function scrapeYouTube(niche: NicheConfig): Promise<TrendItem[]> {
  const { googleTrendsKeywords } = niche // reuse keywords as search terms
  let allTrends: TrendItem[] = []

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const publishedAfter = fourteenDaysAgo.toISOString()

  for (const keyword of googleTrendsKeywords.slice(0, 3)) { // Limit to 3 keywords to avoid quota exhaustion
    try {
      const response = await youtube.search.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['id', 'snippet'],
        q: keyword,
        type: ['video'],
        order: 'viewCount',
        publishedAfter: publishedAfter,
        maxResults: 10,
      })

      const videos = response.data.items || []

      // Get view counts for these videos
      const videoIds = videos.map(v => v.id?.videoId).filter(Boolean) as string[]
      
      if (videoIds.length === 0) continue

      const statsResponse = await youtube.videos.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['statistics', 'contentDetails'],
        id: videoIds,
      })

      const videoStats = statsResponse.data.items || []

      const trends: TrendItem[] = videos.map((v, index) => {
        const stats = videoStats.find(vs => vs.id === v.id?.videoId)
        return {
          id: v.id?.videoId!,
          source: 'youtube',
          title: v.snippet?.title!,
          url: `https://youtube.com/watch?v=${v.id?.videoId}`,
          content: v.snippet?.description!,
          score: parseInt(stats?.statistics?.viewCount || '0'),
          timestamp: v.snippet?.publishedAt!,
          metadata: {
            channelTitle: v.snippet?.channelTitle,
            tags: stats?.snippet?.tags,
            viewCount: stats?.statistics?.viewCount,
            likeCount: stats?.statistics?.likeCount,
          }
        }
      })

      allTrends = [...allTrends, ...trends]
    } catch (err) {
      console.error(`[YouTube] Failed to scrape keyword "${keyword}":`, err)
    }
  }

  return allTrends
}
