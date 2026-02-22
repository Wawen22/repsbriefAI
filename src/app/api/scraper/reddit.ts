// src/app/api/scraper/reddit.ts

import axios from 'axios'
import { NicheConfig, TrendItem } from '@/types/niche'

export async function scrapeReddit(niche: NicheConfig): Promise<TrendItem[]> {
  const { subreddits } = niche
  let allTrends: TrendItem[] = []

  for (const subreddit of subreddits) {
    try {
      // Use official reddit API endpoint for top posts of the week
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=10`, {
        headers: {
          'User-Agent': process.env.REDDIT_USER_AGENT ?? 'RepsBrief/1.0',
        }
      })

      const posts = response.data.data.children

      const trends: TrendItem[] = posts
        .filter((post: any) => post.data.ups >= 500) // Filter by minimum upvotes as per PROJECT_CONTEXT.md
        .map((post: any) => ({
          id: post.data.id,
          source: 'reddit',
          title: post.data.title,
          url: `https://reddit.com${post.data.permalink}`,
          content: post.data.selftext,
          score: post.data.ups,
          timestamp: new Date(post.data.created_utc * 1000).toISOString(),
          metadata: {
            subreddit: post.data.subreddit,
            num_comments: post.data.num_comments,
            flair: post.data.link_flair_text
          }
        }))

      allTrends = [...allTrends, ...trends]
    } catch (err) {
      console.error(`[Reddit] Failed to scrape r/${subreddit}:`, err)
    }
  }

  return allTrends
}
