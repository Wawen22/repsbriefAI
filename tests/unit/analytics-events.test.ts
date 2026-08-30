import { describe, expect, it, vi } from 'vitest'

const track = vi.fn()
vi.mock('@vercel/analytics', () => ({ track }))

describe('product analytics events', () => {
  it('exposes a stable, privacy-safe event contract', async () => {
    const { PRODUCT_EVENTS, trackProductEvent } = await import('@/lib/analytics/events')

    expect(PRODUCT_EVENTS).toEqual([
      'waitlist_submitted',
      'signup_cta_clicked',
      'strategy_shared',
    ])

    trackProductEvent('signup_cta_clicked', { location: 'hero' })
    expect(track).toHaveBeenCalledWith('signup_cta_clicked', { location: 'hero' })
  })
})
