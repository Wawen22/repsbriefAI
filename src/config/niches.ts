// src/config/niches.ts

import type { NicheConfig, TrendItem } from '../types/niche'

// Reddit and Google Trends stay implemented but are disabled until they use
// authenticated, supported upstream APIs.
export const ENABLED_TREND_SOURCES = ['youtube', 'rss'] as const satisfies readonly TrendItem['source'][]

export const NICHES: Record<string, NicheConfig> = {
  fitness: {
    id: 'fitness',
    label: 'Fitness & Nutrition',
    active: true,
    subreddits: [
      'fitness', 'bodybuilding', 'naturalbodybuilding',
      'xxfitness', 'loseit', 'nutrition', 'veganfitness',
      'running', 'weightlifting', 'personaltraining'
    ],
    googleTrendsKeywords: [
      'workout', 'diet', 'protein', 'cutting', 'bulking',
      'intermittent fasting', 'meal prep', 'cardio',
      'strength training', 'calorie deficit'
    ],
    youtubeCategories: ['Sports', 'Health & Fitness'],
    rssFeeds: [
      'https://examine.com/feed/',
      'https://www.strongerbyscience.com/feed/',
      'https://renaissanceperiodization.com/feed',
      'https://www.t-nation.com/feed/'
    ],
    claudePersona: 'a content strategist specialized in fitness and nutrition',
  },

  // Future niches — not active yet
  /*
  personal_finance: {
    id: 'personal_finance',
    label: 'Personal Finance',
    active: false,
    subreddits: ['personalfinance', 'investing', 'fire'],
    googleTrendsKeywords: ['budgeting', 'investing', 'savings'],
    youtubeCategories: ['Finance'],
    rssFeeds: [],
    claudePersona: 'a financial advisor and content creator',
  },
  */
}
