import { todayStartIso } from '@/lib/engagement'

describe('engagement eligibility', () => {
  it('bounds brief-ready eligibility to the current day, excluding historical briefs', () => {
    expect(todayStartIso(new Date('2026-09-07T17:30:00.000Z'))).toBe('2026-09-07T00:00:00.000Z')
  })
})
