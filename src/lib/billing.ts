export type AppPlan = 'starter' | 'pro' | 'team'

const LEGACY_PRO_PRICE_ID = 'price_1T3kiQQ8w32NjQAk6830MCV3'

export const ACTIVE_PAID_PLANS: AppPlan[] = ['pro', 'team']

export function normalizePlan(plan: string | null | undefined): AppPlan {
  if (plan === 'pro' || plan === 'team') return plan
  return 'starter'
}

export function getPriceIdForPlan(plan: Extract<AppPlan, 'pro' | 'team'>): string {
  const proPriceId =
    process.env.STRIPE_PRICE_PRO_MONTHLY ||
    process.env.STRIPE_PRICE_PRO ||
    LEGACY_PRO_PRICE_ID

  const teamPriceId =
    process.env.STRIPE_PRICE_TEAM_MONTHLY || process.env.STRIPE_PRICE_TEAM

  if (plan === 'pro') return proPriceId

  if (!teamPriceId) {
    throw new Error('Missing STRIPE_PRICE_TEAM_MONTHLY (or STRIPE_PRICE_TEAM) env var')
  }
  return teamPriceId
}

export function resolvePlanFromPriceId(priceId?: string | null): AppPlan {
  if (!priceId) return 'starter'

  const proPriceId =
    process.env.STRIPE_PRICE_PRO_MONTHLY ||
    process.env.STRIPE_PRICE_PRO ||
    LEGACY_PRO_PRICE_ID
  const teamPriceId =
    process.env.STRIPE_PRICE_TEAM_MONTHLY || process.env.STRIPE_PRICE_TEAM

  if (priceId === teamPriceId) return 'team'
  if (priceId === proPriceId) return 'pro'

  return 'starter'
}
