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
  metadata?: Record<string, unknown>
}

export interface IdeaObject {
  title: string
  hook: string
  description: string
  format: 'Reel' | 'Carousel' | 'Thread' | 'Newsletter' | 'Idea'
  whyItWorks: string
  niche?: string
  sources?: ('reddit' | 'youtube' | 'google-trends' | 'rss')[]
  // Expanded fields
  scriptDraft?: string
  alternativeHooks?: string[]
  trendingAudioSuggestion?: string
  keyVisuals?: string
  sourceTrend?: string
}

export interface BriefData {
  weekDate: string
  niche: string
  ideas: IdeaObject[]
  aiProvider: string
  aiModel: string
}
