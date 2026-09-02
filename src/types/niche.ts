// src/types/niche.ts

import type { TrendSource } from '@/lib/trends/contracts'

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

export interface NicheTrendSourceConfig {
  enabled: boolean
  native: boolean
  niches: Record<string, { enabled: boolean }>
  apifyTaskIdEnvVar?: string
}

export interface TrendItem {
  id: string
  source: TrendSource
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
  sources?: TrendSource[]
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
