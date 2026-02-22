// src/types/niche.ts

export interface NicheConfig {
  id: string
  label: string
  active: boolean
  subreddits: string[]
  googleTrendsKeywords: string[]
  youtubeCategories: string[]
  rssFeeds: string[]
  claudePersona: string
}

export interface TrendItem {
  id: string
  source: 'reddit' | 'youtube' | 'google-trends' | 'rss'
  title: string
  url?: string
  content?: string
  score?: number
  timestamp: string
  metadata?: Record<string, any>
}

export interface IdeaObject {
  title: string
  hook: string
  description: string
  format: 'Reel' | 'Carousel' | 'Thread' | 'Newsletter'
  whyItWorks: string
}

export interface BriefData {
  weekDate: string
  niche: string
  ideas: IdeaObject[]
  aiProvider: string
  aiModel: string
}
