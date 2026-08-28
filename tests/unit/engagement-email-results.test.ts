import { recordDeliveryResult } from '@/app/api/cron/engagement-emails/results'

describe('recordDeliveryResult', () => {
  it.each(['day1', 'day3', 'day7', 'briefReady'] as const)(
    'increments the %s counter after a successful delivery',
    (counter) => {
      const results = { day1: 0, day3: 0, day7: 0, briefReady: 0, errors: 0 }

      recordDeliveryResult(results, counter, true)

      expect(results[counter]).toBe(1)
      expect(results.errors).toBe(0)
    }
  )

  it('increments only the error counter after a failed delivery', () => {
    const results = { day1: 0, day3: 0, day7: 0, briefReady: 0, errors: 0 }

    recordDeliveryResult(results, 'day1', false)

    expect(results).toEqual({ day1: 0, day3: 0, day7: 0, briefReady: 0, errors: 1 })
  })
})
