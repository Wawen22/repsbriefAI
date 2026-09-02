import { describe, expect, it } from 'vitest'

describe('trend ingestion routes', () => {
  it('exports the protected cron and Apify webhook handlers', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key'

    const [cron, webhook] = await Promise.all([
      import('@/app/api/cron/trend-ingestion/route'),
      import('@/app/api/webhooks/apify/route'),
    ])

    expect(typeof cron.POST).toBe('function')
    expect(typeof webhook.POST).toBe('function')
  })
})
