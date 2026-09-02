// src/config/niches.ts

import type { TrendSource } from '@/lib/trends/contracts'
import type { NicheConfig, NicheTrendSourceConfig, TrendItem } from '../types/niche'

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

type TrendEnvironment = Record<string, string | undefined>

function isExplicitlyEnabled(environment: TrendEnvironment, name: string) {
  return environment[name] === 'true'
}

/**
 * Builds the server-side source configuration from explicit feature flags.
 * Apify sources are fail-closed: an absent, malformed, or false flag keeps
 * them out of scheduling and therefore out of the generation quality gate.
 */
export function getTrendSourceConfig(environment: TrendEnvironment): Record<TrendSource, NicheTrendSourceConfig> {
  const hasApifyBudget = getTrendApifyDailyBudgetUsd(environment) !== null
  const redditEnabled = hasApifyBudget && isExplicitlyEnabled(environment, 'TREND_REDDIT_ENABLED')
  const googleTrendsEnabled = hasApifyBudget && isExplicitlyEnabled(environment, 'TREND_GOOGLE_TRENDS_ENABLED')

  return {
  youtube: {
    enabled: true,
    native: true,
    niches: { fitness: { enabled: true } },
  },
  rss: {
    enabled: true,
    native: true,
    niches: { fitness: { enabled: true } },
  },
  reddit: {
    enabled: redditEnabled,
    native: false,
    apifyTaskIdEnvVar: 'APIFY_REDDIT_TASK_ID',
    niches: { fitness: { enabled: redditEnabled } },
  },
  'google-trends': {
    enabled: googleTrendsEnabled,
    native: false,
    apifyTaskIdEnvVar: 'APIFY_GOOGLE_TRENDS_TASK_ID',
    niches: { fitness: { enabled: googleTrendsEnabled } },
  },
  }
}

/**
 * A malformed or non-positive value is invalid and must block an Apify rollout.
 * The deployment runbook defines the budget check to perform before enabling a
 * source; native sources are unaffected.
 */
export function getTrendApifyDailyBudgetUsd(environment: TrendEnvironment): number | null {
  const value = environment.TREND_APIFY_DAILY_BUDGET_USD
  if (!value) return null

  const budget = Number(value)
  return Number.isFinite(budget) && budget > 0 ? budget : null
}

// Task identifiers are environment variable names only. Their values, flags,
// budget and APIFY_TOKEN remain server-only and are never committed here.
export const TREND_SOURCE_CONFIG = getTrendSourceConfig(process.env)
