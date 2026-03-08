import { getPriceIdForPlan, normalizePlan, resolvePlanFromPriceId } from '@/lib/billing'

const ORIGINAL_ENV = { ...process.env }

function resetStripePriceEnv() {
  delete process.env.STRIPE_PRICE_PRO_MONTHLY
  delete process.env.STRIPE_PRICE_PRO
  delete process.env.STRIPE_PRICE_TEAM_MONTHLY
  delete process.env.STRIPE_PRICE_TEAM
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('billing helpers', () => {
  it('normalizes known/unknown plans safely', () => {
    expect(normalizePlan('pro')).toBe('pro')
    expect(normalizePlan('team')).toBe('team')
    expect(normalizePlan('starter')).toBe('starter')
    expect(normalizePlan('enterprise')).toBe('starter')
    expect(normalizePlan(undefined)).toBe('starter')
  })

  it('resolves configured price ids to paid plans', () => {
    resetStripePriceEnv()
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_x'
    process.env.STRIPE_PRICE_TEAM_MONTHLY = 'price_team_y'

    expect(resolvePlanFromPriceId('price_pro_x')).toBe('pro')
    expect(resolvePlanFromPriceId('price_team_y')).toBe('team')
    expect(resolvePlanFromPriceId('price_unknown')).toBe('starter')
  })

  it('throws when requesting team price without team env configured', () => {
    resetStripePriceEnv()
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_x'

    expect(() => getPriceIdForPlan('team')).toThrow(
      'Missing STRIPE_PRICE_TEAM_MONTHLY (or STRIPE_PRICE_TEAM) env var'
    )
  })
})
