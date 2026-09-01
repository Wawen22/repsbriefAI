const PAID_PLANS = new Set(['pro', 'team'])

export function requirePaidPlan(plan: unknown): { allowed: boolean } {
  return { allowed: typeof plan === 'string' && PAID_PLANS.has(plan) }
}
